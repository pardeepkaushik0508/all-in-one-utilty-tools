import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { blogPosts } from '../../utils/blogPosts';
import { mergeBlogCatalog, slugifyBlogTitle } from '../../utils/cms/blogPosts';
import { adminFetch, triggerRevalidate } from '../../utils/adminApi';
import { tools } from '../../utils/tools';
import {
  Field,
  FormSection,
  StatusBar,
  StringListInput
} from './AdminFormFields';
import CategoryManager from './CategoryManager';

// Load TipTap editor client-side only (no SSR)
const RichTextEditor = dynamic(() => import('./RichTextEditor'), { ssr: false });

const EMPTY_FORM = {
  slug: '',
  title: '',
  excerpt: '',
  category: 'Guides',
  author: 'UtilityTools Team',
  readTime: '5 min',
  relatedToolSlug: '',
  status: 'draft',
  scheduledAt: '',
  metaTitle: '',
  metaDescription: '',
  keywords: [],
  robotsIndex: true,
  content: '',
  contentHtml: ''
};

/**
 * Convert legacy string[] content to HTML for the editor.
 */
function contentToHtml(content) {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter(Boolean)
      .map((para) => `<p>${para.replace(/\n/g, '<br>')}</p>`)
      .join('\n');
  }
  return '';
}

function buildDefaultBlogForm(post, cmsRecord = null) {
  const base = post || {};
  const merged = cmsRecord ? { ...base, ...cmsRecord } : base;
  const rawContent = merged.content || [];
  const html = contentToHtml(rawContent);
  return {
    slug: merged.slug || '',
    title: merged.title || '',
    excerpt: merged.excerpt || '',
    category: merged.category || 'Guides',
    author: merged.author || 'UtilityTools Team',
    readTime: merged.readTime || '5 min',
    relatedToolSlug: merged.relatedToolSlug || '',
    status: merged.status || (post ? 'published' : 'draft'),
    scheduledAt: merged.scheduledAt || '',
    metaTitle: merged.metaTitle || merged.title || '',
    metaDescription: merged.metaDescription || merged.excerpt || '',
    keywords: merged.keywords || [],
    robotsIndex: merged.robotsIndex !== false,
    // Store both: html for editor display, content for save payload
    contentHtml: html,
    content: rawContent,
    source: merged.source || (post ? 'static' : 'cms')
  };
}

function statusLabel(post) {
  if (post.status === 'draft') return 'Draft';
  if (post.status === 'scheduled') return 'Scheduled';
  if (post.source === 'cms') return 'Custom';
  return 'Published';
}

export default function BlogManager({ token }) {
  const [catalog, setCatalog] = useState([]);
  const [mode, setMode] = useState('edit');
  const [selectedSlug, setSelectedSlug] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedEntry = useMemo(
    () => catalog.find((post) => post.slug === selectedSlug),
    [catalog, selectedSlug]
  );

  const loadCatalog = useCallback(async () => {
    const data = await adminFetch('/api/admin/blogs', { token });
    const cmsPosts = data.blogs || [];
    const merged = mergeBlogCatalog(blogPosts, cmsPosts, { includeDrafts: true }).map((post) => {
      const cms = cmsPosts.find((item) => item.slug === post.slug) || {};
      return { ...post, ...cms, source: cms.source || post.source || 'static' };
    });

    cmsPosts
      .filter((post) => post.source === 'cms' && !merged.find((item) => item.slug === post.slug))
      .forEach((post) => merged.unshift({ ...post, source: 'cms' }));

    setCatalog(merged.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)));
    return merged;
  }, [token]);

  const loadEditor = useCallback(async (slug) => {
    if (!slug) return;
    const post = blogPosts.find((item) => item.slug === slug) || null;
    setError('');
    setStatus('Loading...');
    setLoading(true);
    try {
      const remote = await adminFetch(`/api/admin/content/blogs/${slug}`, { token });
      setForm(buildDefaultBlogForm(post, remote.content));
      setMode('edit');
      setStatus('Loaded');
    } catch (err) {
      setError(err.message);
      setStatus('');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCatalog()
      .then((merged) => {
        setSelectedSlug((current) => current || merged[0]?.slug || '');
      })
      .catch((err) => setError(err.message));
  }, [loadCatalog]);

  useEffect(() => {
    if (mode === 'edit' && selectedSlug) loadEditor(selectedSlug);
  }, [selectedSlug, mode, loadEditor]);

  const updateField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'title' && mode === 'create' && !prev.slugTouched) {
        next.slug = slugifyBlogTitle(value);
        next.metaTitle = next.metaTitle || value;
      }
      if (key === 'excerpt' && mode === 'create' && !prev.metaDescription) {
        next.metaDescription = value;
      }
      return next;
    });
  };

  const handleSlugChange = (value) => {
    setForm((prev) => ({ ...prev, slug: slugifyBlogTitle(value), slugTouched: true }));
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
  };

  const handleSave = async (nextStatus = null) => {
    setError('');
    setStatus('Saving...');
    setLoading(true);
    try {
      const payload = {
        ...form,
        status: nextStatus || form.status,
        date: form.date || new Date().toISOString().slice(0, 10),
        // Send HTML string as content; backend stores it
        content: form.contentHtml || form.content || ''
      };
      // Remove internal-only key
      delete payload.contentHtml;

      if (mode === 'create') {
        const created = await adminFetch('/api/admin/blogs', { method: 'POST', body: payload, token });
        const slug = created.blog.slug;
        setSelectedSlug(slug);
        setMode('edit');
        await loadCatalog();
        await triggerRevalidate(token, ['/blog', `/blog/${slug}`]);
        setStatus(nextStatus === 'published' ? 'Blog published successfully.' : 'Blog created successfully.');
        return;
      }

      await adminFetch(`/api/admin/content/blogs/${selectedSlug}`, { method: 'PUT', body: payload, token });
      await loadCatalog();
      await triggerRevalidate(token, [`/blog/${selectedSlug}`, '/blog']);
      setStatus(nextStatus === 'published' ? 'Blog published successfully.' : 'Blog saved successfully.');
    } catch (err) {
      setError(err.message);
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = () => handleSave('published');

  const handleDelete = async () => {
    if (mode === 'create' || form.source !== 'cms') return;
    if (!window.confirm('Delete this custom blog post? This cannot be undone.')) return;
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

  const handleReset = () => {
    const post = blogPosts.find((item) => item.slug === selectedSlug);
    if (!post) return;
    setForm(buildDefaultBlogForm(post));
    setStatus('Reset to default blog content.');
  };

  return (
    <div className="admin-editor-layout">
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
              onClick={() => {
                setMode('edit');
                setSelectedSlug(post.slug);
              }}
            >
              <span className="admin-blog-list-title">{post.title}</span>
              <span className="admin-blog-list-meta">
                {statusLabel(post)}
                {post.source === 'cms' ? ' · Custom' : ''}
              </span>
            </button>
          ))}
        </div>

        {mode === 'create' && (
          <p className="text-xs text-accent">Creating new blog post</p>
        )}
      </aside>

      <div className="admin-editor-main space-y-4">
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-primary" onClick={() => handleSave()} disabled={loading}>
            {mode === 'create' ? 'Save draft' : 'Save blog'}
          </button>
          <button type="button" className="btn-secondary" onClick={handlePublish} disabled={loading}>
            Publish
          </button>
          {mode === 'edit' && form.source === 'static' && (
            <button type="button" className="btn-secondary" onClick={handleReset} disabled={loading}>
              Reset to default
            </button>
          )}
          {mode === 'edit' && form.source === 'cms' && (
            <button type="button" className="btn-secondary" onClick={handleDelete} disabled={loading}>
              Delete blog
            </button>
          )}
        </div>

        <div className="card space-y-6">
          <FormSection title={mode === 'create' ? 'New blog post' : 'Post details'} description="Main blog content shown on the article page.">
            {mode === 'create' && (
              <Field label="URL slug" hint="Used in /blog/your-slug" className="admin-field-full">
                <input
                  className="input-field"
                  value={form.slug || ''}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="my-new-blog-post"
                />
              </Field>
            )}
            <Field label="Title" className="admin-field-full">
              <input
                className="input-field"
                value={form.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
              />
            </Field>
            <Field label="Excerpt" className="admin-field-full">
              <textarea
                className="input-field min-h-[90px]"
                value={form.excerpt || ''}
                onChange={(e) => updateField('excerpt', e.target.value)}
              />
            </Field>

            {/* Category with create option */}
            <Field label="Category" hint="Select an existing category or create a new one.">
              <CategoryManager
                token={token}
                value={form.category}
                onChange={(val) => updateField('category', val)}
              />
            </Field>

            <Field label="Author">
              <input
                className="input-field"
                value={form.author || ''}
                onChange={(e) => updateField('author', e.target.value)}
              />
            </Field>
            <Field label="Read time">
              <input
                className="input-field"
                value={form.readTime || ''}
                onChange={(e) => updateField('readTime', e.target.value)}
                placeholder="e.g. 5 min"
              />
            </Field>
            <Field label="Related tool">
              <select
                className="input-field"
                value={form.relatedToolSlug || ''}
                onChange={(e) => updateField('relatedToolSlug', e.target.value)}
              >
                <option value="">None</option>
                {tools.map((tool) => (
                  <option key={tool.slug} value={tool.slug}>{tool.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                className="input-field"
                value={form.status || 'draft'}
                onChange={(e) => updateField('status', e.target.value)}
              >
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
                onChange={(e) =>
                  updateField('scheduledAt', e.target.value ? new Date(e.target.value).toISOString() : '')
                }
              />
            </Field>
          </FormSection>

          {/* Rich text body */}
          <FormSection title="Article body" description="Write your blog content using the rich text editor below.">
            <Field label="Content" className="admin-field-full">
              <RichTextEditor
                value={form.contentHtml || ''}
                onChange={handleContentChange}
                placeholder="Start writing your blog post..."
              />
            </Field>
          </FormSection>

          <FormSection title="SEO" description="Search engine settings for this blog post.">
            <Field label="Meta title" className="admin-field-full">
              <input
                className="input-field"
                value={form.metaTitle || ''}
                onChange={(e) => updateField('metaTitle', e.target.value)}
              />
            </Field>
            <Field label="Meta description" className="admin-field-full">
              <textarea
                className="input-field min-h-[90px]"
                value={form.metaDescription || ''}
                onChange={(e) => updateField('metaDescription', e.target.value)}
              />
            </Field>
            <Field label="Keywords" hint="One keyword per line." className="admin-field-full">
              <StringListInput
                value={form.keywords || []}
                onChange={(value) => updateField('keywords', value)}
              />
            </Field>
            <Field label="Allow search indexing">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.robotsIndex !== false}
                  onChange={(e) => updateField('robotsIndex', e.target.checked)}
                />
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
