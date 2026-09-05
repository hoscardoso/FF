import type { CardUsage, Purchase } from '@/types';

const HISTORY_KEY = 'cc_history';
const PURCHASES_KEY = 'cc_purchases';

export function loadHistory(): CardUsage[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as CardUsage[]) : [];
  } catch {
    return [];
  }
}

export function saveHistory(items: CardUsage[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
}

export function loadPurchases(): Purchase[] {
  try {
    const raw = localStorage.getItem(PURCHASES_KEY);
    return raw ? (JSON.parse(raw) as Purchase[]) : [];
  } catch {
    return [];
  }
}

export function savePurchases(items: Purchase[]): void {
  localStorage.setItem(PURCHASES_KEY, JSON.stringify(items));
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function seedIfEmpty(): { history: CardUsage[]; purchases: Purchase[] } {
  let history = loadHistory();
  let purchases = loadPurchases();
  if (history.length === 0 && purchases.length === 0) {
    const now = new Date();
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const daysAgo = (n: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - n);
      return iso(d);
    };
    history = [
      {
        id: uid(),
        cardId: 'angela',
        dataRetirada: daysAgo(25),
        horaRetirada: '09:15',
        quemRetirou: 'Carlos Oliveira',
        finalidade: 'Compra de material de escritório',
        observacao: '',
        dataDevolucao: daysAgo(23),
        horaDevolucao: '17:40',
        createdAt: new Date().toISOString(),
      },
      {
        id: uid(),
        cardId: 'angela',
        dataRetirada: daysAgo(10),
        horaRetirada: '08:30',
        quemRetirou: 'Fernanda Lima',
        finalidade: 'Pagamento de serviço de limpeza',
        observacao: 'Urgente',
        dataDevolucao: daysAgo(8),
        horaDevolucao: '16:20',
        createdAt: new Date().toISOString(),
      },
      {
        id: uid(),
        cardId: 'angela',
        dataRetirada: daysAgo(3),
        horaRetirada: '10:00',
        quemRetirou: 'Carlos Oliveira',
        finalidade: 'Compras de alimentação',
        observacao: '',
        dataDevolucao: '',
        horaDevolucao: '',
        createdAt: new Date().toISOString(),
      },
      {
        id: uid(),
        cardId: 'marlei',
        dataRetirada: daysAgo(20),
        horaRetirada: '14:00',
        quemRetirou: 'Roberto Silva',
        finalidade: 'Combustível para viagem',
        observacao: '',
        dataDevolucao: daysAgo(18),
        horaDevolucao: '18:00',
        createdAt: new Date().toISOString(),
      },
      {
        id: uid(),
        cardId: 'marlei',
        dataRetirada: daysAgo(12),
        horaRetirada: '11:30',
        quemRetirou: 'Juliana Costa',
        finalidade: 'Hospedagem em evento',
        observacao: 'Evento corporativo',
        dataDevolucao: daysAgo(10),
        horaDevolucao: '12:00',
        createdAt: new Date().toISOString(),
      },
      {
        id: uid(),
        cardId: 'marlei',
        dataRetirada: daysAgo(9),
        horaRetirada: '07:45',
        quemRetirou: 'Roberto Silva',
        finalidade: 'Despesas com alimentação',
        observacao: '',
        dataDevolucao: '',
        horaDevolucao: '',
        createdAt: new Date().toISOString(),
      },
    ];
    saveHistory(history);

    purchases = [
      {
        id: uid(),
        cardId: 'angela',
        dataCompra: daysAgo(24),
        descricao: 'Papelaria Central',
        categoria: 'Material',
        usuario: 'Carlos Oliveira',
        valor: 152.4,
        numeroParcela: 1,
        totalParcelas: 1,
        observacao: '',
        numeroComprovante: '1001',
        linkComprovante: '',
        arquivoComprovante: '',
        situacao: 'Conferido',
        createdAt: new Date().toISOString(),
      },
      {
        id: uid(),
        cardId: 'angela',
        dataCompra: daysAgo(9),
        descricao: 'Limpeza Total Ltda',
        categoria: 'Serviços',
        usuario: 'Fernanda Lima',
        valor: 380,
        numeroParcela: 1,
        totalParcelas: 1,
        observacao: 'Serviço urgente',
        numeroComprovante: '1002',
        linkComprovante: '',
        arquivoComprovante: '',
        situacao: 'Pendente',
        createdAt: new Date().toISOString(),
      },
      {
        id: uid(),
        cardId: 'marlei',
        dataCompra: daysAgo(19),
        descricao: 'Posto Shell Centro',
        categoria: 'Combustível',
        usuario: 'Roberto Silva',
        valor: 210.75,
        numeroParcela: 1,
        totalParcelas: 1,
        observacao: '',
        numeroComprovante: '2001',
        linkComprovante: '',
        arquivoComprovante: '',
        situacao: 'Conferido',
        createdAt: new Date().toISOString(),
      },
      {
        id: uid(),
        cardId: 'marlei',
        dataCompra: daysAgo(11),
        descricao: 'Hotel Imperial',
        categoria: 'Hospedagem',
        usuario: 'Juliana Costa',
        valor: 640,
        numeroParcela: 1,
        totalParcelas: 2,
        observacao: 'Evento corporativo',
        numeroComprovante: '2002',
        linkComprovante: '',
        arquivoComprovante: '',
        situacao: 'Sem comprovante',
        createdAt: new Date().toISOString(),
      },
    ];
    savePurchases(purchases);
  }
  return { history, purchases };
}
