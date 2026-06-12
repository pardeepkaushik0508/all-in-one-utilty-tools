import { useEffect, useState } from 'react';
import { generateToolSeoContent } from '../../utils/seo/contentGenerator';
import { getToolSeoContent } from '../../utils/seo/getToolSeo';
import { adminFetch, triggerRevalidate } from '../../utils/adminApi';
import { tools } from '../../utils/tools';
import {
  FaqListEditor,
  FeatureListEditor,
  Field,
  FormSection,
  ParagraphListInput,
  SelectorSidebar,
  StatusBar,
  StepListEditor,
  StringListInput
} from './AdminFormFields';

const EMPTY_SEO = {
  metaTitle: '',
  metaDescription: '',
  ogTitle: '',
  ogDescription: '',
  keywords: [],
  overview: [],
  features: [],
  howItWorks: [],
  useCases: [],
  benefits: [],
  faqs: []
};

export default function ToolSeoEditor({ token }) {
  const [selectedSlug, setSelectedSlug] = useState(tools[0]?.slug || '');
  const [form, setForm] = useState(EMPTY_SEO);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedTool = tools.find((tool) => tool.slug === selectedSlug);

  const loadEditor = async (slug) => {
    if (!slug) return;
    setError('');
    setStatus('Loading...');
    setLoading(true);
    try {
      const tool = tools.find((item) => item.slug === slug);
      if (!tool) throw new Error('Tool not found.');
      const remote = await adminFetch(`/api/admin/content/tools/${slug}`, { token });
      const merged = getToolSeoContent(tool, remote.content || {}) || EMPTY_SEO;
      setForm({
        ...EMPTY_SEO,
        ...merged,
        keywords: merged.keywords || [],
        overview: merged.overview || [],
        features: merged.features || [],
        howItWorks: merged.howItWorks || [],
        useCases: merged.useCases || [],
        benefits: merged.benefits || [],
        faqs: merged.faqs || []
      });
      setStatus('Loaded');
    } catch (err) {
      setError(err.message);
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEditor(selectedSlug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlug]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setError('');
    setStatus('Saving...');
    try {
      await adminFetch(`/api/admin/content/tools/${selectedSlug}`, { method: 'PUT', body: form, token });
      await triggerRevalidate(token, [`/tool/${selectedSlug}`]);
      setStatus('Saved successfully.');
    } catch (err) {
      setError(err.message);
      setStatus('');
    }
  };

  const handleGenerateDraft = () => {
    if (!selectedTool) return;
    const draft = generateToolSeoContent(selectedTool);
    setForm({ ...EMPTY_SEO, ...draft });
    setStatus('Generated draft from programmatic SEO templates.');
  };

  return (
    <div className="admin-editor-layout">
      <SelectorSidebar
        label="Tool"
        value={selectedSlug}
        onChange={setSelectedSlug}
        options={tools.map((tool) => ({ value: tool.slug, label: tool.name }))}
        meta={selectedTool && <p className="text-xs text-muted">{selectedTool.category}</p>}
      />

      <div className="admin-editor-main space-y-4">
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-primary" onClick={handleSave} disabled={loading}>
            Save changes
          </button>
          <button type="button" className="btn-secondary" onClick={handleGenerateDraft} disabled={loading}>
            Generate template draft
          </button>
        </div>

        <div className="card space-y-6">
          <FormSection title="SEO meta" description="Search engine and social preview settings.">
            <Field label="Meta title" className="admin-field-full">
              <input className="input-field" value={form.metaTitle || ''} onChange={(e) => updateField('metaTitle', e.target.value)} />
            </Field>
            <Field label="Meta description" className="admin-field-full">
              <textarea className="input-field min-h-[90px]" value={form.metaDescription || ''} onChange={(e) => updateField('metaDescription', e.target.value)} />
            </Field>
            <Field label="Open Graph title" className="admin-field-full">
              <input className="input-field" value={form.ogTitle || ''} onChange={(e) => updateField('ogTitle', e.target.value)} />
            </Field>
            <Field label="Open Graph description" className="admin-field-full">
              <textarea className="input-field min-h-[90px]" value={form.ogDescription || ''} onChange={(e) => updateField('ogDescription', e.target.value)} />
            </Field>
            <Field label="Keywords" hint="One keyword per line." className="admin-field-full">
              <StringListInput value={form.keywords} onChange={(value) => updateField('keywords', value)} />
            </Field>
          </FormSection>

          <FormSection title="Overview" description="Long-form SEO paragraphs shown on the tool page.">
            <Field label="Overview paragraphs" hint="Separate paragraphs with a blank line." className="admin-field-full">
              <ParagraphListInput value={form.overview} onChange={(value) => updateField('overview', value)} />
            </Field>
          </FormSection>

          <FormSection title="Features">
            <Field label="Feature list" className="admin-field-full">
              <FeatureListEditor value={form.features} onChange={(value) => updateField('features', value)} />
            </Field>
          </FormSection>

          <FormSection title="How it works">
            <div className="admin-field-full">
              <StepListEditor value={form.howItWorks} onChange={(value) => updateField('howItWorks', value)} />
            </div>
          </FormSection>

          <FormSection title="Use cases & benefits">
            <Field label="Use cases" hint="One per line." className="admin-field-full">
              <StringListInput value={form.useCases} onChange={(value) => updateField('useCases', value)} />
            </Field>
            <Field label="Benefits" hint="One per line." className="admin-field-full">
              <StringListInput value={form.benefits} onChange={(value) => updateField('benefits', value)} />
            </Field>
          </FormSection>

          <FormSection title="FAQs">
            <div className="admin-field-full">
              <FaqListEditor value={form.faqs} onChange={(value) => updateField('faqs', value)} />
            </div>
          </FormSection>
        </div>

        <StatusBar status={status} error={error} />
      </div>
    </div>
  );
}
