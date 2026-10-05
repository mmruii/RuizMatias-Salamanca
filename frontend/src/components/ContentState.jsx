import { CircleAlert, Coffee, LoaderCircle, RotateCw } from 'lucide-react';

export default function ContentState({
  loading,
  error,
  retry,
  title = 'Todavía no hay productos',
  description = 'Nuestra carta estará disponible pronto.',
}) {
  if (loading)
    return (
      <div className="content-state" role="status">
        <LoaderCircle className="spin" size={28} aria-hidden="true" />
        <p>Cargando productos…</p>
        <div className="skeleton-lines" aria-hidden="true">
          <span />
          <span />
        </div>
      </div>
    );
  if (error)
    return (
      <div className="content-state">
        <CircleAlert size={30} aria-hidden="true" />
        <h2>No pudimos cargar la carta</h2>
        <p>{error}</p>
        <button type="button" className="button button-secondary" onClick={retry}>
          <RotateCw size={16} aria-hidden="true" />
          Reintentar
        </button>
      </div>
    );
  return (
    <div className="content-state">
      <Coffee size={30} aria-hidden="true" />
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
