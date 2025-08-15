import { useEffect } from 'react';

/**
 * Ensures the app uses the visible viewport height on iOS Safari and other mobile browsers
 * with dynamic toolbars by setting a CSS variable that mirrors the current viewport height.
 *
 * Usage: call useViewportHeight() once near the root (e.g., in App).
 */
export function useViewportHeight(): void {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const root = document.documentElement;

    const setAppVh = () => {
      try {
        const visualViewport = window.visualViewport;
        const height = visualViewport?.height ?? window.innerHeight;
        // Store both the pixel height and a 1% unit helper
        root.style.setProperty('--app-vh-px', `${height}px`);
        root.style.setProperty('--app-vh', `${height * 0.01}px`);
      } catch {
        // Fallback in case of any unexpected errors
        root.style.setProperty('--app-vh', `${window.innerHeight * 0.01}px`);
      }
    };

    // Initial set (including from bfcache restore)
    setAppVh();

    const handlePageShow = () => setAppVh();
    const handleResize = () => setAppVh();
    const handleOrientation = () => setAppVh();

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleOrientation, { passive: true });

    // Use visualViewport listeners when available to respond to dynamic toolbar / keyboard changes
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', handleResize, { passive: true } as AddEventListenerOptions);
      vv.addEventListener('scroll', handleResize, { passive: true } as AddEventListenerOptions);
    }

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('resize', handleResize as EventListener);
      window.removeEventListener('orientationchange', handleOrientation as EventListener);
      if (vv) {
        vv.removeEventListener('resize', handleResize as EventListener);
        vv.removeEventListener('scroll', handleResize as EventListener);
      }
    };
  }, []);
}

export default useViewportHeight;


