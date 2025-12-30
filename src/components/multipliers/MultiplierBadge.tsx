import type { MultiplierType } from '@/types';
import './MultiplierBadge.scss';

interface MultiplierBadgeProps {
  multiplierType: MultiplierType;
  className?: string;
}

const BADGE_LABELS: Record<string, string> = {
  rotating: 'Rotating',
  selectable: 'Choice',
};

/**
 * Display badge for rotating/selectable multipliers.
 * Returns null for standard multipliers or undefined (no badge needed).
 */
export function MultiplierBadge({ multiplierType, className = '' }: MultiplierBadgeProps) {
  // Handle undefined/null or standard type - no badge needed
  if (!multiplierType || multiplierType === 'standard') {
    return null;
  }

  const label = BADGE_LABELS[multiplierType];
  if (!label) {
    return null;
  }

  return (
    <span className={`multiplier-badge ${className}`}>
      {label}
    </span>
  );
}

export default MultiplierBadge;
