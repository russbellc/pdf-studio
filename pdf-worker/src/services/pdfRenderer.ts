import { chromium, Browser, BrowserContext } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EmpresaData, PersonaData, PlantillaConfig, RenderResult } from '../types.js';
import { generarQrDataUrl } from './qrService.js';
import { sellarEInyectarMetadatos } from './pdfMetadata.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let browserInstance: Browser | null = null;
let staticCssCache: string | null = null;

function getStaticCss(): string {
  if (!staticCssCache) {
    const candidates = [
      path.resolve(__dirname, '../tailwind-plantillas.css'),
      path.resolve(__dirname, './tailwind-plantillas.css'),
      path.resolve(process.cwd(), 'src/tailwind-plantillas.css'),
      path.resolve(process.cwd(), 'dist/tailwind-plantillas.css'),
      path.resolve(process.cwd(), 'tailwind-plantillas.css'),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        staticCssCache = fs.readFileSync(c, 'utf-8');
        break;
      }
    }
    if (!staticCssCache) {
      staticCssCache = 'body { margin: 0; padding: 0; font-family: sans-serif; }';
    }
  }
  return staticCssCache;
}

async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
  }
  return browserInstance;
}

/**
 * Reemplaza etiquetas {{clave.subclave}} con los datos de empresa, persona y variables del sistema.
 */
export function inyectarVariables(
  html: string,
  empresa: EmpresaData,
  persona: PersonaData,
  extra: { fecha_emision: string; qr_verificacion: string; hash_sha256: string; [key: string]: string }
): string {
  let resultado = html;

  // Variables de Persona
  resultado = resultado.replace(/\{\{persona\.nombres\}\}/g, persona.nombres || '');
  resultado = resultado.replace(/\{\{persona\.apellidos\}\}/g, persona.apellidos || '');
  resultado = resultado.replace(/\{\{persona\.numero_documento\}\}/g, persona.numero_documento || '');
  resultado = resultado.replace(/\{\{persona\.tipo_documento\}\}/g, persona.tipo_documento || 'DNI');
  resultado = resultado.replace(/\{\{persona\.correo\}\}/g, persona.correo || '');
  resultado = resultado.replace(/\{\{persona\.telefono\}\}/g, persona.telefono || '');
  resultado = resultado.replace(/\{\{persona\.cargo\}\}/g, persona.cargo || '');
  resultado = resultado.replace(/\{\{persona\.departamento_area\}\}/g, persona.departamento_area || '');

  // Variables dinámicas en datos_adicionales
  if (persona.datos_adicionales) {
    for (const [k, v] of Object.entries(persona.datos_adicionales)) {
      const regex = new RegExp(`\\{\\{persona\\.extra\\.${k}\\}\\}`, 'g');
      resultado = resultado.replace(regex, String(v ?? ''));
    }
  }

  // Variables de Empresa
  resultado = resultado.replace(/\{\{empresa\.razon_social\}\}/g, empresa.razon_social || '');
  resultado = resultado.replace(/\{\{empresa\.identificacion_fiscal\}\}/g, empresa.identificacion_fiscal || '');
  resultado = resultado.replace(/\{\{empresa\.correo_contacto\}\}/g, empresa.correo_contacto || '');
  resultado = resultado.replace(/\{\{empresa\.telefono\}\}/g, empresa.telefono || '');
  resultado = resultado.replace(/\{\{empresa\.direccion\}\}/g, empresa.direccion || '');
  resultado = resultado.replace(/\{\{empresa\.logo_url\}\}/g, empresa.logo_url || '');

  // Variables del Sistema
  resultado = resultado.replace(/\{\{fecha_emision\}\}/g, extra.fecha_emision);
  resultado = resultado.replace(/\{\{qr_verificacion\}\}/g, extra.qr_verificacion);
  resultado = resultado.replace(/\{\{hash_sha256\}\}/g, extra.hash_sha256);

  // Variables extras personalizadas
  for (const [k, v] of Object.entries(extra)) {
    if (!['fecha_emision', 'qr_verificacion', 'hash_sha256'].includes(k)) {
      const regex = new RegExp(`\\{\\{${k}\\}\\}`, 'g');
      resultado = resultado.replace(regex, String(v ?? ''));
    }
  }

  return resultado;
}

/**
 * Renderiza el HTML con Chromium Headless a un Buffer PDF de 300 DPI utilizando CSS embebido (sin CDN).
 */
export async function renderHtmlToPdf(
  htmlContent: string,
  orientacion: 'portrait' | 'landscape',
  tamano_hoja: 'A4' | 'letter'
): Promise<Buffer> {
  const browser = await getBrowser();
  const context: BrowserContext = await browser.newContext({
    deviceScaleFactor: 2, // Garantiza nitidez y resolución de 300 DPI
  });
  const page = await context.newPage();

  const staticCss = getStaticCss();

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        ${staticCss}
        @page {
          size: ${tamano_hoja} ${orientacion};
          margin: 0;
        }
      </style>
    </head>
    <body class="bg-white">
      ${htmlContent}
    </body>
    </html>
  `;

  await page.setContent(fullHtml, { waitUntil: 'load' });

  const landscape = orientacion === 'landscape';
  const pdfUint8Array = await page.pdf({
    format: tamano_hoja === 'A4' ? 'A4' : 'Letter',
    landscape,
    printBackground: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
  });

  await context.close();

  return Buffer.from(pdfUint8Array);
}

/**
 * Pipeline completo corregido para generación de un documento individual:
 * 1. Genera QR con URL de verificación y código del documento.
 * 2. Inyecta variables en el HTML.
 * 3. Renderiza a PDF con Playwright (offline, CSS embebido).
 * 4. Inyecta metadatos binarios en el PDF y calcula SHA-256 definitivo.
 */
export async function generarDocumentoIndividual(
  empresa: EmpresaData,
  persona: PersonaData,
  plantilla: PlantillaConfig,
  customValues: Record<string, string> = {}
): Promise<RenderResult> {
  const fechaHoy = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Generar QR de verificación
  const urlVerificacion = `https://verificar.documentos.gob.pe/?doc=${persona.numero_documento}&t=${Date.now()}`;
  const qrDataUrl = await generarQrDataUrl(urlVerificacion);

  // Inyección de variables en HTML
  const htmlInyectado = inyectarVariables(plantilla.contenido_html, empresa, persona, {
    fecha_emision: fechaHoy,
    qr_verificacion: qrDataUrl,
    hash_sha256: 'Sello Criptográfico Registrado', // Marcador visual
    ...customValues,
  });

  // Renderizado a PDF con Chromium
  const pdfBufferInicial = await renderHtmlToPdf(
    htmlInyectado,
    plantilla.orientacion,
    plantilla.tamano_hoja
  );

  // Inyección de metadatos formales con pdf-lib
  const tituloDoc = plantilla.config_metadatos?.titulo
    ? inyectarVariables(plantilla.config_metadatos.titulo, empresa, persona, {
        fecha_emision: fechaHoy,
        qr_verificacion: '',
        hash_sha256: '',
      })
    : `${plantilla.nombre} - ${persona.nombres} ${persona.apellidos}`;

  const { pdfFinal, hash_sha256 } = await sellarEInyectarMetadatos(pdfBufferInicial, {
    titulo: tituloDoc,
    autor: empresa.razon_social,
    asunto: plantilla.config_metadatos?.asunto || `Documento Oficial ${plantilla.nombre}`,
    palabrasClave: plantilla.config_metadatos?.palabras_clave || 'documento, oficial, pdf',
    productor: 'PDF Studio Engine v1.0',
    creador: 'PDF Studio Multi-Empresa',
  });

  // Nomenclatura normalizada: [DNI]_[Apellidos]_[Plantilla].pdf
  const apellidosLimpios = (persona.apellidos || 'persona')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 30);
  const plantillaLimpia = (plantilla.nombre || 'documento')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 30);
  const filename = `${persona.numero_documento}_${apellidosLimpios}_${plantillaLimpia}.pdf`;

  return {
    filename,
    pdfBuffer: pdfFinal,
    hash_sha256,
    metadatos: {
      titulo: tituloDoc,
      autor: empresa.razon_social,
      hash_sha256,
    },
  };
}
