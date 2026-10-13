import { PDFDocument } from 'pdf-lib';
import crypto from 'crypto';

export interface MetadatosConfig {
  titulo?: string;
  autor?: string;
  asunto?: string;
  palabrasClave?: string;
  productor?: string;
  creador?: string;
}

export interface SelladoResult {
  pdfFinal: Buffer;
  hash_sha256: string;
}

/**
 * Calcula el hash SHA-256 de un buffer.
 */
export function calcularSha256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Inyecta metadatos binarios formales y calcula la firma criptográfica SHA-256.
 */
export async function sellarEInyectarMetadatos(
  pdfBuffer: Buffer,
  metadatos: MetadatosConfig
): Promise<SelladoResult> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);

  // 1. Inyectar metadatos estándar a nivel de diccionario PDF
  if (metadatos.titulo) {
    pdfDoc.setTitle(metadatos.titulo);
  }
  if (metadatos.autor) {
    pdfDoc.setAuthor(metadatos.autor);
  }
  if (metadatos.asunto) {
    pdfDoc.setSubject(metadatos.asunto);
  }
  if (metadatos.palabrasClave) {
    pdfDoc.setKeywords(metadatos.palabrasClave.split(',').map((k) => k.trim()));
  }

  const now = new Date();
  pdfDoc.setProducer(metadatos.productor || 'Ellucian Document Delivery Service (PDF v1.7)');
  pdfDoc.setCreator(metadatos.creador || 'Ellucian Colleague Student Self-Servicec v2026.2');
  pdfDoc.setCreationDate(now);
  pdfDoc.setModificationDate(now);

  // 2. Guardar el PDF con los metadatos aplicados
  const pdfBytes = await pdfDoc.save();
  const pdfFinal = Buffer.from(pdfBytes);

  // 3. Calcular el hash criptográfico SHA-256 del archivo sellado definitivo
  const hash_sha256 = calcularSha256(pdfFinal);

  return {
    pdfFinal,
    hash_sha256,
  };
}
