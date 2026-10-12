import React, { useState } from 'react';
import { Persona, Empresa } from '../../types/database';
import { Users, FileSpreadsheet, Plus, Search, Printer, Mail, Phone, Briefcase } from 'lucide-react';
import { ExcelImporterModal } from './ExcelImporterModal';

interface PersonasListProps {
  personas: Persona[];
  empresas: Empresa[];
  selectedEmpresaId: string;
  onCrearPersona: (persona: Partial<Persona>) => void;
  onImportarPersonas: (nuevas: Partial<Persona>[]) => void;
  onLanzarGenerador: (persona: Persona) => void;
}

export const PersonasList: React.FC<PersonasListProps> = ({
  personas,
  empresas,
  selectedEmpresaId,
  onCrearPersona,
  onImportarPersonas,
  onLanzarGenerador,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [modalImportarAbierto, setModalImportarAbierto] = useState(false);
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);

  const [formData, setFormData] = useState<Partial<Persona>>({
    tipo_documento: 'DNI',
    numero_documento: '',
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    cargo: '',
    departamento_area: '',
  });

  // Filtrar personas por empresa seleccionada
  const personasFiltradas = personas.filter((p) => {
    const coincideEmpresa = selectedEmpresaId === 'ALL' || p.empresa_id === selectedEmpresaId;
    const coincideBusqueda =
      p.numero_documento.includes(busqueda) ||
      p.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.cargo && p.cargo.toLowerCase().includes(busqueda.toLowerCase()));
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

    onCrearPersona({
      ...formData,
      empresa_id: empId,
      activo: true,
    });

    setModalCrearAbierto(false);
    setFormData({
      tipo_documento: 'DNI',
      numero_documento: '',
      nombres: '',
      apellidos: '',
      correo: '',
      telefono: '',
      cargo: '',
      departamento_area: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Directorio de Personas</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Empleados y colaboradores registrados por empresa. Puedes generar documentos individuales por persona.
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
            placeholder="Buscar por DNI, nombres, apellidos o cargo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full text-xs bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
          />
        </div>

        <div className="text-xs text-slate-500">
          Mostrando <span className="font-bold text-slate-800">{personasFiltradas.length}</span> personas registradas
        </div>
      </div>

      {/* Table view */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Documento / DNI</th>
                <th className="py-3 px-4">Apellidos y Nombres</th>
                <th className="py-3 px-4">Empresa</th>
                <th className="py-3 px-4">Cargo / Área</th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4 text-right">Acción Individual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {personasFiltradas.map((p) => (
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
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] text-slate-600 truncate max-w-[180px] block font-medium">
                      {getNombreEmpresa(p.empresa_id)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{p.cargo || 'Sin cargo'}</span>
                    </div>
                    {p.departamento_area && (
                      <span className="text-[10px] text-slate-400 block">{p.departamento_area}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 space-y-0.5 text-[11px] text-slate-500">
                    {p.correo && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{p.correo}</span>
                      </div>
                    )}
                    {p.telefono && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{p.telefono}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onLanzarGenerador(p)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-all shadow-sm"
                      title="Generar PDF para este registro"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Emitir PDF
                    </button>
                  </td>
                </tr>
              ))}

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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1">Registrar Persona</h3>
            <p className="text-xs text-slate-500 mb-4">Ingresa los datos personales del colaborador.</p>

            <form onSubmit={guardarPersona} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo Doc.</label>
                  <select
                    value={formData.tipo_documento}
                    onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="DNI">DNI</option>
                    <option value="CE">Carnet Ext.</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Número de Documento *</label>
                  <input
                    type="text"
                    required
                    placeholder="72345678"
                    value={formData.numero_documento || ''}
                    onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
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
                    placeholder="Juan Carlos"
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
                    placeholder="Perez Flores"
                    value={formData.apellidos || ''}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cargo / Puesto</label>
                  <input
                    type="text"
                    placeholder="Supervisor SST"
                    value={formData.cargo || ''}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Área o Departamento</label>
                  <input
                    type="text"
                    placeholder="Operaciones"
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
                    placeholder="juan@empresa.com"
                    value={formData.correo || ''}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="987654321"
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
    </div>
  );
};
