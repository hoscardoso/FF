import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportColumn<T> {
  header: string;
  accessor: (row: T) => string | number;
}

export function exportToExcel<T>(
  filename: string,
  columns: ExportColumn<T>[],
  rows: T[]
): void {
  const data = rows.map((row) => {
    const obj: Record<string, string | number> = {};
    columns.forEach((col) => {
      obj[col.header] = col.accessor(row);
    });
    return obj;
  });
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dados');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToCSV<T>(
  filename: string,
  columns: ExportColumn<T>[],
  rows: T[]
): void {
  const header = columns.map((c) => `"${c.header}"`).join(';');
  const lines = rows.map((row) =>
    columns
      .map((c) => {
        const val = c.accessor(row);
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(';')
  );
  const csv = '\uFEFF' + [header, ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function exportToPDF<T>(
  filename: string,
  title: string,
  columns: ExportColumn<T>[],
  rows: T[]
): void {
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 27);

  autoTable(doc, {
    startY: 32,
    head: [columns.map((c) => c.header)],
    body: rows.map((row) => columns.map((c) => String(c.accessor(row)))),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [30, 64, 175], textColor: 255 },
    alternateRowStyles: { fillColor: [243, 246, 252] },
  });

  doc.save(`${filename}.pdf`);
}

export function printTable<T>(
  title: string,
  columns: ExportColumn<T>[],
  rows: T[]
): void {
  const win = window.open('', '_blank');
  if (!win) return;
  const html = `
    <html><head><title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; }
      h1 { color: #1e40af; font-size: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th { background: #1e40af; color: #fff; padding: 8px 10px; text-align: left; font-size: 12px; }
      td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
      tr:nth-child(even) { background: #f3f6fc; }
    </style></head><body>
    <h1>${title}</h1>
    <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
    <table>
      <thead><tr>${columns.map((c) => `<th>${c.header}</th>`).join('')}</tr></thead>
      <tbody>
        ${rows
          .map(
            (row) =>
              `<tr>${columns
                .map((c) => `<td>${c.accessor(row)}</td>`)
                .join('')}</tr>`
          )
          .join('')}
      </tbody>
    </table>
    <script>window.onload = () => window.print()</script>
    </body></html>
  `;
  win.document.write(html);
  win.document.close();
}

export interface ParsedImportRow {
  dataCompra?: string;
  descricao?: string;
  categoria?: string;
  usuario?: string;
  valor?: number;
  numeroParcela?: number;
  totalParcelas?: number;
  observacao?: string;
  numeroComprovante?: string;
  situacao?: string;
}

export async function importFromFile(file: File): Promise<ParsedImportRow[]> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'csv') {
    return parseCSV(await file.text());
  }
  if (ext === 'xlsx' || ext === 'xls') {
    return parseExcel(await file.arrayBuffer());
  }
  if (ext === 'pdf') {
    return parsePDF(await file.text());
  }
  throw new Error('Formato não suportado. Use CSV, Excel ou PDF.');
}

function parseCSV(text: string): ParsedImportRow[] {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitCSVLine(lines[0]).map((h) => h.trim().toLowerCase());
  const rows: ParsedImportRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i]);
    const row: ParsedImportRow = {};
    headers.forEach((h, idx) => {
      const val = (values[idx] || '').trim();
      if (h.includes('data') || h.includes('compra')) row.dataCompra = val;
      else if (h.includes('descri')) row.descricao = val;
      else if (h.includes('categ')) row.categoria = val;
      else if (h.includes('usu') || h.includes('user')) row.usuario = val;
      else if (h.includes('valor')) row.valor = parseFloat(val.replace(',', '.').replace(/[^\d.-]/g, '')) || 0;
      else if (h.includes('parcela') && h.includes('total')) row.totalParcelas = parseInt(val) || 1;
      else if (h.includes('parcela')) row.numeroParcela = parseInt(val) || 1;
      else if (h.includes('observ')) row.observacao = val;
      else if (h.includes('comprov') && h.includes('num')) row.numeroComprovante = val;
      else if (h.includes('situ') || h.includes('conf')) row.situacao = val;
    });
    rows.push(row);
  }
  return rows;
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((ch === ';' || ch === ',') && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function parseExcel(buffer: ArrayBuffer): ParsedImportRow[] {
  const wb = XLSX.read(buffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
  return json.map((raw) => {
    const lower: Record<string, unknown> = {};
    Object.keys(raw).forEach((k) => {
      lower[k.toLowerCase().trim()] = raw[k];
    });
    const row: ParsedImportRow = {};
    const findKey = (needle: string) =>
      Object.keys(lower).find((k) => k.includes(needle));
    const dataKey = findKey('data') || findKey('compra');
    if (dataKey) row.dataCompra = String(lower[dataKey] || '');
    const descKey = findKey('descri');
    if (descKey) row.descricao = String(lower[descKey] || '');
    const catKey = findKey('categ');
    if (catKey) row.categoria = String(lower[catKey] || '');
    const userKey = findKey('usu') || findKey('user');
    if (userKey) row.usuario = String(lower[userKey] || '');
    const valKey = findKey('valor');
    if (valKey) row.valor = Number(lower[valKey]) || 0;
    const parcKey = findKey('parcela');
    if (parcKey) row.numeroParcela = Number(lower[parcKey]) || 1;
    const totalKey = findKey('total');
    if (totalKey) row.totalParcelas = Number(lower[totalKey]) || 1;
    const obsKey = findKey('observ');
    if (obsKey) row.observacao = String(lower[obsKey] || '');
    const numCompKey = findKey('comprov');
    if (numCompKey) row.numeroComprovante = String(lower[numCompKey] || '');
    const sitKey = findKey('situ') || findKey('conf');
    if (sitKey) row.situacao = String(lower[sitKey] || '');
    return row;
  });
}

function parsePDF(text: string): ParsedImportRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const rows: ParsedImportRow[] = [];
  for (const line of lines) {
    const parts = line.split(/\s{2,}|\t/).map((p) => p.trim()).filter(Boolean);
    if (parts.length < 3) continue;
    const dateMatch = parts.find((p) => /^\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}/.test(p));
    const valueMatch = parts.find((p) => /[\d.,]+$/.test(p));
    rows.push({
      dataCompra: dateMatch ? normalizeDate(dateMatch) : '',
      descricao: parts.find((p) => p !== dateMatch && p !== valueMatch) || '',
      valor: valueMatch ? parseFloat(valueMatch.replace('.', '').replace(',', '.')) || 0 : 0,
      situacao: 'Pendente',
    });
  }
  return rows;
}

function normalizeDate(val: string): string {
  const m = val.match(/(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/);
  if (!m) return val;
  const [, d, mo, y] = m;
  const year = y.length === 2 ? `20${y}` : y;
  return `${year}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
}
