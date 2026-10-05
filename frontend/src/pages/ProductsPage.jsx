import { useState } from 'react';
import PageHeading from '../components/PageHeading.jsx';
import ProductCard from '../components/ProductCard.jsx';
import ProductDetail from '../components/ProductDetail.jsx';
import ProductFilters from '../components/ProductFilters.jsx';
import ContentState from '../components/ContentState.jsx';
import { useProducts } from '../components/ProductsProvider.jsx';
import { filterProducts } from '../utils/products.js';
import cafe from '../assets/cafe.jpg';

export default function ProductsPage() {
  const { products, loading, error, retry } = useProducts();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState(null);
  const filtered = filterProducts(products, search, category);

  return (
    <section className="section container catalog">
      <PageHeading
        eyebrow="Nuestros productos"
        title="Recién salidos del horno"
        description="Algo rico para cada momento del día."
      />
      <div className="catalog-intro">
        <img src={cafe} alt="Mesas de una cafetería, imagen ilustrativa" />
        <div>
          <p className="eyebrow">El ritual de todos los días</p>
          <h2>
            Un buen café.
            <br />
            Algo recién horneado.
          </h2>
          <p>La combinación que siempre invita a quedarse un rato más.</p>
        </div>
      </div>
      <ProductFilters
        products={products}
        search={search}
        onSearch={setSearch}
        category={category}
        onCategory={setCategory}
      />
      <p className="results-count" role="status">
        {loading
          ? 'Consultando la carta…'
          : error
            ? 'Carta no disponible'
            : `${filtered.length} ${filtered.length === 1 ? 'producto' : 'productos'}`}
      </p>
      {loading || error || !filtered.length ? (
        <ContentState
          loading={loading}
          error={error}
          retry={retry}
          title={products.length ? 'No encontramos coincidencias' : undefined}
          description={products.length ? 'Prueba con otro nombre o categoría.' : undefined}
        />
      ) : (
        <div className="product-grid">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={setSelected} />
          ))}
        </div>
      )}
      {selected && <ProductDetail product={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
