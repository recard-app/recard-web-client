import { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import type { AllowedCategoryEntry } from '@/types';
import './CategorySelector.scss';

interface CategorySelectorProps {
  allowedCategories: AllowedCategoryEntry[];
  selectedCategoryId: string;
  onSelect: (categoryId: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

/**
 * Dropdown selector for user to choose their category for selectable multipliers.
 * Handles loading state during API updates and shows the current selection.
 */
export function CategorySelector({
  allowedCategories,
  selectedCategoryId,
  onSelect,
  disabled = false,
  className,
}: CategorySelectorProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    if (categoryId === selectedCategoryId) return;

    setIsUpdating(true);
    try {
      await onSelect(categoryId);
    } catch (error) {
      console.error('Failed to update category:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle empty categories case
  if (allowedCategories.length === 0) {
    return (
      <div className={`category-selector-empty ${className || ''}`}>
        <AlertCircle className="empty-icon" />
        <span>No categories available</span>
      </div>
    );
  }

  const selectedCategory = allowedCategories.find(c => c.id === selectedCategoryId);

  // Handle case where selected category was deleted - show warning and default to first
  const effectiveSelectedId = selectedCategory ? selectedCategoryId : allowedCategories[0]?.id || '';
  const showStaleWarning = !selectedCategory && selectedCategoryId;

  return (
    <div className={`category-selector ${className || ''}`}>
      <div className="category-selector-wrapper">
        {isUpdating && (
          <div className="updating-indicator">
            <Loader2 className="spinner" />
          </div>
        )}
        <select
          value={effectiveSelectedId}
          onChange={handleSelect}
          disabled={disabled || isUpdating}
          className={`default-select category-select ${isUpdating ? 'updating' : ''}`}
        >
          {allowedCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.displayName}
              {category.subCategory ? ` (${category.subCategory})` : ''}
            </option>
          ))}
        </select>
      </div>
      {showStaleWarning && (
        <p className="stale-warning">
          <AlertCircle className="warning-icon" />
          <span>Your previous selection is no longer available. Please select a new category.</span>
        </p>
      )}
    </div>
  );
}

export default CategorySelector;
