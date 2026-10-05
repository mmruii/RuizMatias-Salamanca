import { useRef, useState } from 'react';
import { LoaderCircle, Save } from 'lucide-react';
import FormField from './FormField.jsx';
import { productPayload, validateProduct } from '../utils/products.js';
import { useNotifications } from './Notifications.jsx';

export default function ProductForm({ product, categories, busy, onSubmit, onCancel }) {
  const [values, setValues] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || '',
    price: product?.price ?? '',
    imageUrl: product?.imageUrl || '',
    available: product?.available ?? true,
  });
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);
  const { notify } = useNotifications();

  function change(event) {
    const { name, value, type, checked } = event.target;
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function submit(event) {
    event.preventDefault();
    if (busy) return;
    const nextErrors = validateProduct(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      notify('Revisa los campos marcados antes de guardar.', 'error');
      formRef.current.elements.namedItem(Object.keys(nextErrors)[0])?.focus();
      return;
    }
    onSubmit(productPayload(values));
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate>
      <p className="form-note">Los campos con * son obligatorios.</p>
      <fieldset disabled={busy} className="form-grid">
        <legend className="sr-only">Datos del producto</legend>
        <FormField
          label="Nombre"
          name="name"
          required
          autoFocus
          value={values.name}
          onChange={change}
          error={errors.name}
        />
        <FormField
          label="Categoría"
          name="category"
          required
          list="product-categories"
          value={values.category}
          onChange={change}
          error={errors.category}
        />
        <datalist id="product-categories">
          {categories.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
        <FormField
          label="Descripción"
          name="description"
          required
          multiline
          rows={3}
          value={values.description}
          onChange={change}
          error={errors.description}
        />
        <FormField
          label="Precio (ARS)"
          name="price"
          required
          type="number"
          min="0.01"
          step="any"
          inputMode="decimal"
          value={values.price}
          onChange={change}
          error={errors.price}
        />
        <FormField
          label="URL de imagen"
          name="imageUrl"
          type="url"
          value={values.imageUrl}
          onChange={change}
          error={errors.imageUrl}
          hint="Opcional. Si se omite, se usa una imagen de la categoría."
        />
        <label className="checkbox-field">
          <input type="checkbox" name="available" checked={values.available} onChange={change} />
          Disponible en la carta
        </label>
      </fieldset>
      <div className="modal-actions">
        <button
          className="button button-secondary"
          type="button"
          disabled={busy}
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button className="button button-primary" type="submit" disabled={busy}>
          {busy ? (
            <LoaderCircle size={17} className="spin" aria-hidden="true" />
          ) : (
            <Save size={17} aria-hidden="true" />
          )}
          {busy ? 'Guardando…' : 'Guardar producto'}
        </button>
      </div>
    </form>
  );
}
