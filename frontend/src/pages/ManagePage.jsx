import { useState } from 'react';
import { LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import PageHeading from '../components/PageHeading.jsx';
import ProductFilters from '../components/ProductFilters.jsx';
import ContentState from '../components/ContentState.jsx';
import Modal from '../components/Modal.jsx';
import ProductForm from '../components/ProductForm.jsx';
import ProductPhoto from '../components/ProductPhoto.jsx';
import { useProducts } from '../components/ProductsProvider.jsx';
import { useNotifications } from '../components/Notifications.jsx';
import { filterProducts, formatPrice } from '../utils/products.js';

export default function ManagePage() {
  const { products, loading, error, retry, saveProduct, removeProduct } = useProducts();
  const { notify } = useNotifications();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [editor, setEditor] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const filtered = filterProducts(products, search, category);
  const categories = [...new Set(products.map((product) => product.category))];

  async function save(values) {
    setBusy(true);
    try {
      await saveProduct(values, editor.product?.id);
      setEditor(null);
      setSearch('');
      setCategory('');
    } catch (failure) {
      notify(failure.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (busy) return;
    setBusy(true);
    try {
      await removeProduct(toDelete.id);
      setToDelete(null);
      if (category && products.filter((product) => product.category === category).length === 1)
        setCategory('');
    } catch (failure) {
      notify(failure.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section container management">
      <PageHeading
        eyebrow="Administración"
        title="Gestión de productos"
        description="La carta de Salamanca, al día."
        action={
          <button
            className="button button-primary"
            type="button"
            onClick={() => setEditor({ product: null })}
            disabled={loading || Boolean(error)}
          >
            <Plus size={18} aria-hidden="true" />
            Nuevo producto
          </button>
        }
      />
      <div className="management-summary">
        <span>
          <strong>{products.length}</strong> productos en la carta
        </span>
        <span>
          <span className="status-dot" aria-hidden="true" />
          {products.filter((product) => product.available).length} disponibles
        </span>
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
          ? 'Cargando…'
          : error
            ? 'Sin conexión con la carta'
            : `${filtered.length} ${filtered.length === 1 ? 'resultado' : 'resultados'}`}
      </p>
      {loading || error || !filtered.length ? (
        <ContentState
          loading={loading}
          error={error}
          retry={retry}
          title={products.length ? 'No encontramos coincidencias' : 'La carta está vacía'}
          description={
            products.length
              ? 'Prueba con otra búsqueda o categoría.'
              : 'Agrega el primer producto para comenzar.'
          }
        />
      ) : (
        <div className="table-scroll" role="region" aria-label="Lista de productos" tabIndex={0}>
          <table className="products-table">
            <caption className="sr-only">Productos de la carta y acciones de gestión</caption>
            <thead>
              <tr>
                <th scope="col">Producto</th>
                <th scope="col">Categoría</th>
                <th scope="col">Precio</th>
                <th scope="col">Estado</th>
                <th scope="col" className="actions-column">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id}>
                  <th scope="row">
                    <div className="table-product">
                      <ProductPhoto product={product} />
                      <div>
                        <span>{product.name}</span>
                        <small>{product.description}</small>
                      </div>
                    </div>
                  </th>
                  <td>{product.category}</td>
                  <td className="price">{formatPrice(product.price)}</td>
                  <td>
                    <span className={`availability ${product.available ? 'is-available' : ''}`}>
                      {product.available ? 'Disponible' : 'No disponible'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="icon-button"
                        type="button"
                        title={`Editar ${product.name}`}
                        aria-label={`Editar ${product.name}`}
                        onClick={() => setEditor({ product })}
                      >
                        <Pencil size={18} aria-hidden="true" />
                      </button>
                      <button
                        className="icon-button danger-icon"
                        type="button"
                        title={`Eliminar ${product.name}`}
                        aria-label={`Eliminar ${product.name}`}
                        onClick={() => setToDelete(product)}
                      >
                        <Trash2 size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editor && (
        <Modal
          title={editor.product ? 'Editar producto' : 'Nuevo producto'}
          onClose={() => setEditor(null)}
          busy={busy}
          wide
        >
          <ProductForm
            product={editor.product}
            categories={categories}
            busy={busy}
            onSubmit={save}
            onCancel={() => setEditor(null)}
          />
        </Modal>
      )}
      {toDelete && (
        <Modal title="Eliminar producto" onClose={() => setToDelete(null)} busy={busy}>
          <p className="delete-message">
            ¿Eliminar <strong>{toDelete.name}</strong> de la carta? Esta acción no se puede
            deshacer.
          </p>
          <div className="modal-actions">
            <button
              className="button button-secondary"
              type="button"
              disabled={busy}
              onClick={() => setToDelete(null)}
            >
              Cancelar
            </button>
            <button
              className="button button-danger"
              type="button"
              disabled={busy}
              onClick={confirmDelete}
            >
              {busy ? (
                <LoaderCircle className="spin" size={17} aria-hidden="true" />
              ) : (
                <Trash2 size={17} aria-hidden="true" />
              )}
              {busy ? 'Eliminando…' : 'Eliminar producto'}
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
