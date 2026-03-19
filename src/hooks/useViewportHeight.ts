import { useEffect } from 'react';

/**
 * Sets --app-vh and --app-vh-px CSS variables for consistent viewport height
 * on mobile browsers with dynamic toolbars.
 *
 * The height only updates upward — when the virtual keyboard opens and the
 * viewport shrinks, --app-vh stays at its pre-keyboard value so nothing shifts.
 * It resets on orientation change to capture the new dimensions.
 *
 * Usage: call useViewportHeight() once near the root (e.g., in App).
 */
export function useViewportHeight(): void {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const root = document.documentElement;
    let lastHeight = 0;

    const setAppVh = () => {
      try {
        const visualViewport = window.visualViewport;
        const height = visualViewport?.height ?? window.innerHeight;

        // Only update when height increases — keyboard open shrinks the viewport,
        // so skipping decreases keeps the layout stable.
        if (height >= lastHeight) {
          lastHeight = height;
          root.style.setProperty('--app-vh-px', `${height}px`);
          root.style.setProperty('--app-vh', `${height * 0.01}px`);
        }
      } catch {
        root.style.setProperty('--app-vh', `${window.innerHeight * 0.01}px`);
      }
    };

    // Initial set (including from bfcache restore)
    setAppVh();

    const handlePageShow = () => setAppVh();
    const handleResize = () => setAppVh();
    const handleOrientation = () => {
      // Reset on orientation change so it captures the new dimensions
      lastHeight = 0;
      setAppVh();
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleOrientation, { passive: true });

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
