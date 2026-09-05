import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import type { CardUsage, Purchase } from '@/types';
import { CARDS } from '@/types';
import { daysSince, formatCurrency } from '@/lib/utils';

export interface AlertItem {
  id: string;
  type: 'warning' | 'danger';
  title: string;
  message: string;
}

export function useAlerts(
  history: CardUsage[],
  purchases: Purchase[]
): AlertItem[] {
  const alerts: AlertItem[] = [];

  history.forEach((h) => {
    if (h.dataRetirada && !h.dataDevolucao) {
      const days = daysSince(h.dataRetirada);
      if (days > 7) {
        alerts.push({
          id: `longuse-${h.id}`,
          type: 'warning',
          title: 'Cartão em uso prolongado',
          message: `O cartão de ${CARDS[h.cardId].responsavel} está com ${h.quemRetirou} há ${days} dias.`,
        });
      }
    }
  });

  const semComprovante = purchases.filter((p) => p.situacao === 'Sem comprovante');
  if (semComprovante.length > 0) {
    alerts.push({
      id: 'no-receipt',
      type: 'danger',
      title: 'Compras sem comprovante',
      message: `${semComprovante.length} compra(s) sem comprovante anexado.`,
    });
  }

  const pendentes = purchases.filter((p) => p.situacao === 'Pendente');
  if (pendentes.length > 0) {
    alerts.push({
      id: 'pending',
      type: 'warning',
      title: 'Despesas pendentes de conferência',
      message: `${pendentes.length} despesa(s) aguardando conferência.`,
    });
  }

  const naoReconhecidas = purchases.filter(
    (p) => p.situacao === 'Compra não reconhecida'
  );
  if (naoReconhecidas.length > 0) {
    alerts.push({
      id: 'unrecognized',
      type: 'danger',
      title: 'Divergências no extrato',
      message: `${naoReconhecidas.length} compra(s) não reconhecida(s).`,
    });
  }

  return alerts;
}

interface AlertBannerProps {
  alerts: AlertItem[];
}

export function AlertBanner({ alerts }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const visible = alerts.filter((a) => !dismissed.has(a.id));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {visible.map((alert) => {
        const isDanger = alert.type === 'danger';
        return (
          <div
            key={alert.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-lg border animate-slide-in
              ${isDanger
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
          >
            <AlertTriangle
              className={`w-5 h-5 flex-shrink-0 mt-0.5 animate-pulse-alert
                ${isDanger ? 'text-red-500' : 'text-amber-500'}`}
            />
            <div className="flex-1">
              <p className="text-sm font-semibold">{alert.title}</p>
              <p className="text-sm opacity-90">{alert.message}</p>
            </div>
            <button
              onClick={() =>
                setDismissed((prev) => new Set(prev).add(alert.id))
              }
              className="text-current opacity-50 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function AlertBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white
      text-xs font-bold rounded-full flex items-center justify-center
      animate-pulse-alert">
      {count}
    </span>
  );
}

export function totalUtilizado(purchases: Purchase[]): number {
  return purchases.reduce((sum, p) => sum + (p.valor || 0), 0);
}

export function totalUtilizadoMes(purchases: Purchase[]): number {
  const now = new Date();
  return purchases
    .filter((p) => {
      if (!p.dataCompra) return false;
      const d = new Date(p.dataCompra + 'T00:00:00');
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + (p.valor || 0), 0);
}

export { formatCurrency };
