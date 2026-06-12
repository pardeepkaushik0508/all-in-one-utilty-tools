import { useEffect, useState } from 'react';
import { adminFetch, triggerRevalidate } from '../../utils/adminApi';
import {
  Field,
  FormSection,
  SelectorSidebar,
  StatusBar
} from './AdminFormFields';

const SECTION_FIELD_MAP = {
  hero: [
    { key: 'badge', label: 'Badge', type: 'text' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'titleAccent', label: 'Title accent', type: 'text' },
    { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
    { key: 'primaryButton.label', label: 'Primary button label', type: 'text' },
    { key: 'primaryButton.href', label: 'Primary button link', type: 'text' },
    { key: 'secondaryButton.label', label: 'Secondary button label', type: 'text' },
    { key: 'secondaryButton.href', label: 'Secondary button link', type: 'text' }
  ],
  ctaBanner: [
    { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'primaryButton.label', label: 'Primary button label', type: 'text' },
    { key: 'primaryButton.href', label: 'Primary button link', type: 'text' },
    { key: 'secondaryButton.label', label: 'Secondary button label', type: 'text' },
    { key: 'secondaryButton.href', label: 'Secondary button link', type: 'text' }
  ],
  header: [
    { key: 'badge', label: 'Badge', type: 'text' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'titleAccent', label: 'Title accent', type: 'text' },
    { key: 'subtitle', label: 'Subtitle', type: 'textarea' }
  ],
  form: [{ key: 'submitLabel', label: 'Submit button label', type: 'text' }],
  toolsSection: [
    { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
    { key: 'title', label: 'Title', type: 'text' }
  ],
  blogSection: [
    { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
    { key: 'title', label: 'Title', type: 'text' }
  ],
  featuredTools: [
    { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
    { key: 'title', label: 'Title', type: 'text' }
  ],
  brand: [
    { key: 'title', label: 'Brand title', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'statusText', label: 'Status text', type: 'text' }
  ]
};

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const next = { ...obj };
  let cursor = next;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      cursor[key] = value;
      return;
    }
    cursor[key] = { ...(cursor[key] || {}) };
    cursor = cursor[key];
  });
  return next;
}

function SectionField({ field, value, onChange }) {
  if (field.type === 'textarea') {
    return (
      <textarea
        className="input-field min-h-[90px]"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  return <input className="input-field" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
}

export default function ContentManager({ token }) {
  const [pages, setPages] = useState([]);
  const [selectedId, setSelectedId] = useState('home');
  const [page, setPage] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const loadPages = async () => {
    const data = await adminFetch('/api/admin/pages', { token });
    setPages(data.pages || []);
  };

  const loadPage = async (id) => {
    setError('');
    setStatus('Loading...');
    try {
      const data = await adminFetch(`/api/admin/pages/${id}`, { token });
      setPage(data.page);
      setStatus('Loaded');
    } catch (err) {
      setError(err.message);
      setStatus('');
    }
  };

  useEffect(() => {
    loadPages().then(() => loadPage(selectedId)).catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedId) loadPage(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const updatePage = (patch) => setPage((prev) => ({ ...prev, ...patch }));

  const updateSeo = (key, value) => {
    setPage((prev) => ({
      ...prev,
      seo: { ...(prev.seo || {}), [key]: value }
    }));
  };

  const updateSection = (sectionId, patch) => {
    setPage((prev) => ({
      ...prev,
      sections: (prev.sections || []).map((section) =>
        section.id === sectionId ? { ...section, ...patch } : section
      )
    }));
  };

  const updateSectionContent = (sectionId, key, value) => {
    setPage((prev) => ({
      ...prev,
      sections: (prev.sections || []).map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          content: setNestedValue(section.content || {}, key, value)
        };
      })
    }));
  };

  const handleSave = async () => {
    if (!page) return;
    setError('');
    setStatus('Saving...');
    try {
      await adminFetch(`/api/admin/pages/${selectedId}`, { method: 'PUT', body: page, token });
      await triggerRevalidate(token, ['/', '/about', '/contact']);
      setStatus('Saved and revalidation triggered.');
      await loadPages();
    } catch (err) {
      setError(err.message);
      setStatus('');
    }
  };

  const handleRestore = async (revisionId) => {
    setError('');
    try {
      const data = await adminFetch(`/api/admin/pages/${selectedId}/restore/${revisionId}`, { method: 'POST', token });
      setPage(data.page);
      setStatus('Revision restored.');
    } catch (err) {
      setError(err.message);
    }
  };

  if (!page) {
    return <p className="text-sm text-muted">Loading page...</p>;
  }

  return (
    <div className="admin-editor-layout">
      <SelectorSidebar
        label="Page"
        value={selectedId}
        onChange={setSelectedId}
        options={pages.map((item) => ({ value: item.id, label: `${item.title} (${item.status})` }))}
        meta={
          <div className="space-y-2">
            <p className="text-xs text-muted">Slug: {page.slug}</p>
            {page.revisions?.length > 0 && (
              <div>
                <p className="label-text mb-2">Revisions</p>
                <ul className="space-y-1">
                  {page.revisions.slice(0, 5).map((rev) => (
                    <li key={rev.id}>
                      <button type="button" className="text-xs text-accent hover:underline" onClick={() => handleRestore(rev.id)}>
                        Restore {new Date(rev.savedAt).toLocaleString()}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        }
      />

      <div className="admin-editor-main space-y-4">
        <button type="button" className="btn-primary" onClick={handleSave}>Save page</button>

        <div className="card space-y-6">
          <FormSection title="Page settings">
            <Field label="Title">
              <input className="input-field" value={page.title || ''} onChange={(e) => updatePage({ title: e.target.value })} />
            </Field>
            <Field label="Slug">
              <input className="input-field" value={page.slug || ''} onChange={(e) => updatePage({ slug: e.target.value })} />
            </Field>
            <Field label="Status">
              <select className="input-field" value={page.status || 'published'} onChange={(e) => updatePage({ status: e.target.value })}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </Field>
            <Field label="Schedule at">
              <input
                type="datetime-local"
                className="input-field"
                value={page.scheduledAt ? page.scheduledAt.slice(0, 16) : ''}
                onChange={(e) => updatePage({ scheduledAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
              />
            </Field>
          </FormSection>

          <FormSection title="SEO">
            <Field label="Meta title" className="admin-field-full">
              <input className="input-field" value={page.seo?.metaTitle || ''} onChange={(e) => updateSeo('metaTitle', e.target.value)} />
            </Field>
            <Field label="Meta description" className="admin-field-full">
              <textarea className="input-field min-h-[90px]" value={page.seo?.metaDescription || ''} onChange={(e) => updateSeo('metaDescription', e.target.value)} />
            </Field>
            <Field label="Canonical URL">
              <input className="input-field" value={page.seo?.canonicalUrl || ''} onChange={(e) => updateSeo('canonicalUrl', e.target.value)} />
            </Field>
            <Field label="Open Graph title" className="admin-field-full">
              <input className="input-field" value={page.seo?.ogTitle || ''} onChange={(e) => updateSeo('ogTitle', e.target.value)} />
            </Field>
            <Field label="Open Graph description" className="admin-field-full">
              <textarea className="input-field min-h-[90px]" value={page.seo?.ogDescription || ''} onChange={(e) => updateSeo('ogDescription', e.target.value)} />
            </Field>
            <Field label="Allow search indexing">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={page.seo?.robotsIndex !== false}
                  onChange={(e) => updateSeo('robotsIndex', e.target.checked)}
                />
                Index in search engines
              </label>
            </Field>
          </FormSection>

          <FormSection title="Page sections" description="Enable sections and edit their content.">
            {(page.sections || []).map((section) => {
              const fields = SECTION_FIELD_MAP[section.id] || [];
              return (
                <div key={section.id} className="admin-section-card">
                  <div className="admin-section-head">
                    <div>
                      <p className="font-medium text-heading">{section.name || section.id}</p>
                      <p className="text-xs text-muted">Order: {section.order ?? 0}</p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={section.enabled !== false}
                        onChange={(e) => updateSection(section.id, { enabled: e.target.checked })}
                      />
                      Enabled
                    </label>
                  </div>

                  {fields.length > 0 ? (
                    <div className="admin-form-grid mt-3">
                      {fields.map((field) => (
                        <Field key={field.key} label={field.label} className={field.type === 'textarea' ? 'admin-field-full' : ''}>
                          <SectionField
                            field={field}
                            value={getNestedValue(section.content, field.key)}
                            onChange={(value) => updateSectionContent(section.id, field.key, value)}
                          />
                        </Field>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-muted">This section uses default layout content.</p>
                  )}
                </div>
              );
            })}
          </FormSection>
        </div>

        <StatusBar status={status} error={error} />
      </div>
    </div>
  );
}
