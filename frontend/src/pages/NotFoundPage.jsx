import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <section className="section container not-found">
      <p className="eyebrow">Página no encontrada</p>
      <h1>Por acá no es.</h1>
      <p>La página que buscas no está disponible.</p>
      <Link to="/" className="button button-secondary">
        <ArrowLeft size={17} aria-hidden="true" />
        Volver al inicio
      </Link>
    </section>
  );
}
