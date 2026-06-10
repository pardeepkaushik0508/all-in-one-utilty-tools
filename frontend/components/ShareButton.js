import { useState } from 'react';

export default function ShareButton({ title, url }) {
  const [status, setStatus] = useState('');

  const share = async () => {
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    try {
      if (navigator.share) {
        await navigator.share({ title, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setStatus('Link copied!');
      setTimeout(() => setStatus(''), 2000);
    } catch {
      setStatus('Could not share');
    }
  };

  return (
    <button type="button" className="btn-secondary" onClick={share}>
      {status || 'Share'}
    </button>
  );
}
