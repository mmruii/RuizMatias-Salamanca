import { useState } from 'react';
import bakery from '../assets/bakery.jpg';
import coffee from '../assets/coffee.jpg';
import { normalizeText } from '../utils/products.js';

export default function ProductPhoto({ product, className = '' }) {
  const [failedUrl, setFailedUrl] = useState('');
  const isCoffee = normalizeText(product.category).includes('cafe');
  const hasImage = product.imageUrl && failedUrl !== product.imageUrl;
  return (
    <img
      className={`product-photo ${className}`}
      src={hasImage ? product.imageUrl : isCoffee ? coffee : bakery}
      alt={
        hasImage
          ? product.name
          : isCoffee
            ? 'Café de especialidad, imagen ilustrativa'
            : 'Panadería artesanal, imagen ilustrativa'
      }
      loading="lazy"
      onError={() => setFailedUrl(product.imageUrl)}
    />
  );
}
