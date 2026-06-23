import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import ConfirmDialog from '../ui/ConfirmDialog';
import PageTransition from '../ui/PageTransition';
import { useApp } from '../../context/AppContext';

export default function AppLayout() {
  const location = useLocation();
  const { confirmState, resolveConfirm } = useApp();

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-area">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <ConfirmDialog
        open={!!confirmState}
        title={confirmState?.title}
        message={confirmState?.message}
        confirmLabel={confirmState?.confirmLabel}
        onConfirm={() => resolveConfirm(true)}
        onCancel={() => resolveConfirm(false)}
      />
    </div>
  );
}
