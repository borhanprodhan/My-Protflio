import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import {
  Database,
  ExternalLink,
  FileText,
  FolderKanban,
  Globe,
  Image as ImageIcon,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Layers,
  LogOut,
  Search,
  ShieldCheck,
  Sliders,
  User as UserIcon,
  Wrench,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminAuthGate, type ServerSessionState } from '../components/admin/AdminAuthGate';
import {
  LanguagesAndSocialsManager,
  MediaManager,
  ProjectsManager,
  ServicesManager,
  SkillsManager,
} from '../components/admin/AdminCollectionTabs';
import { AdminContentTab } from '../components/admin/AdminContentTab';
import { AdminMessagesTab } from '../components/admin/AdminMessagesTab';
import { auth, db, googleProvider } from '../firebase';
import { seedDefaultPortfolioToFirestore, usePortfolioData } from '../hooks/usePortfolioData';
import type { ContactMessage, MediaItem } from '../types/portfolio';

type AdminTab =
  | 'overview'
  | 'personal'
  | 'about'
  | 'services'
  | 'skills'
  | 'projects'
  | 'languages-social'
  | 'media'
  | 'messages'
  | 'seo'
  | 'sections'
  | 'security';

const NAV_ITEMS: Array<{ id: AdminTab; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'messages', label: 'Messages', icon: Inbox },
  { id: 'personal', label: 'Personal & Hero', icon: UserIcon },
  { id: 'about', label: 'About & CV', icon: FileText },
  { id: 'services', label: 'Services', icon: Wrench },
  { id: 'skills', label: 'Skills', icon: Layers },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'languages-social', label: 'Languages & Social', icon: Globe },
  { id: 'media', label: 'Media Library', icon: ImageIcon },
  { id: 'seo', label: 'SEO Metadata', icon: Search },
  { id: 'sections', label: 'Section Visibility', icon: Sliders },
  { id: 'security', label: 'Security & Password', icon: KeyRound },
];

export function AdminPage() {
  const [session, setSession] = useState<ServerSessionState | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [seedNote, setSeedNote] = useState('');

  // Password change state for Security tab
  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');

  const { siteContent, services, skills, projects, languages, socialLinks, hasRemoteData } =
    usePortfolioData(true);

  useEffect(() => {
    document.title = 'Admin Dashboard — MD. Borhan Prodhan';
    fetch('/api/admin/session', { credentials: 'include' })
      .then((r) => r.json())
      .then((data: ServerSessionState) => setSession(data))
      .catch(() => setSession({ authenticated: false }));

    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
    });
    return () => unsub();
  }, []);

  const firestoreReady =
    Boolean(firebaseUser?.emailVerified) &&
    firebaseUser?.email === 'mdborhprodhan@gmail.com';

  // Subscribe to protected collections only when Firebase Admin Google Auth is ready
  useEffect(() => {
    if (!session?.authenticated || session.mustChangePassword || !firestoreReady) return;

    const unsubMsgs = onSnapshot(
      query(collection(db, 'contact_messages'), orderBy('submittedAt', 'desc')),
      (snap) => {
        setMessages(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<ContactMessage, 'id'>),
          }))
        );
      },
      (err) => console.warn('contact_messages listener:', err.message)
    );

    const unsubMedia = onSnapshot(
      query(collection(db, 'media'), orderBy('uploadedAt', 'desc')),
      (snap) => {
        setMedia(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<MediaItem, 'id'>),
          }))
        );
      },
      (err) => console.warn('media listener:', err.message)
    );

    return () => {
      unsubMsgs();
      unsubMedia();
    };
  }, [session, firestoreReady]);

  const handleConnectFirestore = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const idToken = await cred.user.getIdToken();
      await fetch('/api/admin/google-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idToken }),
      });
    } catch (err) {
      console.error('Google connection error:', err);
    }
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    setSeedNote('');
    try {
      await seedDefaultPortfolioToFirestore();
      setSeedNote('Initial portfolio data seeded to Cloud Firestore.');
    } catch (err) {
      setSeedNote(err instanceof Error ? err.message : 'Seed failed.');
    } finally {
      setSeeding(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassErr('');
    setPassMsg('');
    if (newPass.length < 10) {
      setPassErr('New password must be at least 10 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassErr('Passwords do not match.');
      return;
    }
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword: curPass, newPassword: newPass }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setPassErr(data.error || 'Failed to update password.');
        return;
      }
      setCurPass('');
      setNewPass('');
      setConfirmPass('');
      setPassMsg('Admin password hash updated securely on server.');
    } catch {
      setPassErr('Network error.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    await signOut(auth).catch(() => {});
    setSession({ authenticated: false, passwordConfigured: session?.passwordConfigured });
  };

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080B14] text-sm text-slate-400">
        Verifying admin session...
      </div>
    );
  }

  if (!session.authenticated || session.mustChangePassword) {
    return <AdminAuthGate session={session} onSessionChange={setSession} />;
  }

  const newMsgCount = messages.filter((m) => m.status === 'New').length;

  return (
    <div className="flex min-h-screen bg-[#080B14] text-[#F8FAFC]">
      {/* Sidebar (256px) */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-[#0B101B] lg:flex lg:flex-col">
        <div className="border-b border-slate-800 px-6 py-5">
          <p className="font-display text-base font-bold text-[#F8FAFC]">Borhan Admin</p>
          <p className="mt-0.5 text-xs text-slate-400">Portfolio CMS &amp; Inbox</p>
        </div>

        <nav className="flex-1 space-y-1 p-3" aria-label="Admin sections">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#7C3AED] text-white'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </span>
                {item.id === 'messages' && newMsgCount > 0 && (
                  <span className="font-mono-tech text-xs text-[#38BDF8]">{newMsgCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-3 space-y-1">
          <Link
            to="/"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View Live Site</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-red-950/50 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-[#080B14] px-6 py-4">
          <div>
            <p className="text-xs text-slate-400">
              Admin / {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
            </p>
            <h1 className="font-display text-xl font-bold text-[#F8FAFC]">
              {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Mobile tab selector */}
            <select
              aria-label="Select admin section"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as AdminTab)}
              className="rounded-lg border border-slate-700 bg-[#111827] px-3 py-2 text-xs text-[#F8FAFC] lg:hidden"
            >
              {NAV_ITEMS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white lg:hidden"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">
          {/* Cloud Firestore Admin Authorization Banner */}
          {!firestoreReady && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#38BDF8]/40 bg-[#111827] p-5">
              <div>
                <p className="font-display text-sm font-semibold text-[#F8FAFC]">
                  Connect Cloud Firestore Admin Session
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Zero-Trust Firestore rules require your verified Google owner account (mdborhprodhan@gmail.com) to read private contact inquiries and publish changes.
                </p>
              </div>
              <button
                type="button"
                onClick={handleConnectFirestore}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#7C3AED] px-4 py-2 text-xs font-semibold text-white hover:bg-[#6D28D9] whitespace-nowrap shrink-0"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Authorize with Google</span>
              </button>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-800 bg-[#111827] p-5">
                  <p className="text-xs text-slate-400">Projects</p>
                  <p className="mt-2 font-display text-2xl font-bold tabular-nums text-[#F8FAFC]">
                    {projects.length}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {projects.filter((p) => p.published).length} published
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#111827] p-5">
                  <p className="text-xs text-slate-400">Services</p>
                  <p className="mt-2 font-display text-2xl font-bold tabular-nums text-[#F8FAFC]">
                    {services.length}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {services.filter((s) => s.visible).length} visible
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#111827] p-5">
                  <p className="text-xs text-slate-400">Core Skills</p>
                  <p className="mt-2 font-display text-2xl font-bold tabular-nums text-[#F8FAFC]">
                    {skills.length}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {languages.length} languages configured
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#111827] p-5">
                  <p className="text-xs text-slate-400">Contact Inquiries</p>
                  <p className="mt-2 font-display text-2xl font-bold tabular-nums text-[#38BDF8]">
                    {firestoreReady ? messages.length : '—'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {firestoreReady ? `${newMsgCount} new` : 'Authorize Google to view'}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#111827] p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-base font-semibold text-[#F8FAFC]">
                      Firestore Portfolio Initialization
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                      {hasRemoteData
                        ? 'Your Cloud Firestore database contains live portfolio content.'
                        : 'Click to write the initial portfolio sections, services, skills, languages, and projects to Cloud Firestore.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={!firestoreReady || seeding}
                    onClick={handleSeedDatabase}
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-700 bg-[#080B14] px-4 py-2 text-xs font-medium text-[#F8FAFC] hover:border-[#38BDF8] disabled:opacity-50"
                  >
                    <Database className="h-4 w-4 text-[#38BDF8]" />
                    <span>{seeding ? 'Syncing...' : 'Seed Default Portfolio to Firestore'}</span>
                  </button>
                </div>
                {seedNote && <p className="mt-3 text-xs text-[#38BDF8]">{seedNote}</p>}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <AdminMessagesTab messages={messages} firestoreReady={firestoreReady} />
          )}

          {activeTab === 'personal' && (
            <AdminContentTab
              siteContent={siteContent}
              firestoreReady={firestoreReady}
              mode="personal"
            />
          )}

          {activeTab === 'about' && (
            <AdminContentTab
              siteContent={siteContent}
              firestoreReady={firestoreReady}
              mode="about"
            />
          )}

          {activeTab === 'seo' && (
            <AdminContentTab
              siteContent={siteContent}
              firestoreReady={firestoreReady}
              mode="seo"
            />
          )}

          {activeTab === 'sections' && (
            <AdminContentTab
              siteContent={siteContent}
              firestoreReady={firestoreReady}
              mode="sections"
            />
          )}

          {activeTab === 'services' && (
            <ServicesManager services={services} firestoreReady={firestoreReady} />
          )}

          {activeTab === 'skills' && (
            <SkillsManager skills={skills} firestoreReady={firestoreReady} />
          )}

          {activeTab === 'projects' && (
            <ProjectsManager projects={projects} firestoreReady={firestoreReady} />
          )}

          {activeTab === 'languages-social' && (
            <LanguagesAndSocialsManager
              languages={languages}
              socialLinks={socialLinks}
              firestoreReady={firestoreReady}
            />
          )}

          {activeTab === 'media' && (
            <MediaManager media={media} firestoreReady={firestoreReady} />
          )}

          {activeTab === 'security' && (
            <div className="max-w-lg rounded-xl border border-slate-800 bg-[#111827] p-6">
              <h2 className="font-display text-lg font-semibold text-[#F8FAFC]">
                Change Admin Password
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Updates the scrypt-hashed credentials for username <code className="text-slate-200">borhan</code> on the server.
              </p>

              <form onSubmit={handlePasswordUpdate} className="mt-5 space-y-4">
                {session.passwordConfigured && session.authMethod === 'password' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      value={curPass}
                      onChange={(e) => setCurPass(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2 text-sm text-[#F8FAFC]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-300">
                    New Password (min 10 chars)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={10}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2 text-sm text-[#F8FAFC]"
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
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2 text-sm text-[#F8FAFC]"
                  />
                </div>

                {passErr && <p className="text-xs text-red-400">{passErr}</p>}
                {passMsg && <p className="text-xs text-emerald-400">{passMsg}</p>}

                <button
                  type="submit"
                  className="min-h-[42px] rounded-lg bg-[#7C3AED] px-5 py-2 text-sm font-semibold text-white hover:bg-[#6D28D9]"
                >
                  Update Password
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
