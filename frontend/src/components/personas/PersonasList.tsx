import React, { useState } from 'react';
import { Persona, Empresa } from '../../types/database';
import {
  Users,
  FileSpreadsheet,
  Plus,
  Search,
  Printer,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Eye,
  Calendar,
  ShieldCheck,
  CreditCard,
  X,
  FileText,
  Pencil,
  Key
} from 'lucide-react';
import { ExcelImporterModal } from './ExcelImporterModal';

interface PersonasListProps {
  personas: Persona[];
  empresas: Empresa[];
  selectedEmpresaId: string;
  onCrearPersona: (persona: Partial<Persona>) => void;
  onEditarPersona?: (persona: Persona) => void;
  onImportarPersonas: (nuevas: Partial<Persona>[]) => void;
  onLanzarGenerador: (persona: Persona) => void;
}

export const PersonasList: React.FC<PersonasListProps> = ({
  personas,
  empresas,
  selectedEmpresaId,
  onCrearPersona,
  onEditarPersona,
  onImportarPersonas,
  onLanzarGenerador,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [modalImportarAbierto, setModalImportarAbierto] = useState(false);
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [personaDetalle, setPersonaDetalle] = useState<Persona | null>(null);
  const [personaEnEdicion, setPersonaEnEdicion] = useState<Persona | null>(null);
  const [editFormData, setEditFormData] = useState<Persona | null>(null);

  const [formData, setFormData] = useState<Partial<Persona> & { extraFields?: Record<string, string> }>({
    tipo_documento: 'ID',
    numero_documento: '',
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    cargo: '',
    departamento_area: '',
    extraFields: {
      carrera: '',
      ano_academico: '',
      uopeople_id: '',
      verification_code: '',
      total_charges: '',
      total_paid: '',
      remaining_balance: '',
      estado_cuenta: '',
    },
  });

  // Filtrar personas por empresa seleccionada
  const personasFiltradas = personas.filter((p) => {
    const coincideEmpresa = selectedEmpresaId === 'ALL' || p.empresa_id === selectedEmpresaId;
    const coincideBusqueda =
      p.numero_documento.includes(busqueda) ||
      p.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.cargo && p.cargo.toLowerCase().includes(busqueda.toLowerCase())) ||
      (p.datos_adicionales?.carrera && String(p.datos_adicionales.carrera).toLowerCase().includes(busqueda.toLowerCase())) ||
      (p.datos_adicionales?.uopeople_id && String(p.datos_adicionales.uopeople_id).toLowerCase().includes(busqueda.toLowerCase()));
    return coincideEmpresa && coincideBusqueda;
  });

  const getNombreEmpresa = (empresaId: string) => {
    const emp = empresas.find((e) => e.id === empresaId);
    return emp ? emp.razon_social : 'Empresa General';
  };

  const guardarPersona = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.numero_documento || !formData.nombres) return;

    const empId =
      selectedEmpresaId !== 'ALL'
        ? selectedEmpresaId
        : empresas[0]?.id || 'e1111111-1111-1111-1111-111111111111';

    // Limpiar extraFields vacíos
    const cleanExtra: Record<string, any> = {};
    if (formData.extraFields) {
      Object.entries(formData.extraFields).forEach(([k, v]) => {
        if (v && v.trim()) cleanExtra[k] = v.trim();
      });
    }

    onCrearPersona({
      tipo_documento: formData.tipo_documento || 'ID',
      numero_documento: formData.numero_documento,
      nombres: formData.nombres,
      apellidos: formData.apellidos || '',
      correo: formData.correo || '',
      telefono: formData.telefono || '',
      cargo: formData.cargo || '',
      departamento_area: formData.departamento_area || '',
      datos_adicionales: cleanExtra,
      empresa_id: empId,
      activo: true,
    });

    setModalCrearAbierto(false);
    setFormData({
      tipo_documento: 'ID',
      numero_documento: '',
      nombres: '',
      apellidos: '',
      correo: '',
      telefono: '',
      cargo: '',
      departamento_area: '',
      extraFields: {
        carrera: '',
        ano_academico: '',
        uopeople_id: '',
        verification_code: '',
        total_charges: '',
        total_paid: '',
        remaining_balance: '',
        estado_cuenta: '',
      },
    });
  };

  const abrirModalEdicion = (p: Persona) => {
    setPersonaEnEdicion(p);
    setEditFormData(JSON.parse(JSON.stringify(p)));
  };

  const guardarEdicionPersona = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !editFormData.numero_documento || !editFormData.nombres) return;

    if (onEditarPersona) {
      onEditarPersona(editFormData);
    }
    setPersonaEnEdicion(null);
    setEditFormData(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Directorio de Personas</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Estudiantes, colaboradores y empleados registrados con sus datos dinámicos listos para inyección en plantillas PDF.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalImportarAbierto(true)}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2.5 rounded-lg shadow-sm shadow-emerald-600/20 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Importar Excel (.xlsx)
          </button>

          <button
            onClick={() => setModalCrearAbierto(true)}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3.5 py-2.5 rounded-lg shadow-sm shadow-teal-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Nueva Persona
          </button>
        </div>
      </div>

      {/* Filter and stats bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por ID/DNI, nombres, apellidos, carrera o cargo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full text-xs bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
          />
        </div>

        <div className="text-xs text-slate-500">
          Mostrando <span className="font-bold text-slate-800">{personasFiltradas.length}</span> registros
        </div>
      </div>

      {/* Table view */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Documento / ID</th>
                <th className="py-3 px-4">Apellidos y Nombres</th>
                <th className="py-3 px-4">Empresa / Institución</th>
                <th className="py-3 px-4">Carrera / Cargo / Área</th>
                <th className="py-3 px-4">Datos para Plantilla</th>
                <th className="py-3 px-4 text-right">Acción Individual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {personasFiltradas.map((p) => {
                const totalExtras = p.datos_adicionales ? Object.keys(p.datos_adicionales).length : 0;
                const tieneCarrera = Boolean(p.datos_adicionales?.carrera);

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                        {p.tipo_documento}: {p.numero_documento}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {p.apellidos}, {p.nombres}
                      </div>
                      {p.correo && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Mail className="w-2.5 h-2.5" /> {p.correo}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] text-slate-600 truncate max-w-[180px] block font-medium">
                        {getNombreEmpresa(p.empresa_id)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {tieneCarrera ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-purple-700 font-semibold text-[11px]">
                            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[200px]">{p.datos_adicionales.carrera}</span>
                          </div>
                          {p.datos_adicionales.ano_academico && (
                            <span className="text-[10px] text-slate-500 block">
                              Periodo: {p.datos_adicionales.ano_academico}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{p.cargo || 'Sin cargo'}</span>
                          </div>
                          {p.departamento_area && (
                            <span className="text-[10px] text-slate-400 block">{p.departamento_area}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {totalExtras > 0 ? (
                        <button
                          onClick={() => setPersonaDetalle(p)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors shadow-2xs"
                        >
                          <Eye className="w-3 h-3" />
                          <span>{totalExtras} variables dinámicas</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Campos estándar</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => abrirModalEdicion(p)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all shadow-2xs"
                        title="Editar información personal y variables"
                      >
                        <Pencil className="w-3.5 h-3.5 text-slate-500" />
                        Editar
                      </button>
                      <button
                        onClick={() => onLanzarGenerador(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-all shadow-sm"
                        title="Generar PDF para este registro con sus variables"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Emitir PDF
                      </button>
                    </td>
                  </tr>
                );
              })}

              {personasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No se encontraron personas</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Carga un archivo Excel o registra una persona manualmente.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detalle de Variables de la Persona para Plantillas */}
      {personaDetalle && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  Datos y Variables de Plantilla: {personaDetalle.nombres} {personaDetalle.apellidos}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Estos son los valores que se inyectan automáticamente en las etiquetas de los documentos PDF.
                </p>
              </div>
              <button
                onClick={() => setPersonaDetalle(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resumen principal */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-xs mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Identificación</span>
                <span className="font-mono font-bold text-slate-800">{personaDetalle.tipo_documento}: {personaDetalle.numero_documento}</span>
              </div>
              {personaDetalle.datos_adicionales?.carrera && (
                <div className="col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Carrera / Programa</span>
                  <span className="font-bold text-purple-900">{personaDetalle.datos_adicionales.carrera}</span>
                </div>
              )}
              {personaDetalle.datos_adicionales?.ano_academico && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Año Académico</span>
                  <span className="font-semibold text-slate-800">{personaDetalle.datos_adicionales.ano_academico}</span>
                </div>
              )}
              {personaDetalle.datos_adicionales?.verification_code && (
                <div className="col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Verification Code</span>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-purple-200 inline-block">
                    {personaDetalle.datos_adicionales.verification_code}
                  </span>
                </div>
              )}
            </div>

            {/* Tabla de Materias / Transacciones si existen */}
            {personaDetalle.datos_adicionales?.materia_1_desc && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Materias / Transacciones Académicas Vinculadas
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Descripción</th>
                        <th className="py-2 px-3">Fecha</th>
                        <th className="py-2 px-3">Método</th>
                        <th className="py-2 px-3 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {[1, 2, 3, 4, 5].map((i) => {
                        const desc = personaDetalle.datos_adicionales?.[`materia_${i}_desc`];
                        const fecha = personaDetalle.datos_adicionales?.[`materia_${i}_fecha`];
                        const metodo = personaDetalle.datos_adicionales?.[`materia_${i}_metodo`];
                        const monto = personaDetalle.datos_adicionales?.[`materia_${i}_monto`];
                        if (!desc) return null;
                        return (
                          <tr key={i}>
                            <td className="py-2 px-3 font-medium text-slate-800">{desc}</td>
                            <td className="py-2 px-3 text-slate-600">{fecha}</td>
                            <td className="py-2 px-3 text-slate-600">{metodo}</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900">{monto}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {(personaDetalle.datos_adicionales?.total_charges || personaDetalle.datos_adicionales?.total_paid) && (
                      <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                        <tr>
                          <td colSpan={3} className="py-1.5 px-3 text-right">Total Charges:</td>
                          <td className="py-1.5 px-3 text-right text-slate-900">{personaDetalle.datos_adicionales.total_charges}</td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="py-1.5 px-3 text-right">Total Paid:</td>
                          <td className="py-1.5 px-3 text-right text-slate-900">{personaDetalle.datos_adicionales.total_paid}</td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="py-1.5 px-3 text-right">Remaining Balance:</td>
                          <td className="py-1.5 px-3 text-right text-emerald-600">{personaDetalle.datos_adicionales.remaining_balance}</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            )}

            {/* Listado completo de variables crudas */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Todas las Variables Disponibles para Inyección en Plantillas
              </h4>
              <div className="max-h-40 overflow-y-auto bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-1 font-mono text-[11px]">
                {personaDetalle.datos_adicionales &&
                  Object.entries(personaDetalle.datos_adicionales).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center py-0.5 border-b border-slate-100 last:border-0">
                      <span className="text-purple-700 font-semibold">{`{{persona.extra.${k}}}`}</span>
                      <span className="text-slate-800 font-medium truncate max-w-[260px]">{String(v)}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="pt-4 mt-4 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPersonaDetalle(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg transition-colors"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = personaDetalle;
                  setPersonaDetalle(null);
                  onLanzarGenerador(p);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                Ir a Emitir Documento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Importar Excel */}
      {modalImportarAbierto && (
        <ExcelImporterModal
          empresas={empresas}
          empresaSeleccionadaId={selectedEmpresaId}
          onCerrar={() => setModalImportarAbierto(false)}
          onImportar={(filas) => {
            onImportarPersonas(filas);
            setModalImportarAbierto(false);
          }}
        />
      )}

      {/* Modal Crear Persona Manual */}
      {modalCrearAbierto && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">Registrar Persona</h3>
            <p className="text-xs text-slate-500 mb-4">Ingresa los datos personales y académicos para las plantillas.</p>

            <form onSubmit={guardarPersona} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo Doc.</label>
                  <select
                    value={formData.tipo_documento}
                    onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="ID">ID</option>
                    <option value="DNI">DNI</option>
                    <option value="CE">Carnet Ext.</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Número de Documento / ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="UOP-98234 o 72345678"
                    value={formData.numero_documento || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({
                        ...formData,
                        numero_documento: val,
                        extraFields: { ...formData.extraFields, uopeople_id: val }
                      });
                    }}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nombres *</label>
                  <input
                    type="text"
                    required
                    placeholder="Franco"
                    value={formData.nombres || ''}
                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    placeholder="Lopez Plaza"
                    value={formData.apellidos || ''}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Sección de Campos Académicos / Dinámicos */}
              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 space-y-2.5">
                <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider block">
                  Datos Académicos para Plantillas (Opcional)
                </span>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Carrera / Programa</label>
                  <input
                    type="text"
                    placeholder="Bachelor of Science in Computer Science"
                    value={formData.extraFields?.carrera || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cargo: e.target.value ? 'Estudiante' : formData.cargo,
                        extraFields: { ...formData.extraFields, carrera: e.target.value }
                      })
                    }
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Año Académico</label>
                    <input
                      type="text"
                      placeholder="2026-2027"
                      value={formData.extraFields?.ano_academico || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          extraFields: { ...formData.extraFields, ano_academico: e.target.value }
                        })
                      }
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Código Verificación</label>
                    <input
                      type="text"
                      placeholder="UOP-TR-2026-98234"
                      value={formData.extraFields?.verification_code || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          extraFields: { ...formData.extraFields, verification_code: e.target.value }
                        })
                      }
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cargo / Ocupación</label>
                  <input
                    type="text"
                    placeholder="Estudiante o Supervisor"
                    value={formData.cargo || ''}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Área o Departamento</label>
                  <input
                    type="text"
                    placeholder="Computer Science o Mina"
                    value={formData.departamento_area || ''}
                    onChange={(e) => setFormData({ ...formData, departamento_area: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.edu"
                    value={formData.correo || ''}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="+51 987654321"
                    value={formData.telefono || ''}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalCrearAbierto(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-all"
                >
                  Guardar Persona
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Persona */}
      {personaEnEdicion && editFormData && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Editar Información Personal</h3>
                  <p className="text-xs text-slate-500">
                    Modifica los datos personales, credenciales de acceso y variables para emisión de documentos.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPersonaEnEdicion(null);
                  setEditFormData(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={guardarEdicionPersona} className="space-y-4">
              {/* Sección 1: Datos Personales e Identificación */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-teal-600" />
                  Identificación y Datos de Contacto
                </h4>
                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tipo Doc.</label>
                    <select
                      value={editFormData.tipo_documento}
                      onChange={(e) => setEditFormData({ ...editFormData, tipo_documento: e.target.value })}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="ID">ID</option>
                      <option value="DNI">DNI</option>
                      <option value="CE">Carnet Ext.</option>
                      <option value="PASAPORTE">Pasaporte</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Número de Documento / ID *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.numero_documento}
                      onChange={(e) => setEditFormData({ ...editFormData, numero_documento: e.target.value })}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nombres *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.nombres}
                      onChange={(e) => setEditFormData({ ...editFormData, nombres: e.target.value })}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Apellidos</label>
                    <input
                      type="text"
                      value={editFormData.apellidos}
                      onChange={(e) => setEditFormData({ ...editFormData, apellidos: e.target.value })}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={editFormData.correo || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditFormData({
                          ...editFormData,
                          correo: val,
                          datos_adicionales: {
                            ...(editFormData.datos_adicionales || {}),
                            correo: val,
                          }
                        });
                      }}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Teléfono</label>
                    <input
                      type="text"
                      value={editFormData.telefono || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, telefono: e.target.value })}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Campos Específicos: Fecha de Nacimiento y Contraseña / Pass */}
                <div className="grid grid-cols-2 gap-3 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 mb-3">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-700" />
                      Fecha de Nacimiento
                    </label>
                    <input
                      type="text"
                      placeholder="MM/DD/YYYY (ej: 04/15/2002)"
                      value={editFormData.datos_adicionales?.fecha_nacimiento || ''}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          datos_adicionales: {
                            ...(editFormData.datos_adicionales || {}),
                            fecha_nacimiento: e.target.value,
                          }
                        })
                      }
                      className="w-full text-xs bg-white border border-amber-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-1 flex items-center gap-1">
                      <Key className="w-3 h-3 text-amber-700" />
                      Contraseña / Password (pass)
                    </label>
                    <input
                      type="text"
                      placeholder="Admin_01"
                      value={editFormData.datos_adicionales?.pass || ''}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          datos_adicionales: {
                            ...(editFormData.datos_adicionales || {}),
                            pass: e.target.value,
                          }
                        })
                      }
                      className="w-full text-xs bg-white border border-amber-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cargo / Puesto</label>
                    <input
                      type="text"
                      value={editFormData.cargo || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, cargo: e.target.value })}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Área o Carrera</label>
                    <input
                      type="text"
                      value={editFormData.departamento_area || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, departamento_area: e.target.value })}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Variables Dinámicas del Reporte Académico UoPeople */}
              {editFormData.datos_adicionales && Object.keys(editFormData.datos_adicionales).length > 0 && (
                <div className="border-t border-slate-200 pt-3.5">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                    Variables Académicas y Transacciones (UoPeople)
                  </h4>

                  <div className="grid grid-cols-2 gap-3 mb-3 bg-purple-50/50 p-3.5 rounded-xl border border-purple-200">
                    <div>
                      <label className="block text-[11px] font-semibold text-purple-900 mb-1">Programa / Carrera</label>
                      <input
                        type="text"
                        value={editFormData.datos_adicionales.carrera || ''}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            datos_adicionales: { ...editFormData.datos_adicionales, carrera: e.target.value }
                          })
                        }
                        className="w-full text-xs bg-white border border-purple-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-purple-900 mb-1">Año Académico</label>
                      <input
                        type="text"
                        value={editFormData.datos_adicionales.ano_academico || ''}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            datos_adicionales: { ...editFormData.datos_adicionales, ano_academico: e.target.value }
                          })
                        }
                        className="w-full text-xs bg-white border border-purple-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-purple-900 mb-1">Fecha Emisión Reporte</label>
                      <input
                        type="text"
                        placeholder="10/07/2026"
                        value={editFormData.datos_adicionales.fecha_emision || ''}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            datos_adicionales: { ...editFormData.datos_adicionales, fecha_emision: e.target.value }
                          })
                        }
                        className="w-full text-xs bg-white border border-purple-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-purple-900 mb-1">Hora Emisión</label>
                      <input
                        type="text"
                        placeholder="10:15 AM"
                        value={editFormData.datos_adicionales.hora_emision || ''}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            datos_adicionales: { ...editFormData.datos_adicionales, hora_emision: e.target.value }
                          })
                        }
                        className="w-full text-xs bg-white border border-purple-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-purple-900 mb-1">Fecha Cabecera Corta</label>
                      <input
                        type="text"
                        placeholder="10/7/26"
                        value={editFormData.datos_adicionales.fecha_emision_corta || ''}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            datos_adicionales: { ...editFormData.datos_adicionales, fecha_emision_corta: e.target.value }
                          })
                        }
                        className="w-full text-xs bg-white border border-purple-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-purple-900 mb-1">Código Verificación</label>
                      <input
                        type="text"
                        value={editFormData.datos_adicionales.verification_code || ''}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            datos_adicionales: { ...editFormData.datos_adicionales, verification_code: e.target.value }
                          })
                        }
                        className="w-full text-xs bg-white border border-purple-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Total Charges</label>
                      <input
                        type="text"
                        value={editFormData.datos_adicionales.total_charges || ''}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            datos_adicionales: { ...editFormData.datos_adicionales, total_charges: e.target.value }
                          })
                        }
                        className="w-full text-xs bg-white border border-slate-300 rounded px-2 py-1 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Total Paid</label>
                      <input
                        type="text"
                        value={editFormData.datos_adicionales.total_paid || ''}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            datos_adicionales: { ...editFormData.datos_adicionales, total_paid: e.target.value }
                          })
                        }
                        className="w-full text-xs bg-white border border-slate-300 rounded px-2 py-1 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Remaining Balance</label>
                      <input
                        type="text"
                        value={editFormData.datos_adicionales.remaining_balance || ''}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            datos_adicionales: { ...editFormData.datos_adicionales, remaining_balance: e.target.value }
                          })
                        }
                        className="w-full text-xs bg-white border border-slate-300 rounded px-2 py-1 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Estado Cuenta</label>
                      <input
                        type="text"
                        value={editFormData.datos_adicionales.estado_cuenta || ''}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            datos_adicionales: { ...editFormData.datos_adicionales, estado_cuenta: e.target.value }
                          })
                        }
                        className="w-full text-xs bg-white border border-slate-300 rounded px-2 py-1 text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setPersonaEnEdicion(null);
                    setEditFormData(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-all"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
