import React from 'react';
import Icon from '../../icons';

export type CreditFilter = 'card' | 'category' | 'period' | 'expiring';

interface FilterChipsProps {
  activeFilter: CreditFilter | null;
  onFilterChange: (filter: CreditFilter | null) => void;
  expiringCount: number;
}

const CHIPS: { filter: CreditFilter; label: string }[] = [
  { filter: 'card', label: 'By Card' },
  { filter: 'category', label: 'By Category' },
  { filter: 'period', label: 'By Period' },
  { filter: 'expiring', label: 'Expiring' },
];

const FilterChips: React.FC<FilterChipsProps> = ({ activeFilter, onFilterChange, expiringCount }) => {
  return (
    <div className="credits-filter-chips">
      {CHIPS.map(({ filter, label }) => {
        if (filter === 'expiring' && expiringCount === 0) return null;

        const isActive = activeFilter === filter;
        return (
          <button
            key={filter}
            className={`credits-filter-chip${isActive ? ' credits-filter-chip--active' : ''}`}
            onClick={() => onFilterChange(isActive ? null : filter)}
            type="button"
          >
            {label}
          </button>
        );
      })}
      {activeFilter && (
        <button
          className="credits-filter-chip credits-filter-chip--clear"
          onClick={() => onFilterChange(null)}
          type="button"
        >
          <Icon name="x-mark" variant="micro" size={12} />
        </button>
      )}
    </div>
  );
};

export default FilterChips;
