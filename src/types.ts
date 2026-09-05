export type CardId = string;

export type UserRole =
  | 'MASTER'
  | 'ADMIN'
  | 'USER';

export interface User {
  id: number;
  nome: string;
  usuario: string;
  perfil: UserRole;
  ativo: boolean;
}

export type HistoryStatus =
  | 'Disponível'
  | 'Em uso'
  | 'Devolvido';

export interface CardUsage {
  id: string;
  cardId: CardId;
  dataRetirada: string;
  horaRetirada: string;
  quemRetirou: string;
  finalidade: string;
  observacao: string;
  dataDevolucao: string;
  horaDevolucao: string;
  createdAt: string;
}

export type ConferenceStatus =
  | 'Pendente'
  | 'Conferido'
  | 'Sem comprovante'
  | 'Compra não reconhecida';

export const CATEGORIES = [
  'Alimentação',
  'Combustível',
  'Hospedagem',
  'Manutenção',
  'Material',
  'Serviços',
  'Transporte',
  'Outros',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CONFERENCE_STATUSES: ConferenceStatus[] = [
  'Pendente',
  'Conferido',
  'Sem comprovante',
  'Compra não reconhecida',
];

export interface Purchase {
  id: string;
  cardId: CardId;
  dataCompra: string;
  descricao: string;
  categoria: Category;
  usuario: string;
  valor: number;
  numeroParcela: number;
  totalParcelas: number;
  observacao: string;
  numeroComprovante: string;
  linkComprovante: string;
  arquivoComprovante: string;
  situacao: ConferenceStatus;
  createdAt: string;
}

export interface Cards {
  [key: string]: CardInfo;
}

export interface CardInfo {
  id: CardId;
  responsavel: string;
  conta: string;
}


export const CARDS: Cards = {
  angela: {
    id: 'angela',
    responsavel: 'Ângela',
    conta: '124802273',
  },
  marlei: {
    id: 'marlei',
    responsavel: 'Marlei',
    conta: '127616191',
  },
};

export type Page =
  | 'inicio'
  | 'card-angela'
  | 'card-marlei'
  | 'extrato-angela'
  | 'extrato-marlei'
  | 'relatorios'
  | 'usuarios'
  | 'cards';