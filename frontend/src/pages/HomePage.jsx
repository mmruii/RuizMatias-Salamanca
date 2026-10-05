import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Clock3, MapPin } from 'lucide-react';
import cafe from '../assets/cafe.jpg';
import bakery from '../assets/bakery.jpg';
import { site } from '../utils/site.js';
import { useProducts } from '../components/ProductsProvider.jsx';
import ProductCard from '../components/ProductCard.jsx';
import ProductDetail from '../components/ProductDetail.jsx';
import ContentState from '../components/ContentState.jsx';

export default function HomePage() {
  const { products, loading, error, retry } = useProducts();
  const [selected, setSelected] = useState(null);
  const featured = products.filter((product) => product.available).slice(0, 3);
  return (
    <>
      <section className="hero">
        <img className="hero-image" src={cafe} alt="" fetchPriority="high" />
        <div className="hero-content">
          <p className="eyebrow">San Martín, Buenos Aires</p>
          <h1>Salamanca</h1>
          <p className="hero-subtitle">Panadería artesanal · Café de especialidad</p>
          <div className="hero-actions">
            <a
              className="button button-primary"
              href={site.reservationLink}
              target="_blank"
              rel="noreferrer"
            >
              Reservar <ArrowUpRight size={17} aria-hidden="true" />
              <span className="sr-only"> por WhatsApp, abre otra pestaña</span>
            </a>
            <Link className="button button-light" to="/productos">
              Ver menú <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <p className="hero-address">
            <MapPin size={16} aria-hidden="true" />
            Dr. Ramón Carrillo 2100
          </p>
        </div>
        <div className="hero-bottom">
          <span>Hecho a mano. Compartido con vos.</span>
          <span>
            <Clock3 size={15} aria-hidden="true" />
            Todos los días · 8:00 a 00:00
          </span>
        </div>
      </section>
      <section className="section container home-story">
        <div>
          <p className="eyebrow">Un lugar en el barrio</p>
          <h2>
            Horneado a diario,
            <br />
            <em>con amor.</em>
          </h2>
          <p>
            Masa madre, manteca de primera y el tiempo que necesitan. Cada mañana empieza con el
            aroma de nuestras medialunas y un buen café.
          </p>
          <Link className="text-link" to="/nosotros">
            Nuestra historia <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <img src={bakery} loading="lazy" alt="Piezas de panadería artesanal recién horneadas" />
      </section>
      <section className="section menu-preview">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Nuestra carta</p>
              <h2>Recién salidos del horno</h2>
            </div>
            <Link className="text-link" to="/productos">
              Ver todos <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          {loading || error || !featured.length ? (
            <ContentState loading={loading} error={error} retry={retry} />
          ) : (
            <div className="product-grid">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} onSelect={setSelected} />
              ))}
            </div>
          )}
        </div>
      </section>
      {selected && <ProductDetail product={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
