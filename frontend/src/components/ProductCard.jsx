import { ArrowUpRight } from 'lucide-react';
import ProductPhoto from './ProductPhoto.jsx';
import { formatPrice } from '../utils/products.js';

export default function ProductCard({ product, onSelect }) {
  return (
    <article className="product-card">
      <button
        className="product-photo-button"
        type="button"
        onClick={() => onSelect(product)}
        aria-label={`Ver detalle de ${product.name}`}
      >
        <ProductPhoto product={product} />
        {!product.available && <span className="availability photo-badge">No disponible</span>}
        <span className="photo-action" aria-hidden="true">
          <ArrowUpRight size={20} />
        </span>
      </button>
      <div className="product-card-body">
        <p className="product-category">{product.category}</p>
        <div className="product-title-row">
          <h3>
            <button type="button" onClick={() => onSelect(product)}>
              {product.name}
            </button>
          </h3>
          <span className="price">{formatPrice(product.price)}</span>
        </div>
        <p>{product.description}</p>
      </div>
    </article>
  );
}
