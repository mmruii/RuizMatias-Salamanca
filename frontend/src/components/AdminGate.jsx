import { LoaderCircle } from 'lucide-react';
import { useAdmin } from './AdminProvider.jsx';
import PanelLoginPage from '../pages/PanelLoginPage.jsx';

export default function AdminGate({ children }) {
  const { authenticated, checking } = useAdmin();
  if (checking)
    return (
      <div className="content-state" role="status">
        <LoaderCircle className="spin" size={28} aria-hidden="true" />
        <p>Verificando acceso…</p>
      </div>
    );
  return authenticated ? children : <PanelLoginPage />;
}
