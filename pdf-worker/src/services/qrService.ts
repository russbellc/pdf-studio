import QRCode from 'qrcode';

/**
 * Genera un Data URL PNG con el código QR para verificación del documento.
 */
export async function generarQrDataUrl(contenido: string): Promise<string> {
  try {
    return await QRCode.toDataURL(contenido, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 200,
      color: {
        dark: '#1e293b', // slate-800
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Error generando QR code:', err);
    // Retornar pixel transparente base64 en caso de fallo
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  }
}
