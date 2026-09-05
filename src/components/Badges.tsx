import type { HistoryStatus, ConferenceStatus } from '@/types';

export function StatusBadge({ status }: { status: HistoryStatus }) {
  const styles: Record<HistoryStatus, string> = {
    'Disponível': 'bg-green-100 text-green-800',
    'Em uso': 'bg-blue-100 text-blue-800',
    'Devolvido': 'bg-slate-100 text-slate-600',
  };
  const dot: Record<HistoryStatus, string> = {
    'Disponível': 'bg-green-500',
    'Em uso': 'bg-blue-500',
    'Devolvido': 'bg-slate-400',
  };
  return (
    <span className={`badge ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status]}`} />
      {status}
    </span>
  );
}

export function ConferenceBadge({ status }: { status: ConferenceStatus }) {
  const styles: Record<ConferenceStatus, string> = {
    'Pendente': 'bg-amber-100 text-amber-800',
    'Conferido': 'bg-green-100 text-green-800',
    'Sem comprovante': 'bg-red-100 text-red-700',
    'Compra não reconhecida': 'bg-red-100 text-red-700',
  };
  const dot: Record<ConferenceStatus, string> = {
    'Pendente': 'bg-amber-500',
    'Conferido': 'bg-green-500',
    'Sem comprovante': 'bg-red-500',
    'Compra não reconhecida': 'bg-red-500',
  };
  return (
    <span className={`badge ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status]}`} />
      {status}
    </span>
  );
}
