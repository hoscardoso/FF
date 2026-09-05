import {
  useState,
  useMemo,
  type ReactNode,
} from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  FileSpreadsheet,
  FileText,
  FileType,
  Printer,
} from 'lucide-react';
import {
  exportToExcel,
  exportToCSV,
  exportToPDF,
  printTable,
  type ExportColumn,
} from '@/lib/exportImport';

export type SortDir = 'asc' | 'desc' | null;

interface Column<T> {
  key: string;
  header: string;
  accessor: (row: T) => string | number;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  searchFields?: (row: T) => string;
  searchPlaceholder?: string;
  filters?: ReactNode;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  exportFilename?: string;
  exportTitle?: string;
  pageSize?: number;
  rowKey: (row: T) => string;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  rows,
  searchFields,
  searchPlaceholder = 'Pesquisar...',
  filters,
  onEdit,
  onDelete,
  exportFilename = 'export',
  exportTitle = 'Relatório',
  pageSize = 8,
  rowKey,
  emptyMessage = 'Nenhum registro encontrado.',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let result = [...rows];
    if (search && searchFields) {
      const q = search.toLowerCase();
      result = result.filter((r) => searchFields(r).toLowerCase().includes(q));
    }
    if (sortKey && sortDir) {
      const col = columns.find((c) => c.key === sortKey);
      if (col) {
        result.sort((a, b) => {
          const av = col.accessor(a);
          const bv = col.accessor(b);
          let cmp = 0;
          if (typeof av === 'number' && typeof bv === 'number') {
            cmp = av - bv;
          } else {
            cmp = String(av).localeCompare(String(bv), 'pt-BR');
          }
          return sortDir === 'asc' ? cmp : -cmp;
        });
      }
    }
    return result;
  }, [rows, search, searchFields, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const pageRows = filtered.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );

  const toggleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else if (sortDir === 'desc') {
      setSortKey(null);
      setSortDir(null);
    }
  };

  const exportColumns: ExportColumn<T>[] = columns
    .filter((c) => c.key !== 'actions')
    .map((c) => ({ header: c.header, accessor: c.accessor }));

  const doExport = (type: 'excel' | 'csv' | 'pdf' | 'print') => {
    if (type === 'excel')
      exportToExcel(exportFilename, exportColumns, filtered);
    else if (type === 'csv')
      exportToCSV(exportFilename, exportColumns, filtered);
    else if (type === 'pdf')
      exportToPDF(exportFilename, exportTitle, exportColumns, filtered);
    else printTable(exportTitle, exportColumns, filtered);
  };

  return (
    <div className="card-base p-4 sm:p-6 space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {searchFields && (
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                placeholder={searchPlaceholder}
                className="input-base pl-9"
              />
            </div>
          )}
          {filters}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => doExport('excel')}
            className="btn-secondary !py-1.5 !px-3"
            title="Exportar Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            <span className="hidden sm:inline">Excel</span>
          </button>
          <button
            onClick={() => doExport('csv')}
            className="btn-secondary !py-1.5 !px-3"
            title="Exportar CSV"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">CSV</span>
          </button>
          <button
            onClick={() => doExport('pdf')}
            className="btn-secondary !py-1.5 !px-3"
            title="Exportar PDF"
          >
            <FileType className="w-4 h-4 text-red-600" />
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button
            onClick={() => doExport('print')}
            className="btn-secondary !py-1.5 !px-3"
            title="Imprimir"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left py-3 px-3 font-semibold text-slate-600
                    whitespace-nowrap"
                >
                  {col.sortable !== false && col.key !== 'actions' ? (
                    <button
                      onClick={() => toggleSort(col.key)}
                      className="inline-flex items-center gap-1 hover:text-blue-700
                        transition-colors"
                    >
                      {col.header}
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : sortDir === 'desc' ? (
                          <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="text-right py-3 px-3 font-semibold text-slate-600">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="text-center py-12 text-slate-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="py-3 px-3 text-slate-700 whitespace-nowrap"
                    >
                      {col.render ? col.render(row) : col.accessor(row)}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50
                              transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50
                              transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-slate-500">
          {filtered.length} registro(s) · Página {currentPage + 1} de {totalPages}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100
              disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-600 px-2">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100
              disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
