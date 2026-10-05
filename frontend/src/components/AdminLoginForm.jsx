import { useRef, useState } from 'react';
import { Eye, EyeOff, LoaderCircle, LockKeyhole } from 'lucide-react';
import FormField from './FormField.jsx';
import { useAdmin } from './AdminProvider.jsx';
import { useNotifications } from './Notifications.jsx';

export default function AdminLoginForm({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef(null);
  const { login, signingIn } = useAdmin();
  const { notify } = useNotifications();

  async function submit(event) {
    event.preventDefault();
    if (signingIn) return;
    if (!username.trim()) {
      setUsernameError('Ingresa el usuario.');
      notify('Ingresa el usuario.', 'error');
      formRef.current.elements.namedItem('username').focus();
      return;
    }
    if (!password) {
      setError('Ingresa la clave de administrador.');
      notify('Ingresa la clave de administrador.', 'error');
      formRef.current.elements.namedItem('password').focus();
      return;
    }
    try {
      await login(username.trim(), password);
      setPassword('');
      notify('Acceso administrador habilitado.');
      onSuccess?.();
    } catch (failure) {
      setPassword('');
      setError(failure.message);
      notify(failure.message, 'error');
      formRef.current.elements.namedItem('password').focus();
    }
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate>
      <FormField
        label="Usuario"
        name="username"
        required
        autoFocus
        autoComplete="username"
        maxLength={100}
        disabled={signingIn}
        value={username}
        error={usernameError}
        onChange={(event) => {
          setUsername(event.target.value);
          setUsernameError('');
        }}
      />
      <div className="admin-password-field">
        <FormField
          label="Clave de administrador"
          name="password"
          type={visible ? 'text' : 'password'}
          required
          autoComplete="current-password"
          maxLength={256}
          disabled={signingIn}
          value={password}
          error={error}
          onChange={(event) => {
            setPassword(event.target.value);
            setError('');
          }}
        />
        <button
          className="icon-button password-visibility"
          type="button"
          disabled={signingIn}
          aria-label={visible ? 'Ocultar clave' : 'Mostrar clave'}
          title={visible ? 'Ocultar clave' : 'Mostrar clave'}
          aria-controls="field-password"
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      </div>
      <div className="modal-actions">
        <button className="button button-primary" type="submit" disabled={signingIn}>
          {signingIn ? (
            <LoaderCircle className="spin" size={17} aria-hidden="true" />
          ) : (
            <LockKeyhole size={17} aria-hidden="true" />
          )}
          {signingIn ? 'Verificando…' : 'Ingresar'}
        </button>
      </div>
    </form>
  );
}
