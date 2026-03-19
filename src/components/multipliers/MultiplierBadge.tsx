import type { MultiplierType } from '@/types';
import { Icon } from '@/icons';
import './MultiplierBadge.scss';

interface MultiplierBadgeProps {
  multiplierType: MultiplierType;
  className?: string;
}

const BADGE_CONFIG: Record<string, { label: string; icon: string; iconVariant: string }> = {
  rotating: { label: 'Rotating', icon: 'arrow-refresh', iconVariant: 'outline' },
  selectable: { label: 'Choice', icon: 'check-circle', iconVariant: 'solid' },
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

  const config = BADGE_CONFIG[multiplierType];
  if (!config) {
    return null;
  }

  return (
    <span className={`multiplier-type-badge ${className}`}>
      <Icon name={config.icon} variant={config.iconVariant} size={12} aria-hidden="true" />
      {config.label}
    </span>
  );
}

export default MultiplierBadge;
