import React, { useState } from 'react';
import { Empresa, Persona } from '../../types/database';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { parsearExcelPersonas, ImportResult } from '../../lib/excelImporter';

interface ExcelImporterModalProps {
  empresas: Empresa[];
  empresaSeleccionadaId: string;
  onCerrar: () => void;
  onImportar: (nuevas: Partial<Persona>[]) => void;
}

export const ExcelImporterModal: React.FC<ExcelImporterModalProps> = ({
  empresas,
  empresaSeleccionadaId,
  onCerrar,
  onImportar,
}) => {
  const [empresaDestino, setEmpresaDestino] = useState(
    empresaSeleccionadaId !== 'ALL'
      ? empresaSeleccionadaId
      : empresas[0]?.id || ''
  );

  const [archivo, setArchivo] = useState<File | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState<ImportResult | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArchivo(file);
    setProcesando(true);
    try {
      const res = await parsearExcelPersonas(file, empresaDestino);
      setResultado(res);
    } catch (err) {
      console.error('Error parseando excel:', err);
      alert('Error al leer el archivo Excel. Asegúrate de que sea un archivo válido (.xlsx o .csv)');
    } finally {
      setProcesando(false);
    }
  };

  const confirmarImportacion = () => {
    if (!resultado || !resultado.validas.length) return;
    // Asegurar que todas tengan el ID de empresa destino
    const finales = resultado.validas.map((p) => ({
      ...p,
      empresa_id: empresaDestino,
    }));
    onImportar(finales);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Importador de Personas desde Excel</h3>
                <p className="text-xs text-slate-500">Carga masiva de colaboradores vía archivo .xlsx o .csv</p>
              </div>
            </div>
            <button
              onClick={onCerrar}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Selector de empresa destino */}
          <div className="my-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Empresa donde se registrarán las personas:
            </label>
            <select
              value={empresaDestino}
              onChange={(e) => {
                setEmpresaDestino(e.target.value);
                if (archivo) {
                  parsearExcelPersonas(archivo, e.target.value).then(setResultado);
                }
              }}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              {empresas.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.razon_social} (RUC: {emp.identificacion_fiscal})
                </option>
              ))}
            </select>
          </div>

          {/* Zona de Drop / Carga de archivo */}
          {!resultado && (
            <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-emerald-50/20 my-4">
              <UploadCloud className="w-10 h-10 text-emerald-600 mb-2" />
              <p className="text-xs font-semibold text-slate-800">
                {procesando ? 'Procesando archivo...' : 'Haz clic o arrastra tu archivo Excel aquí'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Formatos soportados: .xlsx, .xls, .csv</p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                disabled={procesando}
                className="hidden"
              />
            </label>
          )}

          {/* Vista previa de datos parseados */}
          {resultado && (
            <div className="my-4 space-y-3">
              <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-800">
                    {resultado.validas.length} registros válidos listos para importar
                  </span>
                </div>
                {resultado.errores.length > 0 && (
                  <div className="flex items-center gap-1.5 text-amber-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{resultado.errores.length} filas con error</span>
                  </div>
                )}
              </div>

              {/* Columnas detectadas */}
              <div className="text-[11px] text-slate-500 flex flex-wrap gap-1 items-center">
                <span className="font-semibold">Columnas detectadas:</span>
                {resultado.columnasDetectadas.map((col, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono text-[10px]">
                    {col}
                  </span>
                ))}
              </div>

              {/* Muestra de primeros 4 registros */}
              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3">Documento</th>
                      <th className="py-2 px-3">Nombres y Apellidos</th>
                      <th className="py-2 px-3">Cargo</th>
                      <th className="py-2 px-3">Extras</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 text-[11px]">
                    {resultado.validas.slice(0, 5).map((p, i) => (
                      <tr key={i}>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">{p.numero_documento}</td>
                        <td className="py-2 px-3">{p.nombres} {p.apellidos}</td>
                        <td className="py-2 px-3">{p.cargo || '-'}</td>
                        <td className="py-2 px-3 font-mono text-[10px] text-slate-400">
                          {p.datos_adicionales && Object.keys(p.datos_adicionales).length > 0
                            ? `${Object.keys(p.datos_adicionales).length} campos extra`
                            : 'Ninguno'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {resultado ? (
            <button
              type="button"
              onClick={() => {
                setResultado(null);
                setArchivo(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Cambiar archivo
            </button>
          ) : <div />}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCerrar}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmarImportacion}
              disabled={!resultado || resultado.validas.length === 0}
              className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg shadow-sm transition-all"
            >
              Importar {resultado ? `(${resultado.validas.length})` : ''} Registros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
