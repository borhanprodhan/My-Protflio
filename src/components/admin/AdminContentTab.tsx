import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Save, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import type { SiteContent } from '../../types/portfolio';

interface AdminContentTabProps {
  siteContent: SiteContent;
  firestoreReady: boolean;
  mode: 'personal' | 'about' | 'seo' | 'sections';
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

export function AdminContentTab({ siteContent, firestoreReady, mode }: AdminContentTabProps) {
  const [form, setForm] = useState<SiteContent>(siteContent);
  const [saving, setSaving] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    setForm(siteContent);
  }, [siteContent]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestoreReady) return;
    setSaving(true);
    setStatusMsg('');
    try {
      const payload: SiteContent = {
        name: form.name.trim().slice(0, 120),
        title: form.title.trim().slice(0, 160),
        location: form.location.trim().slice(0, 160),
        email: form.email.trim().slice(0, 160),
        phone: form.phone.trim().slice(0, 40),
        experienceSummary: form.experienceSummary.trim().slice(0, 160),
        educationHsc: form.educationHsc.trim().slice(0, 100),
        educationSsc: form.educationSsc.trim().slice(0, 100),
        heroHeading: form.heroHeading.trim().slice(0, 220),
        heroSubheading: form.heroSubheading.trim().slice(0, 400),
        introText: form.introText.trim().slice(0, 400),
        aboutHeading: form.aboutHeading.trim().slice(0, 160),
        aboutBody: form.aboutBody.trim().slice(0, 2500),
        profilePhotoUrl: form.profilePhotoUrl.trim().slice(0, 500),
        cvUrl: form.cvUrl.trim().slice(0, 500),
        cvLabel: form.cvLabel.trim().slice(0, 80) || 'Download CV',
        footerTagline: form.footerTagline.trim().slice(0, 200),
        footerSubtitle: form.footerSubtitle.trim().slice(0, 200),
        seoTitle: form.seoTitle.trim().slice(0, 120),
        seoDescription: form.seoDescription.trim().slice(0, 300),
        ogTitle: form.ogTitle.trim().slice(0, 120),
        ogDescription: form.ogDescription.trim().slice(0, 300),
        showHero: Boolean(form.showHero),
        showAbout: Boolean(form.showAbout),
        showServices: Boolean(form.showServices),
        showSkills: Boolean(form.showSkills),
        showProjects: Boolean(form.showProjects),
        showContact: Boolean(form.showContact),
      };

      await setDoc(doc(db, 'site_content', 'main'), {
        ...payload,
        updatedAt: serverTimestamp(),
      });
      setStatusMsg('Saved changes to Cloud Firestore.');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'site_content/main');
    } finally {
      setSaving(false);
    }
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setStatusMsg('CV upload must be a PDF document.');
      return;
    }
    setUploadingCv(true);
    setStatusMsg('');
    try {
      const base64Data = await fileToBase64(file);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          base64Data,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setStatusMsg(data.error || 'CV upload failed.');
        return;
      }
      setForm((prev) => ({ ...prev, cvUrl: data.url! }));
      setStatusMsg('CV PDF uploaded. Click Save Changes to publish the link.');
    } catch {
      setStatusMsg('Upload error.');
    } finally {
      setUploadingCv(false);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="space-y-6 rounded-xl border border-slate-800 bg-[#111827] p-6"
    >
      {mode === 'personal' && (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-300">Full Name</label>
            <input
              type="text"
              required
              maxLength={120}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2 text-sm text-[#F8FAFC]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300">Professional Title</label>
            <input
              type="text"
              required
              maxLength={160}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2 text-sm text-[#F8FAFC]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300">Email</label>
            <input
              type="email"
              required
              maxLength={160}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2 text-sm text-[#F8FAFC]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300">Phone</label>
            <input
              type="text"
              required
              maxLength={40}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2 text-sm text-[#F8FAFC]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300">Location</label>
            <input
              type="text"
              required
              maxLength={160}
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2 text-sm text-[#F8FAFC]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300">Profile Photo URL</label>
            <input
              type="text"
              maxLength={500}
              value={form.profilePhotoUrl}
              onChange={(e) => setForm({ ...form, profilePhotoUrl: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2 text-sm text-[#F8FAFC]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-300">Hero Heading</label>
            <input
              type="text"
              required
              maxLength={220}
              value={form.heroHeading}
              onChange={(e) => setForm({ ...form, heroHeading: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2 text-sm text-[#F8FAFC]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-300">Hero Supporting Text</label>
            <textarea
              rows={2}
              required
              maxLength={400}
              value={form.heroSubheading}
              onChange={(e) => setForm({ ...form, heroSubheading: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2 text-sm text-[#F8FAFC]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-300">
              Professional Introduction
            </label>
            <textarea
              rows={2}
              required
              maxLength={400}
              value={form.introText}
              onChange={(e) => setForm({ ...form, introText: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2 text-sm text-[#F8FAFC]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300">Footer Subtitle</label>
            <input
              type="text"
              maxLength={200}
              value={form.footerSubtitle}
              onChange={(e) => setForm({ ...form, footerSubtitle: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2 text-sm text-[#F8FAFC]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300">Footer Tagline</label>
            <input
              type="text"
              maxLength={200}
              value={form.footerTagline}
              onChange={(e) => setForm({ ...form, footerTagline: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2 text-sm text-[#F8FAFC]"
            />
          </div>
        </div>
      )}

      {mode === 'about' && (
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300">About Heading</label>
              <input
                type="text"
                required
                maxLength={160}
                value={form.aboutHeading}
                onChange={(e) => setForm({ ...form, aboutHeading: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2 text-sm text-[#F8FAFC]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300">About Biography</label>
              <textarea
                rows={6}
                required
                maxLength={2500}
                value={form.aboutBody}
                onChange={(e) => setForm({ ...form, aboutBody: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2 text-sm text-[#F8FAFC]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">Experience Summary</label>
              <input
                type="text"
                required
                maxLength={160}
                value={form.experienceSummary}
                onChange={(e) => setForm({ ...form, experienceSummary: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2 text-sm text-[#F8FAFC]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">HSC Education</label>
              <input
                type="text"
                maxLength={100}
                value={form.educationHsc}
                onChange={(e) => setForm({ ...form, educationHsc: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2 text-sm text-[#F8FAFC]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">SSC Education</label>
              <input
                type="text"
                maxLength={100}
                value={form.educationSsc}
                onChange={(e) => setForm({ ...form, educationSsc: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2 text-sm text-[#F8FAFC]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">CV Button Label</label>
              <input
                type="text"
                maxLength={80}
                value={form.cvLabel}
                onChange={(e) => setForm({ ...form, cvLabel: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2 text-sm text-[#F8FAFC]"
              />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-5">
            <label className="block text-xs font-medium text-slate-300">
              CV File URL (or upload PDF below)
            </label>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <input
                type="text"
                maxLength={500}
                value={form.cvUrl}
                onChange={(e) => setForm({ ...form, cvUrl: e.target.value })}
                placeholder="/uploads/your-cv.pdf (leave blank for built-in CV export)"
                className="flex-1 min-w-[240px] rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2 text-sm text-[#F8FAFC]"
              />
              <label className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-[#080B14] px-4 py-2 text-xs font-medium text-slate-200 hover:border-[#38BDF8]">
                <Upload className="h-4 w-4 text-[#38BDF8]" />
                <span>{uploadingCv ? 'Uploading...' : 'Upload CV PDF'}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleCvUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {mode === 'seo' && (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-300">SEO Page Title</label>
            <input
              type="text"
              maxLength={120}
              value={form.seoTitle}
              onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2 text-sm text-[#F8FAFC]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300">
              SEO Meta Description
            </label>
            <textarea
              rows={3}
              maxLength={300}
              value={form.seoDescription}
              onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2 text-sm text-[#F8FAFC]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300">Open Graph Title</label>
            <input
              type="text"
              maxLength={120}
              value={form.ogTitle}
              onChange={(e) => setForm({ ...form, ogTitle: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2 text-sm text-[#F8FAFC]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Open Graph Description
            </label>
            <textarea
              rows={3}
              maxLength={300}
              value={form.ogDescription}
              onChange={(e) => setForm({ ...form, ogDescription: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2 text-sm text-[#F8FAFC]"
            />
          </div>
        </div>
      )}

      {mode === 'sections' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Toggle visibility of individual sections on the public portfolio website.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { key: 'showHero' as const, label: 'Hero Section' },
              { key: 'showAbout' as const, label: 'About & Timeline Section' },
              { key: 'showServices' as const, label: 'Services Section' },
              { key: 'showSkills' as const, label: 'Skills & Capabilities Section' },
              { key: 'showProjects' as const, label: 'Portfolio Projects Section' },
              { key: 'showContact' as const, label: 'Contact Form Section' },
            ].map((item) => (
              <label
                key={item.key}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-800 bg-[#080B14] px-4 py-3 text-sm"
              >
                <span className="text-slate-200">{item.label}</span>
                <input
                  type="checkbox"
                  checked={form[item.key]}
                  onChange={(e) => setForm({ ...form, [item.key]: e.target.checked })}
                  className="h-4 w-4 accent-[#7C3AED]"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {statusMsg && (
        <p className="text-xs font-medium text-[#38BDF8]">{statusMsg}</p>
      )}

      <div className="flex justify-end border-t border-slate-800 pt-4">
        <button
          type="submit"
          disabled={!firestoreReady || saving}
          className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-[#7C3AED] px-5 py-2 text-sm font-semibold text-white hover:bg-[#6D28D9] disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </form>
  );
}
