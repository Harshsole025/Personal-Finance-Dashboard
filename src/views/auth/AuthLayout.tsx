import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { localStorageAdapter } from '../../storage/localStorageAdapter';
import type { AuthState } from '../../types';
import { ThemeToggle } from '../../components/ThemeToggle';

export function AuthLayout() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (mode === 'signup') {
      if (password.length < 6) {
        alert('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirm) {
        alert('Passwords do not match.');
        return;
      }
    } else {
      if (password.length === 0) {
        alert('Please enter your password.');
        return;
      }
    }
    const userId = email.toLowerCase();
    const next: AuthState = { user: { id: userId, email } };
    localStorageAdapter.setAuth(next);
    navigate('/app');
  }

  return (
    <div className="min-h-dvh grid place-items-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm card p-6 space-y-4">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold header-link">Personal Finance</h1>
          <p className="text-sm muted">{mode === 'login' ? 'Sign in to continue' : 'Create your account'}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setMode('login')} className={`btn-outline ${mode === 'login' ? 'ring-2 ring-zinc-400 dark:ring-zinc-600' : ''}`}>Log in</button>
          <button onClick={() => setMode('signup')} className={`btn-outline ${mode === 'signup' ? 'ring-2 ring-zinc-400 dark:ring-zinc-600' : ''}`}>Sign up</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {mode === 'login' && (
            <div>
              <label className="block text-sm font-medium">Password</label>
              <input className="input" type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          )}
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-sm font-medium">Password</label>
                <input className="input" type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} required={mode === 'signup'} />
              </div>
              <div>
                <label className="block text-sm font-medium">Confirm password</label>
                <input className="input" type="password" placeholder="••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} required={mode === 'signup'} />
              </div>
            </>
          )}
          <button type="submit" className="w-full btn-primary">
            {mode === 'login' ? 'Continue' : 'Create account'}
          </button>
          <div className="text-center text-xs muted">
            {mode === 'login' ? (
              <span>Don’t have an account? <button type="button" className="underline header-link" onClick={() => setMode('signup')}>Sign up</button></span>
            ) : (
              <span>Already have an account? <button type="button" className="underline header-link" onClick={() => setMode('login')}>Log in</button></span>
            )}
          </div>
        </form>
        <div className="pt-2 text-center text-xs text-zinc-500">
          Tip: Use any email to sign in.
        </div>
      </div>
    </div>
  );
}

