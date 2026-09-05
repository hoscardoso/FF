export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function formatDateTime(iso: string, time: string): string {
  if (!iso) return '—';
  return `${formatDate(iso)}${time ? ' ' + time : ''}`;
}

export function calcPossessionTime(
  dataRetirada: string,
  horaRetirada: string,
  dataDevolucao: string,
  horaDevolucao: string
): string {
  if (!dataRetirada) return '—';
  const start = new Date(`${dataRetirada}T${horaRetirada || '00:00'}`);
  let end: Date;
  if (dataDevolucao) {
    end = new Date(`${dataDevolucao}T${horaDevolucao || '00:00'}`);
  } else {
    end = new Date();
  }
  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) return '—';
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days === 0) return `${hours}h`;
  return `${days}d ${hours}h`;
}

export function getUsageStatus(
  dataRetirada: string,
  dataDevolucao: string
): 'Disponível' | 'Em uso' | 'Devolvido' {
  if (!dataRetirada) return 'Disponível';
  if (dataDevolucao) return 'Devolvido';
  return 'Em uso';
}

export function getCardStatus(
  history: { dataRetirada: string; dataDevolucao: string }[],
  cardId: string
): 'Disponível' | 'Em uso' {
  const cardHistory = history.filter((h) => (h as { cardId?: string }).cardId === cardId);
  const hasOpen = cardHistory.some(
    (h) => h.dataRetirada && !h.dataDevolucao
  );
  return hasOpen ? 'Em uso' : 'Disponível';
}

export function currentMonthLabel(): string {
  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ];
  return months[new Date().getMonth()];
}

export function monthLabel(iso: string): string {
  if (!iso) return '';
  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ];
  const d = new Date(iso + 'T00:00:00');
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function isCurrentMonth(iso: string): boolean {
  if (!iso) return false;
  const d = new Date(iso + 'T00:00:00');
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export function daysSince(iso: string): number {
  if (!iso) return 0;
  const d = new Date(iso + 'T00:00:00');
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}
