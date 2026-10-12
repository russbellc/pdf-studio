import React, { useState } from 'react';
import { Plantilla, Empresa } from '../../types/database';
import { FileText, Globe2, Building2, Copy, Edit3, Plus, Search } from 'lucide-react';
import { PlantillaClonerModal } from './PlantillaClonerModal';

interface PlantillasCatalogProps {
  plantillas: Plantilla[];
  empresas: Empresa[];
  selectedEmpresaId: string;
  onEditarPlantilla: (plantilla: Plantilla) => void;
  onCrearPlantilla: () => void;
  onClonarPlantilla: (plantillaId: string, empresaDestinoId: string, nuevoNombre: string) => void;
  onProbarPlantilla: (plantilla: Plantilla) => void;
}

export const PlantillasCatalog: React.FC<PlantillasCatalogProps> = ({
  plantillas,
  empresas,
  selectedEmpresaId,
  onEditarPlantilla,
  onCrearPlantilla,
  onClonarPlantilla,
  onProbarPlantilla,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [plantillaParaClonar, setPlantillaParaClonar] = useState<Plantilla | null>(null);

  const plantillasFiltradas = plantillas.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
  );

  // Plantillas Globales
  const plantillasGlobales = plantillasFiltradas.filter((p) => p.es_global);

  // Plantillas de Empresa
  const plantillasEmpresas = plantillasFiltradas.filter((p) => {
    if (p.es_global) return false;
    return selectedEmpresaId === 'ALL' || p.empresa_id === selectedEmpresaId;
  });

  const getNombreEmpresa = (empresaId?: string | null) => {
    if (!empresaId) return 'Global';
    const emp = empresas.find((e) => e.id === empresaId);
    return emp ? emp.razon_social : 'Empresa';
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Catálogo de Plantillas y Formatos</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Formatos disponibles para emisión. Puedes utilizar formatos globales o clonarlos como plantillas propias de cada empresa.
          </p>
        </div>

        <button
          onClick={onCrearPlantilla}
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm shadow-teal-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Crear Nueva Plantilla
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar plantillas por nombre o descripción..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full text-xs bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
        />
      </div>

      {/* SECCIÓN 1: Plantillas Globales */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-slate-800">
          <Globe2 className="w-4 h-4 text-teal-600" />
          <h3 className="font-bold text-sm tracking-tight">Plantillas Globales (Disponibles para todas las empresas)</h3>
        </div>
        <p className="text-xs text-slate-500">
          Modelos base oficiales diseñados por el Administrador. Puedes clonarlos a cualquier empresa con un solo clic.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {plantillasGlobales.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
                    <Globe2 className="w-3 h-3" /> Global
                  </span>
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                    {p.tamano_hoja} • {p.orientacion === 'landscape' ? 'Horizontal' : 'Vertical'}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 leading-snug">{p.nombre}</h4>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {p.descripcion || 'Sin descripción'}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setPlantillaParaClonar(p)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors border border-teal-200"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copiar Formato
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onProbarPlantilla(p)}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded transition-colors"
                  >
                    Probar
                  </button>
                  <button
                    onClick={() => onEditarPlantilla(p)}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded transition-colors flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" /> Editar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN 2: Plantillas Propias de Empresa */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2 text-slate-800">
          <Building2 className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-sm tracking-tight">Plantillas Propias de Empresas</h3>
        </div>
        <p className="text-xs text-slate-500">
          Formatos personalizados o clonados pertenecientes a una empresa específica.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {plantillasEmpresas.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {getNombreEmpresa(p.empresa_id)}
                  </span>
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                    {p.tamano_hoja} • {p.orientacion}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 leading-snug">{p.nombre}</h4>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {p.descripcion || 'Sin descripción'}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setPlantillaParaClonar(p)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors border border-slate-200"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  Copiar a otra
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onProbarPlantilla(p)}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded transition-colors"
                  >
                    Probar
                  </button>
                  <button
                    onClick={() => onEditarPlantilla(p)}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded transition-colors flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" /> Editar
                  </button>
                </div>
              </div>
            </div>
          ))}

          {plantillasEmpresas.length === 0 && (
            <div className="col-span-full py-8 text-center bg-white rounded-xl border border-dashed border-slate-300">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No hay plantillas exclusivas creadas aún</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Puedes clonar cualquiera de las plantillas globales hacia la empresa seleccionada.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Clonación */}
      {plantillaParaClonar && (
        <PlantillaClonerModal
          plantilla={plantillaParaClonar}
          empresas={empresas}
          empresaActualId={selectedEmpresaId}
          onCerrar={() => setPlantillaParaClonar(null)}
          onClonar={onClonarPlantilla}
        />
      )}
    </div>
  );
};
