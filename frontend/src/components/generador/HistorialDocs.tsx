import React, { useState } from 'react';
import { DocumentoGenerado } from '../../types/database';
import { History, ShieldCheck, Copy, Check, Search, FileText } from 'lucide-react';

interface HistorialDocsProps {
  documentos: DocumentoGenerado[];
}

export const HistorialDocs: React.FC<HistorialDocsProps> = ({ documentos }) => {
  const [busqueda, setBusqueda] = useState('');
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  const docsFiltrados = documentos.filter(
    (d) =>
      d.nombre_archivo.toLowerCase().includes(busqueda.toLowerCase()) ||
      d.hash_sha256.toLowerCase().includes(busqueda.toLowerCase()) ||
      (d.persona_documento && d.persona_documento.includes(busqueda)) ||
      (d.persona_nombre && d.persona_nombre.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const copiarHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Historial de Documentos Emitidos</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Auditoría de todos los PDFs generados individualmente con sus firmas criptográficas SHA-256.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar por DNI, nombre de persona o hash SHA-256..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full text-xs bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Documento / Archivo</th>
                <th className="py-3 px-4">Persona Receptora</th>
                <th className="py-3 px-4">Empresa</th>
                <th className="py-3 px-4">Sello Criptográfico SHA-256</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {docsFiltrados.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                    {new Date(d.created_at).toLocaleString('es-PE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="font-semibold text-slate-900 truncate max-w-xs">{d.nombre_archivo}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{d.persona_nombre || 'N/A'}</div>
                    <span className="text-[10px] font-mono text-slate-400">Doc: {d.persona_documento}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 truncate max-w-[160px]">
                    {d.empresa_nombre || 'Empresa'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded truncate max-w-[180px]">
                        {d.hash_sha256}
                      </span>
                      <button
                        onClick={() => copiarHash(d.hash_sha256, d.id)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                        title="Copiar hash completo"
                      >
                        {copiadoId === d.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {docsFiltrados.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <History className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">Aún no se han emitido documentos</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Usa el módulo "Generar Documentos" para emitir tus primeros PDFs.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
