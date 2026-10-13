export interface EmpresaData {
  id?: string;
  razon_social: string;
  identificacion_fiscal: string;
  correo_contacto?: string;
  telefono?: string;
  direccion?: string;
  logo_url?: string;
  firma_url?: string;
}

export interface PersonaData {
  id?: string;
  tipo_documento: string;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  correo?: string;
  telefono?: string;
  cargo?: string;
  departamento_area?: string;
  datos_adicionales?: Record<string, any>;
}

export interface PlantillaConfig {
  id?: string;
  nombre: string;
  orientacion: 'portrait' | 'landscape';
  tamano_hoja: 'A4' | 'letter' | '288x373mm' | string;
  contenido_html: string;
  config_metadatos?: {
    titulo?: string;
    autor?: string;
    asunto?: string;
    palabras_clave?: string;
    creador?: string;
    productor?: string;
  };
}

export interface RenderSingleRequest {
  empresa: EmpresaData;
  persona: PersonaData;
  plantilla: PlantillaConfig;
  custom_values?: Record<string, string>;
}

export interface RenderBatchRequest {
  empresa: EmpresaData;
  personas: PersonaData[];
  plantilla: PlantillaConfig;
  custom_values?: Record<string, string>;
}

export interface RenderResult {
  filename: string;
  pdfBuffer: Buffer;
  hash_sha256: string;
  metadatos: Record<string, string>;
}
