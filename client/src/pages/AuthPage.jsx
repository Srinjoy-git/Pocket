import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { fastTransition } from '../components/ui/motion';

export default function AuthPage() {
  const { login, register } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ name: '', username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (mode === 'signin') await login(form.username, form.password);
      else await register(form.name, form.username, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
    setError('');
  };

  return (
    <div className="auth-shell">
      <motion.div
        className="auth-hero"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="auth-hero-inner">
          <div className="brand-mark light">
            <span className="brand-icon">₹</span>
            <div>
              <strong>POCKET</strong>
              <small>SIMPLE. SMART. YOURS.</small>
            </div>
          </div>
          <h1>
            Track every rupee.
            <br />
            Trust your money.
          </h1>
          <p>
            A premium personal finance space for students, hostelers, and anyone who lends a hand — and wants it back.
          </p>
          <small className="auth-copy">© POCKET 2026</small>
        </div>
      </motion.div>

      <motion.div
        className="auth-panel"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1], delay: 0.05 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={fastTransition}
          >
            <h2>{mode === 'signin' ? 'Welcome back' : 'Create account'}</h2>
            <p className="auth-sub">
              {mode === 'signin' ? 'Sign in to continue tracking' : 'Set up your private wallet in seconds'}
            </p>

            <form className="auth-form" onSubmit={submit}>
              {mode === 'signup' && (
                <label>
                  Name
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name"
                    required
                    autoComplete="name"
                  />
                </label>
              )}
              <label>
                Username
                <input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="yourname"
                  required
                  autoComplete="username"
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                />
              </label>
              {error && <p className="form-error">{error}</p>}
              <motion.button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={submitting}
                whileHover={{ scale: submitting ? 1 : 1.02 }}
                whileTap={{ scale: submitting ? 1 : 0.97 }}
              >
                {submitting ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
              </motion.button>
            </form>

            <p className="auth-switch">
              {mode === 'signin' ? 'New here?' : 'Already have an account?'}{' '}
              <button type="button" onClick={switchMode}>
                {mode === 'signin' ? 'Create an account' : 'Sign in'}
              </button>
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
