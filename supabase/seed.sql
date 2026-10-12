-- ==============================================================================
-- DATOS SEMILLA (SEED DATA): PDF Studio
-- ==============================================================================

-- 1. Insertar Empresas Demo
INSERT INTO empresas (id, razon_social, identificacion_fiscal, correo_contacto, telefono, direccion)
VALUES 
    ('e1111111-1111-1111-1111-111111111111', 'Corporación Minera del Sur S.A.C.', '20601234567', 'rrhh@minerasur.pe', '+51 987654321', 'Av. Las Begonias 450, San Isidro'),
    ('e2222222-2222-2222-2222-222222222222', 'Constructora e Inmobiliaria Andina S.A.', '20509876543', 'admin@andina.com', '+51 912345678', 'Av. Javier Prado Este 2340, Lima'),
    ('e3333333-3333-3333-3333-333333333333', 'University of the People', 'UOP-US-91101', 'payments@uopeople.edu', '+1 626 264 8880', '595E. Colorado Boulevard, Suite 623, Pasadena, CA 91101')
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


-- 2.3 Insertar Plantilla Oficial University of the People
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
    'p3333333-3333-3333-3333-333333333333',
    'e3333333-3333-3333-3333-333333333333',
    true,
    'Transaction Report - University of the People',
    'Reporte oficial de transacciones académicas (UoPeople) con carreras, materias y montos dinámicos.',
    'comprobante',
    'portrait',
    'A4',
    '<div style="width: 100%; min-height: 100%; box-sizing: border-box; background-color: #ffffff; padding: 20px 24px; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif; color: #222222;">
  <!-- Borde exterior purpura oficial UoPeople -->
  <div style="border: 14px solid #3c2464; padding: 32px 38px; box-sizing: border-box; min-height: 1010px; display: flex; flex-direction: column; justify-content: space-between; position: relative;">

    <div>
      <!-- Cabecera Principal -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
        <div>
          <h1 style="font-size: 32px; font-weight: 400; color: #2d1a47; margin: 0; line-height: 1.1; letter-spacing: -0.5px;">Transaction Report</h1>
          <div style="width: 210px; height: 3px; background-color: #e5a823; margin-top: 8px; margin-bottom: 12px;"></div>
          <div style="font-size: 13px; font-weight: bold; color: #e5a823; margin-bottom: 4px;">{{empresa.razon_social}}</div>
          <div style="font-size: 11px; color: #333333; line-height: 1.4;">
            {{empresa.direccion}}<br>
            {{empresa.correo_contacto}}
          </div>
        </div>

        <div style="text-align: right;">
          <img src="data:image/png;base64,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" alt="University of the People" style="height: 50px; display: inline-block; margin-bottom: 10px;" />
          <div style="font-size: 11px; color: #222222; font-weight: 500;">Date: {{fecha_emision}}</div>
          <div style="font-size: 11px; color: #222222; font-weight: 500; margin-top: 2px;">Time: {{persona.extra.hora_emision}}</div>
        </div>
      </div>

      <!-- Datos del Estudiante y Programa -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 12px; line-height: 1.6;">
        <div>
          <div><span style="color: #444444;">Student Name:</span> <strong style="color: #111111; font-size: 13px;">{{persona.nombres}} {{persona.apellidos}}</strong></div>
          <div><span style="color: #444444;">UoPeople ID:</span> <strong>{{persona.extra.uopeople_id}}</strong></div>
        </div>
        <div style="text-align: right;">
          <div><span style="color: #444444;">Program:</span> <strong style="color: #111111; font-size: 13px;">{{persona.extra.carrera}}</strong></div>
          <div style="margin-top: 2px;"><span style="color: #444444;">Academic Year:</span> <strong style="color: #111111;">{{persona.extra.ano_academico}}</strong></div>
        </div>
      </div>

      <!-- Tabla de Transacciones con Marca de Agua de Fondo -->
      <div style="position: relative; margin-bottom: 22px;">
        <!-- Marca de Agua (Escudo UoPeople) -->
        <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 1;">
          <img src="data:image/png;base64,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" style="width: 170px; opacity: 0.08;" />
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 11px; position: relative; z-index: 2;">
          <thead>
            <tr style="background-color: #ffffff;">
              <th style="border: 1px solid #333333; padding: 8px 12px; text-align: left; font-weight: bold; color: #111111;">Fee Description</th>
              <th style="border: 1px solid #333333; padding: 8px 12px; text-align: center; font-weight: bold; color: #111111; width: 110px;">Date</th>
              <th style="border: 1px solid #333333; padding: 8px 12px; text-align: center; font-weight: bold; color: #111111; width: 140px;">Payment Method</th>
              <th style="border: 1px solid #333333; padding: 8px 12px; text-align: right; font-weight: bold; color: #111111; width: 110px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #333333; padding: 7px 12px; color: #222222;">{{persona.extra.materia_1_desc}}</td>
              <td style="border: 1px solid #333333; padding: 7px 12px; text-align: center; color: #222222;">{{persona.extra.materia_1_fecha}}</td>
              <td style="border: 1px solid #333333; padding: 7px 12px; text-align: center; color: #222222;">{{persona.extra.materia_1_metodo}}</td>
              <td style="border: 1px solid #333333; padding: 7px 12px; text-align: right; color: #222222;">{{persona.extra.materia_1_monto}}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #333333; padding: 7px 12px; color: #222222;">{{persona.extra.materia_2_desc}}</td>
              <td style="border: 1px solid #333333; padding: 7px 12px; text-align: center; color: #222222;">{{persona.extra.materia_2_fecha}}</td>
              <td style="border: 1px solid #333333; padding: 7px 12px; text-align: center; color: #222222;">{{persona.extra.materia_2_metodo}}</td>
              <td style="border: 1px solid #333333; padding: 7px 12px; text-align: right; color: #222222;">{{persona.extra.materia_2_monto}}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #333333; padding: 7px 12px; color: #222222;">{{persona.extra.materia_3_desc}}</td>
              <td style="border: 1px solid #333333; padding: 7px 12px; text-align: center; color: #222222;">{{persona.extra.materia_3_fecha}}</td>
              <td style="border: 1px solid #333333; padding: 7px 12px; text-align: center; color: #222222;">{{persona.extra.materia_3_metodo}}</td>
              <td style="border: 1px solid #333333; padding: 7px 12px; text-align: right; color: #222222;">{{persona.extra.materia_3_monto}}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #333333; padding: 7px 12px; color: #222222;">{{persona.extra.materia_4_desc}}</td>
              <td style="border: 1px solid #333333; padding: 7px 12px; text-align: center; color: #222222;">{{persona.extra.materia_4_fecha}}</td>
              <td style="border: 1px solid #333333; padding: 7px 12px; text-align: center; color: #222222;">{{persona.extra.materia_4_metodo}}</td>
              <td style="border: 1px solid #333333; padding: 7px 12px; text-align: right; color: #222222;">{{persona.extra.materia_4_monto}}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #333333; padding: 7px 12px; color: #222222;">{{persona.extra.materia_5_desc}}</td>
              <td style="border: 1px solid #333333; padding: 7px 12px; text-align: center; color: #222222;">{{persona.extra.materia_5_fecha}}</td>
              <td style="border: 1px solid #333333; padding: 7px 12px; text-align: center; color: #222222;">{{persona.extra.materia_5_metodo}}</td>
              <td style="border: 1px solid #333333; padding: 7px 12px; text-align: right; color: #222222;">{{persona.extra.materia_5_monto}}</td>
            </tr>
            <!-- Totales -->
            <tr>
              <td colspan="3" style="border: 1px solid #333333; padding: 7px 12px; text-align: right; font-weight: bold; color: #111111;">Total Charges</td>
              <td style="border: 1px solid #333333; padding: 7px 12px; text-align: right; font-weight: bold; color: #111111;">{{persona.extra.total_charges}}</td>
            </tr>
            <tr>
              <td colspan="3" style="border: 1px solid #333333; padding: 7px 12px; text-align: right; font-weight: bold; color: #111111;">Total Paid</td>
              <td style="border: 1px solid #333333; padding: 7px 12px; text-align: right; font-weight: bold; color: #111111;">{{persona.extra.total_paid}}</td>
            </tr>
            <tr>
              <td colspan="3" style="border: 1px solid #333333; padding: 7px 12px; text-align: right; font-weight: bold; color: #111111;">Remaining Balance Due</td>
              <td style="border: 1px solid #333333; padding: 7px 12px; text-align: right; font-weight: bold; color: #27ae60;">{{persona.extra.remaining_balance}}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Cuadro de Account Status -->
      <div style="border: 1.5px solid #27ae60; background-color: #f6fcf8; padding: 12px 18px; border-radius: 3px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px;">
        <div>
          <div style="color: #1e7e34; font-weight: bold; font-size: 12px; letter-spacing: 0.3px;">ACCOUNT STATUS: {{persona.extra.estado_cuenta}}</div>
          <div style="font-size: 10.5px; color: #444444; margin-top: 3px; max-width: 500px; line-height: 1.35;">
            All assessment and application fees have been successfully received and credited. Current outstanding balance is $0.00.
          </div>
        </div>
        <div style="background-color: #27ae60; color: #ffffff; font-weight: bold; font-size: 10px; padding: 6px 12px; border-radius: 3px; text-align: center; line-height: 1.2; text-transform: uppercase;">
          PAID IN<br>FULL
        </div>
      </div>
    </div>

    <!-- Pie de Pagina Oficial -->
    <div style="border-top: 1px solid #cccccc; padding-top: 12px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 9.5px; color: #555555;">
      <div>
        <div style="font-weight: bold; color: #333333; margin-bottom: 2px;">Office of Student Accounts • Payments Administration</div>
        <div>This is an official electronic transaction record issued via the UoPeople Student Portal.</div>
        <div>University of the People is an accredited institution by the DEAC and WSCUC.</div>
      </div>
      <div style="text-align: right; line-height: 1.4;">
        <div>Verification Code: <span style="font-family: monospace; font-weight: bold;">{{persona.extra.verification_code}}</span></div>
        <div style="color: #777777;">Official Electronic Record</div>
      </div>
    </div>

  </div>
</div>',
    ARRAY['persona.nombres', 'persona.apellidos', 'persona.extra.carrera', 'persona.extra.total_charges', 'persona.extra.verification_code'],
    '{"titulo": "Transaction Report - {persona.nombres} {persona.apellidos}", "autor": "University of the People", "asunto": "Official Academic Transaction Report"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 4. Insertar Personas de Prueba para Empresa 1 y UoPeople
INSERT INTO personas (empresa_id, tipo_documento, numero_documento, nombres, apellidos, correo, telefono, cargo, departamento_area, datos_adicionales)
VALUES
    ('e1111111-1111-1111-1111-111111111111', 'DNI', '72345678', 'Carlos Alberto', 'Mendoza Quispe', 'carlos.mendoza@minerasur.pe', '987112233', 'Supervisor de Operaciones', 'Mina', '{}'::jsonb),
    ('e1111111-1111-1111-1111-111111111111', 'DNI', '45891234', 'María Elena', 'Rosas Gutierrez', 'maria.rosas@minerasur.pe', '976223344', 'Especialista en Seguridad SST', 'Seguridad', '{}'::jsonb),
    ('e1111111-1111-1111-1111-111111111111', 'DNI', '48123901', 'Jorge Luis', 'Paredes Flores', 'jorge.paredes@minerasur.pe', '955334455', 'Operador de Maquinaria Pesada', 'Mantenimiento', '{}'::jsonb),
    ('e3333333-3333-3333-3333-333333333333', 'ID', 'UOP-98234', 'Franco', 'Lopez Plaza', 'franco.lopez@your.uopeople.edu', '+51 987654321', 'Estudiante', 'Computer Science', '{
      "uopeople_id": "UOP-98234",
      "carrera": "Bachelor of Science in Computer Science",
      "ano_academico": "2026-2027",
      "fecha_emision": "10/07/2026",
      "hora_emision": "10:15 AM",
      "materia_1_desc": "Programming Fundamentals",
      "materia_1_fecha": "10/07/2026",
      "materia_1_metodo": "CREDIT CARD",
      "materia_1_monto": "$140",
      "materia_2_desc": "English Composition 2",
      "materia_2_fecha": "10/07/2026",
      "materia_2_metodo": "CREDIT CARD",
      "materia_2_monto": "$140",
      "materia_3_desc": "Introduction to Computer Science",
      "materia_3_fecha": "08/15/2026",
      "materia_3_metodo": "CREDIT CARD",
      "materia_3_monto": "$140",
      "materia_4_desc": "Online Education Strategies",
      "materia_4_fecha": "08/15/2026",
      "materia_4_metodo": "CREDIT CARD",
      "materia_4_monto": "$140",
      "materia_5_desc": "Application fee",
      "materia_5_fecha": "08/05/2026",
      "materia_5_metodo": "CREDIT CARD",
      "materia_5_monto": "$60",
      "total_charges": "$620",
      "total_paid": "-$620",
      "remaining_balance": "$0",
      "estado_cuenta": "PAID IN FULL • GOOD STANDING",
      "verification_code": "UOP-TR-2026-98234"
    }'::jsonb)
ON CONFLICT (empresa_id, numero_documento) DO NOTHING;
