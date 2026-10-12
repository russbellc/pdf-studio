import React, { useState } from 'react';
import { Empresa } from '../../types/database';
import { Building2, Plus, Mail, Phone, MapPin, Search } from 'lucide-react';

interface EmpresasListProps {
  empresas: Empresa[];
  onCrearEmpresa: (empresa: Partial<Empresa>) => void;
  onEditarEmpresa: (empresa: Empresa) => void;
  onSelectEmpresa: (id: string) => void;
}

export const EmpresasList: React.FC<EmpresasListProps> = ({
  empresas,
  onCrearEmpresa,
  onEditarEmpresa,
  onSelectEmpresa,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [empresaEditando, setEmpresaEditando] = useState<Empresa | null>(null);

  const [formData, setFormData] = useState<Partial<Empresa>>({
    razon_social: '',
    identificacion_fiscal: '',
    correo_contacto: '',
    telefono: '',
    direccion: '',
  });

  const empresasFiltradas = empresas.filter(
    (e) =>
      e.razon_social.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.identificacion_fiscal.includes(busqueda)
  );

  const abrirCrear = () => {
    setEmpresaEditando(null);
    setFormData({
      razon_social: '',
      identificacion_fiscal: '',
      correo_contacto: '',
      telefono: '',
      direccion: '',
    });
    setModalAbierto(true);
  };

  const abrirEditar = (emp: Empresa) => {
    setEmpresaEditando(emp);
    setFormData(emp);
    setModalAbierto(true);
  };

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.razon_social || !formData.identificacion_fiscal) return;

    if (empresaEditando) {
      onEditarEmpresa({ ...empresaEditando, ...formData } as Empresa);
    } else {
      onCrearEmpresa(formData);
    }
    setModalAbierto(false);
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Directorio de Empresas</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administra las razones sociales y datos fiscales de cada organización.
          </p>
        </div>

        <button
          onClick={abrirCrear}
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm shadow-teal-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Registrar Nueva Empresa
        </button>
      </div>

      {/* Search filter */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar por Razón Social o RUC / NIT..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full text-xs bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
        />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {empresasFiltradas.map((emp) => (
          <div
            key={emp.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  RUC: {emp.identificacion_fiscal}
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                {emp.razon_social}
              </h3>

              <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                {emp.correo_contacto && (
                  <p className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{emp.correo_contacto}</span>
                  </p>
                )}
                {emp.telefono && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{emp.telefono}</span>
                  </p>
                )}
                {emp.direccion && (
                  <p className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{emp.direccion}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => onSelectEmpresa(emp.id)}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/70 px-3 py-1.5 rounded-lg transition-colors"
              >
                Ver Personas &rarr;
              </button>
              <button
                onClick={() => abrirEditar(emp)}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded transition-colors"
              >
                Editar
              </button>
            </div>
          </div>
        ))}

        {empresasFiltradas.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No se encontraron empresas</p>
            <p className="text-xs text-slate-400 mt-1">Registra tu primera empresa para comenzar a emitir documentos.</p>
          </div>
        )}
      </div>

      {/* Modal Crear / Editar */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {empresaEditando ? 'Editar Empresa' : 'Registrar Nueva Empresa'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Completa los datos fiscales de la organización.
            </p>

            <form onSubmit={guardar} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Razón Social *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Minera del Sur S.A.C."
                  value={formData.razon_social || ''}
                  onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Identificación Fiscal (RUC / NIT / CIF) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 20601234567"
                  value={formData.identificacion_fiscal || ''}
                  onChange={(e) => setFormData({ ...formData, identificacion_fiscal: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="rrhh@empresa.com"
                    value={formData.correo_contacto || ''}
                    onChange={(e) => setFormData({ ...formData, correo_contacto: e.target.value })}
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dirección Fiscal</label>
                <input
                  type="text"
                  placeholder="Av. Ejemplo 123, Ciudad"
                  value={formData.direccion || ''}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-all"
                >
                  {empresaEditando ? 'Actualizar Empresa' : 'Guardar Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
