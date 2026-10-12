import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generarDocumentoIndividual, inyectarVariables } from './services/pdfRenderer.js';
import { empaquetarLoteEnZip, ArchivoEnZip } from './services/batchZip.js';
import { generarQrDataUrl } from './services/qrService.js';
import { RenderSingleRequest, RenderBatchRequest } from './types.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'PDF Studio Worker',
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/render/single
 * Genera un PDF individual para una persona específica con sellado criptográfico y metadatos.
 */
app.post('/api/render/single', async (req: Request, res: Response) => {
  try {
    const { empresa, persona, plantilla, custom_values } = req.body as RenderSingleRequest;

    if (!empresa || !persona || !plantilla) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos: empresa, persona o plantilla.' });
    }

    const resultado = await generarDocumentoIndividual(empresa, persona, plantilla, custom_values);

    // Permitir descarga directa binaria o entrega en JSON base64 según el header Accept
    if (req.headers.accept?.includes('application/pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${resultado.filename}"`);
      res.setHeader('X-Document-Hash-Sha256', resultado.hash_sha256);
      return res.send(resultado.pdfBuffer);
    }

    res.json({
      success: true,
      filename: resultado.filename,
      hash_sha256: resultado.hash_sha256,
      metadatos: resultado.metadatos,
      pdfBase64: resultado.pdfBuffer.toString('base64'),
    });
  } catch (error: any) {
    console.error('Error en /api/render/single:', error);
    res.status(500).json({ error: error.message || 'Error interno al generar el PDF' });
  }
});

/**
 * POST /api/render/batch
 * Genera PDFs individuales para una lista de personas y los entrega empaquetados en un archivo ZIP.
 */
app.post('/api/render/batch', async (req: Request, res: Response) => {
  try {
    const { empresa, personas, plantilla, custom_values } = req.body as RenderBatchRequest;

    if (!empresa || !personas || !personas.length || !plantilla) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos: empresa, personas o plantilla.' });
    }

    console.log(`Iniciando lote de ${personas.length} documentos para la empresa: ${empresa.razon_social}`);

    const archivosPdf: ArchivoEnZip[] = [];
    const registrosGenerados = [];

    for (const persona of personas) {
      try {
        const resultado = await generarDocumentoIndividual(empresa, persona, plantilla, custom_values);
        archivosPdf.push({
          nombreArchivo: resultado.filename,
          buffer: resultado.pdfBuffer,
        });
        registrosGenerados.push({
          persona_id: persona.id,
          numero_documento: persona.numero_documento,
          nombre_archivo: resultado.filename,
          hash_sha256: resultado.hash_sha256,
        });
      } catch (err: any) {
        console.error(`Error generando documento para persona ${persona.numero_documento}:`, err);
      }
    }

    const zipBuffer = await empaquetarLoteEnZip(archivosPdf);
    const zipFilename = `LOTE_${plantilla.nombre.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.zip`;

    if (req.headers.accept?.includes('application/zip')) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);
      return res.send(zipBuffer);
    }

    res.json({
      success: true,
      total_procesados: archivosPdf.length,
      zipFilename,
      zipBase64: zipBuffer.toString('base64'),
      documentos: registrosGenerados,
    });
  } catch (error: any) {
    console.error('Error en /api/render/batch:', error);
    res.status(500).json({ error: error.message || 'Error interno al generar el lote' });
  }
});

/**
 * POST /api/render/preview
 * Devuelve el HTML inyectado para vista previa interactiva en el navegador.
 */
app.post('/api/render/preview', async (req: Request, res: Response) => {
  try {
    const { empresa, persona, plantilla, custom_values } = req.body as RenderSingleRequest;

    if (!empresa || !persona || !plantilla) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos.' });
    }

    const fechaHoy = new Date().toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const qrDataUrl = await generarQrDataUrl(
      `https://verificar.documentos.gob.pe/?doc=${persona.numero_documento}&preview=1`
    );

    const html = inyectarVariables(plantilla.contenido_html, empresa, persona, {
      fecha_emision: fechaHoy,
      qr_verificacion: qrDataUrl,
      hash_sha256: 'PREVIEW_SHA256_MOCK_VALOR',
      ...custom_values,
    });

    res.json({
      success: true,
      html,
      orientacion: plantilla.orientacion,
      tamano_hoja: plantilla.tamano_hoja,
    });
  } catch (error: any) {
    console.error('Error en /api/render/preview:', error);
    res.status(500).json({ error: error.message || 'Error al generar preview' });
  }
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 PDF Studio Worker corriendo en puerto ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});
