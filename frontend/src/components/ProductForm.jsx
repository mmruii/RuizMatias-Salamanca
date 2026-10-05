import { useEffect, useRef, useState } from 'react';
import { LoaderCircle, Save, X } from 'lucide-react';
import FormField from './FormField.jsx';
import { productPayload, validatePhoto, validateProduct } from '../utils/products.js';
import { useNotifications } from './Notifications.jsx';

export default function ProductForm({ product, categories, busy, onSubmit, onCancel }) {
  const [values, setValues] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || '',
    price: product?.price ?? '',
    stock: product?.stock ?? 0,
    imageUrl: product?.imageUrl || '',
    available: product?.available ?? true,
  });
  const [errors, setErrors] = useState({});
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState('');
  const photoRef = useRef(null);
  const formRef = useRef(null);
  const { notify } = useNotifications();

  useEffect(() => {
    if (!photo) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  function selectPhoto(event) {
    const file = event.target.files?.[0];
    const photoError = validatePhoto(file);
    setErrors((current) => ({ ...current, photo: photoError }));
    if (photoError) {
      setPhoto(null);
      notify(photoError, 'error');
      event.target.value = '';
      return;
    }
    setPhoto(file || null);
  }

  function clearPhoto() {
    setPhoto(null);
    setValues((current) => ({ ...current, imageUrl: '' }));
    setErrors((current) => ({ ...current, photo: undefined }));
    photoRef.current.value = '';
  }

  function change(event) {
    const { name, value, type, checked } = event.target;
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function submit(event) {
    event.preventDefault();
    if (busy) return;
    const nextErrors = validateProduct(values);
    const photoError = validatePhoto(photo);
    if (photoError) nextErrors.photo = photoError;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      notify('Revisa los campos marcados antes de guardar.', 'error');
      formRef.current.elements.namedItem(Object.keys(nextErrors)[0])?.focus();
      return;
    }
    onSubmit(productPayload(values), photo);
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
          label="Stock"
          name="stock"
          required
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={values.stock}
          onChange={change}
          error={errors.stock}
        />
        <div className="form-field full-width">
          <label htmlFor="field-photo">Foto del producto</label>
          <input
            id="field-photo"
            name="photo"
            ref={photoRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={selectPhoto}
            aria-invalid={Boolean(errors.photo)}
            aria-describedby={errors.photo ? 'photo-hint photo-error' : 'photo-hint'}
          />
          <small id="photo-hint">
            JPG, PNG o WebP. Máximo 5 MB. Sin foto se usa una imagen de la categoría.
          </small>
          {errors.photo && (
            <small className="field-error" id="photo-error">
              {errors.photo}
            </small>
          )}
          {(preview || values.imageUrl) && (
            <div className="photo-preview">
              <img src={preview || values.imageUrl} alt="Vista previa de la foto del producto" />
              <button className="button button-secondary" type="button" onClick={clearPhoto}>
                <X size={16} aria-hidden="true" />
                Quitar foto
              </button>
            </div>
          )}
        </div>
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
