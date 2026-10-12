import React from 'react';
import { Building2, Users, FileText, Printer, History, LayoutDashboard } from 'lucide-react';

export type TabKey = 'dashboard' | 'empresas' | 'personas' | 'plantillas' | 'generador' | 'historial';

interface SidebarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  empresaSeleccionada?: { razon_social: string } | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, empresaSeleccionada }) => {
  const navItems = [
    { key: 'dashboard' as TabKey, label: 'Dashboard', icon: LayoutDashboard },
    { key: 'empresas' as TabKey, label: 'Empresas', icon: Building2 },
    { key: 'personas' as TabKey, label: 'Personas', icon: Users },
    { key: 'plantillas' as TabKey, label: 'Plantillas y Formatos', icon: FileText },
    { key: 'generador' as TabKey, label: 'Generar Documentos', icon: Printer },
    { key: 'historial' as TabKey, label: 'Historial Emitidos', icon: History },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col justify-between border-r border-slate-800 shrink-0">
      <div>
        {/* Brand */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-teal-500/20">
              PDF
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight leading-tight">PDF Studio</h1>
              <p className="text-[11px] text-teal-400 font-medium">Panel Administrador</p>
            </div>
          </div>
        </div>

        {/* Empresa activa context indicator */}
        <div className="px-4 py-3 mx-3 my-3 bg-slate-800/60 rounded-lg border border-slate-700/50">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Empresa en contexto</p>
          <p className="text-xs font-semibold text-slate-200 truncate mt-0.5">
            {empresaSeleccionada ? empresaSeleccionada.razon_social : 'Todas las empresas'}
          </p>
        </div>

        {/* Navigation list */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onSelectTab(item.key)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white font-semibold shadow-sm shadow-teal-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span>Worker Engine:</span>
          <span className="text-emerald-400 font-mono font-medium">Online (3001)</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Modo:</span>
          <span className="text-slate-300 font-medium">Admin Master</span>
        </div>
      </div>
    </aside>
  );
};
