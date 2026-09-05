import { useCards } from '@/context/CardsContext';
import { useState, useMemo } from 'react';
import {
  BarChart3,
  DollarSign,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  FileType,
  Printer,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CARDS, CATEGORIES, CONFERENCE_STATUSES } from '@/types';
import type { CardUsage, Purchase } from '@/types';
import {
  formatCurrency,
  formatDate,
  getUsageStatus,
  calcPossessionTime,
} from '@/lib/utils';
import { DataTable } from '@/components/DataTable';
import { ConferenceBadge, StatusBadge } from '@/components/Badges';
import {
  exportToExcel,
  exportToCSV,
  exportToPDF,
  printTable,
  type ExportColumn,
} from '@/lib/exportImport';

type ReportTab = 'utilizacao' | 'financeiro' | 'prestacao';

export function Reports() {
  const { history, purchases } = useApp();
  const { cards } = useCards();
  const [tab, setTab] = useState<ReportTab>('utilizacao');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  const filterByPeriod = <T extends { dataRetirada?: string; dataCompra?: string }>(
    items: T[],
    dateField: keyof T
  ): T[] => {
    return items.filter((item) => {
      const date = String(item[dateField] || '');
      if (!date) return false;
      if (periodStart && date < periodStart) return false;
      if (periodEnd && date > periodEnd) return false;
      return true;
    });
  };

  // UTILIZACAO reports
  const utilizacaoData = useMemo(() => {
    const filtered = filterByPeriod(history, 'dataRetirada');
    const byColaborador: Record<string, { retiradas: number; devolucoes: number }> = {};
    filtered.forEach((h) => {
      const name = h.quemRetirou || '—';
      if (!byColaborador[name]) byColaborador[name] = { retiradas: 0, devolucoes: 0 };
      byColaborador[name].retiradas++;
      if (h.dataDevolucao) byColaborador[name].devolucoes++;
    });
    const byCard = cards.map((card) => {
      const cardHist = filtered.filter((h) => h.cardId === card.id);
      return {
        card: card.responsavel,
        conta: card.conta,
        retiradas: cardHist.length,
        devolucoes: cardHist.filter((h) => h.dataDevolucao).length,
        emUso: cardHist.filter((h) => !h.dataDevolucao).length,
      };
    });
    return { filtered, byColaborador, byCard };
  }, [history, periodStart, periodEnd]);

  // FINANCEIRO reports
  const financeiroData = useMemo(() => {
    const filtered = filterByPeriod(purchases, 'dataCompra');
    const byCategory: Record<string, number> = {};
    filtered.forEach((p) => {
      byCategory[p.categoria] = (byCategory[p.categoria] || 0) + p.valor;
    });
    const byMonth: Record<string, number> = {};
    filtered.forEach((p) => {
      const m = p.dataCompra.slice(0, 7);
      if (m) byMonth[m] = (byMonth[m] || 0) + p.valor;
    });
    const byResponsavel = cards.map((card) => {
      const total = filtered
        .filter((p) => p.cardId === card.id)
        .reduce((sum, p) => sum + p.valor, 0);
      return { responsavel: card.responsavel, conta: card.conta, total };
    });
    return { filtered, byCategory, byMonth, byResponsavel };
  }, [purchases, periodStart, periodEnd]);

  // PRESTACAO reports
  const prestacaoData = useMemo(() => {
    const filtered = filterByPeriod(purchases, 'dataCompra');
    const groups: Record<string, Purchase[]> = {
      'Pendente': [],
      'Conferido': [],
      'Sem comprovante': [],
      'Compra não reconhecida': [],
    };
    filtered.forEach((p) => {
      groups[p.situacao].push(p);
    });
    return { filtered, groups };
  }, [purchases, periodStart, periodEnd]);

  const tabs: { id: ReportTab; label: string; icon: typeof BarChart3 }[] = [
    { id: 'utilizacao', label: 'Utilização', icon: BarChart3 },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'prestacao', label: 'Prestação de Contas', icon: ClipboardCheck },
  ];

  const handleExport = <T,>(
    type: 'excel' | 'csv' | 'pdf' | 'print',
    filename: string,
    title: string,
    columns: ExportColumn<T>[],
    rows: T[]
  ) => {
    if (type === 'excel') exportToExcel(filename, columns, rows);
    else if (type === 'csv') exportToCSV(filename, columns, rows);
    else if (type === 'pdf') exportToPDF(filename, title, columns, rows);
    else printTable(title, columns, rows);
  };

  const exportButtons = <T,>(
    filename: string,
    title: string,
    columns: ExportColumn<T>[],
    rows: T[]
  ) => (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => handleExport('excel', filename, title, columns, rows)}
        className="btn-secondary !py-1.5 !px-3"
      >
        <FileSpreadsheet className="w-4 h-4 text-green-600" />
        <span className="hidden sm:inline">Excel</span>
      </button>
      <button
        onClick={() => handleExport('csv', filename, title, columns, rows)}
        className="btn-secondary !py-1.5 !px-3"
      >
        <FileText className="w-4 h-4 text-slate-600" />
        <span className="hidden sm:inline">CSV</span>
      </button>
      <button
        onClick={() => handleExport('pdf', filename, title, columns, rows)}
        className="btn-secondary !py-1.5 !px-3"
      >
        <FileType className="w-4 h-4 text-red-600" />
        <span className="hidden sm:inline">PDF</span>
      </button>
      <button
        onClick={() => handleExport('print', filename, title, columns, rows)}
        className="btn-secondary !py-1.5 !px-3"
      >
        <Printer className="w-4 h-4 text-blue-600" />
        <span className="hidden sm:inline">Imprimir</span>
      </button>
    </div>
  );

  // Columns definitions for each report
  const utilizacaoCols: ExportColumn<CardUsage & { cardName: string }>[] = [
    { header: 'Cartão', accessor: (r) => r.cardName },
    { header: 'Data Retirada', accessor: (r) => formatDate(r.dataRetirada) },
    { header: 'Quem Retirou', accessor: (r) => r.quemRetirou },
    { header: 'Finalidade', accessor: (r) => r.finalidade },
    { header: 'Data Devolução', accessor: (r) => (r.dataDevolucao ? formatDate(r.dataDevolucao) : '—') },
    { header: 'Tempo de Posse', accessor: (r) => calcPossessionTime(r.dataRetirada, r.horaRetirada, r.dataDevolucao, r.horaDevolucao) },
    { header: 'Status', accessor: (r) => getUsageStatus(r.dataRetirada, r.dataDevolucao) },
  ];

  const utilizacaoRows = utilizacaoData.filtered.map((h) => ({
    ...h,
    cardName:
  cards.find(
    (c) => String(c.id) === String(h.cardId)
  )?.responsavel || 'Cartão',
  }));

  const financeiroCols: ExportColumn<Purchase & { cardName: string }>[] = [
    { header: 'Cartão', accessor: (r) => r.cardName },
    { header: 'Data', accessor: (r) => formatDate(r.dataCompra) },
    { header: 'Descrição', accessor: (r) => r.descricao },
    { header: 'Categoria', accessor: (r) => r.categoria },
    { header: 'Usuário', accessor: (r) => r.usuario },
    { header: 'Valor', accessor: (r) => r.valor },
    { header: 'Situação', accessor: (r) => r.situacao },
  ];

  const financeiroRows = financeiroData.filtered.map((p) => ({
    ...p,
    cardName:
  cards.find(
    (c) => String(c.id) === String(p.cardId)
  )?.responsavel || 'Cartão',
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Relatórios</h1>
        <p className="text-sm text-slate-500 mt-1">
          Análises de utilização, financeiro e prestação de contas
        </p>
      </div>

      {/* Period filter */}
      <div className="card-base p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs text-slate-600 block mb-1">Período inicial</label>
          <input
            type="date"
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
            className="input-base !w-auto"
          />
        </div>
        <div>
          <label className="text-xs text-slate-600 block mb-1">Período final</label>
          <input
            type="date"
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
            className="input-base !w-auto"
          />
        </div>
        {(periodStart || periodEnd) && (
          <button
            onClick={() => {
              setPeriodStart('');
              setPeriodEnd('');
            }}
            className="btn-secondary !py-2"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                border-b-2 transition-colors
                ${
                  active
                    ? 'border-blue-700 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* UTILIZACAO */}
      {tab === 'utilizacao' && (
        <div className="space-y-6">
          {/* By colaborador */}
          <div className="card-base p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700">
                Por Colaborador
              </h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 font-semibold text-slate-600">Colaborador</th>
                  <th className="text-right py-2 px-3 font-semibold text-slate-600">Retiradas</th>
                  <th className="text-right py-2 px-3 font-semibold text-slate-600">Devoluções</th>
                  <th className="text-right py-2 px-3 font-semibold text-slate-600">Em uso</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(utilizacaoData.byColaborador).map(([name, data]) => (
                  <tr key={name} className="border-b border-slate-100">
                    <td className="py-2 px-3 text-slate-700">{name}</td>
                    <td className="py-2 px-3 text-right text-slate-700">{data.retiradas}</td>
                    <td className="py-2 px-3 text-right text-slate-700">{data.devolucoes}</td>
                    <td className="py-2 px-3 text-right text-slate-700">
                      {data.retiradas - data.devolucoes}
                    </td>
                  </tr>
                ))}
                {Object.keys(utilizacaoData.byColaborador).length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-400">
                      Sem dados no período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* By card */}
          <div className="card-base p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">
              Por Cartão
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 font-semibold text-slate-600">Responsável</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-600">Conta</th>
                  <th className="text-right py-2 px-3 font-semibold text-slate-600">Retiradas</th>
                  <th className="text-right py-2 px-3 font-semibold text-slate-600">Devoluções</th>
                  <th className="text-right py-2 px-3 font-semibold text-slate-600">Em uso</th>
                </tr>
              </thead>
              <tbody>
                {utilizacaoData.byCard.map((c) => (
                  <tr key={c.conta} className="border-b border-slate-100">
                    <td className="py-2 px-3 text-slate-700">{c.card}</td>
                    <td className="py-2 px-3 text-slate-500">{c.conta}</td>
                    <td className="py-2 px-3 text-right text-slate-700">{c.retiradas}</td>
                    <td className="py-2 px-3 text-right text-slate-700">{c.devolucoes}</td>
                    <td className="py-2 px-3 text-right text-slate-700">{c.emUso}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detailed table */}
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-700">Detalhado</h3>
            {exportButtons('relatorio-utilizacao', 'Relatório de Utilização', utilizacaoCols, utilizacaoRows)}
          </div>
          <DataTable
            columns={[
              { key: 'cardName', header: 'Cartão', accessor: (h: CardUsage & { cardName: string }) => h.cardName },
              { key: 'dataRetirada', header: 'Data', accessor: (h) => formatDate(h.dataRetirada) },
              { key: 'quemRetirou', header: 'Quem Retirou', accessor: (h) => h.quemRetirou },
              { key: 'finalidade', header: 'Finalidade', accessor: (h) => h.finalidade },
              { key: 'dataDevolucao', header: 'Devolução', accessor: (h) => (h.dataDevolucao ? formatDate(h.dataDevolucao) : '—') },
              { key: 'posse', header: 'Posse', accessor: (h) => calcPossessionTime(h.dataRetirada, h.horaRetirada, h.dataDevolucao, h.horaDevolucao) },
              {
                key: 'status',
                header: 'Status',
                accessor: (h) => getUsageStatus(h.dataRetirada, h.dataDevolucao),
                render: (h) => <StatusBadge status={getUsageStatus(h.dataRetirada, h.dataDevolucao)} />,
              },
            ]}
            rows={utilizacaoRows}
            rowKey={(h) => h.id}
            searchFields={(h) => `${h.quemRetirou} ${h.finalidade} ${h.cardName}`}
            searchPlaceholder="Pesquisar..."
            pageSize={10}
          />
        </div>
      )}

      {/* FINANCEIRO */}
      {tab === 'financeiro' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* By category */}
            <div className="card-base p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">
                Por Categoria
              </h3>
              <div className="space-y-2">
                {CATEGORIES.map((cat) => {
                  const val = financeiroData.byCategory[cat] || 0;
                  const total = Object.values(financeiroData.byCategory).reduce(
                    (a, b) => a + b,
                    0
                  );
                  const pct = total > 0 ? (val / total) * 100 : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>{cat}</span>
                        <span className="font-medium">{formatCurrency(val)}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* By month */}
            <div className="card-base p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">
                Por Mês
              </h3>
              <div className="space-y-2">
                {Object.entries(financeiroData.byMonth)
                  .sort((a, b) => a[0].localeCompare(b[0]))
                  .map(([month, val]) => (
                    <div
                      key={month}
                      className="flex justify-between items-center text-sm py-1.5 border-b border-slate-100"
                    >
                      <span className="text-slate-600">{month}</span>
                      <span className="font-medium text-slate-800">
                        {formatCurrency(val)}
                      </span>
                    </div>
                  ))}
                {Object.keys(financeiroData.byMonth).length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">
                    Sem dados.
                  </p>
                )}
              </div>
            </div>

            {/* By responsavel */}
            <div className="card-base p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">
                Por Responsável
              </h3>
              <div className="space-y-3">
                {financeiroData.byResponsavel.map((r) => (
                  <div key={r.conta} className="text-center">
                    <p className="text-xs text-slate-500">{r.responsavel}</p>
                    <p className="text-2xl font-bold text-blue-700 mt-1">
                      {formatCurrency(r.total)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-700">Detalhado</h3>
            {exportButtons('relatorio-financeiro', 'Relatório Financeiro', financeiroCols, financeiroRows)}
          </div>
          <DataTable
            columns={[
              { key: 'cardName', header: 'Cartão', accessor: (p: Purchase & { cardName: string }) => p.cardName },
              { key: 'dataCompra', header: 'Data', accessor: (p) => formatDate(p.dataCompra) },
              { key: 'descricao', header: 'Descrição', accessor: (p) => p.descricao },
              { key: 'categoria', header: 'Categoria', accessor: (p) => p.categoria },
              { key: 'usuario', header: 'Usuário', accessor: (p) => p.usuario },
              {
                key: 'valor',
                header: 'Valor',
                accessor: (p) => p.valor,
                render: (p) => (
                  <span className="font-semibold text-slate-800">{formatCurrency(p.valor)}</span>
                ),
              },
              {
                key: 'situacao',
                header: 'Situação',
                accessor: (p) => p.situacao,
                render: (p) => <ConferenceBadge status={p.situacao} />,
              },
            ]}
            rows={financeiroRows}
            rowKey={(p) => p.id}
            searchFields={(p) => `${p.descricao} ${p.categoria} ${p.usuario} ${p.cardName}`}
            searchPlaceholder="Pesquisar..."
            pageSize={10}
          />
        </div>
      )}

      {/* PRESTACAO */}
      {tab === 'prestacao' && (
        <div className="space-y-6">
          {CONFERENCE_STATUSES.map((status) => {
            const items = prestacaoData.groups[status];
            return (
              <div key={status} className="card-base p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <ConferenceBadge status={status} />
                    <span className="text-sm text-slate-500">
                      {items.length} lançamento(s)
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">
                    {formatCurrency(items.reduce((s, p) => s + p.valor, 0))}
                  </span>
                </div>
                {items.length > 0 && (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-3 font-semibold text-slate-600">Data</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-600">Descrição</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-600">Cartão</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-600">Usuário</th>
                        <th className="text-right py-2 px-3 font-semibold text-slate-600">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((p) => (
                        <tr key={p.id} className="border-b border-slate-100">
                          <td className="py-2 px-3 text-slate-700">{formatDate(p.dataCompra)}</td>
                          <td className="py-2 px-3 text-slate-700">{p.descricao}</td>
                          <td className="py-2 px-3 text-slate-500">{
  cards.find(
    (c) => String(c.id) === String(p.cardId)
  )?.responsavel || 'Cartão'
}</td>
                          <td className="py-2 px-3 text-slate-700">{p.usuario}</td>
                          <td className="py-2 px-3 text-right font-medium text-slate-800">
                            {formatCurrency(p.valor)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
