import * as XLSX from 'xlsx';
import { Persona } from '../types/database';

export interface ImportResult {
  validas: Partial<Persona>[];
  errores: { fila: number; mensaje: string }[];
  totalFilas: number;
  columnasDetectadas: string[];
}

/**
 * Normaliza nombres de columnas eliminando acentos, espacios y caracteres especiales.
 */
function normalizarClave(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^a-z0-9]/g, '_');
}

/**
 * Parsea un archivo Excel (.xlsx, .xls) o CSV y extrae la lista de personas para la empresa seleccionada.
 */
export async function parsearExcelPersonas(
  file: File,
  empresaId: string
): Promise<ImportResult> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });

  // Leer la primera hoja
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convertir a objetos JSON con claves crudas
  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  const validas: Partial<Persona>[] = [];
  const errores: { fila: number; mensaje: string }[] = [];
  const columnasDetectadas: Set<string> = new Set();

  rawRows.forEach((row, index) => {
    const filaNum = index + 2; // Fila 1 suele ser la cabecera
    const normalizedRow: Record<string, any> = {};

    Object.entries(row).forEach(([colName, val]) => {
      const cleanCol = normalizarClave(colName);
      normalizedRow[cleanCol] = String(val).trim();
      columnasDetectadas.add(colName);
    });

    // Mapeo flexible de documento (DNI, ID internacional, UoPeople ID, etc.)
    const numeroDoc =
      normalizedRow['uopeople_id'] ||
      normalizedRow['id'] ||
      normalizedRow['dni'] ||
      normalizedRow['numero_documento'] ||
      normalizedRow['documento'] ||
      normalizedRow['nro_documento'] ||
      normalizedRow['nro_doc'] ||
      normalizedRow['cedula'] ||
      normalizedRow['rut'] ||
      '';

    // Mapeo flexible de nombres y apellidos
    let nombres = normalizedRow['nombres'] || normalizedRow['nombre'] || '';
    let apellidos = normalizedRow['apellidos'] || normalizedRow['apellido'] || '';

    // Si viene en una sola columna "nombre_completo" o "apellidos_y_nombres"
    if (!nombres && (normalizedRow['apellidos_y_nombres'] || normalizedRow['nombres_y_apellidos'])) {
      const parts = (normalizedRow['apellidos_y_nombres'] || normalizedRow['nombres_y_apellidos']).split(' ');
      if (parts.length >= 2) {
        apellidos = parts.slice(0, Math.floor(parts.length / 2)).join(' ');
        nombres = parts.slice(Math.floor(parts.length / 2)).join(' ');
      } else {
        nombres = parts[0] || 'Desconocido';
      }
    }

    if (!numeroDoc) {
      errores.push({ fila: filaNum, mensaje: 'Falta el número de documento / ID / DNI.' });
      return;
    }

    if (!nombres) {
      errores.push({ fila: filaNum, mensaje: 'Faltan los nombres de la persona.' });
      return;
    }

    const correo = normalizedRow['correo'] || normalizedRow['email'] || normalizedRow['correo_electronico'] || '';
    const telefono = normalizedRow['telefono'] || normalizedRow['celular'] || normalizedRow['movil'] || '';
    const cargo = normalizedRow['cargo'] || normalizedRow['puesto'] || normalizedRow['ocupacion'] || (normalizedRow['carrera'] ? 'Estudiante' : '');
    const depto = normalizedRow['departamento_area'] || normalizedRow['area'] || normalizedRow['departamento'] || normalizedRow['carrera'] || '';
    const tipoDoc = normalizedRow['tipo_documento'] || normalizedRow['tipo_doc'] || (normalizedRow['uopeople_id'] ? 'ID' : 'DNI');

    // Todas las demás columnas van a datos_adicionales
    const datosAdicionales: Record<string, any> = {};
    if (normalizedRow['uopeople_id']) {
      datosAdicionales['uopeople_id'] = normalizedRow['uopeople_id'];
    }
    const clavesMapeadas = [
      'dni', 'numero_documento', 'documento', 'nro_documento', 'nro_doc', 'cedula', 'rut', 'id',
      'nombres', 'nombre', 'apellidos', 'apellido', 'apellidos_y_nombres', 'nombres_y_apellidos',
      'correo', 'email', 'correo_electronico', 'telefono', 'celular', 'movil',
      'cargo', 'puesto', 'ocupacion', 'departamento_area', 'area', 'departamento', 'tipo_documento', 'tipo_doc'
    ];

    Object.entries(normalizedRow).forEach(([k, v]) => {
      if (!clavesMapeadas.includes(k) && v !== '') {
        datosAdicionales[k] = v;
      }
    });

    validas.push({
      empresa_id: empresaId,
      tipo_documento: tipoDoc.toUpperCase(),
      numero_documento: numeroDoc,
      nombres,
      apellidos: apellidos || '-',
      correo,
      telefono,
      cargo,
      departamento_area: depto,
      datos_adicionales: datosAdicionales,
      activo: true,
    });
  });

  return {
    validas,
    errores,
    totalFilas: rawRows.length,
    columnasDetectadas: Array.from(columnasDetectadas),
  };
}
