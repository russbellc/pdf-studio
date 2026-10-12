import archiver from 'archiver';
import { PassThrough } from 'stream';

export interface ArchivoEnZip {
  nombreArchivo: string;
  buffer: Buffer;
}

/**
 * Empaqueta una lista de archivos PDF individuales en un buffer comprimido ZIP.
 */
export async function empaquetarLoteEnZip(archivos: ArchivoEnZip[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Nivel máximo de compresión
    });

    const passThrough = new PassThrough();
    const chunks: Buffer[] = [];

    passThrough.on('data', (chunk) => chunks.push(chunk));
    passThrough.on('end', () => resolve(Buffer.concat(chunks)));
    passThrough.on('error', (err) => reject(err));

    archive.on('error', (err) => reject(err));
    archive.pipe(passThrough);

    for (const archivo of archivos) {
      archive.append(archivo.buffer, { name: archivo.nombreArchivo });
    }

    archive.finalize();
  });
}
