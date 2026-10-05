import { ArrowUpRight, Clock3, Heart, CalendarDays } from 'lucide-react';
import cafe from '../assets/cafe.jpg';
import { site } from '../utils/site.js';

export default function AboutPage() {
  return (
    <>
      <section className="container about-section">
        <div className="about-copy">
          <p className="eyebrow">Sobre nosotros</p>
          <h1>
            Horneado a diario,
            <br />
            <em>con amor.</em>
          </h1>
          <p>
            En Salamanca creemos que el desayuno merece lo mejor. Cada mañana horneamos nuestras
            medialunas y croissants con masa madre, manteca de primera y el tiempo que necesitan:
            sin apuros, sin atajos.
          </p>
          <p>
            Abrimos los 7 días de 8:00 a 00:00 para que siempre encuentres tu lugar: el café del
            mediodía, la merienda con los chicos o la copa de vino de los viernes. El barrio de San
            Martín es nuestro hogar, y cada cliente que entra se convierte en parte de él.
          </p>
          <ul className="about-facts">
            <li>
              <Clock3 size={17} aria-hidden="true" />
              8:00 a 00:00
            </li>
            <li>
              <CalendarDays size={17} aria-hidden="true" />7 días a la semana
            </li>
            <li>
              <Heart size={17} aria-hidden="true" />
              Producción artesanal
            </li>
          </ul>
          <a className="button button-primary" href={site.mapLink} target="_blank" rel="noreferrer">
            Cómo llegar <ArrowUpRight size={17} aria-hidden="true" />
            <span className="sr-only">, abre otra pestaña</span>
          </a>
        </div>
        <img
          className="about-image"
          src={cafe}
          alt="Interior de una cafetería con mesas y luz natural, imagen ilustrativa"
        />
      </section>
      <section className="visit-band">
        <div className="container">
          <div>
            <p className="eyebrow">Te esperamos</p>
            <h2>Tu próxima pausa, en Salamanca.</h2>
          </div>
          <p>
            {site.address}
            <br />
            {site.hours}
          </p>
        </div>
      </section>
    </>
  );
}
