-- ==============================================================================
-- MIGRACIÓN INICIAL: PDF Studio Multi-Empresa
-- Base de Datos PostgreSQL / Supabase
-- ==============================================================================

-- Habilitar extensión pgcrypto para UUIDs y funciones criptográficas
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABLA: EMPRESAS
CREATE TABLE IF NOT EXISTS empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    razon_social TEXT NOT NULL,
    identificacion_fiscal TEXT NOT NULL UNIQUE, -- RUC / NIT / CIF
    correo_contacto TEXT,
    telefono TEXT,
    direccion TEXT,
    logo_url TEXT,
    firma_url TEXT, -- Firma digital o sello institucional por defecto
    metadatos_default JSONB DEFAULT '{"productor": "PDF Studio Engine", "autor": "Empresa"}'::jsonb,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA: PERSONAS (Aisladas por Empresa)
CREATE TABLE IF NOT EXISTS personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    tipo_documento TEXT NOT NULL DEFAULT 'DNI', -- DNI, CE, PASAPORTE
    numero_documento TEXT NOT NULL,
    nombres TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    correo TEXT,
    telefono TEXT,
    cargo TEXT,
    departamento_area TEXT,
    datos_adicionales JSONB DEFAULT '{}'::jsonb, -- Flexibilidad para cualquier columna extra de Excel
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uk_persona_empresa_documento UNIQUE (empresa_id, numero_documento)
);

-- 3. TABLA: PLANTILLAS (Globales o Propias de Empresa)
CREATE TABLE IF NOT EXISTS plantillas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE, -- NULL si es_global = true
    es_global BOOLEAN DEFAULT false,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    tipo TEXT NOT NULL DEFAULT 'certificado', -- certificado, contrato, comprobante, constancia
    orientacion TEXT NOT NULL DEFAULT 'portrait', -- portrait | landscape
    tamano_hoja TEXT NOT NULL DEFAULT 'A4', -- A4 | letter
    contenido_html TEXT NOT NULL, -- Código HTML/Tailwind con etiquetas {{persona.nombres}}, etc.
    variables_requeridas TEXT[] DEFAULT '{}',
    config_metadatos JSONB DEFAULT '{
        "titulo": "{{plantilla.nombre}} - {{persona.nombres}} {{persona.apellidos}}",
        "autor": "{{empresa.razon_social}}",
        "asunto": "Documento Oficial emitido",
        "palabras_clave": "oficial, certificado, pdf"
    }'::jsonb,
    plantilla_origen_id UUID REFERENCES plantillas(id) ON DELETE SET NULL, -- Trazabilidad de plantillas clonadas
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: DOCUMENTOS GENERADOS POR PERSONA
CREATE TABLE IF NOT EXISTS documentos_generados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    plantilla_id UUID REFERENCES plantillas(id) ON DELETE SET NULL,
    nombre_archivo TEXT NOT NULL,
    storage_path TEXT NOT NULL, -- Ruta dentro del bucket de Supabase Storage
    hash_sha256 TEXT NOT NULL, -- Huella criptográfica del archivo
    metadatos_aplicados JSONB NOT NULL,
    datos_snapshot JSONB NOT NULL, -- Datos de la persona en el momento exacto de emisión
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA: CONFIGURACIÓN GLOBAL DEL ADMIN
CREATE TABLE IF NOT EXISTS configuracion (
    clave TEXT PRIMARY KEY,
    valor JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ÍNDICES DE RENDIMIENTO
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_personas_empresa_id ON personas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_personas_doc ON personas(empresa_id, numero_documento);
CREATE INDEX IF NOT EXISTS idx_plantillas_empresa_id ON plantillas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_plantillas_es_global ON plantillas(es_global);
CREATE INDEX IF NOT EXISTS idx_documentos_persona_id ON documentos_generados(persona_id);
CREATE INDEX IF NOT EXISTS idx_documentos_empresa_id ON documentos_generados(empresa_id);

-- ==============================================================================
-- FUNCIÓN: CLONAR PLANTILLA A OTRA EMPRESA
-- Permite tomar cualquier plantilla (global o de otra empresa) y clonarla
-- como formato propio para una empresa destino seleccionada.
-- ==============================================================================
CREATE OR REPLACE FUNCTION clonar_plantilla(
    p_plantilla_id UUID,
    p_empresa_destino_id UUID,
    p_nuevo_nombre TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_plantilla_original RECORD;
    v_nueva_plantilla_id UUID;
    v_nombre_final TEXT;
BEGIN
    -- 1. Obtener la plantilla origen
    SELECT * INTO v_plantilla_original FROM plantillas WHERE id = p_plantilla_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'La plantilla origen no existe.';
    END IF;

    -- 2. Verificar que la empresa destino exista
    PERFORM 1 FROM empresas WHERE id = p_empresa_destino_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'La empresa destino no existe.';
    END IF;

    -- 3. Definir el nombre de la copia
    IF p_nuevo_nombre IS NOT NULL AND trim(p_nuevo_nombre) <> '' THEN
        v_nombre_final := p_nuevo_nombre;
    ELSE
        v_nombre_final := v_plantilla_original.nombre || ' (Copia)';
    END IF;

    -- 4. Insertar la nueva plantilla vinculada a la empresa destino
    INSERT INTO plantillas (
        empresa_id,
        es_global,
        nombre,
        descripcion,
        tipo,
        orientacion,
        tamano_hoja,
        contenido_html,
        variables_requeridas,
        config_metadatos,
        plantilla_origen_id
    ) VALUES (
        p_empresa_destino_id,
        false, -- Siempre es propia de la empresa destino
        v_nombre_final,
        v_plantilla_original.descripcion,
        v_plantilla_original.tipo,
        v_plantilla_original.orientacion,
        v_plantilla_original.tamano_hoja,
        v_plantilla_original.contenido_html,
        v_plantilla_original.variables_requeridas,
        v_plantilla_original.config_metadatos,
        v_plantilla_original.id
    ) RETURNING id INTO v_nueva_plantilla_id;

    RETURN v_nueva_plantilla_id;
END;
$$;
