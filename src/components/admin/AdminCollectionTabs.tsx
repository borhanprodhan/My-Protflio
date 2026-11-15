import {
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Plus, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import {
  PROJECT_CATEGORIES,
  type LanguageItem,
  type MediaItem,
  type ProjectItem,
  type ProjectStatus,
  type ServiceItem,
  type SkillItem,
  type SocialLinkItem,
} from '../../types/portfolio';

function slugify(val: string): string {
  const cleaned = val
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || `item-${Date.now()}`;
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Read failed'));
    reader.readAsDataURL(file);
  });
}

/* ==================== SERVICES MANAGER ==================== */
export function ServicesManager({
  services,
  firestoreReady,
}: {
  services: ServiceItem[];
  firestoreReady: boolean;
}) {
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [deliverablesText, setDeliverablesText] = useState('');
  const [visualUrl, setVisualUrl] = useState('');
  const [visible, setVisible] = useState(true);
  const [busy, setBusy] = useState(false);

  const startNew = () => {
    setEditing(null);
    setTitle('');
    setShortDesc('');
    setFullDesc('');
    setDeliverablesText('');
    setVisualUrl('');
    setVisible(true);
  };

  const startEdit = (item: ServiceItem) => {
    setEditing(item);
    setTitle(item.title);
    setShortDesc(item.shortDescription);
    setFullDesc(item.fullDescription);
    setDeliverablesText(item.deliverables.join('\n'));
    setVisualUrl(item.visualUrl);
    setVisible(item.visible);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestoreReady) return;
    setBusy(true);
    const id = editing ? editing.id : `srv-${Date.now()}`;
    const deliverables = deliverablesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 10);

    try {
      await setDoc(doc(db, 'services', id), {
        title: title.trim().slice(0, 120),
        slug: slugify(title).slice(0, 120),
        shortDescription: shortDesc.trim().slice(0, 400),
        fullDescription: (fullDesc.trim() || shortDesc.trim()).slice(0, 2000),
        deliverables,
        visualUrl: visualUrl.trim().slice(0, 500),
        order: editing ? editing.order : services.length + 1,
        visible,
        updatedAt: serverTimestamp(),
      });
      startNew();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `services/${id}`);
    } finally {
      setBusy(false);
    }
  };

  const moveOrder = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= services.length) return;
    const a = services[idx];
    const b = services[target];
    try {
      await updateDoc(doc(db, 'services', a.id), {
        order: b.order,
        updatedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'services', b.id), {
        order: a.order,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `services/${a.id}`);
    }
  };

  const toggleVisible = async (item: ServiceItem) => {
    try {
      await updateDoc(doc(db, 'services', item.id), {
        visible: !item.visible,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `services/${item.id}`);
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'services', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `services/${id}`);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-3 lg:col-span-7">
        {services.map((item, idx) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-[#111827] p-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm text-[#F8FAFC] truncate">{item.title}</p>
                {!item.visible && <span className="text-xs text-slate-500">Hidden</span>}
              </div>
              <p className="mt-1 text-xs text-slate-400 truncate">{item.shortDescription}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => moveOrder(idx, -1)}
                disabled={idx === 0}
                aria-label="Move up"
                className="rounded border border-slate-700 p-1.5 text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => moveOrder(idx, 1)}
                disabled={idx === services.length - 1}
                aria-label="Move down"
                className="rounded border border-slate-700 p-1.5 text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => toggleVisible(item)}
                aria-label={item.visible ? 'Hide service' : 'Show service'}
                className="rounded border border-slate-700 p-1.5 text-slate-400 hover:text-white"
              >
                {item.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => startEdit(item)}
                className="rounded border border-slate-700 px-2.5 py-1 text-xs text-slate-200 hover:border-[#38BDF8]"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label="Delete service"
                className="rounded border border-slate-700 p-1.5 text-slate-400 hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-4 rounded-xl border border-slate-800 bg-[#111827] p-6 lg:col-span-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-[#F8FAFC]">
            {editing ? 'Edit Service' : 'Add New Service'}
          </h3>
          {editing && (
            <button type="button" onClick={startNew} className="text-xs text-[#38BDF8]">
              Cancel Edit
            </button>
          )}
        </div>
        <input
          type="text"
          required
          minLength={2}
          maxLength={120}
          placeholder="Service title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-[#080B14] px-3 py-2 text-sm text-[#F8FAFC]"
        />
        <textarea
          required
          minLength={10}
          maxLength={400}
          rows={2}
          placeholder="Short description (10-400 chars)"
          value={shortDesc}
          onChange={(e) => setShortDesc(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-[#080B14] px-3 py-2 text-sm text-[#F8FAFC]"
        />
        <textarea
          required
          minLength={10}
          maxLength={2000}
          rows={3}
          placeholder="Full detailed specification"
          value={fullDesc}
          onChange={(e) => setFullDesc(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-[#080B14] px-3 py-2 text-sm text-[#F8FAFC]"
        />
        <textarea
          rows={3}
          placeholder="Deliverables (one per line, max 10)"
          value={deliverablesText}
          onChange={(e) => setDeliverablesText(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-[#080B14] px-3 py-2 text-sm text-[#F8FAFC]"
        />
        <input
          type="text"
          maxLength={500}
          placeholder="Visual image URL"
          value={visualUrl}
          onChange={(e) => setVisualUrl(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-[#080B14] px-3 py-2 text-sm text-[#F8FAFC]"
        />
        <label className="flex items-center gap-2 text-xs text-slate-300">
          <input
            type="checkbox"
            checked={visible}
            onChange={(e) => setVisible(e.target.checked)}
            className="accent-[#7C3AED]"
          />
          <span>Visible on portfolio</span>
        </label>
        <button
          type="submit"
          disabled={!firestoreReady || busy}
          className="inline-flex w-full min-h-[42px] items-center justify-center gap-2 rounded-lg bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6D28D9] disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          <span>{editing ? 'Update Service' : 'Add Service'}</span>
        </button>
      </form>
    </div>
  );
}

/* ==================== PROJECTS MANAGER ==================== */
export function ProjectsManager({
  projects,
  firestoreReady,
}: {
  projects: ProjectItem[];
  firestoreReady: boolean;
}) {
  const [editing, setEditing] = useState<ProjectItem | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>(PROJECT_CATEGORIES[1]);
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [galleryText, setGalleryText] = useState('');
  const [techText, setTechText] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Architecture Blueprint');
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setEditing(null);
    setTitle('');
    setCategory(PROJECT_CATEGORIES[1]);
    setDescription('');
    setCoverImage('');
    setGalleryText('');
    setTechText('');
    setProjectUrl('');
    setGithubUrl('');
    setStatus('Architecture Blueprint');
    setFeatured(false);
    setPublished(true);
  };

  const startEdit = (p: ProjectItem) => {
    setEditing(p);
    setTitle(p.title);
    setCategory(p.category);
    setDescription(p.description);
    setCoverImage(p.coverImage);
    setGalleryText(p.gallery.join('\n'));
    setTechText(p.technologies.join(', '));
    setProjectUrl(p.projectUrl);
    setGithubUrl(p.githubUrl);
    setStatus(p.status);
    setFeatured(p.featured);
    setPublished(p.published);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestoreReady) return;
    setBusy(true);
    const id = editing ? editing.id : `proj-${Date.now()}`;
    const gallery = galleryText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8);
    const technologies = techText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 12);

    try {
      const base = {
        title: title.trim().slice(0, 140),
        slug: slugify(title).slice(0, 140),
        category: category.trim().slice(0, 100),
        description: description.trim().slice(0, 2500),
        coverImage: coverImage.trim().slice(0, 500),
        gallery,
        technologies,
        projectUrl: projectUrl.trim().slice(0, 500),
        githubUrl: githubUrl.trim().slice(0, 500),
        status,
        featured,
        published,
        order: editing ? editing.order : projects.length + 1,
      };
      if (editing) {
        await updateDoc(doc(db, 'projects', id), {
          ...base,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(doc(db, 'projects', id), {
          ...base,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      reset();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `projects/${id}`);
    } finally {
      setBusy(false);
    }
  };

  const togglePublished = async (p: ProjectItem) => {
    try {
      await updateDoc(doc(db, 'projects', p.id), {
        published: !p.published,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `projects/${p.id}`);
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `projects/${id}`);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-3 lg:col-span-7">
        {projects.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-[#111827] p-4"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="text-[#38BDF8]">{p.category}</span>
                <span>·</span>
                <span>{p.published ? 'Published' : 'Unpublished'}</span>
                {p.featured && (
                  <>
                    <span>·</span>
                    <span className="text-slate-200">Featured</span>
                  </>
                )}
              </div>
              <p className="mt-1 font-medium text-sm text-[#F8FAFC] truncate">{p.title}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => togglePublished(p)}
                className="rounded border border-slate-700 px-2.5 py-1 text-xs text-slate-300 hover:text-white"
              >
                {p.published ? 'Unpublish' : 'Publish'}
              </button>
              <button
                type="button"
                onClick={() => startEdit(p)}
                className="rounded border border-slate-700 px-2.5 py-1 text-xs text-slate-200 hover:border-[#38BDF8]"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => remove(p.id)}
                aria-label="Delete project"
                className="rounded border border-slate-700 p-1.5 text-slate-400 hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-3.5 rounded-xl border border-slate-800 bg-[#111827] p-6 lg:col-span-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-[#F8FAFC]">
            {editing ? 'Edit Project' : 'Add New Project'}
          </h3>
          {editing && (
            <button type="button" onClick={reset} className="text-xs text-[#38BDF8]">
              Cancel
            </button>
          )}
        </div>
        <input
          type="text"
          required
          minLength={2}
          maxLength={140}
          placeholder="Project title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-[#080B14] px-3 py-2 text-sm text-[#F8FAFC]"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-[#080B14] px-3 py-2 text-sm text-[#F8FAFC]"
        >
          {PROJECT_CATEGORIES.filter((c) => c !== 'All').map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <textarea
          required
          minLength={10}
          maxLength={2500}
          rows={3}
          placeholder="Project description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-[#080B14] px-3 py-2 text-sm text-[#F8FAFC]"
        />
        <input
          type="text"
          maxLength={500}
          placeholder="Cover image URL"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-[#080B14] px-3 py-2 text-sm text-[#F8FAFC]"
        />
        <textarea
          rows={2}
          placeholder="Gallery URLs (one per line)"
          value={galleryText}
          onChange={(e) => setGalleryText(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-[#080B14] px-3 py-2 text-sm text-[#F8FAFC]"
        />
        <input
          type="text"
          placeholder="Technologies (comma-separated, e.g. n8n, WhatsApp API)"
          value={techText}
          onChange={(e) => setTechText(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-[#080B14] px-3 py-2 text-sm text-[#F8FAFC]"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            maxLength={500}
            placeholder="Project URL (optional)"
            value={projectUrl}
            onChange={(e) => setProjectUrl(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-[#080B14] px-3 py-2 text-sm text-[#F8FAFC]"
          />
          <input
            type="text"
            maxLength={500}
            placeholder="GitHub URL (optional)"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-[#080B14] px-3 py-2 text-sm text-[#F8FAFC]"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ProjectStatus)}
          className="w-full rounded-lg border border-slate-700 bg-[#080B14] px-3 py-2 text-sm text-[#F8FAFC]"
        >
          <option value="Architecture Blueprint">Architecture Blueprint</option>
          <option value="In Development">In Development</option>
          <option value="Published">Published</option>
        </select>
        <div className="flex items-center gap-6 text-xs text-slate-300">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="accent-[#7C3AED]"
            />
            <span>Featured</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="accent-[#7C3AED]"
            />
            <span>Published</span>
          </label>
        </div>
        <button
          type="submit"
          disabled={!firestoreReady || busy}
          className="inline-flex w-full min-h-[42px] items-center justify-center gap-2 rounded-lg bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6D28D9] disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          <span>{editing ? 'Update Project' : 'Create Project'}</span>
        </button>
      </form>
    </div>
  );
}

/* ==================== SKILLS MANAGER ==================== */
export function SkillsManager({
  skills,
  firestoreReady,
}: {
  skills: SkillItem[];
  firestoreReady: boolean;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Automation & AI');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestoreReady) return;
    setBusy(true);
    const id = `sk-${Date.now()}`;
    try {
      await setDoc(doc(db, 'skills', id), {
        name: name.trim().slice(0, 100),
        category: category.trim().slice(0, 80),
        description: description.trim().slice(0, 300),
        order: skills.length + 1,
        visible: true,
        updatedAt: serverTimestamp(),
      });
      setName('');
      setDescription('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `skills/${id}`);
    } finally {
      setBusy(false);
    }
  };

  const toggleVisible = async (s: SkillItem) => {
    try {
      await updateDoc(doc(db, 'skills', s.id), {
        visible: !s.visible,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `skills/${s.id}`);
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'skills', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `skills/${id}`);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-3 lg:col-span-7">
        {skills.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-[#111827] p-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-[#38BDF8]">{s.category}</span>
                {!s.visible && <span>· Hidden</span>}
              </div>
              <p className="mt-1 font-medium text-sm text-[#F8FAFC]">{s.name}</p>
              <p className="mt-0.5 text-xs text-slate-400 truncate">{s.description}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => toggleVisible(s)}
                className="rounded border border-slate-700 p-1.5 text-slate-400 hover:text-white"
              >
                {s.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => remove(s.id)}
                className="rounded border border-slate-700 p-1.5 text-slate-400 hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleAdd}
        className="space-y-4 rounded-xl border border-slate-800 bg-[#111827] p-6 lg:col-span-5"
      >
        <h3 className="font-display text-base font-semibold text-[#F8FAFC]">Add Skill</h3>
        <input
          type="text"
          required
          minLength={2}
          maxLength={100}
          placeholder="Skill name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-[#080B14] px-3 py-2 text-sm text-[#F8FAFC]"
        />
        <input
          type="text"
          required
          minLength={2}
          maxLength={80}
          placeholder="Category (e.g. Automation & AI)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-[#080B14] px-3 py-2 text-sm text-[#F8FAFC]"
        />
        <textarea
          required
          minLength={5}
          maxLength={300}
          rows={3}
          placeholder="Short description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-[#080B14] px-3 py-2 text-sm text-[#F8FAFC]"
        />
        <button
          type="submit"
          disabled={!firestoreReady || busy}
          className="inline-flex w-full min-h-[42px] items-center justify-center gap-2 rounded-lg bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6D28D9] disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          <span>Add Skill</span>
        </button>
      </form>
    </div>
  );
}

/* ==================== LANGUAGES & SOCIALS MANAGER ==================== */
export function LanguagesAndSocialsManager({
  languages,
  socialLinks,
  firestoreReady,
}: {
  languages: LanguageItem[];
  socialLinks: SocialLinkItem[];
  firestoreReady: boolean;
}) {
  const [langName, setLangName] = useState('');
  const [langProf, setLangProf] = useState('');
  const [socPlatform, setSocPlatform] = useState('');
  const [socUrl, setSocUrl] = useState('');

  const addLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestoreReady || !langName.trim()) return;
    const id = `lang-${slugify(langName)}`;
    try {
      await setDoc(doc(db, 'languages', id), {
        name: langName.trim().slice(0, 60),
        proficiency: langProf.trim().slice(0, 80),
        order: languages.length + 1,
        visible: true,
      });
      setLangName('');
      setLangProf('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `languages/${id}`);
    }
  };

  const updateLanguageProf = async (item: LanguageItem, nextProf: string) => {
    try {
      await updateDoc(doc(db, 'languages', item.id), {
        proficiency: nextProf.slice(0, 80),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `languages/${item.id}`);
    }
  };

  const deleteLanguage = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'languages', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `languages/${id}`);
    }
  };

  const saveSocial = async (item: SocialLinkItem, nextUrl: string) => {
    try {
      await setDoc(doc(db, 'social_links', item.id), {
        ...item,
        url: nextUrl.trim().slice(0, 500),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `social_links/${item.id}`);
    }
  };

  const addSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestoreReady || !socPlatform.trim()) return;
    const id = `soc-${slugify(socPlatform)}`;
    try {
      await setDoc(doc(db, 'social_links', id), {
        platform: socPlatform.trim().slice(0, 60),
        label: socPlatform.trim().slice(0, 80),
        url: socUrl.trim().slice(0, 500),
        order: socialLinks.length + 1,
        visible: true,
      });
      setSocPlatform('');
      setSocUrl('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `social_links/${id}`);
    }
  };

  const deleteSocial = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'social_links', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `social_links/${id}`);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Languages */}
      <div className="space-y-4 rounded-xl border border-slate-800 bg-[#111827] p-6">
        <h3 className="font-display text-lg font-semibold text-[#F8FAFC]">Languages</h3>
        <div className="space-y-3">
          {languages.map((l) => (
            <div
              key={l.id}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-[#080B14] p-3"
            >
              <span className="min-w-[90px] text-sm font-medium text-[#F8FAFC]">{l.name}</span>
              <input
                type="text"
                defaultValue={l.proficiency}
                placeholder="Proficiency (optional)"
                onBlur={(e) => {
                  if (e.target.value !== l.proficiency) {
                    updateLanguageProf(l, e.target.value);
                  }
                }}
                className="flex-1 rounded border border-slate-700 bg-[#111827] px-2.5 py-1.5 text-xs text-[#F8FAFC]"
              />
              <button
                type="button"
                onClick={() => deleteLanguage(l.id)}
                className="rounded border border-slate-700 p-1.5 text-slate-400 hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={addLanguage} className="flex flex-wrap gap-2 border-t border-slate-800 pt-4">
          <input
            type="text"
            required
            placeholder="Language (e.g. German)"
            value={langName}
            onChange={(e) => setLangName(e.target.value)}
            className="flex-1 min-w-[120px] rounded-lg border border-slate-700 bg-[#080B14] px-3 py-2 text-xs text-[#F8FAFC]"
          />
          <input
            type="text"
            placeholder="Proficiency (optional)"
            value={langProf}
            onChange={(e) => setLangProf(e.target.value)}
            className="flex-1 min-w-[120px] rounded-lg border border-slate-700 bg-[#080B14] px-3 py-2 text-xs text-[#F8FAFC]"
          />
          <button
            type="submit"
            disabled={!firestoreReady}
            className="rounded-lg bg-[#7C3AED] px-4 py-2 text-xs font-semibold text-white hover:bg-[#6D28D9]"
          >
            Add
          </button>
        </form>
      </div>

      {/* Social Links */}
      <div className="space-y-4 rounded-xl border border-slate-800 bg-[#111827] p-6">
        <h3 className="font-display text-lg font-semibold text-[#F8FAFC]">Social Links</h3>
        <div className="space-y-3">
          {socialLinks.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-[#080B14] p-3"
            >
              <span className="min-w-[90px] text-sm font-medium text-[#F8FAFC]">
                {s.platform}
              </span>
              <input
                type="url"
                defaultValue={s.url}
                placeholder="https://..."
                onBlur={(e) => {
                  if (e.target.value !== s.url) {
                    saveSocial(s, e.target.value);
                  }
                }}
                className="flex-1 rounded border border-slate-700 bg-[#111827] px-2.5 py-1.5 text-xs text-[#F8FAFC]"
              />
              <button
                type="button"
                onClick={() => deleteSocial(s.id)}
                className="rounded border border-slate-700 p-1.5 text-slate-400 hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={addSocial} className="flex flex-wrap gap-2 border-t border-slate-800 pt-4">
          <input
            type="text"
            required
            placeholder="Platform"
            value={socPlatform}
            onChange={(e) => setSocPlatform(e.target.value)}
            className="w-32 rounded-lg border border-slate-700 bg-[#080B14] px-3 py-2 text-xs text-[#F8FAFC]"
          />
          <input
            type="url"
            placeholder="Profile URL (https://...)"
            value={socUrl}
            onChange={(e) => setSocUrl(e.target.value)}
            className="flex-1 min-w-[160px] rounded-lg border border-slate-700 bg-[#080B14] px-3 py-2 text-xs text-[#F8FAFC]"
          />
          <button
            type="submit"
            disabled={!firestoreReady}
            className="rounded-lg bg-[#7C3AED] px-4 py-2 text-xs font-semibold text-white hover:bg-[#6D28D9]"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
}

/* ==================== MEDIA MANAGER ==================== */
export function MediaManager({
  media,
  firestoreReady,
}: {
  media: MediaItem[];
  firestoreReady: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firestoreReady) return;
    setUploading(true);
    setErrMsg('');
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
      const data = (await res.json()) as {
        url?: string;
        mimeType?: string;
        sizeBytes?: number;
        error?: string;
      };
      if (!res.ok || !data.url) {
        setErrMsg(data.error || 'Upload failed.');
        return;
      }

      const id = `media-${Date.now()}`;
      await setDoc(doc(db, 'media', id), {
        title: file.name.slice(0, 140),
        url: data.url,
        mimeType: data.mimeType || file.type,
        sizeBytes: data.sizeBytes || file.size,
        uploadedAt: serverTimestamp(),
      });
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'media', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `media/${id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-[#111827] p-6">
        <div>
          <h3 className="font-display text-base font-semibold text-[#F8FAFC]">
            Upload Portfolio Media
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Supports JPG, PNG, WebP, and PDF up to 5 MB.
          </p>
        </div>

        <label className="inline-flex min-h-[42px] cursor-pointer items-center gap-2 rounded-lg bg-[#7C3AED] px-5 py-2 text-sm font-semibold text-white hover:bg-[#6D28D9]">
          <Upload className="h-4 w-4" />
          <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      </div>

      {errMsg && (
        <div className="rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-xs text-red-200">
          {errMsg}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {media.map((m) => (
          <div
            key={m.id}
            className="overflow-hidden rounded-xl border border-slate-800 bg-[#111827]"
          >
            {m.mimeType.startsWith('image/') ? (
              <div className="aspect-[4/3] w-full bg-slate-900">
                <img
                  src={m.url}
                  alt={m.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-[4/3] w-full items-center justify-center bg-slate-900 font-mono-tech text-xs text-slate-300">
                {m.mimeType}
              </div>
            )}
            <div className="p-4">
              <p className="truncate text-sm font-medium text-[#F8FAFC]">{m.title}</p>
              <p className="mt-0.5 font-mono-tech text-xs text-slate-400">
                {(m.sizeBytes / 1024).toFixed(1)} KB
              </p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(m.url);
                    setCopiedId(m.id);
                    setTimeout(() => setCopiedId(null), 1500);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-[#38BDF8] hover:underline"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{copiedId === m.id ? 'Copied URL' : 'Copy URL'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => remove(m.id)}
                  aria-label="Delete media"
                  className="rounded border border-slate-700 p-1.5 text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
