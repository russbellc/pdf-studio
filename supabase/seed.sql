-- ==============================================================================
-- DATOS SEMILLA (SEED DATA): PDF Studio
-- ==============================================================================

-- 1. Insertar Empresas Demo
INSERT INTO empresas (id, razon_social, identificacion_fiscal, correo_contacto, telefono, direccion)
VALUES 
    ('e1111111-1111-1111-1111-111111111111', 'Corporación Minera del Sur S.A.C.', '20601234567', 'rrhh@minerasur.pe', '+51 987654321', 'Av. Las Begonias 450, San Isidro'),
    ('e2222222-2222-2222-2222-222222222222', 'Constructora e Inmobiliaria Andina S.A.', '20509876543', 'admin@andina.com', '+51 912345678', 'Av. Javier Prado Este 2340, Lima')
ON CONFLICT (identificacion_fiscal) DO NOTHING;

-- 2. Insertar Plantilla Global 1: Certificado de Capacitación / Inducción
INSERT INTO plantillas (
    id,
    empresa_id,
    es_global,
    nombre,
    descripcion,
    tipo,
    orientacion,
    tamano_hoja,
    contenido_html,
    variables_requeridas,
    config_metadatos
) VALUES (
    'p1111111-1111-1111-1111-111111111111',
    NULL, -- Global para todas las empresas
    true,
    'Certificado de Capacitación Oficial',
    'Plantilla horizontal elegante para cursos, inducciones y certificaciones técnicas.',
    'certificado',
    'landscape',
    'A4',
    '<div class="w-full h-full p-12 bg-white flex flex-col justify-between border-[8px] border-amber-600 font-sans relative">
        <div class="absolute inset-4 border border-amber-300 pointer-events-none"></div>
        <div class="text-center z-10 pt-4">
            <p class="text-xs uppercase tracking-widest text-amber-700 font-bold mb-1">{{empresa.razon_social}}</p>
            <h1 class="text-4xl font-serif text-slate-800 font-bold tracking-wide">CERTIFICADO DE RECONOCIMIENTO</h1>
            <p class="text-sm text-slate-500 mt-1">Por haber culminado satisfactoriamente el programa de entrenamiento</p>
        </div>
        
        <div class="text-center z-10 my-6">
            <p class="text-xs text-slate-400 uppercase tracking-widest mb-1">Se otorga el presente a:</p>
            <h2 class="text-3xl font-bold text-slate-900 border-b-2 border-amber-600 inline-block pb-1 px-8">{{persona.nombres}} {{persona.apellidos}}</h2>
            <p class="text-sm text-slate-600 mt-3 font-medium">Documento de Identidad: <span class="font-bold">{{persona.tipo_documento}} {{persona.numero_documento}}</span></p>
            <p class="text-sm text-slate-600">Cargo / Posición: <span class="font-semibold">{{persona.cargo}}</span></p>
            <p class="text-xs text-slate-500 max-w-xl mx-auto mt-4 leading-relaxed">
                Por su destacada participación en el programa de actualización y capacitación técnica, cumpliendo con los estándares exigidos de evaluación y asistencia.
            </p>
        </div>

        <div class="flex justify-between items-end z-10 px-8 pb-4 text-xs text-slate-600">
            <div class="text-center">
                <div class="w-40 border-b border-slate-400 mb-1"></div>
                <p class="font-bold text-slate-800">{{empresa.razon_social}}</p>
                <p class="text-[10px] text-slate-400">RUC: {{empresa.identificacion_fiscal}}</p>
            </div>
            <div class="text-center">
                <div class="p-1 bg-white border border-slate-300 rounded shadow-sm inline-block mb-1">
                    <img src="{{qr_verificacion}}" alt="QR Validación" class="w-16 h-16" />
                </div>
                <p class="text-[9px] text-slate-400">Escanea para verificar integridad</p>
                <p class="text-[8px] font-mono text-slate-400 truncate max-w-[120px]">{{hash_sha256}}</p>
            </div>
            <div class="text-center">
                <div class="w-40 border-b border-slate-400 mb-1"></div>
                <p class="font-bold text-slate-800">Dirección Académica</p>
                <p class="text-[10px] text-slate-400">Fecha de Emisión: {{fecha_emision}}</p>
            </div>
        </div>
    </div>',
    ARRAY['persona.nombres', 'persona.apellidos', 'persona.numero_documento', 'persona.cargo', 'empresa.razon_social'],
    '{"titulo": "Certificado - {{persona.nombres}} {{persona.apellidos}}", "autor": "{{empresa.razon_social}}", "asunto": "Certificado de Capacitación", "palabras_clave": "certificado, capacitacion, oficial"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 3. Insertar Plantilla Global 2: Constancia de Entrega de EPP / Equipos
INSERT INTO plantillas (
    id,
    empresa_id,
    es_global,
    nombre,
    descripcion,
    tipo,
    orientacion,
    tamano_hoja,
    contenido_html,
    variables_requeridas,
    config_metadatos
) VALUES (
    'p2222222-2222-2222-2222-222222222222',
    NULL, -- Global
    true,
    'Constancia de Entrega de Equipos / EPP',
    'Formato vertical formal para actas de recepción de bienes o equipos de protección.',
    'comprobante',
    'portrait',
    'A4',
    '<div class="w-full h-full p-10 bg-white flex flex-col justify-between font-sans text-slate-800">
        <div>
            <div class="flex justify-between items-start border-b pb-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-slate-900">ACTA DE ENTREGA Y RECEPCIÓN</h1>
                    <p class="text-xs text-slate-500 uppercase tracking-wider">Documento Administrativo Interno</p>
                </div>
                <div class="text-right text-xs">
                    <p class="font-bold text-slate-800">{{empresa.razon_social}}</p>
                    <p class="text-slate-500">RUC: {{empresa.identificacion_fiscal}}</p>
                    <p class="text-slate-500">Fecha: {{fecha_emision}}</p>
                </div>
            </div>

            <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 text-xs">
                <h3 class="font-bold text-slate-800 uppercase mb-2">Datos del Receptor / Colaborador</h3>
                <div class="grid grid-cols-2 gap-2">
                    <p><span class="font-semibold text-slate-600">Apellidos y Nombres:</span> {{persona.apellidos}}, {{persona.nombres}}</p>
                    <p><span class="font-semibold text-slate-600">Doc. Identidad:</span> {{persona.tipo_documento}} {{persona.numero_documento}}</p>
                    <p><span class="font-semibold text-slate-600">Cargo:</span> {{persona.cargo}}</p>
                    <p><span class="font-semibold text-slate-600">Área / Depto:</span> {{persona.departamento_area}}</p>
                </div>
            </div>

            <div class="mb-6 text-xs leading-relaxed text-slate-700">
                <p class="mb-3">Por medio del presente documento, el colaborador declara haber recibido a entera satisfacción los materiales, herramientas o equipos de trabajo necesarios para el desempeño seguro de sus funciones en la empresa <span class="font-bold">{{empresa.razon_social}}</span>.</p>
                <p>El colaborador se compromete a hacer uso adecuado de los mismos, salvaguardar su estado y reportar inmediatamente cualquier desperfecto o pérdida.</p>
            </div>
        </div>

        <div>
            <div class="flex justify-between items-end pt-12 border-t border-slate-200 text-xs">
                <div class="text-center w-52">
                    <div class="border-b border-slate-400 mb-2 h-16"></div>
                    <p class="font-bold text-slate-800">{{persona.nombres}} {{persona.apellidos}}</p>
                    <p class="text-[10px] text-slate-500">{{persona.tipo_documento}}: {{persona.numero_documento}}</p>
                    <p class="text-[10px] text-slate-400">Firma del Colaborador</p>
                </div>
                
                <div class="text-center">
                    <img src="{{qr_verificacion}}" alt="QR" class="w-16 h-16 mx-auto mb-1 border p-1 rounded" />
                    <p class="text-[8px] font-mono text-slate-400 truncate max-w-[140px]">{{hash_sha256}}</p>
                </div>

                <div class="text-center w-52">
                    <div class="border-b border-slate-400 mb-2 h-16"></div>
                    <p class="font-bold text-slate-800">Por la Empresa</p>
                    <p class="text-[10px] text-slate-500">Administración / Logística</p>
                    <p class="text-[10px] text-slate-400">Firma y Sello</p>
                </div>
            </div>
        </div>
    </div>',
    ARRAY['persona.nombres', 'persona.apellidos', 'persona.numero_documento', 'persona.cargo', 'empresa.razon_social'],
    '{"titulo": "Acta Entrega - {{persona.nombres}} {{persona.apellidos}}", "autor": "{{empresa.razon_social}}", "asunto": "Acta de Entrega de Equipos", "palabras_clave": "acta, epp, recepcion"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 4. Insertar Personas de Prueba para Empresa 1
INSERT INTO personas (empresa_id, tipo_documento, numero_documento, nombres, apellidos, correo, telefono, cargo, departamento_area)
VALUES
    ('e1111111-1111-1111-1111-111111111111', 'DNI', '72345678', 'Carlos Alberto', 'Mendoza Quispe', 'carlos.mendoza@minerasur.pe', '987112233', 'Supervisor de Operaciones', 'Mina'),
    ('e1111111-1111-1111-1111-111111111111', 'DNI', '45891234', 'María Elena', 'Rosas Gutierrez', 'maria.rosas@minerasur.pe', '976223344', 'Especialista en Seguridad SST', 'Seguridad'),
    ('e1111111-1111-1111-1111-111111111111', 'DNI', '48123901', 'Jorge Luis', 'Paredes Flores', 'jorge.paredes@minerasur.pe', '955334455', 'Operador de Maquinaria Pesada', 'Mantenimiento')
ON CONFLICT (empresa_id, numero_documento) DO NOTHING;
