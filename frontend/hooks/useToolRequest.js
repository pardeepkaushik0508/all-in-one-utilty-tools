import { useState, useCallback } from 'react';

export default function useToolRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const run = useCallback(async (requestFn) => {
    setError('');
    setResult(null);

    try {
      setLoading(true);
      const data = await requestFn();
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message || 'Request failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError('');
    setResult(null);
    setLoading(false);
  }, []);

  return { loading, error, result, run, reset, setError };
}
