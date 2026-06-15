import { useCallback, useEffect, useState } from 'react';
import { adminFetch } from '../../utils/adminApi';
import { Field, FormSection, StatusBar } from './AdminFormFields';

const DEFAULT_SLUGS = ['pdf-tools', 'image-tools', 'video-audio', 'text-ai', 'developer', 'security', 'guides'];

function slugify(name = '') {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const EMPTY_FORM = { name: '', slug: '', description: '', status: 'active' };

export default function BlogCategoryManager({ token }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingSlug, setEditingSlug] = useState(null); // null = create mode
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const data = await adminFetch('/api/admin/blog-categories', { token });
      setCategories(data.categories || []);
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const updateField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-generate slug from name if slug not manually touched
      if (key === 'name' && !prev.slugTouched) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const startCreate = () => {
    setEditingSlug(null);
    setForm(EMPTY_FORM);
    setError('');
    setStatus('');
  };

  const startEdit = (cat) => {
    if (DEFAULT_SLUGS.includes(cat.slug)) return; // built-in, no edit
    setEditingSlug(cat.slug);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', status: cat.status || 'active', slugTouched: true });
    setError('');
    setStatus('');
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Category name is required.'); return; }
    setError('');
    setStatus('Saving...');
    setLoading(true);
    try {
      if (editingSlug) {
        await adminFetch(`/api/admin/blog-categories/${encodeURIComponent(editingSlug)}`, {
          method: 'PUT', body: { name: form.name, description: form.description, status: form.status }, token
        });
        setStatus('Category updated.');
      } else {
        await adminFetch('/api/admin/blog-categories', {
          method: 'POST', body: { name: form.name, slug: form.slug, description: form.description, status: form.status }, token
        });
        setStatus('Category created.');
        setForm(EMPTY_FORM);
        setEditingSlug(null);
      }
      await loadCategories();
    } catch (err) {
      setError(err.message);
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug, name) => {
    if (DEFAULT_SLUGS.includes(slug)) return;
    if (!window.confirm(`Delete category "${name}"? Existing posts keep their category value.`)) return;
    setError('');
    setLoading(true);
    try {
      await adminFetch(`/api/admin/blog-categories/${encodeURIComponent(slug)}`, { method: 'DELETE', token });
      await loadCategories();
      if (editingSlug === slug) { setEditingSlug(null); setForm(EMPTY_FORM); }
      setStatus(`Deleted "${name}".`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (cat) => {
    if (DEFAULT_SLUGS.includes(cat.slug)) return;
    const next = cat.status === 'active' ? 'inactive' : 'active';
    try {
      await adminFetch(`/api/admin/blog-categories/${encodeURIComponent(cat.slug)}`, {
        method: 'PUT', body: { name: cat.name, description: cat.description, status: next }, token
      });
      await loadCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const isDefault = (slug) => DEFAULT_SLUGS.includes(slug);

  return (
    <div className="admin-editor-layout">
      {/* Sidebar: category list */}
      <aside className="admin-sidebar-panel space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="label-text">Categories</p>
          <button type="button" className="btn-primary !px-3 !py-1.5 !text-xs" onClick={startCreate}>
            + New
          </button>
        </div>

        <div className="admin-blog-list">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              className={`admin-blog-list-item ${editingSlug === cat.slug ? 'admin-blog-list-item-active' : ''}`}
              onClick={() => startEdit(cat)}
              disabled={isDefault(cat.slug)}
            >
              <span className="admin-blog-list-title flex items-center gap-1.5">
                {cat.name}
                {isDefault(cat.slug) && (
                  <span className="text-[10px] font-normal text-muted">(built-in)</span>
                )}
              </span>
              <span className="admin-blog-list-meta flex items-center gap-2">
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${cat.status === 'inactive' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                {cat.status === 'inactive' ? 'Inactive' : 'Active'}
                {cat.slug && <span className="opacity-50">· /{cat.slug}</span>}
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main: create / edit form */}
      <div className="admin-editor-main space-y-4">
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-primary" onClick={handleSave} disabled={loading || (editingSlug && isDefault(editingSlug))}>
            {editingSlug ? 'Update category' : 'Create category'}
          </button>
          {editingSlug && (
            <button type="button" className="btn-secondary" onClick={startCreate}>
              New category
            </button>
          )}
        </div>

        <div className="card space-y-6">
          <FormSection
            title={editingSlug ? 'Edit category' : 'New category'}
            description={editingSlug ? 'Update the category details. Built-in categories cannot be edited.' : 'Create a new blog category.'}
          >
            <Field label="Category name *" className="admin-field-full">
              <input
                className="input-field"
                value={form.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g. Tutorials"
                disabled={editingSlug && isDefault(editingSlug)}
              />
            </Field>

            {!editingSlug && (
              <Field label="Slug" hint="Auto-generated from name. Used in URLs.">
                <input
                  className="input-field"
                  value={form.slug || ''}
                  onChange={(e) => setForm((p) => ({ ...p, slug: slugify(e.target.value), slugTouched: true }))}
                  placeholder="e.g. tutorials"
                />
              </Field>
            )}

            <Field label="Description" hint="Optional — shown in category listings." className="admin-field-full">
              <textarea
                className="input-field min-h-[80px]"
                value={form.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="What this category covers..."
                disabled={editingSlug && isDefault(editingSlug)}
              />
            </Field>

            <Field label="Status">
              <select
                className="input-field"
                value={form.status || 'active'}
                onChange={(e) => updateField('status', e.target.value)}
                disabled={editingSlug && isDefault(editingSlug)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
          </FormSection>

          {/* Categories table */}
          <FormSection title="All categories" description="Manage, enable/disable, or delete custom categories.">
            <div className="admin-field-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="pb-2 pr-4 text-xs font-semibold uppercase tracking-wider text-muted">Name</th>
                    <th className="pb-2 pr-4 text-xs font-semibold uppercase tracking-wider text-muted">Slug</th>
                    <th className="pb-2 pr-4 text-xs font-semibold uppercase tracking-wider text-muted">Status</th>
                    <th className="pb-2 text-xs font-semibold uppercase tracking-wider text-muted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.slug} className="border-t border-theme">
                      <td className="py-2.5 pr-4">
                        <span className="font-medium text-heading">{cat.name}</span>
                        {isDefault(cat.slug) && <span className="ml-2 text-[10px] text-muted">(built-in)</span>}
                        {cat.description && <p className="text-xs text-muted line-clamp-1 max-w-[180px]">{cat.description}</p>}
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-xs text-muted">{cat.slug}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${cat.status === 'inactive' ? 'bg-yellow-400/10 text-yellow-500' : 'bg-green-400/10 text-green-500'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${cat.status === 'inactive' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                          {cat.status === 'inactive' ? 'Inactive' : 'Active'}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          {!isDefault(cat.slug) && (
                            <>
                              <button
                                type="button"
                                className="btn-secondary !py-1 !px-2.5 !text-xs"
                                onClick={() => startEdit(cat)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn-secondary !py-1 !px-2.5 !text-xs"
                                onClick={() => toggleStatus(cat)}
                                title={cat.status === 'active' ? 'Disable' : 'Enable'}
                              >
                                {cat.status === 'active' ? 'Disable' : 'Enable'}
                              </button>
                              <button
                                type="button"
                                className="btn-secondary !py-1 !px-2.5 !text-xs !text-red-400 hover:!text-red-500"
                                onClick={() => handleDelete(cat.slug, cat.name)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                          {isDefault(cat.slug) && (
                            <span className="text-xs text-muted">Read-only</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FormSection>
        </div>

        <StatusBar status={status} error={error} />
      </div>
    </div>
  );
}
