import { useState, useMemo } from 'react';
import { Menu, Bell } from 'lucide-react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/pages/Dashboard';
import { CardControl } from '@/pages/CardControl';
import { Statement } from '@/pages/Statement';
import { Reports } from '@/pages/Reports';
import { AlertBanner, useAlerts } from '@/components/Alerts';
import type { Page } from '@/types';

function AppContent() {
  const [page, setPage] = useState<Page>('inicio');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { history, purchases } = useApp();
  const alerts = useAlerts(history, purchases);

  const renderPage = () => {
    switch (page) {
      case 'inicio':
        return <Dashboard />;
      case 'card-angela':
        return <CardControl cardId="angela" />;
      case 'card-marlei':
        return <CardControl cardId="marlei" />;
      case 'extrato-angela':
        return <Statement cardId="angela" />;
      case 'extrato-marlei':
        return <Statement cardId="marlei" />;
      case 'relatorios':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  const pageTitle = useMemo(() => {
    const titles: Record<Page, string> = {
      'inicio': 'Início',
      'card-angela': 'Ângela',
      'card-marlei': 'Marlei',
      'extrato-angela': 'Extrato Ângela',
      'extrato-marlei': 'Extrato Marlei',
      'relatorios': 'Relatórios',
    };
    return titles[page];
  }, [page]);

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar
        current={page}
        onNavigate={setPage}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="lg:ml-72 min-h-screen flex flex-col">
        {/* Top bar */}
        <header
          className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200
            px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-600 hover:text-slate-800"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-sm font-semibold text-slate-700">
              {pageTitle}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors relative">
                <Bell className="w-5 h-5" />
                {alerts.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-alert">
                    {alerts.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-4">
          {page === 'inicio' && <AlertBanner alerts={alerts} />}
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
