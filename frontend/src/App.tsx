import React, { useState, useEffect } from 'react';
import { Empresa, Persona, Plantilla, DocumentoGenerado } from './types/database';
import { INITIAL_EMPRESAS, INITIAL_PERSONAS, INITIAL_PLANTILLAS } from './lib/mockData';
import { Sidebar, TabKey } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { EmpresasList } from './components/empresas/EmpresasList';
import { PersonasList } from './components/personas/PersonasList';
import { PlantillasCatalog } from './components/plantillas/PlantillasCatalog';
import { PlantillaEditor } from './components/plantillas/PlantillaEditor';
import { GeneradorView } from './components/generador/GeneradorView';
import { HistorialDocs } from './components/generador/HistorialDocs';

export const App: React.FC = () => {
  // Estado de datos con persistencia en localStorage y sincronización de registros iniciales
  const [empresas, setEmpresas] = useState<Empresa[]>(() => {
    const saved = localStorage.getItem('pdf_studio_empresas');
    if (!saved) return INITIAL_EMPRESAS;
    try {
      const parsed: Empresa[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map((e) => e.id));
      const faltantes = INITIAL_EMPRESAS.filter((e) => !existingIds.has(e.id));
      return [...parsed, ...faltantes];
    } catch {
      return INITIAL_EMPRESAS;
    }
  });

  const [personas, setPersonas] = useState<Persona[]>(() => {
    const saved = localStorage.getItem('pdf_studio_personas');
    if (!saved) return INITIAL_PERSONAS;
    try {
      const parsed: Persona[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map((p) => p.id));
      const faltantes = INITIAL_PERSONAS.filter((p) => !existingIds.has(p.id));
      // Actualizar registros iniciales con los datos nuevos (correo, fecha_nacimiento, pass, etc.)
      const actualizadas = parsed.map((p) => {
        const init = INITIAL_PERSONAS.find((ip) => ip.id === p.id || ip.numero_documento === p.numero_documento);
        if (init) {
          return {
            ...p,
            ...init,
            datos_adicionales: { ...p.datos_adicionales, ...init.datos_adicionales },
          };
        }
        return p;
      });
      return [...actualizadas, ...faltantes];
    } catch {
      return INITIAL_PERSONAS;
    }
  });

  const [plantillas, setPlantillas] = useState<Plantilla[]>(() => {
    const saved = localStorage.getItem('pdf_studio_plantillas');
    if (!saved) return INITIAL_PLANTILLAS;
    try {
      const parsed: Plantilla[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map((p) => p.id));
      const faltantes = INITIAL_PLANTILLAS.filter((p) => !existingIds.has(p.id));
      // Sincronizar plantillas del sistema con la versión más reciente
      const actualizadas = parsed.map((p) => {
        const init = INITIAL_PLANTILLAS.find((ip) => ip.id === p.id);
        return init ? init : p;
      });
      return [...actualizadas, ...faltantes];
    } catch {
      return INITIAL_PLANTILLAS;
    }
  });

  const [documentos, setDocumentos] = useState<DocumentoGenerado[]>(() => {
    const saved = localStorage.getItem('pdf_studio_documentos');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persistencia automática
  useEffect(() => {
    localStorage.setItem('pdf_studio_empresas', JSON.stringify(empresas));
  }, [empresas]);

  useEffect(() => {
    localStorage.setItem('pdf_studio_personas', JSON.stringify(personas));
  }, [personas]);

  useEffect(() => {
    localStorage.setItem('pdf_studio_plantillas', JSON.stringify(plantillas));
  }, [plantillas]);

  useEffect(() => {
    localStorage.setItem('pdf_studio_documentos', JSON.stringify(documentos));
  }, [documentos]);

  // Navegación y filtros
  const [currentTab, setCurrentTab] = useState<TabKey>('dashboard');
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>('ALL');

  // Estado para editor de plantilla
  const [plantillaEnEdicion, setPlantillaEnEdicion] = useState<Plantilla | null>(null);

  // Estado para pre-selección al saltar a Generador
  const [personaSeleccionadaParaGen, setPersonaSeleccionadaParaGen] = useState<Persona | null>(null);
  const [plantillaSeleccionadaParaGen, setPlantillaSeleccionadaParaGen] = useState<Plantilla | null>(null);

  const empresaActiva = empresas.find((e) => e.id === selectedEmpresaId) || null;

  // Handlers Empresas
  const handleCrearEmpresa = (nueva: Partial<Empresa>) => {
    const creada: Empresa = {
      id: `emp_${Date.now()}`,
      razon_social: nueva.razon_social || 'Nueva Empresa',
      identificacion_fiscal: nueva.identificacion_fiscal || '00000000000',
      correo_contacto: nueva.correo_contacto,
      telefono: nueva.telefono,
      direccion: nueva.direccion,
      activo: true,
      created_at: new Date().toISOString(),
    };
    setEmpresas((prev) => [creada, ...prev]);
  };

  const handleEditarEmpresa = (actualizada: Empresa) => {
    setEmpresas((prev) => prev.map((e) => (e.id === actualizada.id ? actualizada : e)));
  };

  // Handlers Personas
  const handleCrearPersona = (nueva: Partial<Persona>) => {
    const creada: Persona = {
      id: `per_${Date.now()}`,
      empresa_id: nueva.empresa_id || empresas[0]?.id || '',
      tipo_documento: nueva.tipo_documento || 'DNI',
      numero_documento: nueva.numero_documento || '',
      nombres: nueva.nombres || '',
      apellidos: nueva.apellidos || '',
      correo: nueva.correo,
      telefono: nueva.telefono,
      cargo: nueva.cargo,
      departamento_area: nueva.departamento_area,
      datos_adicionales: nueva.datos_adicionales || {},
      activo: true,
      created_at: new Date().toISOString(),
    };
    setPersonas((prev) => [creada, ...prev]);
  };

  const handleEditarPersona = (actualizada: Persona) => {
    setPersonas((prev) => prev.map((p) => (p.id === actualizada.id ? actualizada : p)));
    alert('Información de la persona actualizada correctamente.');
  };

  const handleImportarPersonas = (nuevas: Partial<Persona>[]) => {
    const paraInsertar: Persona[] = nuevas.map((n, idx) => ({
      id: `per_import_${Date.now()}_${idx}`,
      empresa_id: n.empresa_id || empresas[0]?.id || '',
      tipo_documento: n.tipo_documento || 'DNI',
      numero_documento: n.numero_documento || '',
      nombres: n.nombres || '',
      apellidos: n.apellidos || '',
      correo: n.correo,
      telefono: n.telefono,
      cargo: n.cargo,
      departamento_area: n.departamento_area,
      datos_adicionales: n.datos_adicionales || {},
      activo: true,
      created_at: new Date().toISOString(),
    }));

    // Evitar duplicados por (empresa_id, numero_documento)
    setPersonas((prev) => {
      const keysExistentes = new Set(prev.map((p) => `${p.empresa_id}_${p.numero_documento}`));
      const filtradas = paraInsertar.filter((p) => !keysExistentes.has(`${p.empresa_id}_${p.numero_documento}`));
      return [...filtradas, ...prev];
    });

    alert(`¡Se importaron ${nuevas.length} personas con éxito!`);
  };

  // Handlers Plantillas
  const handleCrearPlantilla = () => {
    const nueva: Plantilla = {
      id: `plan_${Date.now()}`,
      empresa_id: selectedEmpresaId !== 'ALL' ? selectedEmpresaId : null,
      es_global: selectedEmpresaId === 'ALL',
      nombre: 'Nueva Plantilla Oficial',
      descripcion: 'Formato personalizado para emisión de documentos.',
      tipo: 'certificado',
      orientacion: 'portrait',
      tamano_hoja: 'A4',
      contenido_html: `<div class="w-full h-full p-12 bg-white flex flex-col justify-between font-sans border-4 border-slate-900">
  <div class="text-center">
    <h1 class="text-3xl font-bold text-slate-900">DOCUMENTO OFICIAL</h1>
    <p class="text-xs text-slate-500 mt-1">{{empresa.razon_social}}</p>
  </div>
  <div class="my-6 text-center">
    <p class="text-sm">Por medio del presente se certifica a:</p>
    <h2 class="text-2xl font-bold text-slate-800 my-2">{{persona.nombres}} {{persona.apellidos}}</h2>
    <p class="text-xs">Identificado con {{persona.tipo_documento}}: {{persona.numero_documento}}</p>
  </div>
  <div class="flex justify-between items-end border-t pt-4 text-xs">
    <div>Fecha: {{fecha_emision}}</div>
    <div>Firma Autorizada</div>
  </div>
</div>`,
      variables_requeridas: ['persona.nombres', 'persona.numero_documento', 'empresa.razon_social'],
      activo: true,
      created_at: new Date().toISOString(),
    };
    setPlantillas((prev) => [nueva, ...prev]);
    setPlantillaEnEdicion(nueva);
  };

  const handleGuardarPlantilla = (actualizada: Plantilla) => {
    setPlantillas((prev) => prev.map((p) => (p.id === actualizada.id ? actualizada : p)));
    setPlantillaEnEdicion(null);
    alert('Plantilla guardada con éxito.');
  };

  // CLONACIÓN: Copiar formato de plantilla hacia otra empresa
  const handleClonarPlantilla = (plantillaId: string, empresaDestinoId: string, nuevoNombre: string) => {
    const original = plantillas.find((p) => p.id === plantillaId);
    if (!original) return;

    const clonada: Plantilla = {
      ...original,
      id: `plan_clon_${Date.now()}`,
      empresa_id: empresaDestinoId,
      es_global: false, // Las copias pertenecen a la empresa destino
      nombre: nuevoNombre,
      plantilla_origen_id: original.id,
      created_at: new Date().toISOString(),
    };

    setPlantillas((prev) => [clonada, ...prev]);
    alert(`¡Plantilla clonada con éxito para la empresa seleccionada como formato independiente!`);
  };

  const handleLanzarGeneradorDesdePersona = (persona: Persona) => {
    setPersonaSeleccionadaParaGen(persona);
    setSelectedEmpresaId(persona.empresa_id);
    setCurrentTab('generador');
  };

  const handleLanzarGeneradorDesdePlantilla = (plantilla: Plantilla) => {
    setPlantillaSeleccionadaParaGen(plantilla);
    if (plantilla.empresa_id) {
      setSelectedEmpresaId(plantilla.empresa_id);
    }
    setCurrentTab('generador');
  };

  const handleDocumentoGenerado = (doc: DocumentoGenerado) => {
    setDocumentos((prev) => [doc, ...prev]);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar de navegación */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setPlantillaEnEdicion(null);
          setCurrentTab(tab);
        }}
        empresaSeleccionada={empresaActiva}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header superior */}
        <Header
          empresas={empresas}
          selectedEmpresaId={selectedEmpresaId}
          onSelectEmpresa={setSelectedEmpresaId}
        />

        {/* Scrollable Content View */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                empresas={empresas}
                personas={personas}
                plantillas={plantillas}
                documentos={documentos}
                onNavegar={setCurrentTab}
              />
            )}

            {currentTab === 'empresas' && (
              <EmpresasList
                empresas={empresas}
                onCrearEmpresa={handleCrearEmpresa}
                onEditarEmpresa={handleEditarEmpresa}
                onSelectEmpresa={(id) => {
                  setSelectedEmpresaId(id);
                  setCurrentTab('personas');
                }}
              />
            )}

            {currentTab === 'personas' && (
              <PersonasList
                personas={personas}
                empresas={empresas}
                selectedEmpresaId={selectedEmpresaId}
                onCrearPersona={handleCrearPersona}
                onEditarPersona={handleEditarPersona}
                onImportarPersonas={handleImportarPersonas}
                onLanzarGenerador={handleLanzarGeneradorDesdePersona}
              />
            )}

            {currentTab === 'plantillas' && (
              plantillaEnEdicion ? (
                <PlantillaEditor
                  plantilla={plantillaEnEdicion}
                  onGuardar={handleGuardarPlantilla}
                  onVolver={() => setPlantillaEnEdicion(null)}
                  onAbrirPreview={(p) => {
                    setPlantillaSeleccionadaParaGen(p);
                    setCurrentTab('generador');
                  }}
                />
              ) : (
                <PlantillasCatalog
                  plantillas={plantillas}
                  empresas={empresas}
                  selectedEmpresaId={selectedEmpresaId}
                  onEditarPlantilla={setPlantillaEnEdicion}
                  onCrearPlantilla={handleCrearPlantilla}
                  onClonarPlantilla={handleClonarPlantilla}
                  onProbarPlantilla={handleLanzarGeneradorDesdePlantilla}
                />
              )
            )}

            {currentTab === 'generador' && (
              <GeneradorView
                empresas={empresas}
                personas={personas}
                plantillas={plantillas}
                selectedEmpresaId={selectedEmpresaId}
                personaInicial={personaSeleccionadaParaGen}
                plantillaInicial={plantillaSeleccionadaParaGen}
                onDocumentoGenerado={handleDocumentoGenerado}
              />
            )}

            {currentTab === 'historial' && (
              <HistorialDocs documentos={documentos} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
export default App;
