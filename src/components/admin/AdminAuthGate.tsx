import { signInWithPopup } from 'firebase/auth';
import { KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, googleProvider } from '../../firebase';

export interface ServerSessionState {
  authenticated: boolean;
  username?: string;
  authMethod?: 'password' | 'google';
  mustChangePassword?: boolean;
  passwordConfigured?: boolean;
}

interface AdminAuthGateProps {
  session: ServerSessionState;
  onSessionChange: (next: ServerSessionState) => void;
}

export function AdminAuthGate({ session, onSessionChange }: AdminAuthGateProps) {
  const [username, setUsername] = useState('borhan');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = (await res.json()) as ServerSessionState & { error?: string };
      if (!res.ok) {
        setError(data.error || 'Login failed.');
        return;
      }
      setPassword('');
      onSessionChange({
        authenticated: true,
        username: data.username,
        authMethod: data.authMethod,
        mustChangePassword: data.mustChangePassword,
        passwordConfigured: true,
      });
    } catch {
      setError('Unable to reach authentication server.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOwnerLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const idToken = await cred.user.getIdToken();
      const res = await fetch('/api/admin/google-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idToken }),
      });
      if (res.status === 404 || res.status === 405) {
        if (cred.user.emailVerified && cred.user.email === 'mdborhprodhan@gmail.com') {
          onSessionChange({
            authenticated: true,
            username: 'borhan',
            authMethod: 'google',
            mustChangePassword: false,
            passwordConfigured: false,
          });
          return;
        }
        setError('Access denied. Verified owner Google account required.');
        return;
      }
      const data = (await res.json()) as ServerSessionState & { error?: string };
      if (!res.ok) {
        setError(data.error || 'Google owner verification failed.');
        return;
      }
      onSessionChange({
        authenticated: true,
        username: data.username,
        authMethod: 'google',
        mustChangePassword: data.mustChangePassword,
        passwordConfigured: session.passwordConfigured,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google Sign-In cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForcePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 10) {
      setError('New password must be at least 10 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error || 'Could not update password.');
        return;
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onSessionChange({
        ...session,
        mustChangePassword: false,
        passwordConfigured: true,
      });
    } catch {
      setError('Network error updating password.');
    } finally {
      setLoading(false);
    }
  };

  // Mandatory first-login password change gate
  if (session.authenticated && session.mustChangePassword) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080B14] px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#111827] p-8">
          <div className="flex items-center gap-3 text-[#38BDF8]">
            <KeyRound className="h-5 w-5" />
            <span className="text-xs font-medium uppercase tracking-wider">Security Requirement</span>
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold text-[#F8FAFC]">
            Change Initial Password
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            For account security, you must set a new personal password (minimum 10 characters) before accessing the admin dashboard.
          </p>

          <form onSubmit={handleForcePasswordChange} className="mt-6 space-y-4">
            {session.authMethod === 'password' && (
              <div>
                <label className="block text-xs font-medium text-slate-300">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:border-[#38BDF8] focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300">New Password</label>
              <input
                type="password"
                required
                minLength={10}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 10 characters"
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:border-[#38BDF8] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={10}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:border-[#38BDF8] focus:outline-none"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-950/40 px-3.5 py-2.5 text-xs text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] rounded-lg bg-[#7C3AED] px-4 py-2.5 text-sm font-semibold text-[#F8FAFC] hover:bg-[#6D28D9] disabled:opacity-60"
            >
              {loading ? 'Updating...' : 'Save Password & Enter Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080B14] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#111827] p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#38BDF8]">
            <Lock className="h-4 w-4" />
            <span className="text-xs font-medium">Protected Admin Route</span>
          </div>
          <Link to="/" className="text-xs text-slate-400 hover:text-slate-200">
            Back to Portfolio
          </Link>
        </div>

        <h1 className="mt-4 font-display text-2xl font-bold text-[#F8FAFC]">
          Admin Dashboard Sign In
        </h1>
        <p className="mt-1.5 text-sm text-slate-400">
          MD. Borhan Prodhan Portfolio Management
        </p>

        <form onSubmit={handlePasswordLogin} className="mt-6 space-y-4">
          <div>
            <label htmlFor="admin-user" className="block text-xs font-medium text-slate-300">
              Username
            </label>
            <input
              id="admin-user"
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:border-[#38BDF8] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="admin-pass" className="block text-xs font-medium text-slate-300">
              Password
            </label>
            <input
              id="admin-pass"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                session.passwordConfigured === false
                  ? 'Set ADMIN_INITIAL_PASSWORD or use Google Sign-In below'
                  : 'Enter password'
              }
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:border-[#38BDF8] focus:outline-none"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-500/40 bg-red-950/40 px-3.5 py-2.5 text-xs text-red-200"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] rounded-lg bg-[#7C3AED] px-4 py-2.5 text-sm font-semibold text-[#F8FAFC] transition-colors hover:bg-[#6D28D9] disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In with Password'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-slate-500">
          <div className="h-px flex-1 bg-slate-800" />
          <span>or</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <button
          type="button"
          onClick={handleGoogleOwnerLogin}
          disabled={loading}
          className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-lg border border-slate-700 bg-[#080B14] px-4 py-2.5 text-sm font-medium text-[#F8FAFC] transition-colors hover:border-[#38BDF8]/60 hover:bg-slate-900 disabled:opacity-60"
        >
          <ShieldCheck className="h-4 w-4 text-[#38BDF8]" />
          <span>Sign In with Owner Google Account</span>
        </button>

        {session.passwordConfigured === false && (
          <p className="mt-4 text-xs leading-relaxed text-slate-400">
            Note: <code className="font-mono-tech text-slate-300">ADMIN_INITIAL_PASSWORD</code> is not set in server environment secrets yet. You can sign in using your verified Google account (<code className="font-mono-tech text-slate-300">mdborhprodhan@gmail.com</code>) and set a local password inside the Security tab.
          </p>
        )}
      </div>
    </div>
  );
}
