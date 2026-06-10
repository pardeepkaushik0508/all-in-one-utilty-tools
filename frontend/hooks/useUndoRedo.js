import { useCallback, useState } from 'react';

export default function useUndoRedo(initialValue = []) {
  const [history, setHistory] = useState([initialValue]);
  const [index, setIndex] = useState(0);

  const value = history[index];

  const setValue = useCallback(
    (next) => {
      setHistory((prev) => {
        const currentValue = prev[index] ?? [];
        const current = typeof next === 'function' ? next(currentValue) : next;
        const trimmed = prev.slice(0, index + 1);
        return [...trimmed, current];
      });
      setIndex((prev) => prev + 1);
    },
    [index]
  );

  const undo = useCallback(() => {
    setIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const redo = useCallback(() => {
    setIndex((prev) => Math.min(history.length - 1, prev + 1));
  }, [history.length]);

  const reset = useCallback((next = []) => {
    setHistory([next]);
    setIndex(0);
  }, []);

  return {
    value,
    setValue,
    undo,
    redo,
    reset,
    canUndo: index > 0,
    canRedo: index < history.length - 1
  };
}
