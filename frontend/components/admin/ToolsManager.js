import { useEffect, useMemo, useState } from 'react';
import { adminFetch, triggerRevalidate } from '../../utils/adminApi';
import { tools } from '../../utils/tools';

function mergeToolSettings(catalog, remote = []) {
  const map = Object.fromEntries(remote.map((item) => [item.slug, item]));
  return catalog.map((tool, index) => ({
    id: tool.slug,
    toolName: tool.name,
    slug: tool.slug,
    enabled: true,
    featured: false,
    maintenanceMode: false,
    hiddenFromSearch: false,
    hiddenFromHomepage: false,
    hiddenFromNavigation: false,
    order: index,
    ...map[tool.slug]
  }));
}

export default function ToolsManager({ token }) {
  const [toolSettings, setToolSettings] = useState([]);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const loadTools = async () => {
    const data = await adminFetch('/api/admin/tools', { token });
    setToolSettings(mergeToolSettings(tools, data.tools || []));
  };

  useEffect(() => {
    loadTools().catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return toolSettings;
    return toolSettings.filter((tool) => tool.toolName.toLowerCase().includes(q) || tool.slug.includes(q));
  }, [toolSettings, filter]);

  const updateTool = async (slug, patch) => {
    setError('');
    try {
      const data = await adminFetch(`/api/admin/tools/${slug}`, { method: 'PUT', body: patch, token });
      setToolSettings((prev) => prev.map((item) => (item.slug === slug ? { ...item, ...data.tool } : item)));
      await triggerRevalidate(token, ['/']);
      setStatus(`Updated ${slug}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const bulkToggle = async (enabled) => {
    if (!selected.size) return;
    setError('');
    try {
      await adminFetch('/api/admin/tools/toggle', {
        method: 'POST',
        body: { slugs: [...selected], enabled },
        token
      });
      await loadTools();
      setSelected(new Set());
      setStatus(enabled ? 'Tools enabled.' : 'Tools disabled.');
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleSelect = (slug) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center gap-2">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field max-w-xs"
          placeholder="Search tools..."
        />
        <button type="button" className="btn-secondary" onClick={() => bulkToggle(true)}>Bulk enable</button>
        <button type="button" className="btn-secondary" onClick={() => bulkToggle(false)}>Bulk disable</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-muted">
              <th className="p-2"> </th>
              <th className="p-2">Tool</th>
              <th className="p-2">Enabled</th>
              <th className="p-2">Featured</th>
              <th className="p-2">Maintenance</th>
              <th className="p-2">Hide search</th>
              <th className="p-2">Hide home</th>
              <th className="p-2">Order</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tool) => (
              <tr key={tool.slug} className="border-t border-theme">
                <td className="p-2">
                  <input type="checkbox" checked={selected.has(tool.slug)} onChange={() => toggleSelect(tool.slug)} />
                </td>
                <td className="p-2">
                  <p className="font-medium text-heading">{tool.toolName}</p>
                  <p className="text-xs text-muted">{tool.slug}</p>
                </td>
                <td className="p-2">
                  <input type="checkbox" checked={tool.enabled !== false} onChange={(e) => updateTool(tool.slug, { enabled: e.target.checked })} />
                </td>
                <td className="p-2">
                  <input type="checkbox" checked={tool.featured === true} onChange={(e) => updateTool(tool.slug, { featured: e.target.checked })} />
                </td>
                <td className="p-2">
                  <input type="checkbox" checked={tool.maintenanceMode === true} onChange={(e) => updateTool(tool.slug, { maintenanceMode: e.target.checked })} />
                </td>
                <td className="p-2">
                  <input type="checkbox" checked={tool.hiddenFromSearch === true} onChange={(e) => updateTool(tool.slug, { hiddenFromSearch: e.target.checked })} />
                </td>
                <td className="p-2">
                  <input type="checkbox" checked={tool.hiddenFromHomepage === true} onChange={(e) => updateTool(tool.slug, { hiddenFromHomepage: e.target.checked })} />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    className="input-field w-20"
                    value={tool.order ?? 0}
                    onChange={(e) => updateTool(tool.slug, { order: Number(e.target.value) })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {status && <p className="text-sm text-muted">{status}</p>}
      {error && <p className="alert-error">{error}</p>}
    </div>
  );
}
