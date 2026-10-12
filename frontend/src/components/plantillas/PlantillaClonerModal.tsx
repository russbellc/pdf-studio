import React, { useState } from 'react';
import { Plantilla, Empresa } from '../../types/database';
import { Copy, X, Building2 } from 'lucide-react';

interface PlantillaClonerModalProps {
  plantilla: Plantilla;
  empresas: Empresa[];
  empresaActualId: string;
  onCerrar: () => void;
  onClonar: (plantillaId: string, empresaDestinoId: string, nuevoNombre: string) => void;
}

export const PlantillaClonerModal: React.FC<PlantillaClonerModalProps> = ({
  plantilla,
  empresas,
  empresaActualId,
  onCerrar,
  onClonar,
}) => {
  const [empresaDestinoId, setEmpresaDestinoId] = useState(
    empresaActualId !== 'ALL' ? empresaActualId : empresas[0]?.id || ''
  );
  const [nuevoNombre, setNuevoNombre] = useState(`${plantilla.nombre} (Copia para empresa)`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaDestinoId || !nuevoNombre) return;
    onClonar(plantilla.id, empresaDestinoId, nuevoNombre);
    onCerrar();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Copy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Copiar Formato de Plantilla</h3>
              <p className="text-xs text-slate-500">Clonar diseño para una empresa específica</p>
            </div>
          </div>
          <button
            onClick={onCerrar}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Plantilla Original:</p>
            <p className="text-slate-700">{plantilla.nombre}</p>
            <p className="text-[10px] text-slate-400 mt-1">
              Tipo: {plantilla.tipo.toUpperCase()} | Formato: {plantilla.tamano_hoja} ({plantilla.orientacion})
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Empresa Destino *
            </label>
            <select
              required
              value={empresaDestinoId}
              onChange={(e) => setEmpresaDestinoId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            >
              {empresas.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.razon_social} (RUC: {emp.identificacion_fiscal})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre para el nuevo formato en la empresa *
            </label>
            <input
              type="text"
              required
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCerrar}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
              Clonar Plantilla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
