import { Link } from 'react-router-dom';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import AdminLoginForm from '../components/AdminLoginForm.jsx';

export default function PanelLoginPage() {
  return (
    <section className="section container panel-login">
      <div className="panel-login-heading">
        <LockKeyhole size={26} aria-hidden="true" />
        <p className="eyebrow">Salamanca · Administración</p>
        <h1>Panel de control</h1>
      </div>
      <AdminLoginForm />
      <Link className="text-link" to="/">
        <ArrowLeft size={17} aria-hidden="true" />
        Volver al sitio
      </Link>
    </section>
  );
}
