import React from 'react';
import { Empresa } from '../../types/database';
import { Building2, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  empresas: Empresa[];
  selectedEmpresaId: string;
  onSelectEmpresa: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  empresas,
  selectedEmpresaId,
  onSelectEmpresa,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Building2 className="w-4 h-4 text-slate-400" />
          <span>Filtrar por Empresa:</span>
        </label>
        <select
          value={selectedEmpresaId}
          onChange={(e) => onSelectEmpresa(e.target.value)}
          className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all max-w-xs"
        >
          <option value="ALL">🏢 Todas las Empresas</option>
          {empresas.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.razon_social} (RUC: {emp.identificacion_fiscal})
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] text-emerald-700 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Firma SHA-256 Activa</span>
        </div>

        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-100 flex items-center justify-center font-bold text-xs">
            AD
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 leading-tight">Administrador</p>
            <p className="text-[10px] text-slate-400">Superuser</p>
          </div>
        </div>
      </div>
    </header>
  );
};
