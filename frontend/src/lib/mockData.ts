import { Empresa, Persona, Plantilla, DocumentoGenerado } from '../types/database';

export const INITIAL_EMPRESAS: Empresa[] = [
  {
    id: 'e1111111-1111-1111-1111-111111111111',
    razon_social: 'Corporación Minera del Sur S.A.C.',
    identificacion_fiscal: '20601234567',
    correo_contacto: 'rrhh@minerasur.pe',
    telefono: '+51 987654321',
    direccion: 'Av. Las Begonias 450, San Isidro',
    activo: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'e2222222-2222-2222-2222-222222222222',
    razon_social: 'Constructora e Inmobiliaria Andina S.A.',
    identificacion_fiscal: '20509876543',
    correo_contacto: 'contacto@andina.com',
    telefono: '+51 912345678',
    direccion: 'Av. Javier Prado Este 2340, Lima',
    activo: true,
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_PLANTILLAS: Plantilla[] = [
  {
    id: 'p1111111-1111-1111-1111-111111111111',
    empresa_id: null,
    es_global: true,
    nombre: 'Certificado de Capacitación Oficial',
    descripcion: 'Plantilla horizontal elegante para cursos, inducciones y certificaciones técnicas.',
    tipo: 'certificado',
    orientacion: 'landscape',
    tamano_hoja: 'A4',
    contenido_html: `<div class="w-full h-full p-12 bg-white flex flex-col justify-between border-[8px] border-amber-600 font-sans relative">
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
</div>`,
    variables_requeridas: ['persona.nombres', 'persona.apellidos', 'persona.numero_documento', 'persona.cargo', 'empresa.razon_social'],
    config_metadatos: {
      titulo: 'Certificado - {{persona.nombres}} {{persona.apellidos}}',
      autor: '{{empresa.razon_social}}',
      asunto: 'Certificado de Capacitación',
      palabras_clave: 'certificado, capacitacion, oficial',
    },
    activo: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'p2222222-2222-2222-2222-222222222222',
    empresa_id: null,
    es_global: true,
    nombre: 'Constancia de Entrega de Equipos / EPP',
    descripcion: 'Formato vertical formal para actas de recepción de bienes o equipos de protección.',
    tipo: 'comprobante',
    orientacion: 'portrait',
    tamano_hoja: 'A4',
    contenido_html: `<div class="w-full h-full p-10 bg-white flex flex-col justify-between font-sans text-slate-800">
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
</div>`,
    variables_requeridas: ['persona.nombres', 'persona.apellidos', 'persona.numero_documento', 'persona.cargo', 'empresa.razon_social'],
    config_metadatos: {
      titulo: 'Acta Entrega - {{persona.nombres}} {{persona.apellidos}}',
      autor: '{{empresa.razon_social}}',
      asunto: 'Acta de Entrega de Equipos',
      palabras_clave: 'acta, epp, recepcion',
    },
    activo: true,
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_PERSONAS: Persona[] = [
  {
    id: 'per1',
    empresa_id: 'e1111111-1111-1111-1111-111111111111',
    tipo_documento: 'DNI',
    numero_documento: '72345678',
    nombres: 'Carlos Alberto',
    apellidos: 'Mendoza Quispe',
    correo: 'carlos.mendoza@minerasur.pe',
    telefono: '987112233',
    cargo: 'Supervisor de Operaciones',
    departamento_area: 'Mina',
    activo: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'per2',
    empresa_id: 'e1111111-1111-1111-1111-111111111111',
    tipo_documento: 'DNI',
    numero_documento: '45891234',
    nombres: 'María Elena',
    apellidos: 'Rosas Gutierrez',
    correo: 'maria.rosas@minerasur.pe',
    telefono: '976223344',
    cargo: 'Especialista en Seguridad SST',
    departamento_area: 'Seguridad',
    activo: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'per3',
    empresa_id: 'e1111111-1111-1111-1111-111111111111',
    tipo_documento: 'DNI',
    numero_documento: '48123901',
    nombres: 'Jorge Luis',
    apellidos: 'Paredes Flores',
    correo: 'jorge.paredes@minerasur.pe',
    telefono: '955334455',
    cargo: 'Operador de Maquinaria Pesada',
    departamento_area: 'Mantenimiento',
    activo: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'per4',
    empresa_id: 'e2222222-2222-2222-2222-222222222222',
    tipo_documento: 'DNI',
    numero_documento: '71998877',
    nombres: 'Ana Lucía',
    apellidos: 'Vargas Silva',
    correo: 'ana.vargas@andina.com',
    telefono: '944112288',
    cargo: 'Ingeniera Residente',
    departamento_area: 'Obras Civiles',
    activo: true,
    created_at: new Date().toISOString(),
  },
];
