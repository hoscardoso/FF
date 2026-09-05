import {
  LayoutDashboard,
  CreditCard,
  FileText,
  BarChart3,
  X,
} from 'lucide-react';
import type { Page, CardId } from '@/types';
import { CARDS } from '@/types';

interface SidebarProps {
  current: Page;
  onNavigate: (page: Page) => void;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ current, onNavigate, open, onClose }: SidebarProps) {
  const items: {
    id: Page;
    label: string;
    sublabel?: string;
    icon: typeof LayoutDashboard;
  }[] = [
    { id: 'inicio', label: 'Início', icon: LayoutDashboard },
    {
      id: 'card-angela',
      label: CARDS.angela.responsavel,
      sublabel: `Conta ${CARDS.angela.conta}`,
      icon: CreditCard,
    },
    {
      id: 'card-marlei',
      label: CARDS.marlei.responsavel,
      sublabel: `Conta ${CARDS.marlei.conta}`,
      icon: CreditCard,
    },
    {
      id: 'extrato-angela',
      label: `Extrato ${CARDS.angela.responsavel}`,
      sublabel: `Conta ${CARDS.angela.conta}`,
      icon: FileText,
    },
    {
      id: 'extrato-marlei',
      label: `Extrato ${CARDS.marlei.responsavel}`,
      sublabel: `Conta ${CARDS.marlei.conta}`,
      icon: FileText,
    },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-200 z-40
          flex flex-col transition-transform duration-300 lg:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-800 rounded-lg flex items-center justify-center shadow-md">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 leading-tight">
                Cartões
              </h1>
              <p className="text-xs text-slate-500">Corporativos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`nav-item w-full text-left ${active ? 'nav-item-active' : ''}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="truncate">{item.label}</div>
                  {item.sublabel && (
                    <div
                      className={`text-xs truncate ${
                        active ? 'text-blue-200' : 'text-slate-400'
                      }`}
                    >
                      {item.sublabel}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200">
          <p className="text-xs text-slate-400">
            Sistema de Controle
          </p>
          <p className="text-xs text-slate-400">v1.0 · 2026</p>
        </div>
      </aside>
    </>
  );
}

export function cardIdFromPage(page: Page): CardId | null {
  if (page === 'card-angela' || page === 'extrato-angela') return 'angela';
  if (page === 'card-marlei' || page === 'extrato-marlei') return 'marlei';
  return null;
}
