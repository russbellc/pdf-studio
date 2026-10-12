import React, { useState, useEffect } from 'react';
import { Empresa, Persona, Plantilla, DocumentoGenerado } from '../../types/database';
import {
  Printer,
  Eye,
  CheckCircle2,
  FileDown,
  ShieldCheck,
  RefreshCw,
  Archive,
  GraduationCap,
  Calendar,
  Key,
  FileText,
  CreditCard
} from 'lucide-react';

interface GeneradorViewProps {
  empresas: Empresa[];
  personas: Persona[];
  plantillas: Plantilla[];
  selectedEmpresaId: string;
  personaInicial?: Persona | null;
  plantillaInicial?: Plantilla | null;
  onDocumentoGenerado: (doc: DocumentoGenerado) => void;
}

export const GeneradorView: React.FC<GeneradorViewProps> = ({
  empresas,
  personas,
  plantillas,
  selectedEmpresaId,
  personaInicial,
  plantillaInicial,
  onDocumentoGenerado,
}) => {
  const [empresaId, setEmpresaId] = useState(
    selectedEmpresaId !== 'ALL' ? selectedEmpresaId : empresas[0]?.id || ''
  );
  const [personaSeleccionadaId, setPersonaSeleccionadaId] = useState(
    personaInicial ? personaInicial.id : ''
  );
  const [plantillaSeleccionadaId, setPlantillaSeleccionadaId] = useState(
    plantillaInicial ? plantillaInicial.id : plantillas[0]?.id || ''
  );

  // Sincronizar si cambia personaInicial desde el exterior
  useEffect(() => {
    if (personaInicial) {
      setEmpresaId(personaInicial.empresa_id);
      setPersonaSeleccionadaId(personaInicial.id);
    }
  }, [personaInicial]);

  // Sincronizar si cambia plantillaInicial desde el exterior
  useEffect(() => {
    if (plantillaInicial) {
      if (plantillaInicial.empresa_id) {
        setEmpresaId(plantillaInicial.empresa_id);
      }
      setPlantillaSeleccionadaId(plantillaInicial.id);
    }
  }, [plantillaInicial]);

  // Modo lote: selección de múltiples personas
  const [personasLoteIds, setPersonasLoteIds] = useState<string[]>([]);
  const [modoLote, setModoLote] = useState(false);

  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [generando, setGenerando] = useState(false);
  const [progresoLote, setProgresoLote] = useState<string>('');

  // Personas disponibles para la empresa seleccionada
  const personasEmpresa = personas.filter((p) => p.empresa_id === empresaId);

  // Plantillas disponibles (Globales + propias de la empresa)
  const plantillasDisponibles = plantillas.filter(
    (p) => p.es_global || p.empresa_id === empresaId
  );

  const empresaActiva = empresas.find((e) => e.id === empresaId);
  const personaActiva = personas.find((p) => p.id === personaSeleccionadaId);
  const plantillaActiva = plantillas.find((p) => p.id === plantillaSeleccionadaId);

  // Auto-seleccionar la primera persona si no hay ninguna
  useEffect(() => {
    if (!personaSeleccionadaId && personasEmpresa.length > 0) {
      setPersonaSeleccionadaId(personasEmpresa[0].id);
    }
  }, [empresaId, personasEmpresa]);

  // Actualizar Preview cuando cambian las selecciones
  useEffect(() => {
    if (!empresaActiva || !personaActiva || !plantillaActiva) return;

    const fechaHoy = new Date().toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    let html = plantillaActiva.contenido_html;

    // Inyección de variables para el preview
    html = html.replace(/\{\{persona\.nombres\}\}/g, () => personaActiva.nombres || '');
    html = html.replace(/\{\{persona\.apellidos\}\}/g, () => personaActiva.apellidos || '');
    html = html.replace(/\{\{persona\.numero_documento\}\}/g, () => personaActiva.numero_documento || '');
    html = html.replace(/\{\{persona\.tipo_documento\}\}/g, () => personaActiva.tipo_documento || 'DNI');
    html = html.replace(/\{\{persona\.correo\}\}/g, () => personaActiva.correo || '');
    html = html.replace(/\{\{persona\.telefono\}\}/g, () => personaActiva.telefono || '');
    html = html.replace(/\{\{persona\.cargo\}\}/g, () => personaActiva.cargo || '');
    html = html.replace(/\{\{persona\.departamento_area\}\}/g, () => personaActiva.departamento_area || '');

    // Inyección dinámica de datos_adicionales (ej. materias, carrera, totales, etc.)
    if (personaActiva.datos_adicionales) {
      for (const [k, v] of Object.entries(personaActiva.datos_adicionales)) {
        const valStr = String(v ?? '');
        const regexExtra = new RegExp(`\\{\\{persona\\.extra\\.${k}\\}\\}`, 'g');
        html = html.replace(regexExtra, () => valStr);
        const regexDirect = new RegExp(`\\{\\{${k}\\}\\}`, 'g');
        html = html.replace(regexDirect, () => valStr);
      }
    }

    html = html.replace(/\{\{empresa\.razon_social\}\}/g, () => empresaActiva.razon_social || '');
    html = html.replace(/\{\{empresa\.identificacion_fiscal\}\}/g, () => empresaActiva.identificacion_fiscal || '');
    html = html.replace(/\{\{empresa\.correo_contacto\}\}/g, () => empresaActiva.correo_contacto || '');
    html = html.replace(/\{\{empresa\.telefono\}\}/g, () => empresaActiva.telefono || '');
    html = html.replace(/\{\{empresa\.direccion\}\}/g, () => empresaActiva.direccion || '');
    html = html.replace(/\{\{empresa\.logo_url\}\}/g, () => empresaActiva.logo_url || '');

    html = html.replace(/\{\{fecha_emision\}\}/g, () => fechaHoy);
    html = html.replace(/\{\{qr_verificacion\}\}/g, () => 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VERIFICACION_OFICIAL');
    html = html.replace(/\{\{hash_sha256\}\}/g, () => 'SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069');

    setPreviewHtml(html);
  }, [empresaActiva, personaActiva, plantillaActiva]);

  // Generar PDF individual
  const emitirPdfIndividual = async () => {
    if (!empresaActiva || !personaActiva || !plantillaActiva) {
      alert('Selecciona una empresa, persona y plantilla.');
      return;
    }

    setGenerando(true);
    try {
      const response = await fetch('/api/render/single', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          empresa: empresaActiva,
          persona: personaActiva,
          plantilla: plantillaActiva,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.statusText}`);
      }

      const data = await response.json();

      // Descargar el archivo PDF automáticamente en el navegador
      const byteCharacters = atob(data.pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = data.filename;
      link.click();

      // Guardar registro en historial
      const nuevoDoc: DocumentoGenerado = {
        id: `doc_${Date.now()}`,
        empresa_id: empresaActiva.id,
        persona_id: personaActiva.id,
        plantilla_id: plantillaActiva.id,
        nombre_archivo: data.filename,
        storage_path: `documentos/${empresaActiva.id}/${data.filename}`,
        hash_sha256: data.hash_sha256,
        metadatos_aplicados: data.metadatos,
        datos_snapshot: personaActiva,
        created_at: new Date().toISOString(),
        persona_nombre: `${personaActiva.nombres} ${personaActiva.apellidos}`,
        persona_documento: personaActiva.numero_documento,
        plantilla_nombre: plantillaActiva.nombre,
        empresa_nombre: empresaActiva.razon_social,
      };

      onDocumentoGenerado(nuevoDoc);
      alert(`¡Documento emitido con éxito!\nArchivo: ${data.filename}\nHash: ${data.hash_sha256.substring(0, 20)}...`);
    } catch (err: any) {
      console.error(err);
      alert(`Hubo un error al generar el PDF: ${err.message}. Verifica que el PDF Worker esté corriendo.`);
    } finally {
      setGenerando(false);
    }
  };

  // Generar Lote de PDFs en ZIP
  const emitirLoteZip = async () => {
    if (!empresaActiva || !plantillaActiva || personasLoteIds.length === 0) {
      alert('Selecciona al menos una persona para el lote.');
      return;
    }

    setGenerando(true);
    setProgresoLote(`Generando ${personasLoteIds.length} PDFs individuales y empaquetando en ZIP...`);

    const personasParaLote = personas.filter((p) => personasLoteIds.includes(p.id));

    try {
      const response = await fetch('/api/render/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          empresa: empresaActiva,
          personas: personasParaLote,
          plantilla: plantillaActiva,
        }),
      });

      if (!response.ok) throw new Error('Error en el worker');
      const data = await response.json();

      // Descargar ZIP
      const byteCharacters = atob(data.zipBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/zip' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = data.zipFilename;
      link.click();

      // Registrar los documentos en historial
      data.documentos.forEach((d: any) => {
        const p = personas.find((x) => x.id === d.persona_id);
        onDocumentoGenerado({
          id: `doc_${Date.now()}_${d.numero_documento}`,
          empresa_id: empresaActiva.id,
          persona_id: d.persona_id,
          plantilla_id: plantillaActiva.id,
          nombre_archivo: d.nombre_archivo,
          storage_path: `documentos/${empresaActiva.id}/${d.nombre_archivo}`,
          hash_sha256: d.hash_sha256,
          metadatos_aplicados: {},
          datos_snapshot: p || {},
          created_at: new Date().toISOString(),
          persona_nombre: p ? `${p.nombres} ${p.apellidos}` : d.numero_documento,
          persona_documento: d.numero_documento,
          plantilla_nombre: plantillaActiva.nombre,
          empresa_nombre: empresaActiva.razon_social,
        });
      });

      alert(`¡Lote de ${data.total_procesados} PDFs generado y descargado en archivo ZIP!`);
    } catch (err: any) {
      alert(`Error al generar lote: ${err.message}`);
    } finally {
      setGenerando(false);
      setProgresoLote('');
    }
  };

  const togglePersonaLote = (id: string) => {
    setPersonasLoteIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const seleccionarTodasLote = () => {
    if (personasLoteIds.length === personasEmpresa.length) {
      setPersonasLoteIds([]);
    } else {
      setPersonasLoteIds(personasEmpresa.map((p) => p.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Emisión de Documentos por Persona</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Genera PDFs individuales inyectando los datos de cada persona con sellado criptográfico SHA-256.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Panel Izquierdo: Configuración de Parámetros */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 text-xs">
            {/* 1. Seleccionar Empresa */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">1. Empresa Emisora *</label>
              <select
                value={empresaId}
                onChange={(e) => setEmpresaId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              >
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.razon_social} (RUC: {emp.identificacion_fiscal})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Seleccionar Plantilla */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">2. Plantilla de Documento *</label>
              <select
                value={plantillaSeleccionadaId}
                onChange={(e) => setPlantillaSeleccionadaId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              >
                {plantillasDisponibles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.es_global ? '🌐 [Global] ' : '🏢 '} {p.nombre} ({p.tamano_hoja} {p.orientacion})
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Modo: Individual vs Lote */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-700">Modo de emisión:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setModoLote(false)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                    !modoLote
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Persona Única
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModoLote(true);
                    if (personasLoteIds.length === 0) {
                      setPersonasLoteIds(personasEmpresa.map((p) => p.id));
                    }
                  }}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                    modoLote
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Múltiples (ZIP)
                </button>
              </div>
            </div>

            {/* 3. Selección de Persona (Modo Único) */}
            {!modoLote ? (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  3. Seleccionar Persona * ({personasEmpresa.length} registradas)
                </label>
                <select
                  value={personaSeleccionadaId}
                  onChange={(e) => setPersonaSeleccionadaId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                >
                  {personasEmpresa.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.numero_documento} — {p.apellidos}, {p.nombres} ({p.cargo || 'Sin cargo'})
                    </option>
                  ))}
                  {personasEmpresa.length === 0 && (
                    <option disabled>No hay personas en esta empresa</option>
                  )}
                </select>

                {/* Panel de Datos Dinámicos / Académicos de la Persona */}
                {personaActiva?.datos_adicionales && Object.keys(personaActiva.datos_adicionales).length > 0 && (
                  <div className="mt-2.5 p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-purple-700" />
                        Datos para plantilla &#40;&#123;&#123;persona.extra.*&#125;&#125;&#41;
                      </span>
                      <span className="text-[10px] bg-purple-200/70 text-purple-800 font-bold px-1.5 py-0.5 rounded">
                        {Object.keys(personaActiva.datos_adicionales).length} campos
                      </span>
                    </div>

                    {/* Resumen de campos clave */}
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-700">
                      {personaActiva.datos_adicionales.carrera && (
                        <div className="col-span-2 bg-white/80 p-1.5 rounded border border-purple-100">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Carrera / Programa</span>
                          <span className="font-semibold text-purple-950 truncate block">{personaActiva.datos_adicionales.carrera}</span>
                        </div>
                      )}
                      {personaActiva.datos_adicionales.ano_academico && (
                        <div className="bg-white/80 p-1.5 rounded border border-purple-100">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Año Académico</span>
                          <span className="font-semibold text-slate-800">{personaActiva.datos_adicionales.ano_academico}</span>
                        </div>
                      )}
                      {personaActiva.datos_adicionales.uopeople_id && (
                        <div className="bg-white/80 p-1.5 rounded border border-purple-100">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">ID Registrado</span>
                          <span className="font-mono font-bold text-slate-800">{personaActiva.datos_adicionales.uopeople_id}</span>
                        </div>
                      )}
                      {personaActiva.datos_adicionales.verification_code && (
                        <div className="col-span-2 bg-white/80 p-1.5 rounded border border-purple-100">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Verification Code</span>
                          <span className="font-mono font-bold text-purple-900">{personaActiva.datos_adicionales.verification_code}</span>
                        </div>
                      )}
                      {(personaActiva.datos_adicionales.total_charges || personaActiva.datos_adicionales.remaining_balance) && (
                        <div className="col-span-2 flex justify-between bg-white/80 p-1.5 rounded border border-purple-100 text-[10px]">
                          <span>Cargos: <strong>{personaActiva.datos_adicionales.total_charges || '-'}</strong></span>
                          <span>Pagado: <strong>{personaActiva.datos_adicionales.total_paid || '-'}</strong></span>
                          <span className="text-emerald-700 font-bold">Balance: {personaActiva.datos_adicionales.remaining_balance || '$0'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Modo Lote: Selección múltiple con checkboxes */
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">
                    3. Seleccionar Personas ({personasLoteIds.length} seleccionadas)
                  </label>
                  <button
                    type="button"
                    onClick={seleccionarTodasLote}
                    className="text-[11px] text-teal-700 font-semibold hover:underline"
                  >
                    {personasLoteIds.length === personasEmpresa.length ? 'Desmarcar todas' : 'Marcar todas'}
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1 bg-slate-50">
                  {personasEmpresa.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={personasLoteIds.includes(p.id)}
                        onChange={() => togglePersonaLote(p.id)}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span className="font-mono text-[11px] font-bold text-slate-900">{p.numero_documento}</span>
                      <span className="truncate text-slate-700">{p.apellidos}, {p.nombres}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Botón de Emisión Principal */}
            <div className="pt-3 border-t border-slate-100">
              {!modoLote ? (
                <button
                  type="button"
                  onClick={emitirPdfIndividual}
                  disabled={generando || !personaActiva}
                  className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-teal-600/20 transition-all text-xs"
                >
                  {generando ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Renderizando PDF y Sellando SHA-256...
                    </>
                  ) : (
                    <>
                      <Printer className="w-4 h-4" />
                      Generar y Descargar PDF Individual
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={emitirLoteZip}
                  disabled={generando || personasLoteIds.length === 0}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-indigo-600/20 transition-all text-xs"
                >
                  {generando ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {progresoLote || 'Procesando lote...'}
                    </>
                  ) : (
                    <>
                      <Archive className="w-4 h-4" />
                      Generar {personasLoteIds.length} PDFs y Descargar ZIP
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Panel Derecho: Previsualización en Vivo */}
        <div className="lg:col-span-7 bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2 font-semibold">
              <Eye className="w-4 h-4 text-teal-400" />
              <span>Previsualización en Tiempo Real</span>
            </div>
            {personaActiva && (
              <span className="text-[11px] font-mono text-slate-400">
                Persona: {personaActiva.numero_documento}
              </span>
            )}
          </div>

          {/* Canvas de previsualización en miniatura */}
          <div className="my-4 flex items-center justify-center bg-slate-950/80 rounded-lg p-4 overflow-hidden min-h-[460px]">
            {previewHtml ? (
              <div
                className={`bg-white shadow-2xl transition-all origin-top overflow-hidden ${
                  plantillaActiva?.orientacion === 'landscape'
                    ? 'w-[560px] h-[395px]'
                    : 'w-[395px] h-[560px]'
                }`}
                style={{ transform: 'scale(0.85)' }}
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            ) : (
              <p className="text-xs text-slate-500">Selecciona una plantilla y persona para previsualizar.</p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Resolución de exportación: 300 DPI</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Sello criptográfico automático
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
