import { useEffect } from 'react';

/**
 * Ensures the app uses the visible viewport height on iOS Safari and other mobile browsers
 * with dynamic toolbars by setting a CSS variable that mirrors the current viewport height.
 *
 * - Skips updates during pinch-to-zoom (scale > 1) to prevent layout thrashing.
 * - Batches visualViewport resize+scroll events per animation frame to avoid duplicate work.
 * - Toggles a `keyboard-animating` class on <html> during keyboard open/close so CSS
 *   can apply a transition that tracks the iOS keyboard animation.
 *
 * Usage: call useViewportHeight() once near the root (e.g., in App).
 */
export function useViewportHeight(): void {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const root = document.documentElement;
    let rafId: number | null = null;
    let lastHeight = 0;
    let keyboardTimer: ReturnType<typeof setTimeout> | null = null;

    const setAppVh = () => {
      rafId = null;
      try {
        const visualViewport = window.visualViewport;

        // Skip updates during pinch-to-zoom -- the layout viewport hasn't changed,
        // only the visual viewport has shrunk. Updating --app-vh during zoom causes
        // the entire layout to collapse and shift.
        if (visualViewport && visualViewport.scale > 1.01) return;

        const height = visualViewport?.height ?? window.innerHeight;

        // Detect keyboard opening/closing: a large height change (>100px) indicates
        // the virtual keyboard is animating. Toggle a class so CSS can apply a
        // transition that matches the iOS keyboard curve.
        const delta = Math.abs(height - lastHeight);
        if (delta > 100) {
          root.classList.add('keyboard-animating');
          if (keyboardTimer) clearTimeout(keyboardTimer);
          keyboardTimer = setTimeout(() => {
            root.classList.remove('keyboard-animating');
            keyboardTimer = null;
          }, 350);
        }

        lastHeight = height;
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

    // Deduplicate visualViewport events (resize + scroll can both fire per frame)
    const scheduleUpdate = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(setAppVh);
      }
    };

    const handlePageShow = () => setAppVh();
    const handleOrientation = () => setAppVh();

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    window.addEventListener('orientationchange', handleOrientation, { passive: true });

    // Use visualViewport listeners when available to respond to dynamic toolbar / keyboard changes
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', scheduleUpdate, { passive: true } as AddEventListenerOptions);
      vv.addEventListener('scroll', scheduleUpdate, { passive: true } as AddEventListenerOptions);
    }

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (keyboardTimer) clearTimeout(keyboardTimer);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('resize', scheduleUpdate as EventListener);
      window.removeEventListener('orientationchange', handleOrientation as EventListener);
      if (vv) {
        vv.removeEventListener('resize', scheduleUpdate as EventListener);
        vv.removeEventListener('scroll', scheduleUpdate as EventListener);
      }
    };
  }, []);
}

export default useViewportHeight;
