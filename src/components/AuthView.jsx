import { useState } from 'react';
import { postJson } from '../api';
import '../css/AuthView.css';

function VisibilityButton({ visible, onClick, label }) {
  return (
    <button
      className="password-visibility"
      type="button"
      onClick={onClick}
      aria-label={`${visible ? 'Hide' : 'Show'} ${label}`}
      aria-pressed={visible}
    >
      {visible ? (
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.2A10.7 10.7 0 0112 5c5.5 0 9 7 9 7a15 15 0 01-3.1 3.7M6.2 6.2C3.9 7.8 3 12 3 12s3.5 7 9 7a9.8 9.8 0 004-.8" /></svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7z" /><circle cx="12" cy="12" r="3" /></svg>
      )}
    </button>
  );
}

export default function AuthView({ onAuthenticated, message }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const registering = mode === 'register';

  function changeMode(nextMode) {
    setMode(nextMode);
    setPassword('');
    setConfirmPassword('');
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (registering && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      const session = await postJson(
        registering ? '/auth/registeruser' : '/auth/loginuser',
        { username, password },
      );
      await onAuthenticated(session);
    } catch (authError) {
      setError(authError.message || `Unable to ${registering ? 'register' : 'sign in'}.`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-brand"><span aria-hidden="true">DM</span><p>Deeniyat Maktab Portal</p></div>
        <h1 id="auth-title">{registering ? 'Create your account' : 'Welcome back'}</h1>
        <p className="auth-description">
          {registering
            ? 'Register to create an account and access the maktab portal.'
            : 'Sign in to manage the maktab portal.'}
        </p>
        {message && <div className="alert alert-error" role="status">{message}</div>}
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <form className="auth-form" onSubmit={submit}>
          <label htmlFor="auth-username">Username</label>
          <input
            id="auth-username"
            autoComplete={registering ? 'username' : 'username'}
            minLength={registering ? 3 : undefined}
            maxLength={registering ? 32 : undefined}
            pattern={registering ? '[A-Za-z0-9._-]+' : undefined}
            title={registering ? 'Use 3–32 letters, numbers, dots, underscores, or hyphens.' : undefined}
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <label htmlFor="auth-password">Password</label>
          <div className="password-input-wrap">
            <input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={registering ? 'new-password' : 'current-password'}
              minLength={registering ? 8 : undefined}
              maxLength={registering ? 72 : undefined}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <VisibilityButton
              visible={showPassword}
              onClick={() => setShowPassword(!showPassword)}
              label="password"
            />
          </div>
          {registering && (
            <>
              <label htmlFor="auth-confirm-password">Confirm password</label>
              <div className="password-input-wrap">
                <input
                  id="auth-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  minLength="8"
                  maxLength="72"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
                <VisibilityButton
                  visible={showConfirmPassword}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  label="password confirmation"
                />
              </div>
            </>
          )}
          <button className="button button-primary" disabled={busy}>
            {busy
              ? (registering ? 'Creating account…' : 'Signing in…')
              : (registering ? 'Create account' : 'Sign in')}
          </button>
        </form>
        <p className="auth-footnote">
          {registering ? 'Already have an account? ' : 'New to the portal? '}
          <button
            className="auth-mode-toggle"
            type="button"
            onClick={() => changeMode(registering ? 'login' : '')}
          >
            {registering ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </section>
    </main>
  );
}
