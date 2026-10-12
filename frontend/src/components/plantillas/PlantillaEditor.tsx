import React, { useState } from 'react';
import { Plantilla } from '../../types/database';
import { ArrowLeft, Save, Sparkles, Tag, Eye, Code } from 'lucide-react';

interface PlantillaEditorProps {
  plantilla: Plantilla;
  onGuardar: (plantillaActualizada: Plantilla) => void;
  onVolver: () => void;
  onAbrirPreview: (plantilla: Plantilla) => void;
}

export const PlantillaEditor: React.FC<PlantillaEditorProps> = ({
  plantilla,
  onGuardar,
  onVolver,
  onAbrirPreview,
}) => {
  const [formData, setFormData] = useState<Plantilla>({ ...plantilla });

  const variablesDisponibles = [
    { label: 'Nombres', tag: '{{persona.nombres}}', desc: 'Nombres de la persona' },
    { label: 'Apellidos', tag: '{{persona.apellidos}}', desc: 'Apellidos de la persona' },
    { label: 'N° Documento', tag: '{{persona.numero_documento}}', desc: 'DNI / Carnet' },
    { label: 'Tipo Doc.', tag: '{{persona.tipo_documento}}', desc: 'DNI / CE' },
    { label: 'Cargo', tag: '{{persona.cargo}}', desc: 'Puesto de trabajo' },
    { label: 'Área', tag: '{{persona.departamento_area}}', desc: 'Departamento' },
    { label: 'Razón Social', tag: '{{empresa.razon_social}}', desc: 'Nombre empresa' },
    { label: 'RUC Empresa', tag: '{{empresa.identificacion_fiscal}}', desc: 'RUC / Identificación' },
    { label: 'Fecha Emisión', tag: '{{fecha_emision}}', desc: 'Fecha actual formateada' },
    { label: 'Código QR', tag: '{{qr_verificacion}}', desc: 'Data URL del QR de verificación' },
    { label: 'Hash SHA-256', tag: '{{hash_sha256}}', desc: 'Firma de integridad' },
  ];

  const insertarVariable = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      contenido_html: prev.contenido_html + '\n' + tag,
    }));
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar(formData);
  };

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onVolver}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              Editando: {formData.nombre}
            </h2>
            <p className="text-xs text-slate-500">
              Formato {formData.tamano_hoja} ({formData.orientacion === 'landscape' ? 'Horizontal' : 'Vertical'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAbrirPreview(formData)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors border border-slate-300"
          >
            <Eye className="w-4 h-4 text-slate-600" />
            Vista Previa en Vivo
          </button>
          <button
            onClick={handleGuardar}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            Guardar Plantilla
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Configuration & Available Variables */}
        <div className="lg:col-span-1 space-y-5">
          {/* Settings Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3.5 text-xs">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Configuración del Formato</h4>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nombre de la Plantilla</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tipo de Documento</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="certificado">Certificado / Diploma</option>
                <option value="comprobante">Constancia / Acta de Entrega</option>
                <option value="contrato">Contrato / Addenda</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Orientación</label>
                <select
                  value={formData.orientacion}
                  onChange={(e) => setFormData({ ...formData, orientacion: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="portrait">Vertical</option>
                  <option value="landscape">Horizontal</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hoja</label>
                <select
                  value={formData.tamano_hoja}
                  onChange={(e) => setFormData({ ...formData, tamano_hoja: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="A4">A4</option>
                  <option value="letter">Carta</option>
                </select>
              </div>
            </div>
          </div>

          {/* Variables Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-xs">
            <div className="flex items-center gap-1.5 mb-2 text-teal-700 font-bold uppercase tracking-wider text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Variables Dinámicas</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Haz clic sobre cualquier etiqueta para agregarla a tu diseño HTML:
            </p>

            <div className="space-y-1.5">
              {variablesDisponibles.map((v, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => insertarVariable(v.tag)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50/60 transition-all flex items-center justify-between group"
                >
                  <div>
                    <span className="font-semibold text-slate-800 text-[11px] block">{v.label}</span>
                    <span className="font-mono text-[9px] text-teal-700 group-hover:text-teal-900">{v.tag}</span>
                  </div>
                  <Tag className="w-3 h-3 text-slate-300 group-hover:text-teal-600 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Code Editor */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-900 text-slate-200 text-xs font-mono flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-teal-400" />
              <span>Plantilla HTML + Tailwind CSS (Renderizado 300 DPI)</span>
            </div>
            <span className="text-[10px] text-slate-400 font-sans">
              Compatible con clases de Tailwind
            </span>
          </div>

          <textarea
            value={formData.contenido_html}
            onChange={(e) => setFormData({ ...formData, contenido_html: e.target.value })}
            rows={26}
            className="w-full p-4 font-mono text-xs bg-slate-950 text-emerald-400 focus:outline-none resize-none leading-relaxed selection:bg-teal-700 selection:text-white"
            placeholder="Escribe el código HTML de tu plantilla aquí..."
          />
        </div>
      </div>
    </div>
  );
};
