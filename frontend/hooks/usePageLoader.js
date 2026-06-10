import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

const MIN_VISIBLE_MS = 380;

function getPathname(url) {
  return url.split('?')[0].split('#')[0];
}

function removeInitialLoader() {
  const initialLoader = document.getElementById('initial-loader');
  if (!initialLoader) return;

  initialLoader.classList.add('initial-loader--hide');
  setTimeout(() => initialLoader.remove(), 400);
}

export default function usePageLoader() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const hideTimerRef = useRef(null);
  const showStartedAtRef = useRef(0);

  const showLoader = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    showStartedAtRef.current = Date.now();
    setIsLoading(true);
  };

  const hideLoader = () => {
    const elapsed = Date.now() - showStartedAtRef.current;
    const remaining = showStartedAtRef.current ? Math.max(0, MIN_VISIBLE_MS - elapsed) : 0;

    hideTimerRef.current = setTimeout(() => {
      setIsLoading(false);
      hideTimerRef.current = null;
    }, remaining);
  };

  useEffect(() => {
    removeInitialLoader();

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleStart = (url) => {
      if (getPathname(url) !== getPathname(router.asPath)) {
        showLoader();
      }
    };

    const handleEnd = () => hideLoader();

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleEnd);
    router.events.on('routeChangeError', handleEnd);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleEnd);
      router.events.off('routeChangeError', handleEnd);
    };
  }, [router]);

  return isLoading;
}
