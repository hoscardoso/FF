import { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { CardUsage } from '@/types';
import {
  formatDate,
  getUsageStatus,
  calcPossessionTime,
} from '@/lib/utils';
import { StatusBadge } from '@/components/Badges';
import { DataTable } from '@/components/DataTable';

export function Reports() {
  const { history } = useApp();

  const byColaborador = useMemo(() => {
    const result: Record<
      string,
      {
        retiradas: number;
        devolucoes: number;
      }
    > = {};

    history.forEach((h) => {
      const nome =
        h.quemRetirou || 'Não informado';

      if (!result[nome]) {
        result[nome] = {
          retiradas: 0,
          devolucoes: 0,
        };
      }

      result[nome].retiradas++;

      if (h.dataDevolucao) {
        result[nome].devolucoes++;
      }
    });

    return result;
  }, [history]);

  return (
    <div className="space-y-6 animate-fade-in">

      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Relatórios
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Relatório de utilização dos cartões
        </p>
      </div>

      <div className="card-base p-6">

        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-5 h-5 text-blue-600" />

          <h2 className="text-lg font-semibold">
            Por Portador
          </h2>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">
                Portador
              </th>

              <th className="text-right p-3">
                Retiradas
              </th>

              <th className="text-right p-3">
                Devoluções
              </th>

              <th className="text-right p-3">
                Em uso
              </th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(byColaborador).map(
              ([nome, item]) => (
                <tr
                  key={nome}
                  className="border-b"
                >
                  <td className="p-3">
                    {nome}
                  </td>

                  <td className="p-3 text-right">
                    {item.retiradas}
                  </td>

                  <td className="p-3 text-right">
                    {item.devolucoes}
                  </td>

                  <td className="p-3 text-right">
                    {item.retiradas -
                      item.devolucoes}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>

      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">
          Histórico Detalhado
        </h2>

        <DataTable
          columns={[
            {
              key: 'dataRetirada',
              header: 'Data',
              accessor: (h: CardUsage) =>
                formatDate(h.dataRetirada),
            },
            {
              key: 'quemRetirou',
              header: 'Portador',
              accessor: (h: CardUsage) =>
                h.quemRetirou,
            },
            {
              key: 'finalidade',
              header: 'Finalidade',
              accessor: (h: CardUsage) =>
                h.finalidade,
            },
            {
              key: 'devolucao',
              header: 'Devolução',
              accessor: (h: CardUsage) =>
                h.dataDevolucao
                  ? formatDate(
                      h.dataDevolucao
                    )
                  : '—',
            },
            {
              key: 'tempo',
              header: 'Tempo',
              accessor: (h: CardUsage) =>
                calcPossessionTime(
                  h.dataRetirada,
                  h.horaRetirada,
                  h.dataDevolucao,
                  h.horaDevolucao
                ),
            },
            {
              key: 'status',
              header: 'Status',
              accessor: (h: CardUsage) =>
                getUsageStatus(
                  h.dataRetirada,
                  h.dataDevolucao
                ),
              render: (h: CardUsage) => (
                <StatusBadge
                  status={getUsageStatus(
                    h.dataRetirada,
                    h.dataDevolucao
                  )}
                />
              ),
            },
          ]}
          rows={history}
          rowKey={(h) => h.id}
          searchFields={(h) =>
            `${h.quemRetirou} ${h.finalidade}`
          }
          searchPlaceholder="Pesquisar..."
        />
      </div>
    </div>
  );
}