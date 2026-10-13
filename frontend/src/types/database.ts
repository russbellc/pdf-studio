export interface Empresa {
  id: string;
  razon_social: string;
  identificacion_fiscal: string;
  correo_contacto?: string;
  telefono?: string;
  direccion?: string;
  logo_url?: string;
  firma_url?: string;
  metadatos_default?: Record<string, any>;
  activo: boolean;
  created_at: string;
}

export interface Persona {
  id: string;
  empresa_id: string;
  tipo_documento: string;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  correo?: string;
  telefono?: string;
  cargo?: string;
  departamento_area?: string;
  datos_adicionales?: Record<string, any>;
  activo: boolean;
  created_at: string;
}

export interface Plantilla {
  id: string;
  empresa_id?: string | null;
  es_global: boolean;
  nombre: string;
  descripcion?: string;
  tipo: 'certificado' | 'contrato' | 'comprobante' | 'constancia';
  orientacion: 'portrait' | 'landscape';
  tamano_hoja: 'A4' | 'letter' | '288x373mm' | string;
  contenido_html: string;
  variables_requeridas: string[];
  config_metadatos?: {
    titulo?: string;
    autor?: string;
    asunto?: string;
    palabras_clave?: string;
    creador?: string;
    productor?: string;
  };
  plantilla_origen_id?: string | null;
  activo: boolean;
  created_at: string;
}

export interface DocumentoGenerado {
  id: string;
  empresa_id: string;
  persona_id: string;
  plantilla_id?: string | null;
  nombre_archivo: string;
  storage_path: string;
  hash_sha256: string;
  metadatos_aplicados: Record<string, any>;
  datos_snapshot: Record<string, any>;
  created_at: string;
  // Campos populados en frontend:
  persona_nombre?: string;
  persona_documento?: string;
  plantilla_nombre?: string;
  empresa_nombre?: string;
}
