import { useCallback, useEffect, useState } from 'react';

const SCROLL_TOLERANCE = 1;
const SCROLLABLE_OVERFLOW_VALUES = new Set(['auto', 'scroll', 'overlay']);

interface UseScrollShadowOptions {
  /**
   * Optional selector list used to find a scrollable descendant inside `element`.
   * If omitted, `element` itself is treated as the scroll target.
   */
  selectors?: string;
}

function hasScrollableOverflowStyle(element: HTMLElement): boolean {
  const overflowY = window.getComputedStyle(element).overflowY;
  return SCROLLABLE_OVERFLOW_VALUES.has(overflowY);
}

function findScrollableDescendant(
  root: HTMLElement,
  selectors?: string
): HTMLElement | null {
  if (selectors) {
    const preferred = root.querySelector<HTMLElement>(selectors);
    if (preferred) {
      return preferred;
    }
  }

  const descendants = Array.from(root.querySelectorAll<HTMLElement>('*'));
  return descendants.find((candidate) => hasScrollableOverflowStyle(candidate)) ?? null;
}

/**
 * Tracks whether a scrollable container is scrolled from the top and/or
 * has overflow content below the visible area.
 *
 * @param element - The scrollable container element (or null)
 */
export function useScrollShadow(
  element: HTMLElement | null,
  options: UseScrollShadowOptions = {}
): { isScrolledFromTop: boolean; isScrolledFromBottom: boolean } {
  const [isScrolledFromTop, setIsScrolledFromTop] = useState(false);
  const [isScrolledFromBottom, setIsScrolledFromBottom] = useState(false);

  const check = useCallback((target: HTMLElement | null) => {
    if (!target) {
      setIsScrolledFromTop(false);
      setIsScrolledFromBottom(false);
      return;
    }
    setIsScrolledFromTop(target.scrollTop > 0);
    setIsScrolledFromBottom(
      target.scrollTop + target.clientHeight < target.scrollHeight - SCROLL_TOLERANCE
    );
  }, []);

  const resolveScrollTarget = useCallback(
    (root: HTMLElement | null): HTMLElement | null => {
      if (!root) {
        return null;
      }
      if (!options.selectors) {
        return root;
      }
      return findScrollableDescendant(root, options.selectors);
    },
    [options.selectors]
  );

  useEffect(() => {
    if (!element) {
      check(null);
      return;
    }

    let activeTarget: HTMLElement | null = null;
    let targetResizeObserver: ResizeObserver | null = null;

    const handleScroll = () => {
      check(activeTarget);
    };

    const bindTarget = (nextTarget: HTMLElement | null) => {
      if (activeTarget === nextTarget) {
        check(activeTarget);
        return;
      }

      if (activeTarget) {
        activeTarget.removeEventListener('scroll', handleScroll);
      }
      targetResizeObserver?.disconnect();
      targetResizeObserver = null;

      activeTarget = nextTarget;

      if (!activeTarget) {
        check(null);
        return;
      }

      activeTarget.addEventListener('scroll', handleScroll, { passive: true });
      targetResizeObserver = new ResizeObserver(() => check(activeTarget));
      targetResizeObserver.observe(activeTarget);
      check(activeTarget);
    };

    const refreshTarget = () => {
      bindTarget(resolveScrollTarget(element));
    };

    refreshTarget();
    const rafId = requestAnimationFrame(refreshTarget);
    const timerId = window.setTimeout(refreshTarget, 200);

    const containerResizeObserver = new ResizeObserver(() => {
      refreshTarget();
      check(activeTarget);
    });
    containerResizeObserver.observe(element);

    const mutationObserver = options.selectors
      ? new MutationObserver(() => refreshTarget())
      : null;

    mutationObserver?.observe(element, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    window.addEventListener('resize', refreshTarget);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
      window.removeEventListener('resize', refreshTarget);
      mutationObserver?.disconnect();
      containerResizeObserver.disconnect();
      if (activeTarget) {
        activeTarget.removeEventListener('scroll', handleScroll);
      }
      targetResizeObserver?.disconnect();
    };
  }, [check, element, options.selectors, resolveScrollTarget]);

  return { isScrolledFromTop, isScrolledFromBottom };
}
