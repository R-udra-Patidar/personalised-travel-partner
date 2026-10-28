import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { ToastProvider } from '../components/ui';

export default function AppLayout() {
  return (
    <ToastProvider>
      <div className="app-layout">
        <Navbar />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </ToastProvider>
  );
}
