import React from 'react';
import { MonthlyStatsResponse, CREDIT_SUMMARY_SECTIONS, ALWAYS_SHOW_EXPIRING_CREDITS, SHOW_USAGE_BAR_IN_SIDEBAR_MENU, CREDIT_USAGE_DISPLAY_NAMES } from '../../types';
import { NEUTRAL_DARK_GRAY, PRIMARY_COLOR, PRIMARY_LIGHT, WARNING } from '../../types/Colors';
import { InfoDisplay, ErrorWithRetry } from '../../elements';
import Icon from '@/icons';
import UsageBar from '../UsageBar';
import CreditSummarySkeleton from './CreditSummarySkeleton';
import './CreditSummary.scss';

// Debug flag to use mock data with expiring credits for design testing
const DEBUG_USE_MOCK_EXPIRING_CREDITS = false;

// Mock data with expiring credits for testing
const MOCK_MONTHLY_STATS: MonthlyStatsResponse = {
  MonthlyCredits: {
    usedValue: 150,
    possibleValue: 425,
    usedCount: 3,
    partiallyUsedCount: 2,
    unusedCount: 4
  },
  CurrentCredits: {
    usedValue: 150,
    possibleValue: 425,
    usedCount: 3,
    partiallyUsedCount: 2,
    unusedCount: 4
  },
  AllCredits: {
    usedValue: 150,
    possibleValue: 425,
    usedCount: 3,
    partiallyUsedCount: 2,
    unusedCount: 4
  },
  ExpiringCredits: {
    Monthly: { count: 0, unusedValue: 0 },
    Quarterly: { count: 0, unusedValue: 0 },
    Semiannually: { count: 0, unusedValue: 0 },
    Annually: { count: 0, unusedValue: 0 },
    Total: { count: 4, unusedValue: 54 }
  }
};

interface CreditSummaryProps {
  variant?: 'header' | 'sidebar';
  monthlyStats: MonthlyStatsResponse | null;
  loading: boolean;
  isUpdating?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onDetailedSummaryClick?: () => void;
}

const CreditSummary: React.FC<CreditSummaryProps> = ({
  variant = 'header',
  monthlyStats,
  loading,
  isUpdating = false,
  error = null,
  onRetry,
  onDetailedSummaryClick
}) => {
  // Use mock data if debug flag is enabled
  const effectiveMonthlyStats = DEBUG_USE_MOCK_EXPIRING_CREDITS ? MOCK_MONTHLY_STATS : monthlyStats;

  // Only show skeleton/loading if we're loading and have no data yet (initial load)
  if (loading && !effectiveMonthlyStats) {
    if (variant === 'header') {
      return <CreditSummarySkeleton />;
    }
    // Sidebar: return null while loading -- the CreditListSkeleton below handles the visual placeholder
    return null;
  }

  if (error) {
    const errorMessage = variant === 'sidebar' ? "Error loading stats" : `Error: ${error}`;
    if (onRetry) {
      return (
        <ErrorWithRetry
          message={errorMessage}
          onRetry={onRetry}
        />
      );
    }
    return (
      <InfoDisplay
        type="error"
        message={errorMessage}
        showTitle={false}
        transparent={true}
      />
    );
  }

  if (!effectiveMonthlyStats) {
    return (
      <InfoDisplay
        type="default"
        message="No credits available"
        showTitle={false}
        transparent={true}
        showIcon={false}
      />
    );
  }

  // Calculate stats
  const totalMonthlyCredits = effectiveMonthlyStats.MonthlyCredits.usedCount + effectiveMonthlyStats.MonthlyCredits.partiallyUsedCount + effectiveMonthlyStats.MonthlyCredits.unusedCount;
  const hasExpiringCredits = effectiveMonthlyStats.ExpiringCredits.Total.count > 0;
  const showExpiringRow = ALWAYS_SHOW_EXPIRING_CREDITS || hasExpiringCredits;

  // Shared hero content (used by both sidebar and header)
  const heroContent = (
    <>
      {/* Hero value row */}
      <div className="hero-value-row">
        <span className="hero-value">${effectiveMonthlyStats.MonthlyCredits.usedValue} / ${effectiveMonthlyStats.MonthlyCredits.possibleValue}</span>
        <span className="hero-label">of monthly credits spent</span>
      </div>

      {/* Usage bar */}
      <UsageBar
        segments={[
          {
            label: CREDIT_USAGE_DISPLAY_NAMES.USED,
            value: effectiveMonthlyStats.MonthlyCredits.usedValue,
            color: PRIMARY_COLOR,
          },
        ]}
        maxValue={effectiveMonthlyStats.MonthlyCredits.possibleValue}
        height={8}
        borderRadius={4}
        showLabels={false}
        animate={true}
        className="credit-summary-usage-bar"
        valuePrefix="$"
      />
    </>
  );

  // Shared expiring row (used by both sidebar and header)
  const expiringRowContent = showExpiringRow && (
    <div className="expiring-row">
      <span className="expiring-icon">
        <Icon name={CREDIT_SUMMARY_SECTIONS.EXPIRING_CREDITS.icon} variant="micro" size={14} color={WARNING} />
      </span>
      <span className="expiring-text">
        <span className="expiring-value">{effectiveMonthlyStats.ExpiringCredits.Total.count} {effectiveMonthlyStats.ExpiringCredits.Total.count === 1 ? 'credit' : 'credits'}</span>{effectiveMonthlyStats.ExpiringCredits.Total.unusedValue > 0 ? <> worth <span className="expiring-value">${effectiveMonthlyStats.ExpiringCredits.Total.unusedValue}</span></> : null} expiring soon
      </span>
    </div>
  );

  // Sidebar variant
  if (variant === 'sidebar') {
    // Hide the element entirely if there's nothing to show
    const hasContentToShow = SHOW_USAGE_BAR_IN_SIDEBAR_MENU || showExpiringRow;
    if (!hasContentToShow) {
      return null;
    }

    return (
      <div className={`credit-summary-hero credit-summary-sidebar ${isUpdating ? 'updating' : ''}`}>
        {SHOW_USAGE_BAR_IN_SIDEBAR_MENU && heroContent}
        {expiringRowContent}
      </div>
    );
  }

  // Header variant
  return (
    <div className={`credit-summary-hero credit-summary-header ${isUpdating ? 'updating' : ''}`}>
      {/* Section header row */}
      <div className="section-header-row">
        <span className="section-header-label">{CREDIT_SUMMARY_SECTIONS.MONTHLY_CREDITS.displayName}</span>
        {onDetailedSummaryClick && (
          <button className="button ghost icon small with-text" onClick={onDetailedSummaryClick} aria-label="View stats">
            <Icon name="arrow-trending-up" variant="mini" size={16} />
            View stats
          </button>
        )}
      </div>

      {/* Value line */}
      <div className="hero-value-row">
        <span className="hero-value">${effectiveMonthlyStats.MonthlyCredits.usedValue}</span>
        <span className="hero-label">/ ${effectiveMonthlyStats.MonthlyCredits.possibleValue} spent</span>
      </div>

      {/* Segmented usage bar (count-based) */}
      <UsageBar
        segments={[
          {
            label: CREDIT_USAGE_DISPLAY_NAMES.USED,
            value: effectiveMonthlyStats.MonthlyCredits.usedCount,
            color: PRIMARY_COLOR,
          },
          {
            label: CREDIT_USAGE_DISPLAY_NAMES.PARTIALLY_USED,
            value: effectiveMonthlyStats.MonthlyCredits.partiallyUsedCount,
            color: PRIMARY_LIGHT,
          },
        ]}
        maxValue={totalMonthlyCredits}
        height={8}
        borderRadius={4}
        showLabels={false}
        animate={true}
        className="credit-summary-usage-bar"
      />

      {/* Legend */}
      <div className="bar-legend">
        <div className="bar-legend-item">
          <span className="bar-legend-dot" style={{ backgroundColor: PRIMARY_COLOR }} />
          <span className="bar-legend-text">{effectiveMonthlyStats.MonthlyCredits.usedCount} Used</span>
        </div>
        <div className="bar-legend-item">
          <span className="bar-legend-dot" style={{ backgroundColor: PRIMARY_LIGHT }} />
          <span className="bar-legend-text">{effectiveMonthlyStats.MonthlyCredits.partiallyUsedCount} Partially</span>
        </div>
        <div className="bar-legend-item">
          <span className="bar-legend-dot bar-legend-dot--unused" />
          <span className="bar-legend-text">{effectiveMonthlyStats.MonthlyCredits.unusedCount} Unused</span>
        </div>
      </div>

      {/* Expiring row */}
      {expiringRowContent}
    </div>
  );
};

export default CreditSummary;
