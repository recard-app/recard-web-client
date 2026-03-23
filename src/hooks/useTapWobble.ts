import { useRef, useCallback, useMemo } from 'react';

function buildWobbleKeyframes(perspective: number): Keyframe[] {
  const p = `perspective(${perspective}px)`;
  return [
    { offset: 0,    transform: `${p} rotateX(0deg) rotateY(0deg)` },
    { offset: 0.2,  transform: `${p} rotateX(3deg) rotateY(-4deg) scale(0.98)` },
    { offset: 0.5,  transform: `${p} rotateX(-2deg) rotateY(2deg) scale(1.01)` },
    { offset: 0.75, transform: `${p} rotateX(1deg) rotateY(-1deg)` },
    { offset: 1,    transform: `${p} rotateX(0deg) rotateY(0deg)` },
  ];
}

const WOBBLE_OPTIONS: KeyframeAnimationOptions = {
  duration: 1800,
  easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
};

/**
 * Returns a ref and onClick handler that plays a wobble animation
 * on the referenced element using the Web Animations API.
 * Designed to layer on top of CSS float animations without conflict.
 *
 * @param perspective - Perspective depth in px. Smaller = more dramatic.
 *                      Default 800 for large cards, use ~500 for smaller elements.
 */
export function useTapWobble<T extends HTMLElement = HTMLDivElement>(perspective = 800) {
  const ref = useRef<T>(null);
  const animationRef = useRef<Animation | null>(null);
  const keyframes = useMemo(() => buildWobbleKeyframes(perspective), [perspective]);

  const onWobble = useCallback((e: React.MouseEvent) => {
    // Mobile only — matches $mobile-breakpoint in variables.scss
    if (window.innerWidth > 780) return;

    // Don't wobble when clicking interactive elements (buttons, links, dropdowns)
    const target = e.target as HTMLElement;
    if (target.closest('button, a, [role="menuitem"], .showcase-actions')) return;

    // Cancel any previous animation to prevent accumulation
    animationRef.current?.cancel();
    const anim = ref.current?.animate(keyframes, WOBBLE_OPTIONS);
    if (anim) {
      animationRef.current = anim;
      anim.onfinish = () => {
        anim.cancel();
        animationRef.current = null;
      };
    }
  }, [keyframes]);

  return { wobbleRef: ref, onWobble };
}
