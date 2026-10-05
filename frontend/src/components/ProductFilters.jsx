import { Search, X } from 'lucide-react';

export default function ProductFilters({ products, search, onSearch, category, onCategory }) {
  const categories = [...new Set(products.map((product) => product.category))].sort(
    (first, second) => first.localeCompare(second, 'es'),
  );
  return (
    <div className="product-filters">
      <div className="search-field">
        <label className="sr-only" htmlFor="product-search">
          Buscar productos
        </label>
        <Search size={19} aria-hidden="true" />
        <input
          id="product-search"
          type="search"
          placeholder="Buscar en la carta…"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
        />
        {search && (
          <button
            className="icon-button"
            type="button"
            onClick={() => onSearch('')}
            title="Limpiar búsqueda"
            aria-label="Limpiar búsqueda"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="category-field">
        <label htmlFor="product-category-filter">Categoría</label>
        <select
          id="product-category-filter"
          value={category}
          onChange={(event) => onCategory(event.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categories.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
