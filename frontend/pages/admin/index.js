import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import { generateToolSeoContent } from '../../utils/seo/contentGenerator';
import { getToolSeoContent } from '../../utils/seo/getToolSeo';
import { tools } from '../../utils/tools';
import { blogPosts } from '../../utils/blogPosts';
import { resolveApiUrl } from '../../utils/apiBase';

const TOKEN_KEY = 'aio_admin_token';

async function adminFetch(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(resolveApiUrl(path), {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': token || ''
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [authed, setAuthed] = useState(false);
  const [contentType, setContentType] = useState('tool');
  const [selectedSlug, setSelectedSlug] = useState(tools[0]?.slug || '');
  const [editorValue, setEditorValue] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const selectedTool = useMemo(() => tools.find((tool) => tool.slug === selectedSlug), [selectedSlug]);
  const selectedPost = useMemo(() => blogPosts.find((post) => post.slug === selectedSlug), [selectedSlug]);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : '';
    if (saved) {
      setToken(saved);
      adminFetch('/api/admin/auth', { method: 'POST', body: { token: saved } })
        .then(() => setAuthed(true))
        .catch(() => localStorage.removeItem(TOKEN_KEY));
    }
  }, []);

  const loadEditor = async (slug, type, authToken = token) => {
    setError('');
    setStatus('Loading...');
    try {
      if (type === 'tool') {
        const tool = tools.find((item) => item.slug === slug);
        const generated = getToolSeoContent(tool);
        const remote = await adminFetch(`/api/admin/content/tools/${slug}`, { token: authToken });
        const merged = getToolSeoContent(tool, remote.content || {});
        setEditorValue(JSON.stringify(merged, null, 2));
      } else {
        const post = blogPosts.find((item) => item.slug === slug);
        const remote = await adminFetch(`/api/admin/content/blogs/${slug}`, { token: authToken });
        const payload = remote.content || {
          title: post.title,
          excerpt: post.excerpt,
          category: post.category,
          scheduledAt: null,
          content: post.content
        };
        setEditorValue(JSON.stringify(payload, null, 2));
      }
      setStatus('Loaded');
    } catch (err) {
      setError(err.message);
      setStatus('');
    }
  };

  const handleLogin = async () => {
    setError('');
    try {
      await adminFetch('/api/admin/auth', { method: 'POST', body: { token } });
      localStorage.setItem(TOKEN_KEY, token);
      setAuthed(true);
      await loadEditor(selectedSlug, contentType, token);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async () => {
    setError('');
    setStatus('Saving...');
    try {
      const payload = JSON.parse(editorValue);
      const path =
        contentType === 'tool'
          ? `/api/admin/content/tools/${selectedSlug}`
          : `/api/admin/content/blogs/${selectedSlug}`;
      await adminFetch(path, { method: 'PUT', body: payload, token });
      setStatus('Saved successfully. Tool pages revalidate within ~60 seconds.');
    } catch (err) {
      setError(err.message);
      setStatus('');
    }
  };

  const handleGenerateDraft = () => {
    if (contentType !== 'tool' || !selectedTool) return;
    const draft = generateToolSeoContent(selectedTool);
    setEditorValue(JSON.stringify(draft, null, 2));
    setStatus('Generated draft from programmatic SEO templates.');
  };

  useEffect(() => {
    if (authed) loadEditor(selectedSlug, contentType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlug, contentType, authed]);

  return (
    <Layout title="Content Admin" noindex canonical="/admin">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="card">
          <h1 className="font-display text-2xl font-bold text-heading">SEO Content Admin</h1>
          <p className="mt-2 text-sm text-muted">
            Edit tool SEO content, blog metadata, FAQs, and overrides. Changes are stored on the backend and merged at page render time.
          </p>
        </header>

        {!authed ? (
          <div className="card space-y-4">
            <label className="block">
              <span className="label-text">Admin token</span>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="input-field"
                placeholder="Enter ADMIN_TOKEN"
              />
            </label>
            {error && <p className="alert-error">{error}</p>}
            <button type="button" className="btn-primary" onClick={handleLogin}>
              Sign in
            </button>
          </div>
        ) : (
          <>
            <div className="card flex flex-wrap gap-2">
              <button
                type="button"
                className={contentType === 'tool' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setContentType('tool')}
              >
                Tools
              </button>
              <button
                type="button"
                className={contentType === 'blog' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setContentType('blog')}
              >
                Blogs
              </button>
            </div>

            <div className="card grid gap-4 lg:grid-cols-[280px_1fr]">
              <div>
                <label className="block">
                  <span className="label-text">{contentType === 'tool' ? 'Tool' : 'Blog post'}</span>
                  <select
                    value={selectedSlug}
                    onChange={(e) => setSelectedSlug(e.target.value)}
                    className="input-field"
                  >
                    {(contentType === 'tool' ? tools : blogPosts).map((item) => (
                      <option key={item.slug} value={item.slug}>
                        {item.name || item.title}
                      </option>
                    ))}
                  </select>
                </label>
                {contentType === 'tool' && selectedTool && (
                  <p className="mt-2 text-xs text-muted">{selectedTool.category}</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn-primary" onClick={handleSave}>
                    Save changes
                  </button>
                  {contentType === 'tool' && (
                    <button type="button" className="btn-secondary" onClick={handleGenerateDraft}>
                      Generate AI/template draft
                    </button>
                  )}
                </div>
                <textarea
                  value={editorValue}
                  onChange={(e) => setEditorValue(e.target.value)}
                  className="input-field min-h-[480px] font-mono text-xs"
                  spellCheck={false}
                />
                {status && <p className="text-sm text-muted">{status}</p>}
                {error && <p className="alert-error">{error}</p>}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
