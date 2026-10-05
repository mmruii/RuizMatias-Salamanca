import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../services/products.js';
import { useNotifications } from './Notifications.jsx';

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const { notify } = useNotifications();
  const [loadNotification] = useState(() => notify);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    api
      .getProducts(controller.signal)
      .then((data) => {
        if (!Array.isArray(data))
          throw new Error('El servidor no devolvió una lista de productos.');
        if (!controller.signal.aborted) setProducts(data);
      })
      .catch((failure) => {
        if (!controller.signal.aborted) {
          setError(failure.message);
          loadNotification(failure.message, 'error');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [reloadKey, loadNotification]);

  async function saveProduct(values, id) {
    const saved = id ? await api.updateProduct(id, values) : await api.createProduct(values);
    setProducts((current) =>
      id ? current.map((product) => (product.id === id ? saved : product)) : [...current, saved],
    );
    notify(id ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.');
    return saved;
  }

  async function removeProduct(id) {
    await api.deleteProduct(id);
    setProducts((current) => current.filter((product) => product.id !== id));
    notify('Producto eliminado correctamente.');
  }

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        error,
        retry: () => setReloadKey((current) => current + 1),
        saveProduct,
        removeProduct,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export const useProducts = () => useContext(ProductsContext);
