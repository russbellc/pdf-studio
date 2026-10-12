# 📄 PDF Studio — Plataforma de Gestión y Generación de Documentos

Plataforma empresarial para diseñar plantillas oficiales (certificados, actas de entrega, constancias), importar directorios de personas vía hojas de cálculo Excel (`.xlsx`) y emitir documentos individuales por persona con renderizado pixel-perfect a 300 DPI y sellado criptográfico SHA-256.

---

## 🏗️ Arquitectura del Sistema

```
pdf-studio/
├── supabase/
│   ├── migrations/
│   │   └── 20261012000001_initial_schema.sql  ← Esquema PostgreSQL corregido (Empresas, Personas, Plantillas, Documentos, Config)
│   └── seed.sql                               ← Datos semilla (2 empresas demo, 2 plantillas oficiales y colaboradores)
├── pdf-worker/                                ← Microservicio en Node.js (Playwright + pdf-lib + Express)
│   ├── src/
│   │   ├── index.ts                           ← Endpoints REST (:3001)
│   │   ├── services/pdfRenderer.ts            ← Chromium 300 DPI con CSS embebido (offline)
│   │   ├── services/pdfMetadata.ts            ← Inyección de metadatos binarios y hash SHA-256
│   │   ├── services/batchZip.ts               ← Empaquetador masivo ZIP
│   │   └── services/qrService.ts              ← Generador de códigos QR de validación
│   ├── Dockerfile
│   └── package.json
├── frontend/                                  ← Single Page Application (React 19 + TypeScript + Vite + Tailwind)
│   ├── src/
│   │   ├── components/empresas/               ← CRUD y directorio de empresas
│   │   ├── components/personas/               ← Directorio e Importador Excel (.xlsx) con mapeo flexible
│   │   ├── components/plantillas/             ← Catálogo (Globales vs Empresa), editor y clonador multi-empresa
│   │   ├── components/generador/              ← Emisión por persona, preview en vivo y descarga ZIP
│   │   └── components/dashboard/              ← Métricas y accesos rápidos
│   └── package.json
└── docker-compose.yml                         ← Orquestador de servicios
```

---

## 🚀 Puesta en Marcha

### Prerrequisitos en el Servidor (`serverus`):
Ejecuta estos comandos en tu terminal de Linux con permisos `sudo`:

```bash
# 1. Instalar Node.js 22 LTS
sudo snap install node --classic --channel=22

# 2. Instalar Docker
sudo snap install docker
sudo groupadd docker 2>/dev/null || true
sudo usermod -aG docker aidev
```

---

### Opción A: Ejecutar con Docker Compose (Recomendado)

En la carpeta raíz del proyecto:

```bash
cd /home/aidev/proyectos/pdf-studio
docker compose up -d --build
```

El **PDF Worker** estará activo y escuchando en `http://localhost:3001`.

---

### Opción B: Ejecución Manual en Desarrollo

#### 1. Iniciar el PDF Worker (Puerto 3001):
```bash
cd /home/aidev/proyectos/pdf-studio/pdf-worker
npm install
npx playwright install chromium --with-deps
npm run dev
```

#### 2. Iniciar el Frontend (Puerto 5173):
```bash
cd /home/aidev/proyectos/pdf-studio/frontend
npm install
npm run dev
```

Accede desde tu navegador en Windows a:
👉 `http://192.168.1.100:5173` (o `http://localhost:5173`)

---

## 🌟 Características Implementadas

1. **Gestión Multi-Empresa:** Registro y administración de empresas con datos fiscales (RUC/NIT).
2. **Directorio de Personas e Importador Excel (`.xlsx`):**
   * Carga masiva con drag-and-drop.
   * Detección automática de columnas (DNI, Nombres, Apellidos, Cargo, Área, Teléfono, Correo).
   * Flexibilidad para absorber columnas extras en `datos_adicionales`.
3. **Catálogo de Plantillas con Clonación:**
   * **Plantillas Globales:** Disponibles para todas las empresas como modelos oficiales.
   * **Clonar Formato:** Duplica cualquier plantilla hacia una empresa específica con un solo clic.
   * **Editor Visual de Código:** Inserción rápida de variables `{{persona.nombres}}`, `{{empresa.razon_social}}`, etc.
4. **Emisión Estricta por Persona:**
   * Vista previa interactiva con los datos reales del colaborador.
   * Generación individual de PDF con nomenclatura limpia: `[DNI]_[Apellidos]_[Plantilla].pdf`.
   * Opción de generación múltiple con descarga empaquetada en archivo `.ZIP`.
   * Sellado formal con metadatos de diccionario PDF, hash de integridad SHA-256 y código QR.
