import Modal from './Modal.jsx';
import ProductPhoto from './ProductPhoto.jsx';
import { formatPrice } from '../utils/products.js';

export default function ProductDetail({ product, onClose }) {
  return (
    <Modal title={product.name} onClose={onClose}>
      <ProductPhoto product={product} className="detail-photo" />
      <div className="detail-meta">
        <span className="product-category">{product.category}</span>
        <strong className="price">{formatPrice(product.price)}</strong>
      </div>
      <p className="detail-description">{product.description}</p>
      <p className={`availability ${product.available ? 'is-available' : ''}`}>
        {product.available ? 'Disponible' : 'No disponible por el momento'}
      </p>
      <div className="modal-actions">
        <button className="button button-secondary" type="button" onClick={onClose}>
          Volver a la carta
        </button>
      </div>
    </Modal>
  );
}
