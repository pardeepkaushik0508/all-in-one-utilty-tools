export function FormSection({ title, description, children }) {
  return (
    <section className="admin-form-section">
      {title && <h3 className="admin-form-section-title">{title}</h3>}
      {description && <p className="admin-form-section-desc">{description}</p>}
      <div className="admin-form-grid">{children}</div>
    </section>
  );
}

export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`admin-field ${className}`}>
      {label && <span className="label-text">{label}</span>}
      {children}
      {hint && <span className="admin-field-hint">{hint}</span>}
    </label>
  );
}

export function StringListInput({ value = [], onChange, placeholder = 'One item per line' }) {
  const text = Array.isArray(value) ? value.join('\n') : '';
  return (
    <textarea
      className="input-field min-h-[120px]"
      value={text}
      placeholder={placeholder}
      onChange={(e) => {
        const items = e.target.value
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean);
        onChange(items);
      }}
    />
  );
}

export function ParagraphListInput({ value = [], onChange, placeholder = 'Separate paragraphs with a blank line' }) {
  const text = Array.isArray(value) ? value.join('\n\n') : '';
  return (
    <textarea
      className="input-field min-h-[200px]"
      value={text}
      placeholder={placeholder}
      onChange={(e) => {
        const items = e.target.value
          .split(/\n\s*\n/)
          .map((block) => block.trim())
          .filter(Boolean);
        onChange(items);
      }}
    />
  );
}

export function StepListEditor({ value = [], onChange }) {
  const items = value.length ? value : [{ title: '', description: '' }];

  const updateItem = (index, patch) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const addItem = () => onChange([...items, { title: '', description: '' }]);
  const removeItem = (index) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className="admin-list-editor">
      {items.map((item, index) => (
        <div key={index} className="admin-list-item">
          <Field label={`Step ${index + 1} title`}>
            <input
              className="input-field"
              value={item.title || ''}
              onChange={(e) => updateItem(index, { title: e.target.value })}
            />
          </Field>
          <Field label="Description">
            <textarea
              className="input-field min-h-[80px]"
              value={item.description || ''}
              onChange={(e) => updateItem(index, { description: e.target.value })}
            />
          </Field>
          <button type="button" className="btn-secondary !text-xs" onClick={() => removeItem(index)}>
            Remove step
          </button>
        </div>
      ))}
      <button type="button" className="btn-secondary !text-xs" onClick={addItem}>
        Add step
      </button>
    </div>
  );
}

export function FaqListEditor({ value = [], onChange }) {
  const items = value.length ? value : [{ question: '', answer: '' }];

  const updateItem = (index, patch) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const addItem = () => onChange([...items, { question: '', answer: '' }]);
  const removeItem = (index) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className="admin-list-editor">
      {items.map((item, index) => (
        <div key={index} className="admin-list-item">
          <Field label={`Question ${index + 1}`}>
            <input
              className="input-field"
              value={item.question || ''}
              onChange={(e) => updateItem(index, { question: e.target.value })}
            />
          </Field>
          <Field label="Answer">
            <textarea
              className="input-field min-h-[80px]"
              value={item.answer || ''}
              onChange={(e) => updateItem(index, { answer: e.target.value })}
            />
          </Field>
          <button type="button" className="btn-secondary !text-xs" onClick={() => removeItem(index)}>
            Remove FAQ
          </button>
        </div>
      ))}
      <button type="button" className="btn-secondary !text-xs" onClick={addItem}>
        Add FAQ
      </button>
    </div>
  );
}

export function FeatureListEditor({ value = [], onChange }) {
  const items = value.length ? [...value] : [''];

  const updateItem = (index, text) => {
    const next = [...items];
    next[index] = text;
    onChange(next.filter(Boolean));
  };

  const addItem = () => onChange([...items, '']);
  const removeItem = (index) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className="admin-list-editor">
      {items.map((item, index) => (
        <div key={index} className="admin-inline-row">
          <input
            className="input-field"
            value={item}
            placeholder={`Feature ${index + 1}`}
            onChange={(e) => updateItem(index, e.target.value)}
          />
          <button type="button" className="btn-secondary !text-xs" onClick={() => removeItem(index)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" className="btn-secondary !text-xs" onClick={addItem}>
        Add feature
      </button>
    </div>
  );
}

export function SelectorSidebar({ label, value, onChange, options, meta }) {
  return (
    <div className="admin-sidebar-panel space-y-3">
      <Field label={label}>
        <select value={value} onChange={(e) => onChange(e.target.value)} className="input-field">
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>
      {meta}
    </div>
  );
}

export function StatusBar({ status, error }) {
  return (
    <>
      {status && <p className="text-sm text-muted">{status}</p>}
      {error && <p className="alert-error">{error}</p>}
    </>
  );
}
