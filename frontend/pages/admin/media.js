import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminLoginPage from '../../components/admin/AdminLoginPage';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { adminFetch, adminUpload } from '../../utils/adminApi';

export default function AdminMediaPage() {
  const { token, authed, checking, error, loading, login, logout } = useAdminAuth();
  const [media, setMedia] = useState([]);
  const [status, setStatus] = useState('');
  const [pageError, setPageError] = useState('');

  const loadMedia = async (authToken = token) => {
    const data = await adminFetch('/api/admin/media', { token: authToken });
    setMedia(data.media || []);
  };

  useEffect(() => {
    if (authed) loadMedia().catch((err) => setPageError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPageError('');
    setStatus('Uploading...');
    try {
      await adminUpload('/api/admin/media/upload', file, token);
      await loadMedia();
      setStatus('Upload complete.');
      event.target.value = '';
    } catch (err) {
      setPageError(err.message);
      setStatus('');
    }
  };

  const handleDelete = async (id) => {
    setPageError('');
    try {
      await adminFetch(`/api/admin/media/${id}`, { method: 'DELETE', token });
      await loadMedia();
      setStatus('Media deleted.');
    } catch (err) {
      setPageError(err.message);
    }
  };

  if (checking) {
    return (
      <div className="admin-login-shell flex items-center justify-center">
        <p className="text-sm text-muted">Checking session...</p>
      </div>
    );
  }

  if (!authed) {
    return <AdminLoginPage onLogin={login} error={error} loading={loading} />;
  }

  return (
    <AdminLayout
      title="Media Library"
      subtitle="Upload, replace, and manage CMS images and assets."
      activeTab="media"
      onLogout={logout}
    >
      <div className="space-y-4">
        <div className="card">
          <label className="btn-primary inline-flex cursor-pointer">
            Upload file
            <input type="file" className="hidden" onChange={handleUpload} accept="image/*,video/*,.svg,.ico" />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((item) => (
            <article key={item.id} className="card space-y-3">
              {item.mimeType?.startsWith('image/') ? (
                <img src={item.url} alt={item.filename} className="h-40 w-full rounded-lg object-cover" />
              ) : (
                <div className="flex h-40 items-center justify-center rounded-lg bg-[var(--bg-muted)] text-sm text-muted">
                  {item.mimeType || 'File'}
                </div>
              )}
              <div>
                <p className="font-medium text-heading">{item.filename}</p>
                <p className="break-all text-xs text-muted">{item.url}</p>
              </div>
              <button type="button" className="btn-secondary" onClick={() => handleDelete(item.id)}>Delete</button>
            </article>
          ))}
        </div>

        {!media.length && <div className="card text-sm text-muted">No media uploaded yet.</div>}
        {status && <p className="text-sm text-muted">{status}</p>}
        {pageError && <p className="alert-error">{pageError}</p>}
      </div>
    </AdminLayout>
  );
}
