import { Component, type ErrorInfo, type ReactNode } from 'react';
import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminPage } from './pages/AdminPage';
import { HomePage } from './pages/HomePage';

interface ErrorBoundaryState {
  hasError: boolean;
}

class AppErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#080B14] px-6 text-center text-[#F8FAFC]">
          <h1 className="font-display text-2xl font-bold">MD. Borhan Prodhan</h1>
          <p className="mt-2 text-sm text-slate-400">
            Something went wrong loading this view. Please reload the page.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-[#7C3AED] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#6D28D9]"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function shouldUseHashRouter(): boolean {
  if (typeof window === 'undefined') return false;
  const { hostname, protocol, pathname, hash } = window.location;
  if (hostname.endsWith('github.io') || protocol === 'file:' || hash.startsWith('#/')) {
    return true;
  }
  return pathname !== '/' && pathname !== '/admin' && pathname !== '/admin/';
}

export default function App() {
  const Router = shouldUseHashRouter() ? HashRouter : BrowserRouter;

  return (
    <AppErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppErrorBoundary>
  );
}
