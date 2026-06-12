import { useEffect, useState } from 'react';
import { adminFetch, triggerRevalidate } from '../../utils/adminApi';

export default function NavigationManager({ token }) {
  const [editorValue, setEditorValue] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const loadNavigation = async () => {
    const data = await adminFetch('/api/admin/navigation', { token });
    setEditorValue(JSON.stringify(data.navigation, null, 2));
  };

  useEffect(() => {
    loadNavigation().catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setError('');
    setStatus('Saving...');
    try {
      const payload = JSON.parse(editorValue);
      await adminFetch('/api/admin/navigation', { method: 'PUT', body: payload, token });
      await triggerRevalidate(token, ['/']);
      setStatus('Navigation saved.');
    } catch (err) {
      setError(err.message);
      setStatus('');
    }
  };

  return (
    <div className="card space-y-3">
      <p className="text-sm text-muted">
        Edit header links, footer links, brand copy, and CTA. Set <code>external: true</code> and <code>openInNewTab: true</code> for external links.
      </p>
      <button type="button" className="btn-primary" onClick={handleSave}>Save navigation</button>
      <textarea
        value={editorValue}
        onChange={(e) => setEditorValue(e.target.value)}
        className="input-field min-h-[480px] font-mono text-xs"
        spellCheck={false}
      />
      {status && <p className="text-sm text-muted">{status}</p>}
      {error && <p className="alert-error">{error}</p>}
    </div>
  );
}
