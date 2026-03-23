import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { usePageScroll } from '@/contexts/PageScrollContext';
import './FooterControls.scss';

export interface FooterControlsProps {
  children?: ReactNode;
  className?: string;
}

export default function FooterControls({ children, className }: FooterControlsProps) {
  const { isScrolledFromBottom } = usePageScroll();

  return (
    <div
      className={cn('footer-controls-container', className)}
      data-has-overflow={isScrolledFromBottom}
    >
      {children}
    </div>
  );
}
