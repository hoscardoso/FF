import { useCards } from '@/context/CardsContext';
import { useMemo } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  CheckCircle2,
  Clock,
  DollarSign,
  CalendarDays,
  Users,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CARDS } from '@/types';
import {
  formatCurrency,
  isCurrentMonth,
  monthLabel,
  getUsageStatus,
} from '@/lib/utils';
import { chartColors } from '@/lib/chartSetup';
import {
  totalUtilizado,
  totalUtilizadoMes,
} from '@/components/Alerts';

export function Dashboard() {
  const { history, purchases } = useApp();
  const { cards } = useCards();

  const stats = useMemo(() => {
    const totalRetiradas = history.filter((h) => h.dataRetirada).length;
    const totalDevolucoes = history.filter((h) => h.dataDevolucao).length;
    const emUso = history.filter(
      (h) => h.dataRetirada && !h.dataDevolucao
    ).length;
    const disponiveis = cards.length - emUso;
    const pendentesComprovacao = purchases.filter(
      (p) => p.situacao === 'Pendente' || p.situacao === 'Sem comprovante'
    ).length;
    const valorTotal = totalUtilizado(purchases);
    const valorMes = totalUtilizadoMes(purchases);

    const porResponsavel = cards.map((card) => {
      const total = purchases
        .filter((p) => String(p.cardId) === String(card.id))
        .reduce((sum, p) => sum + p.valor, 0);
      return { name: card.responsavel, total };
    });

    return {
      totalRetiradas,
      totalDevolucoes,
      emUso,
      disponiveis,
      pendentesComprovacao,
      valorTotal,
      valorMes,
      porResponsavel,
    };
  }, [history, purchases]);

  const monthlyData = useMemo(() => {
    const months: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(monthLabel(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`));
    }
    const totals = months.map((_, idx) => {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      const tMonth = targetDate.getMonth();
      const tYear = targetDate.getFullYear();
      return purchases
        .filter((p) => {
          if (!p.dataCompra) return false;
          const d = new Date(p.dataCompra + 'T00:00:00');
          return d.getMonth() === tMonth && d.getFullYear() === tYear;
        })
        .reduce((sum, p) => sum + p.valor, 0);
    });
    return {
      labels: months,
      datasets: [
        {
          label: 'Valor Utilizado (R$)',
          data: totals,
          backgroundColor: chartColors.blueLight + '30',
          borderColor: chartColors.blue,
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointBackgroundColor: chartColors.blue,
          pointRadius: 4,
        },
      ],
    };
  }, [purchases]);

  const categoryData = useMemo(() => {
    const byCategory: Record<string, number> = {};
    purchases.forEach((p) => {
      byCategory[p.categoria] = (byCategory[p.categoria] || 0) + p.valor;
    });
    const labels = Object.keys(byCategory);
    const values = Object.values(byCategory);
    const colors = [
      chartColors.blue,
      chartColors.green,
      chartColors.amber,
      chartColors.red,
      chartColors.cyan,
      chartColors.purple,
      chartColors.orange,
      chartColors.teal,
    ];
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: labels.map((_, i) => colors[i % colors.length]),
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    };
  }, [purchases]);

  const userExpenseData = useMemo(() => {
    const byUser: Record<string, number> = {};
    purchases.forEach((p) => {
      byUser[p.usuario] = (byUser[p.usuario] || 0) + p.valor;
    });
    const labels = Object.keys(byUser);
    return {
      labels,
      datasets: [
        {
          label: 'Despesas por Usuário (R$)',
          data: Object.values(byUser),
          backgroundColor: chartColors.blue,
          borderRadius: 6,
        },
      ],
    };
  }, [purchases]);

  const conferenceData = useMemo(() => {
    const counts: Record<string, number> = {
      'Pendente': 0,
      'Conferido': 0,
      'Sem comprovante': 0,
      'Compra não reconhecida': 0,
    };
    purchases.forEach((p) => {
      counts[p.situacao] = (counts[p.situacao] || 0) + 1;
    });
    return {
      labels: Object.keys(counts),
      datasets: [
        {
          data: Object.values(counts),
          backgroundColor: [
            chartColors.amber,
            chartColors.green,
            chartColors.red,
            chartColors.slate,
          ],
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    };
  }, [purchases]);

  const indicators = [
    {
      label: 'Total de Retiradas',
      value: stats.totalRetiradas.toString(),
      icon: TrendingUp,
      color: 'blue',
    },
    {
      label: 'Total de Devoluções',
      value: stats.totalDevolucoes.toString(),
      icon: TrendingDown,
      color: 'green',
    },
    {
      label: 'Cartões em Uso',
      value: stats.emUso.toString(),
      icon: CreditCard,
      color: 'amber',
    },
    {
      label: 'Cartões Disponíveis',
      value: stats.disponiveis.toString(),
      icon: CheckCircle2,
      color: 'green',
    },
    {
      label: 'Pendentes de Comprovação',
      value: stats.pendentesComprovacao.toString(),
      icon: Clock,
      color: 'red',
    },
    {
      label: 'Valor Total Utilizado',
      value: formatCurrency(stats.valorTotal),
      icon: DollarSign,
      color: 'blue',
    },
    {
      label: 'Utilizado no Mês',
      value: formatCurrency(stats.valorMes),
      icon: CalendarDays,
      color: 'cyan',
    },
    {
      label: 'Por Responsável',
      value: stats.porResponsavel
        .map((r) => `${r.name}: ${formatCurrency(r.total)}`)
        .join(' · '),
      icon: Users,
      color: 'slate',
      wide: true,
    },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Painel Inicial</h1>
        <p className="text-sm text-slate-500 mt-1">
          Visão geral do controle de cartões corporativos
        </p>
      </div>

      {/* Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {indicators.map((ind) => {
          const Icon = ind.icon;
          return (
            <div
              key={ind.label}
              className={`card-base p-5 border ${colorMap[ind.color]} ${
                ind.wide ? 'sm:col-span-2 lg:col-span-4' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className={ind.wide ? 'flex-1' : ''}>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {ind.label}
                  </p>
                  <p
                    className={`mt-2 font-bold text-slate-800 ${
                      ind.wide ? 'text-sm' : 'text-2xl'
                    }`}
                  >
                    {ind.value}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center
                  ${colorMap[ind.color]} border-0`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-base p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            Utilização por Mês
          </h3>
          <div className="h-64">
            <Line
              data={monthlyData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (v) => formatCurrency(Number(v)),
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="card-base p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            Despesas por Categoria
          </h3>
          <div className="h-64">
            <Doughnut
              data={categoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'right', labels: { usePointStyle: true, padding: 12 } },
                },
              }}
            />
          </div>
        </div>

        <div className="card-base p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            Despesas por Usuário
          </h3>
          <div className="h-64">
            <Bar
              data={userExpenseData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        </div>

        <div className="card-base p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            Conferência de Comprovantes
          </h3>
          <div className="h-64">
            <Doughnut
              data={conferenceData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'right', labels: { usePointStyle: true, padding: 12 } },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
