import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, Clock3, MapPin, Menu, Phone, X } from 'lucide-react';
import { site } from '../utils/site.js';

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef(null);
  const previousPath = useRef(location.pathname);
  const home = location.pathname === '/';

  useEffect(() => {
    setMenuOpen(false);
    if (previousPath.current !== location.pathname) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      mainRef.current?.focus();
      previousPath.current = location.pathname;
    }
    const titles = {
      '/': 'Inicio',
      '/nosotros': 'Sobre nosotros',
      '/productos': 'Productos',
      '/panel-de-control': 'Panel de control',
      '/api/products': 'Panel de control',
    };
    document.title = `${titles[location.pathname] || 'Página no encontrada'} | Salamanca`;
  }, [location.pathname]);

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <header className={`site-header ${home ? 'header-home' : ''}`}>
        <div className="container header-inner">
          <Link to="/" className="brand" aria-label="Salamanca, inicio">
            <span className="brand-seal" aria-hidden="true">
              S
            </span>
            Salamanca
          </Link>
          <button
            className="icon-button menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
          <nav
            id="main-navigation"
            aria-label="Navegación principal"
            className={menuOpen ? 'navigation is-open' : 'navigation'}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setMenuOpen(false);
            }}
          >
            <NavLink to="/" end>
              Inicio
            </NavLink>
            <NavLink to="/nosotros">Sobre nosotros</NavLink>
            <NavLink to="/productos">Productos</NavLink>
            <a
              className="button button-primary reservation"
              href={site.reservationLink}
              target="_blank"
              rel="noreferrer"
            >
              Reservar <ArrowUpRight size={16} aria-hidden="true" />
              <span className="sr-only"> por WhatsApp, abre otra pestaña</span>
            </a>
          </nav>
        </div>
      </header>
      <main id="contenido" ref={mainRef} tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <Link to="/" className="footer-brand">
              Salamanca
            </Link>
            <p>
              Panadería artesanal y café de especialidad en el corazón de San Martín. Un lugar para
              encontrarnos, todos los días.
            </p>
          </div>
          <div>
            <h2>Contacto</h2>
            <a href={site.mapLink} target="_blank" rel="noreferrer">
              <MapPin size={17} aria-hidden="true" />
              {site.address}
              <span className="sr-only">, abre otra pestaña</span>
            </a>
            <a href={site.phoneLink}>
              <Phone size={17} aria-hidden="true" />
              {site.phone}
            </a>
            <p className="footer-line">
              <Clock3 size={17} aria-hidden="true" />
              {site.hours}
            </p>
          </div>
          <div>
            <h2>Nos encontramos</h2>
            <a href={site.reservationLink} target="_blank" rel="noreferrer">
              Consultar por WhatsApp <ArrowUpRight size={16} aria-hidden="true" />
              <span className="sr-only">, abre otra pestaña</span>
            </a>
            <Link to="/productos">
              Ver nuestra carta <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Salamanca · San Martín, Buenos Aires</span>
        </div>
      </footer>
    </>
  );
}
