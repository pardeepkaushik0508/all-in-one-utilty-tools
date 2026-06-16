import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { slugifyBlogTitle } from '../../utils/cms/blogPosts';
import { adminFetch, triggerRevalidate } from '../../utils/adminApi';
import { tools } from '../../utils/tools';
import {
  Field,
  FormSection,
  StatusBar,
  StringListInput
} from './AdminFormFields';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), { ssr: false });

const AUTOSAVE_KEY = 'aio_blog_autosave';
const AUTOSAVE_INTERVAL = 30000; // 30 seconds

const EMPTY_FORM = {
  slug: '',
  title: '',
  excerpt: '',
  categories: ['Guides'],
  category: 'Guides',
  author: 'UtilityTools Team',
  readTime: '5 min',
  relatedToolSlug: '',
  status: 'draft',
  scheduledAt: '',
  // SEO
  metaTitle: '',
  metaDescription: '',
  keywords: [],
  canonicalUrl: '',
  ogTitle: '',
  ogDescription: '',
  featuredImage: '',
  robotsIndex: true,
  content: '',
  contentHtml: ''
};

function contentToHtml(content) {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.filter(Boolean).map((para) => `<p>${para.replace(/\n/g, '<br>')}</p>`).join('\n');
  }
  return '';
}

function buildDefaultBlogForm(post, cmsRecord = null) {
  const base = post || {};
  const merged = cmsRecord ? { ...base, ...cmsRecord } : base;
  const rawContent = merged.content || [];
  const html = contentToHtml(rawContent);

  const cats = Array.isArray(merged.categories) && merged.categories.length
    ? merged.categories
    : [merged.category || 'Guides'];

  return {
    slug: merged.slug || '',
    title: merged.title || '',
    excerpt: merged.excerpt || '',
    categories: cats,
    category: cats[0],
    author: merged.author || 'UtilityTools Team',
    readTime: merged.readTime || '5 min',
    relatedToolSlug: merged.relatedToolSlug || '',
    status: merged.status || (post ? 'published' : 'draft'),
    scheduledAt: merged.scheduledAt || '',
    metaTitle: merged.metaTitle || merged.title || '',
    metaDescription: merged.metaDescription || merged.excerpt || '',
    keywords: merged.keywords || [],
    canonicalUrl: merged.canonicalUrl || '',
    ogTitle: merged.ogTitle || merged.metaTitle || merged.title || '',
    ogDescription: merged.ogDescription || merged.metaDescription || merged.excerpt || '',
    featuredImage: merged.featuredImage || '',
    robotsIndex: merged.robotsIndex !== false,
    contentHtml: html,
    content: rawContent,
    source: merged.source || 'cms'
  };
}

function statusLabel(post) {
  if (post.status === 'draft') return 'Draft';
  if (post.status === 'scheduled') return 'Scheduled';
  return 'Published';
}

// ── Multi-category picker ─────────────────────────────────────────────────────
function MultiCategoryPicker({ allCategories, selected, onChange }) {
  const toggle = (name) => {
    const next = selected.includes(name)
      ? selected.filter((c) => c !== name)
      : [...selected, name];
    // Must have at least one
    if (next.length === 0) return;
    onChange(next);
  };

  return (
    <div className="cat-list mt-1">
      {allCategories.filter((c) => c.status !== 'inactive').map((cat) => {
        const catName = typeof cat === 'string' ? cat : cat.name;
        const active = selected.includes(catName);
        return (
          <button
            key={catName}
            type="button"
            onClick={() => toggle(catName)}
            className={`cat-tag cursor-pointer transition-colors ${active ? 'cat-tag-custom' : ''}`}
          >
            {active && <span className="mr-0.5">✓</span>}
            {catName}
          </button>
        );
      })}
    </div>
  );
}

export default function BlogManager({ token }) {
  const [catalog, setCatalog] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [mode, setMode] = useState('edit');
  const [selectedSlug, setSelectedSlug] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [autosaveMsg, setAutosaveMsg] = useState('');
  const [hasDraft, setHasDraft] = useState(false);
  const autosaveTimer = useRef(null);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const data = await adminFetch('/api/admin/blog-categories', { token });
      setAllCategories(data.categories || []);
    } catch { /* silent */ }
  }, [token]);

  const loadCatalog = useCallback(async () => {
    const data = await adminFetch('/api/admin/blogs', { token });
    const posts = (data.blogs || []).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    setCatalog(posts);
    return posts;
  }, [token]);

  const loadEditor = useCallback(async (slug) => {
    if (!slug) return;
    setError('');
    setStatus('Loading...');
    setLoading(true);
    try {
      const remote = await adminFetch(`/api/admin/content/blogs/${slug}`, { token });
      setForm(buildDefaultBlogForm(null, remote.content));
      setMode('edit');
      setStatus('Loaded');
      // Check for autosaved draft
      const saved = typeof window !== 'undefined' ? localStorage.getItem(`${AUTOSAVE_KEY}_${slug}`) : null;
      setHasDraft(!!saved);
    } catch (err) {
      setError(err.message);
      setStatus('');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCategories();
    loadCatalog()
      .then((merged) => setSelectedSlug((cur) => cur || merged[0]?.slug || ''))
      .catch((err) => setError(err.message));
  }, [loadCatalog, loadCategories]);

  useEffect(() => {
    if (mode === 'edit' && selectedSlug) loadEditor(selectedSlug);
  }, [selectedSlug, mode, loadEditor]);

  // Autosave every 30s
  useEffect(() => {
    if (autosaveTimer.current) clearInterval(autosaveTimer.current);
    autosaveTimer.current = setInterval(() => {
      if (typeof window === 'undefined') return;
      const key = mode === 'create' ? `${AUTOSAVE_KEY}_new` : `${AUTOSAVE_KEY}_${selectedSlug}`;
      localStorage.setItem(key, JSON.stringify({ ...form, _savedAt: new Date().toISOString() }));
      setAutosaveMsg(`Draft autosaved at ${new Date().toLocaleTimeString()}`);
    }, AUTOSAVE_INTERVAL);
    return () => clearInterval(autosaveTimer.current);
  }, [form, mode, selectedSlug]);

  const restoreDraft = () => {
    const key = mode === 'create' ? `${AUTOSAVE_KEY}_new` : `${AUTOSAVE_KEY}_${selectedSlug}`;
    const saved = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      setForm(parsed);
      setAutosaveMsg(`Restored draft from ${new Date(parsed._savedAt).toLocaleString()}`);
      setHasDraft(false);
    } catch { /* ignore */ }
  };

  const discardDraft = () => {
    const key = mode === 'create' ? `${AUTOSAVE_KEY}_new` : `${AUTOSAVE_KEY}_${selectedSlug}`;
    if (typeof window !== 'undefined') localStorage.removeItem(key);
    setHasDraft(false);
    setAutosaveMsg('');
  };

  const updateField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'title' && mode === 'create' && !prev.slugTouched) {
        next.slug = slugifyBlogTitle(value);
        if (!prev.metaTitle) next.metaTitle = value;
        if (!prev.ogTitle) next.ogTitle = value;
      }
      if (key === 'excerpt' && mode === 'create') {
        if (!prev.metaDescription) next.metaDescription = value;
        if (!prev.ogDescription) next.ogDescription = value;
      }
      if (key === 'metaTitle' && !prev.ogTitle) next.ogTitle = value;
      if (key === 'metaDescription' && !prev.ogDescription) next.ogDescription = value;
      return next;
    });
  };

  const handleContentChange = (html) => {
    setForm((prev) => ({ ...prev, contentHtml: html, content: html }));
  };

  const handleCreateNew = () => {
    setMode('create');
    setSelectedSlug('');
    setForm({ ...EMPTY_FORM, slugTouched: false });
    setStatus('');
    setError('');
    setHasDraft(false);
    setAutosaveMsg('');
    // Check for new post autosave
    const saved = typeof window !== 'undefined' ? localStorage.getItem(`${AUTOSAVE_KEY}_new`) : null;
    setHasDraft(!!saved);
  };

  // Validation
  const validate = (nextStatus) => {
    if (!form.title?.trim()) return 'Blog title is required.';
    if (!form.contentHtml?.trim()) return 'Blog content is required.';
    if (!form.categories?.length) return 'At least one category is required.';
    if (nextStatus === 'published' && !form.categories?.length) return 'Select at least one category before publishing.';
    return null;
  };

  const handleSave = async (nextStatus = null) => {
    const validationError = validate(nextStatus);
    if (validationError) { setError(validationError); return; }

    setError('');
    setStatus('Saving...');
    setLoading(true);
    try {
      const payload = {
        ...form,
        status: nextStatus || form.status,
        date: form.date || new Date().toISOString().slice(0, 10),
        content: form.contentHtml || form.content || '',
        categories: form.categories,
        category: form.categories[0]
      };
      delete payload.contentHtml;

      if (mode === 'create') {
        const created = await adminFetch('/api/admin/blogs', { method: 'POST', body: payload, token });
        const slug = created.blog.slug;
        if (typeof window !== 'undefined') localStorage.removeItem(`${AUTOSAVE_KEY}_new`);
        setSelectedSlug(slug);
        setMode('edit');
        await loadCatalog();
        await triggerRevalidate(token, ['/blog', `/blog/${slug}`]);
        setStatus(nextStatus === 'published' ? 'Blog published.' : 'Blog created.');
        return;
      }

      await adminFetch(`/api/admin/content/blogs/${selectedSlug}`, { method: 'PUT', body: payload, token });
      if (typeof window !== 'undefined') localStorage.removeItem(`${AUTOSAVE_KEY}_${selectedSlug}`);
      setHasDraft(false);
      await loadCatalog();
      await triggerRevalidate(token, [`/blog/${selectedSlug}`, '/blog']);
      setStatus(nextStatus === 'published' ? 'Blog published.' : 'Blog saved.');
    } catch (err) {
      setError(err.message);
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = () => {
    const validationError = validate('published');
    if (validationError) { setError(validationError); return; }
    handleSave('published');
  };

  const handleDelete = async () => {
    if (mode === 'create') return;
    if (!window.confirm('Delete this blog post? This cannot be undone.')) return;
    setError('');
    setLoading(true);
    try {
      await adminFetch(`/api/admin/blogs/${selectedSlug}`, { method: 'DELETE', token });
      const merged = await loadCatalog();
      const nextSlug = merged[0]?.slug || '';
      setSelectedSlug(nextSlug);
      setMode(nextSlug ? 'edit' : 'create');
      if (!nextSlug) setForm(EMPTY_FORM);
      await triggerRevalidate(token, ['/blog']);
      setStatus('Blog deleted.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-editor-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar-panel space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="label-text">Blog posts</p>
          <button type="button" className="btn-primary !px-3 !py-1.5 !text-xs" onClick={handleCreateNew}>
            + New blog
          </button>
        </div>
        <div className="admin-blog-list">
          {catalog.map((post) => (
            <button
              key={post.slug}
              type="button"
              className={`admin-blog-list-item ${selectedSlug === post.slug && mode === 'edit' ? 'admin-blog-list-item-active' : ''}`}
              onClick={() => { setMode('edit'); setSelectedSlug(post.slug); }}
            >
              <span className="admin-blog-list-title">{post.title}</span>
              <span className="admin-blog-list-meta">
                {statusLabel(post)}{post.source === 'cms' ? ' · Custom' : ''}
              </span>
            </button>
          ))}
        </div>
        {mode === 'create' && <p className="text-xs text-accent">Creating new blog post</p>}
      </aside>

      {/* Main editor */}
      <div className="admin-editor-main space-y-4">
        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn-primary" onClick={() => handleSave()} disabled={loading}>
            {mode === 'create' ? 'Save draft' : 'Save blog'}
          </button>
          <button type="button" className="btn-secondary" onClick={handlePublish} disabled={loading}>
            Publish
          </button>
          {mode === 'edit' && (
            <button type="button" className="btn-secondary" onClick={handleDelete} disabled={loading}>Delete</button>
          )}
          {autosaveMsg && <span className="ml-auto text-xs text-muted">{autosaveMsg}</span>}
        </div>

        {/* Restore autosave banner */}
        {hasDraft && (
          <div className="flex items-center gap-3 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-subtle)] px-4 py-3 text-sm">
            <span className="flex-1 text-heading">An unsaved draft was found for this post.</span>
            <button type="button" className="btn-primary !py-1.5 !px-3 !text-xs" onClick={restoreDraft}>Restore</button>
            <button type="button" className="btn-secondary !py-1.5 !px-3 !text-xs" onClick={discardDraft}>Discard</button>
          </div>
        )}

        <div className="card space-y-6">
          {/* ── Post Details ── */}
          <FormSection title={mode === 'create' ? 'New blog post' : 'Post details'} description="Main info for this blog post.">
            {mode === 'create' && (
              <Field label="URL slug" hint="Used in /blog/your-slug" className="admin-field-full">
                <input
                  className="input-field"
                  value={form.slug || ''}
                  onChange={(e) => setForm((p) => ({ ...p, slug: slugifyBlogTitle(e.target.value), slugTouched: true }))}
                  placeholder="my-new-blog-post"
                />
              </Field>
            )}
            <Field label="Title *" className="admin-field-full">
              <input className="input-field" value={form.title || ''} onChange={(e) => updateField('title', e.target.value)} />
            </Field>
            <Field label="Excerpt" className="admin-field-full">
              <textarea className="input-field min-h-[90px]" value={form.excerpt || ''} onChange={(e) => updateField('excerpt', e.target.value)} />
            </Field>
            <Field label="Featured image URL" hint="Full URL or relative path." className="admin-field-full">
              <input
                className="input-field"
                value={form.featuredImage || ''}
                onChange={(e) => updateField('featuredImage', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </Field>
            <Field label="Categories *" hint="Select one or more categories. Click to toggle." className="admin-field-full">
              <MultiCategoryPicker
                allCategories={allCategories}
                selected={form.categories || ['Guides']}
                onChange={(cats) => setForm((p) => ({ ...p, categories: cats, category: cats[0] }))}
              />
            </Field>
            <Field label="Author">
              <input className="input-field" value={form.author || ''} onChange={(e) => updateField('author', e.target.value)} />
            </Field>
            <Field label="Read time">
              <input className="input-field" value={form.readTime || ''} onChange={(e) => updateField('readTime', e.target.value)} placeholder="5 min" />
            </Field>
            <Field label="Related tool">
              <select className="input-field" value={form.relatedToolSlug || ''} onChange={(e) => updateField('relatedToolSlug', e.target.value)}>
                <option value="">None</option>
                {tools.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className="input-field" value={form.status || 'draft'} onChange={(e) => updateField('status', e.target.value)}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </Field>
            <Field label="Schedule at" hint="Publish automatically at this date/time.">
              <input
                type="datetime-local"
                className="input-field"
                value={form.scheduledAt ? form.scheduledAt.slice(0, 16) : ''}
                onChange={(e) => updateField('scheduledAt', e.target.value ? new Date(e.target.value).toISOString() : '')}
              />
            </Field>
          </FormSection>

          {/* ── Article body ── */}
          <FormSection title="Article body *" description="Write your blog content using the rich text editor.">
            <Field label="Content" className="admin-field-full">
              <RichTextEditor
                value={form.contentHtml || ''}
                onChange={handleContentChange}
                placeholder="Start writing your blog post..."
              />
            </Field>
          </FormSection>

          {/* ── SEO ── */}
          <FormSection title="SEO" description="Search engine and social sharing settings.">
            <Field label="Meta title" className="admin-field-full">
              <input className="input-field" value={form.metaTitle || ''} onChange={(e) => updateField('metaTitle', e.target.value)} />
            </Field>
            <Field label="Meta description" className="admin-field-full">
              <textarea className="input-field min-h-[80px]" value={form.metaDescription || ''} onChange={(e) => updateField('metaDescription', e.target.value)} />
            </Field>
            <Field label="Keywords" hint="One keyword per line." className="admin-field-full">
              <StringListInput value={form.keywords || []} onChange={(v) => updateField('keywords', v)} />
            </Field>
            <Field label="Canonical URL" hint="Leave blank to use default URL.">
              <input className="input-field" value={form.canonicalUrl || ''} onChange={(e) => updateField('canonicalUrl', e.target.value)} placeholder="https://yoursite.com/blog/..." />
            </Field>
            <Field label="OG Title" hint="Open Graph title for social sharing." className="admin-field-full">
              <input className="input-field" value={form.ogTitle || ''} onChange={(e) => updateField('ogTitle', e.target.value)} />
            </Field>
            <Field label="OG Description" hint="Open Graph description for social sharing." className="admin-field-full">
              <textarea className="input-field min-h-[80px]" value={form.ogDescription || ''} onChange={(e) => updateField('ogDescription', e.target.value)} />
            </Field>
            <Field label="Allow search indexing">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.robotsIndex !== false} onChange={(e) => updateField('robotsIndex', e.target.checked)} />
                Index in search engines
              </label>
            </Field>
          </FormSection>
        </div>

        <StatusBar status={status} error={error} />
      </div>
    </div>
  );
}
