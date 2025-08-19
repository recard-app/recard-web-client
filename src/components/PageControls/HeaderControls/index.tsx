import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import './HeaderControls.scss';

export interface HeaderControlsProps {
  children?: ReactNode;
  className?: string;
}

export default function HeaderControls({ children, className }: HeaderControlsProps) {
  return (
    <div className={cn('header-controls-container', className)}>
      {children}
    </div>
  );
}


