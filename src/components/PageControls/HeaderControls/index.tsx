import { ReactNode, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { usePageScroll } from '@/contexts/PageScrollContext';
import './HeaderControls.scss';

export interface HeaderControlsProps {
  children?: ReactNode;
  className?: string;
}

export default function HeaderControls({ children, className }: HeaderControlsProps) {
  const { isScrolledFromTop, setHasHeaderControls } = usePageScroll();

  useEffect(() => {
    setHasHeaderControls(true);
    return () => setHasHeaderControls(false);
  }, [setHasHeaderControls]);

  return (
    <div
      className={cn('header-controls-container', className)}
      data-scrolled={isScrolledFromTop}
    >
      {children}
    </div>
  );
}
