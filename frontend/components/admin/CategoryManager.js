import { useState, useEffect, useCallback } from 'react';
import { adminFetch } from '../../utils/adminApi';

const DEFAULT_CATEGORIES = ['PDF Tools', 'Image Tools', 'Video & Audio', 'Text & AI', 'Developer', 'Security', 'Guides'];

/**
 * CategoryManager — inline component for managing blog categories.
 *
 * Props:
 *   token         — admin token
 *   value         — currently selected category (string)
 *   onChange      — called with new category string when selection changes
 *   onCategoriesChange — optional, called with full categories array after add/delete
 */
export default function CategoryManager({ token, value, onChange, onCategoriesChange }) {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [newCat, setNewCat] = useState('');
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState('');

  const loadCategories = useCallback(async () => {
    try {
      const data = await adminFetch('/api/admin/blog-categories', { token });
      setCategories(data.categories || DEFAULT_CATEGORIES);
      if (onCategoriesChange) onCategoriesChange(data.categories || DEFAULT_CATEGORIES);
    } catch {
      // fall back to defaults silently
    }
  }, [token, onCategoriesChange]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleAdd = async () => {
    const trimmed = newCat.trim();
    if (!trimmed) return;
    setError('');
    setAdding(true);
    try {
      await adminFetch('/api/admin/blog-categories', { method: 'POST', body: { name: trimmed }, token });
      setNewCat('');
      setShowAdd(false);
      await loadCategories();
      onChange(trimmed);
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (cat) => {
    if (DEFAULT_CATEGORIES.includes(cat)) return;
    if (!window.confirm(`Delete category "${cat}"? Existing posts keep their category value.`)) return;
    try {
      await adminFetch(`/api/admin/blog-categories/${encodeURIComponent(cat)}`, { method: 'DELETE', token });
      await loadCategories();
      // If deleted category was selected, fall back to first
      if (value === cat) onChange(categories[0] || DEFAULT_CATEGORIES[0]);
    } catch (err) {
      setError(err.message);
    }
  };

  const isDefault = (cat) => DEFAULT_CATEGORIES.includes(cat);

  return (
    <div className="cat-manager">
      {/* Select row */}
      <div className="flex gap-2 items-center">
        <select
          className="input-field flex-1"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button
          type="button"
          className="btn-secondary !py-1.5 !px-3 !text-xs whitespace-nowrap"
          onClick={() => setShowAdd((v) => !v)}
        >
          {showAdd ? 'Cancel' : '+ New'}
        </button>
      </div>

      {/* Add new category */}
      {showAdd && (
        <div className="cat-add-row">
          <input
            className="input-field flex-1"
            placeholder="Category name"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
            autoFocus
          />
          <button
            type="button"
            className="btn-primary !py-1.5 !px-3 !text-xs"
            onClick={handleAdd}
            disabled={adding || !newCat.trim()}
          >
            {adding ? 'Adding…' : 'Add'}
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}

      {/* Category tags — show all, allow deleting custom ones */}
      <div className="cat-list">
        {categories.map((cat) => (
          <span key={cat} className={`cat-tag ${!isDefault(cat) ? 'cat-tag-custom' : ''}`}>
            {cat}
            {!isDefault(cat) && (
              <button
                type="button"
                className="cat-tag-del"
                title={`Delete "${cat}"`}
                onClick={() => handleDelete(cat)}
              >
                ×
              </button>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
