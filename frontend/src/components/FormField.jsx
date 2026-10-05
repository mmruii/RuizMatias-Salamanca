export default function FormField({ label, name, error, hint, multiline = false, ...props }) {
  const Control = multiline ? 'textarea' : 'input';
  const descriptionIds = [hint ? `${name}-hint` : '', error ? `${name}-error` : '']
    .filter(Boolean)
    .join(' ');
  return (
    <div className={`form-field ${multiline ? 'full-width' : ''}`}>
      <label htmlFor={`field-${name}`}>
        {label}
        {props.required && <span aria-hidden="true"> *</span>}
      </label>
      <Control
        id={`field-${name}`}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={descriptionIds || undefined}
        {...props}
      />
      {hint && <small id={`${name}-hint`}>{hint}</small>}
      {error && (
        <small className="field-error" id={`${name}-error`}>
          {error}
        </small>
      )}
    </div>
  );
}
