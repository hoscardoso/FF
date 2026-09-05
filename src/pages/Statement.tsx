import { useState, useMemo, useRef } from 'react';
import {
  Plus,
  Save,
  Upload,
  FileText,
  Link as LinkIcon,
  Paperclip,
  Eye,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { CardId, Purchase, Category, ConferenceStatus } from '@/types';
import { CARDS, CATEGORIES, CONFERENCE_STATUSES } from '@/types';
import {
  formatCurrency,
  formatDate,
} from '@/lib/utils';
import { Modal } from '@/components/Modal';
import { ConferenceBadge } from '@/components/Badges';
import { DataTable } from '@/components/DataTable';
import { importFromFile, type ParsedImportRow } from '@/lib/exportImport';

interface StatementProps {
  cardId: CardId;
}

const emptyForm = {
  dataCompra: '',
  descricao: '',
  categoria: 'Alimentação' as Category,
  usuario: '',
  valor: '',
  numeroParcela: '1',
  totalParcelas: '1',
  observacao: '',
  numeroComprovante: '',
  linkComprovante: '',
  arquivoComprovante: '',
  situacao: 'Pendente' as ConferenceStatus,
};

export function Statement({ cardId }: StatementProps) {
  const { purchases, addPurchase, addPurchases, updatePurchase, deletePurchase } =
    useApp();
  const card = CARDS[cardId];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [importMsg, setImportMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  const cardPurchases = useMemo(
    () => purchases.filter((p) => p.cardId === cardId),
    [purchases, cardId]
  );

  const filteredPurchases = useMemo(() => {
    return cardPurchases.filter((p) => {
      if (categoryFilter && p.categoria !== categoryFilter) return false;
      if (statusFilter && p.situacao !== statusFilter) return false;
      if (periodStart && p.dataCompra < periodStart) return false;
      if (periodEnd && p.dataCompra > periodEnd) return false;
      return true;
    });
  }, [cardPurchases, categoryFilter, statusFilter, periodStart, periodEnd]);

  const totalFiltered = filteredPurchases.reduce(
    (sum, p) => sum + p.valor,
    0
  );

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (item: Purchase) => {
    setForm({
      dataCompra: item.dataCompra,
      descricao: item.descricao,
      categoria: item.categoria,
      usuario: item.usuario,
      valor: String(item.valor),
      numeroParcela: String(item.numeroParcela),
      totalParcelas: String(item.totalParcelas),
      observacao: item.observacao,
      numeroComprovante: item.numeroComprovante,
      linkComprovante: item.linkComprovante,
      arquivoComprovante: item.arquivoComprovante,
      situacao: item.situacao,
    });
    setEditingId(item.id);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.dataCompra || !form.descricao) return;
    const payload = {
      cardId,
      dataCompra: form.dataCompra,
      descricao: form.descricao,
      categoria: form.categoria,
      usuario: form.usuario,
      valor: parseFloat(form.valor) || 0,
      numeroParcela: parseInt(form.numeroParcela) || 1,
      totalParcelas: parseInt(form.totalParcelas) || 1,
      observacao: form.observacao,
      numeroComprovante: form.numeroComprovante,
      linkComprovante: form.linkComprovante,
      arquivoComprovante: form.arquivoComprovante,
      situacao: form.situacao,
    };
    if (editingId) {
      updatePurchase(editingId, payload);
    } else {
      addPurchase(payload);
    }
    setModalOpen(false);
  };

  const handleDelete = (item: Purchase) => {
    if (confirm('Excluir esta compra?')) {
      deletePurchase(item.id);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportMsg('');
    importFromFile(file)
      .then((rows: ParsedImportRow[]) => {
        if (rows.length === 0) {
          setImportMsg('Nenhum registro válido encontrado no arquivo.');
          return;
        }
        const newPurchases = rows.map((r) => ({
          cardId,
          dataCompra: r.dataCompra || '',
          descricao: r.descricao || '',
          categoria: (CATEGORIES as readonly string[]).includes(r.categoria || '')
            ? (r.categoria as Category)
            : 'Outros',
          usuario: r.usuario || '',
          valor: r.valor || 0,
          numeroParcela: r.numeroParcela || 1,
          totalParcelas: r.totalParcelas || 1,
          observacao: r.observacao || '',
          numeroComprovante: r.numeroComprovante || '',
          linkComprovante: '',
          arquivoComprovante: '',
          situacao: (CONFERENCE_STATUSES.includes(
            r.situacao as ConferenceStatus
          )
            ? r.situacao
            : 'Pendente') as ConferenceStatus,
        }));
        addPurchases(newPurchases);
        setImportMsg(`${newPurchases.length} registro(s) importado(s) com sucesso.`);
      })
      .catch((err) => {
        setImportMsg(`Erro: ${err.message}`);
      });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleComprovanteFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm({ ...form, arquivoComprovante: file.name });
  };

  const columns = [
    {
      key: 'dataCompra',
      header: 'Data',
      accessor: (p: Purchase) => formatDate(p.dataCompra),
    },
    {
      key: 'descricao',
      header: 'Descrição',
      accessor: (p: Purchase) => p.descricao,
    },
    {
      key: 'categoria',
      header: 'Categoria',
      accessor: (p: Purchase) => p.categoria,
    },
    {
      key: 'usuario',
      header: 'Usuário',
      accessor: (p: Purchase) => p.usuario,
    },
    {
      key: 'valor',
      header: 'Valor',
      accessor: (p: Purchase) => p.valor,
      render: (p: Purchase) => (
        <span className="font-semibold text-slate-800">
          {formatCurrency(p.valor)}
        </span>
      ),
    },
    {
      key: 'parcela',
      header: 'Parcela',
      accessor: (p: Purchase) => `${p.numeroParcela}/${p.totalParcelas}`,
    },
    {
      key: 'situacao',
      header: 'Conferência',
      accessor: (p: Purchase) => p.situacao,
      render: (p: Purchase) => <ConferenceBadge status={p.situacao} />,
    },
    {
      key: 'comprovante',
      header: 'Comprovante',
      accessor: (p: Purchase) =>
        p.numeroComprovante || p.linkComprovante || p.arquivoComprovante || '—',
      render: (p: Purchase) => {
        if (p.linkComprovante) {
          return (
            <a
              href={p.linkComprovante}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
            >
              <LinkIcon className="w-3 h-3" />
              {p.numeroComprovante || 'Ver'}
            </a>
          );
        }
        if (p.arquivoComprovante) {
          return (
            <span className="inline-flex items-center gap-1 text-slate-600">
              <Paperclip className="w-3 h-3" />
              {p.arquivoComprovante}
            </span>
          );
        }
        return (
          <span className="text-slate-400">{p.numeroComprovante || '—'}</span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Extrato · {card.responsavel}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Conta {card.conta} · Prestação de contas
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary"
          >
            <Upload className="w-4 h-4" />
            Importar
          </button>
          <button onClick={openNew} className="btn-primary">
            <Plus className="w-4 h-4" />
            Nova Compra
          </button>
        </div>
      </div>

      {importMsg && (
        <div
          className={`px-4 py-3 rounded-lg text-sm ${
            importMsg.startsWith('Erro')
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}
        >
          {importMsg}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card-base p-4">
          <p className="text-xs text-slate-500 uppercase">Total de Lançamentos</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {filteredPurchases.length}
          </p>
        </div>
        <div className="card-base p-4">
          <p className="text-xs text-slate-500 uppercase">Valor Total</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">
            {formatCurrency(totalFiltered)}
          </p>
        </div>
        <div className="card-base p-4">
          <p className="text-xs text-slate-500 uppercase">Conferidos</p>
          <p className="text-2xl font-bold text-green-700 mt-1">
            {filteredPurchases.filter((p) => p.situacao === 'Conferido').length}
          </p>
        </div>
        <div className="card-base p-4">
          <p className="text-xs text-slate-500 uppercase">Pendentes</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {
              filteredPurchases.filter(
                (p) => p.situacao === 'Pendente' || p.situacao === 'Sem comprovante'
              ).length
            }
          </p>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        rows={filteredPurchases}
        rowKey={(p) => p.id}
        searchFields={(p) =>
          `${p.descricao} ${p.usuario} ${p.categoria} ${p.observacao} ${p.numeroComprovante}`
        }
        searchPlaceholder="Pesquisar por descrição, usuário, categoria..."
        onEdit={openEdit}
        onDelete={handleDelete}
        exportFilename={`extrato-${card.responsavel.toLowerCase()}`}
        exportTitle={`Extrato — ${card.responsavel} (Conta ${card.conta})`}
        filters={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-base !w-auto !py-1.5 text-xs"
            >
              <option value="">Todas categorias</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-base !w-auto !py-1.5 text-xs"
            >
              <option value="">Todos status</option>
              {CONFERENCE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
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

      {/* Modal Form */}
      <Modal
        open={modalOpen}
        title={editingId ? 'Editar Compra' : 'Cadastrar Compra'}
        onClose={() => setModalOpen(false)}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-600">Data da Compra *</label>
              <input
                type="date"
                value={form.dataCompra}
                onChange={(e) =>
                  setForm({ ...form, dataCompra: e.target.value })
                }
                className="input-base"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600">Estabelecimento *</label>
              <input
                type="text"
                value={form.descricao}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
                }
                className="input-base"
                placeholder="Nome do estabelecimento"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600">Categoria</label>
              <select
                value={form.categoria}
                onChange={(e) =>
                  setForm({ ...form, categoria: e.target.value as Category })
                }
                className="input-base"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-600">Nome do Usuário</label>
              <input
                type="text"
                value={form.usuario}
                onChange={(e) =>
                  setForm({ ...form, usuario: e.target.value })
                }
                className="input-base"
                placeholder="Quem fez a compra"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
                className="input-base"
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600">Situação da Conferência</label>
              <select
                value={form.situacao}
                onChange={(e) =>
                  setForm({
                    ...form,
                    situacao: e.target.value as ConferenceStatus,
                  })
                }
                className="input-base"
              >
                {CONFERENCE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-600">Nº da Parcela</label>
              <input
                type="number"
                value={form.numeroParcela}
                onChange={(e) =>
                  setForm({ ...form, numeroParcela: e.target.value })
                }
                className="input-base"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600">Total de Parcelas</label>
              <input
                type="number"
                value={form.totalParcelas}
                onChange={(e) =>
                  setForm({ ...form, totalParcelas: e.target.value })
                }
                className="input-base"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-600">Observação</label>
            <textarea
              value={form.observacao}
              onChange={(e) =>
                setForm({ ...form, observacao: e.target.value })
              }
              className="input-base resize-none"
              rows={2}
              placeholder="Observações sobre a compra"
            />
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
              Comprovante
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600">Nº do Comprovante</label>
                <input
                  type="text"
                  value={form.numeroComprovante}
                  onChange={(e) =>
                    setForm({ ...form, numeroComprovante: e.target.value })
                  }
                  className="input-base"
                  placeholder="Número do recibo/Nota fiscal"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600">Link do Comprovante</label>
                <input
                  type="url"
                  value={form.linkComprovante}
                  onChange={(e) =>
                    setForm({ ...form, linkComprovante: e.target.value })
                  }
                  className="input-base"
                  placeholder="https://..."
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-600">
                  Arquivo do Comprovante
                </label>
                <div className="flex items-center gap-2">
                  <label className="btn-secondary cursor-pointer !py-1.5">
                    <Paperclip className="w-4 h-4" />
                    {form.arquivoComprovante || 'Selecionar arquivo'}
                    <input
                      type="file"
                      onChange={handleComprovanteFile}
                      className="hidden"
                    />
                  </label>
                  {form.arquivoComprovante && (
                    <button
                      onClick={() =>
                        setForm({ ...form, arquivoComprovante: '' })
                      }
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remover
                    </button>
                  )}
                </div>
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
              disabled={!form.dataCompra || !form.descricao}
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
