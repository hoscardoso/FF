import { useState, useMemo } from 'react';
import {
  CreditCard,
  User,
  Calendar,
  Clock,
  RotateCcw,
  Plus,
  Save,
  CalendarOff,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { CardId, CardUsage } from '@/types';
import { CARDS } from '@/types';
import {
  formatDate,
  formatDateTime,
  calcPossessionTime,
  getUsageStatus,
  daysSince,
} from '@/lib/utils';
import { Modal } from '@/components/Modal';
import { StatusBadge } from '@/components/Badges';
import { DataTable } from '@/components/DataTable';

interface CardControlProps {
  cardId: CardId;
}

const emptyForm = {
  dataRetirada: '',
  horaRetirada: '',
  quemRetirou: '',
  finalidade: '',
  observacao: '',
  dataDevolucao: '',
  horaDevolucao: '',
};

export function CardControl({ cardId }: CardControlProps) {
  const { history, addHistory, updateHistory, deleteHistory } = useApp();
  const card = CARDS[cardId];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [statusFilter, setStatusFilter] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  const cardHistory = useMemo(
    () => history.filter((h) => h.cardId === cardId),
    [history, cardId]
  );

  const currentUsage = cardHistory.find(
    (h) => h.dataRetirada && !h.dataDevolucao
  );

  const cardStatus = currentUsage ? 'Em uso' : 'Disponível';

  const lastRetirada = cardHistory
    .filter((h) => h.dataRetirada)
    .sort((a, b) => b.dataRetirada.localeCompare(a.dataRetirada))[0];
  const lastDevolucao = cardHistory
    .filter((h) => h.dataDevolucao)
    .sort((a, b) => b.dataDevolucao.localeCompare(a.dataDevolucao))[0];

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (item: CardUsage) => {
    setForm({
      dataRetirada: item.dataRetirada,
      horaRetirada: item.horaRetirada,
      quemRetirou: item.quemRetirou,
      finalidade: item.finalidade,
      observacao: item.observacao,
      dataDevolucao: item.dataDevolucao,
      horaDevolucao: item.horaDevolucao,
    });
    setEditingId(item.id);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.dataRetirada || !form.quemRetirou) return;
    if (editingId) {
      updateHistory(editingId, { ...form, cardId });
    } else {
      addHistory({ ...form, cardId });
    }
    setModalOpen(false);
  };

  const handleDelete = (item: CardUsage) => {
    if (confirm('Excluir este registro?')) {
      deleteHistory(item.id);
    }
  };

  const registerReturn = (item: CardUsage) => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const time = now.toTimeString().slice(0, 5);
    updateHistory(item.id, { dataDevolucao: today, horaDevolucao: time });
  };

  const filteredHistory = useMemo(() => {
    return cardHistory.filter((h) => {
      const status = getUsageStatus(h.dataRetirada, h.dataDevolucao);
      if (statusFilter && status !== statusFilter) return false;
      if (periodStart && h.dataRetirada < periodStart) return false;
      if (periodEnd && h.dataRetirada > periodEnd) return false;
      return true;
    });
  }, [cardHistory, statusFilter, periodStart, periodEnd]);

  const infoCards = [
    {
      label: 'Responsável',
      value: card.responsavel,
      icon: User,
      color: 'text-blue-700 bg-blue-50',
    },
    {
      label: 'Número da Conta',
      value: card.conta,
      icon: CreditCard,
      color: 'text-slate-700 bg-slate-100',
    },
    {
      label: 'Situação Atual',
      value: cardStatus,
      icon: cardStatus === 'Em uso' ? Clock : RotateCcw,
      color:
        cardStatus === 'Em uso'
          ? 'text-amber-700 bg-amber-50'
          : 'text-green-700 bg-green-50',
    },
    {
      label: 'Utilizando agora',
      value: currentUsage?.quemRetirou || '—',
      icon: User,
      color: 'text-slate-700 bg-slate-100',
    },
    {
      label: 'Última Retirada',
      value: lastRetirada ? formatDateTime(lastRetirada.dataRetirada, lastRetirada.horaRetirada) : '—',
      icon: Calendar,
      color: 'text-blue-700 bg-blue-50',
    },
    {
      label: 'Última Devolução',
      value: lastDevolucao ? formatDateTime(lastDevolucao.dataDevolucao, lastDevolucao.horaDevolucao) : '—',
      icon: CalendarOff,
      color: 'text-green-700 bg-green-50',
    },
  ];

  const columns = [
    {
      key: 'dataRetirada',
      header: 'Data Retirada',
      accessor: (h: CardUsage) => formatDate(h.dataRetirada),
    },
    {
      key: 'horaRetirada',
      header: 'Hora',
      accessor: (h: CardUsage) => h.horaRetirada || '—',
    },
    {
      key: 'quemRetirou',
      header: 'Quem Retirou',
      accessor: (h: CardUsage) => h.quemRetirou,
    },
    {
      key: 'finalidade',
      header: 'Finalidade',
      accessor: (h: CardUsage) => h.finalidade,
    },
    {
      key: 'dataDevolucao',
      header: 'Data Devolução',
      accessor: (h: CardUsage) => (h.dataDevolucao ? formatDate(h.dataDevolucao) : '—'),
    },
    {
      key: 'horaDevolucao',
      header: 'Hora Dev.',
      accessor: (h: CardUsage) => h.horaDevolucao || '—',
    },
    {
      key: 'posse',
      header: 'Tempo de Posse',
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
      accessor: (h: CardUsage) => getUsageStatus(h.dataRetirada, h.dataDevolucao),
      render: (h: CardUsage) => {
        const status = getUsageStatus(h.dataRetirada, h.dataDevolucao);
        const overdue =
          status === 'Em uso' && daysSince(h.dataRetirada) > 7;
        return (
          <div className="flex items-center gap-2">
            <StatusBadge status={status} />
            {overdue && (
              <span className="text-xs text-red-600 font-medium">
                ({daysSince(h.dataRetirada)}d)
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'observacao',
      header: 'Observação',
      accessor: (h: CardUsage) => h.observacao || '—',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Cartão · {card.responsavel}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Conta {card.conta} · Controle de utilização
          </p>
        </div>
        <button onClick={openNew} className="btn-primary">
          <Plus className="w-4 h-4" />
          Nova Retirada
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {infoCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card-base p-4">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${card.color}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                {card.label}
              </p>
              <p className="text-sm font-semibold text-slate-800 mt-1 truncate">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Current usage alert */}
      {currentUsage && (
        <div className="card-base p-4 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">
                Cartão em uso por {currentUsage.quemRetirou}
              </p>
              <p className="text-xs text-amber-700">
                Retirado em {formatDate(currentUsage.dataRetirada)} ·{' '}
                {daysSince(currentUsage.dataRetirada)} dia(s) ·{' '}
                {currentUsage.finalidade}
              </p>
            </div>
            <button
              onClick={() => registerReturn(currentUsage)}
              className="btn-success !py-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Registrar Devolução
            </button>
          </div>
        </div>
      )}

      {/* History Table */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          Histórico de Utilização
        </h2>

        <DataTable
          columns={columns}
          rows={filteredHistory}
          rowKey={(h) => h.id}
          searchFields={(h) => `${h.quemRetirou} ${h.finalidade} ${h.observacao}`}
          searchPlaceholder="Pesquisar por nome ou finalidade..."
          onEdit={openEdit}
          onDelete={handleDelete}
          exportFilename={`historico-${card.responsavel.toLowerCase()}`}
          exportTitle={`Histórico de Utilização — ${card.responsavel}`}
          filters={
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-base !w-auto !py-1.5 text-xs"
              >
                <option value="">Todos os status</option>
                <option value="Disponível">Disponível</option>
                <option value="Em uso">Em uso</option>
                <option value="Devolvido">Devolvido</option>
              </select>
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="input-base !w-auto !py-1.5 text-xs"
                title="Data inicial"
              />
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="input-base !w-auto !py-1.5 text-xs"
                title="Data final"
              />
            </div>
          }
        />
      </div>

      {/* Modal Form */}
      <Modal
        open={modalOpen}
        title={editingId ? 'Editar Registro' : 'Nova Retirada / Devolução'}
        onClose={() => setModalOpen(false)}
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
              Retirada
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600">Data de Retirada *</label>
                <input
                  type="date"
                  value={form.dataRetirada}
                  onChange={(e) =>
                    setForm({ ...form, dataRetirada: e.target.value })
                  }
                  className="input-base"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600">Horário de Retirada</label>
                <input
                  type="time"
                  value={form.horaRetirada}
                  onChange={(e) =>
                    setForm({ ...form, horaRetirada: e.target.value })
                  }
                  className="input-base"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600">Quem Retirou *</label>
                <input
                  type="text"
                  value={form.quemRetirou}
                  onChange={(e) =>
                    setForm({ ...form, quemRetirou: e.target.value })
                  }
                  className="input-base"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600">Finalidade *</label>
                <input
                  type="text"
                  value={form.finalidade}
                  onChange={(e) =>
                    setForm({ ...form, finalidade: e.target.value })
                  }
                  className="input-base"
                  placeholder="Finalidade da utilização"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs text-slate-600">Observação</label>
              <textarea
                value={form.observacao}
                onChange={(e) =>
                  setForm({ ...form, observacao: e.target.value })
                }
                className="input-base resize-none"
                rows={2}
                placeholder="Observações adicionais"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
              Devolução
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600">Data de Devolução</label>
                <input
                  type="date"
                  value={form.dataDevolucao}
                  onChange={(e) =>
                    setForm({ ...form, dataDevolucao: e.target.value })
                  }
                  className="input-base"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600">Horário de Devolução</label>
                <input
                  type="time"
                  value={form.horaDevolucao}
                  onChange={(e) =>
                    setForm({ ...form, horaDevolucao: e.target.value })
                  }
                  className="input-base"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!form.dataRetirada || !form.quemRetirou}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
