import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

// One validation rule per field; each returns an error message or ''
const rules = {
  name: (v) => (v.trim().length < 2 ? 'Enter your full name.' : ''),
  email: (v) => (/^\S+@\S+\.\S+$/.test(v.trim()) ? '' : 'Enter a valid email address.'),
  password: (v) => (v.length < 6 ? 'Use at least 6 characters.' : ''),
  confirm: (v, all) => (v !== all.password ? 'Passwords do not match.' : ''),
};
const labels = { name: 'Full name', email: 'Email', password: 'Password', confirm: 'Confirm password' };

export default function Login() {
  const { user, login, register, guest } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const from = useLocation().state?.from?.pathname || '/';

  const [mode, setMode] = useState('login');
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const fields = mode === 'login' ? ['email', 'password'] : ['name', 'email', 'password', 'confirm'];

  const check = (field, all = values) => rules[field](all[field], all);

  // Controlled inputs: re-check a field while typing only after it has shown an error
  const onChange = ({ target: { name, value } }) => {
    const next = { ...values, [name]: value };
    setValues(next);
    if (errors[name]) setErrors({ ...errors, [name]: check(name, next) });
  };
  const onBlur = ({ target: { name } }) => setErrors({ ...errors, [name]: check(name) });

  const switchMode = (next) => { setMode(next); setErrors({}); };

  const onSubmit = (e) => {
    e.preventDefault();
    const found = Object.fromEntries(fields.map((f) => [f, check(f)]));
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;

    const email = values.email.trim().toLowerCase();
    const problem = mode === 'login'
      ? login({ email, password: values.password })
      : register({ name: values.name.trim(), email, password: values.password });
    if (problem) return setErrors({ form: problem });
    addToast(mode === 'login' ? 'Welcome back!' : 'Account created.', 'success');
    navigate(from, { replace: true });
  };

  const onGuest = () => { guest(); navigate(from, { replace: true }); };

  if (user) return <Navigate to="/" replace />;

  return (
    <main className="auth-wrapper">
      <form className="card auth-card" onSubmit={onSubmit} noValidate>
        <h1>{mode === 'login' ? 'Sign in' : 'Create your account'}</h1>
        <p className="muted">Your account and scores are saved on this device only.</p>

        {fields.map((f) => (
          <FormInput
            key={f}
            name={f}
            label={labels[f]}
            type={f === 'email' ? 'email' : f === 'name' ? 'text' : 'password'}
            value={values[f]}
            error={errors[f]}
            onChange={onChange}
            onBlur={onBlur}
          />
        ))}
        {errors.form && <div className="form-error" role="alert">{errors.form}</div>}

        <button type="submit" className="btn btn-primary">{mode === 'login' ? 'Sign in' : 'Create account'}</button>
        <button type="button" className="btn btn-outline" onClick={onGuest}>Continue as guest</button>
        <p className="muted">
          {mode === 'login' ? 'New here? ' : 'Already registered? '}
          <button type="button" className="link-btn" onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </form>
    </main>
  );
}
