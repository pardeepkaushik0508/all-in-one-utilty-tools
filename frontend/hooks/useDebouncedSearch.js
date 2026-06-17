import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_DELAY = 500;

/**
 * Debounced search input — resets immediately when cleared, cancels pending timers on new input.
 */
export default function useDebouncedSearch(initialValue = '', delay = DEFAULT_DELAY) {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const timerRef = useRef(null);
  const generationRef = useRef(0);

  const isSearching = value.trim() !== debouncedValue.trim();

  const applyDebouncedValue = useCallback((nextValue, generation) => {
    if (generation !== generationRef.current) return;
    setDebouncedValue(nextValue);
  }, []);

  useEffect(() => {
    generationRef.current += 1;
    const generation = generationRef.current;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!value.trim()) {
      setDebouncedValue('');
      return undefined;
    }

    timerRef.current = setTimeout(() => {
      applyDebouncedValue(value, generation);
      timerRef.current = null;
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [value, delay, applyDebouncedValue]);

  const setSearchValue = useCallback((nextValue) => {
    setValue(nextValue);
  }, []);

  const clearSearch = useCallback(() => {
    generationRef.current += 1;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setValue('');
    setDebouncedValue('');
  }, []);

  return {
    value,
    debouncedValue,
    setValue: setSearchValue,
    clear: clearSearch,
    isSearching
  };
}
