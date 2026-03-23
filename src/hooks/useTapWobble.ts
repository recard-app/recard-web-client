import { useRef, useCallback } from 'react';

const WOBBLE_KEYFRAMES: Keyframe[] = [
  { offset: 0,    transform: 'perspective(800px) rotateX(0deg) rotateY(0deg)' },
  { offset: 0.2,  transform: 'perspective(800px) rotateX(3deg) rotateY(-4deg) scale(0.98)' },
  { offset: 0.5,  transform: 'perspective(800px) rotateX(-2deg) rotateY(2deg) scale(1.01)' },
  { offset: 0.75, transform: 'perspective(800px) rotateX(1deg) rotateY(-1deg)' },
  { offset: 1,    transform: 'perspective(800px) rotateX(0deg) rotateY(0deg)' },
];

const WOBBLE_OPTIONS: KeyframeAnimationOptions = {
  duration: 1200,
  easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
};

/**
 * Returns a ref and onClick handler that plays a wobble animation
 * on the referenced element using the Web Animations API.
 * Designed to layer on top of CSS float animations without conflict.
 */
export function useTapWobble<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  const onWobble = useCallback(() => {
    ref.current?.animate(WOBBLE_KEYFRAMES, WOBBLE_OPTIONS);
  }, []);

  return { wobbleRef: ref, onWobble };
}
