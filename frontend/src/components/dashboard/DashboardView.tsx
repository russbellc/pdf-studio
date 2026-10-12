import React from 'react';
import { Empresa, Persona, Plantilla, DocumentoGenerado } from '../../types/database';
import { Building2, Users, FileText, Printer, FileSpreadsheet, Plus, ShieldCheck, ArrowRight } from 'lucide-react';
import { TabKey } from '../layout/Sidebar';

interface DashboardViewProps {
  empresas: Empresa[];
  personas: Persona[];
  plantillas: Plantilla[];
  documentos: DocumentoGenerado[];
  onNavegar: (tab: TabKey) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  empresas,
  personas,
  plantillas,
  documentos,
  onNavegar,
}) => {
  const stats = [
    { label: 'Empresas Registradas', valor: empresas.length, icon: Building2, color: 'text-teal-600 bg-teal-50 border-teal-200' },
    { label: 'Personas en Base de Datos', valor: personas.length, icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: 'Plantillas y Formatos', valor: plantillas.length, icon: FileText, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { label: 'Documentos Emitidos', valor: documentos.length, icon: Printer, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  ];

  return (
    <div className="space-y-8">
      {/* Banner de bienvenida */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-6 text-white shadow-lg border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-semibold border border-teal-500/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sistema Multi-Empresa con Sellado SHA-256</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Bienvenido a PDF Studio</h2>
          <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
            Plataforma para diseñar plantillas oficiales, importar personas desde Excel (.xlsx) y generar PDFs individuales por registro listos para imprimir.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavegar('generador')}
            className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            Emitir Documentos
          </button>
          <button
            onClick={() => onNavegar('personas')}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-600 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Cargar Excel
          </button>
        </div>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500">{s.label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">{s.valor}</div>
            </div>
          );
        })}
      </div>

      {/* Acciones Rápidas y Guía */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => onNavegar('empresas')}
          className="bg-white border border-slate-200 hover:border-teal-400 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 mb-3 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 flex items-center justify-between">
            1. Registrar Empresas
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Agrega la razón social y datos fiscales de cada organización cliente.
          </p>
        </div>

        <div
          onClick={() => onNavegar('personas')}
          className="bg-white border border-slate-200 hover:border-emerald-400 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-3 group-hover:scale-105 transition-transform">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 flex items-center justify-between">
            2. Cargar Personas (Excel)
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Sube hojas de cálculo con DNI, nombres y cargos para cada empresa.
          </p>
        </div>

        <div
          onClick={() => onNavegar('plantillas')}
          className="bg-white border border-slate-200 hover:border-indigo-400 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 mb-3 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 flex items-center justify-between">
            3. Plantillas y Clonación
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Usa los certificados globales o copia el formato exclusivo para una empresa.
          </p>
        </div>
      </div>
    </div>
  );
};
