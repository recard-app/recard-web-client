import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import './FooterControls.scss';

export interface FooterControlsProps {
  children?: ReactNode;
  className?: string;
}

export default function FooterControls({ children, className }: FooterControlsProps) {
  return (
    <div className={cn('footer-controls-container', className)}>
      {children}
    </div>
  );
}


