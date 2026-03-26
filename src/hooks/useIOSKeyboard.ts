import { useRef, useEffect, useCallback } from 'react';
import { MOBILE_BREAKPOINT } from '../types';

interface UseIOSKeyboardReturn {
  /** Attach to the spacer div at the bottom of .prompt-window */
  spacerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * iOS Safari keyboard spacer hook.
 *
 * Makes Safari's native scroll-to-focused-input reliable by giving it
 * a scrollable ancestor (.prompt-window) with room to scroll (the spacer).
 *
 * Key design decisions to avoid previous glitches:
 * - .prompt-window is ALWAYS overflow-y:auto on mobile (via CSS, no class toggle)
 *   so there's no layout shift when the keyboard opens.
 * - The spacer is pre-grown on focusin (before Safari's auto-scroll fires)
 *   so Safari has room on its first scroll attempt.
 * - visualViewport.resize refines the spacer to the exact keyboard height.
 * - All spacer mutations are direct ref writes (no React re-renders during animation).
 *
 * Mobile only -- returns inert ref on desktop/tablet.
 */
export function useIOSKeyboard(): UseIOSKeyboardReturn {
  const spacerRef = useRef<HTMLDivElement | null>(null);

  const baselineRef = useRef<number>(0);
  const isVisibleRef = useRef(false);
  // Remember last keyboard height so we can pre-grow accurately on re-focus
  const lastKeyboardHeightRef = useRef<number>(320);

  const captureBaseline = useCallback(() => {
    if (!isVisibleRef.current) {
      baselineRef.current = window.innerHeight;
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isMobile = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT}px)`,
    ).matches;
    const vv = window.visualViewport;
    if (!isMobile || !vv) return;

    baselineRef.current = window.innerHeight;

    const KEYBOARD_THRESHOLD = 150;

    const setSpacer = (height: number) => {
      const spacer = spacerRef.current;
      if (spacer) {
        spacer.style.height = height > 0 ? `${height}px` : '0px';
      }
    };

    // Pre-grow spacer on focus so Safari's auto-scroll has room
    // BEFORE it fires. This prevents the intermittent failure where
    // Safari tries to scroll but has nowhere to go.
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target ||
        (target.tagName !== 'TEXTAREA' && target.tagName !== 'INPUT')
      )
        return;

      // Recapture baseline at focus time (stable window.innerHeight)
      baselineRef.current = window.innerHeight;

      if (!isVisibleRef.current) {
        setSpacer(lastKeyboardHeightRef.current);
        isVisibleRef.current = true;
      }
    };

    // Refine spacer to exact keyboard height as it animates
    const handleViewportResize = () => {
      const diff = Math.max(
        0,
        baselineRef.current - vv.height - vv.offsetTop,
      );

      if (diff > KEYBOARD_THRESHOLD) {
        setSpacer(diff);
        isVisibleRef.current = true;
        lastKeyboardHeightRef.current = diff;
      } else if (isVisibleRef.current) {
        // Keyboard closed
        setSpacer(0);
        isVisibleRef.current = false;
      }
    };

    const handleFocusOut = () => {
      // Delay rebaseline so viewport settles after keyboard dismiss
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!isVisibleRef.current) {
            captureBaseline();
          }
        });
      });
    };

    const handleOrientationChange = () => {
      setTimeout(() => {
        baselineRef.current = 0;
        captureBaseline();
      }, 300);
    };

    const handlePageShow = () => {
      captureBaseline();
    };

    document.addEventListener('focusin', handleFocusIn, true);
    vv.addEventListener('resize', handleViewportResize, {
      passive: true,
    } as AddEventListenerOptions);
    document.addEventListener('focusout', handleFocusOut, { passive: true });
    window.addEventListener('orientationchange', handleOrientationChange, {
      passive: true,
    });
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      document.removeEventListener('focusin', handleFocusIn, true);
      vv.removeEventListener('resize', handleViewportResize);
      document.removeEventListener('focusout', handleFocusOut);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [captureBaseline]);

  return { spacerRef };
}
