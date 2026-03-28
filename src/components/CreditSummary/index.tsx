import React from 'react';
import { MonthlyStatsResponse, CREDIT_SUMMARY_SECTIONS, ALWAYS_SHOW_EXPIRING_CREDITS, SHOW_USAGE_BAR_IN_SIDEBAR_MENU, CREDIT_USAGE_DISPLAY_NAMES } from '../../types';
import { PRIMARY_COLOR, PRIMARY_LIGHT, WARNING } from '../../types/Colors';
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
  },
  PeriodBreakdown: {
    Monthly: { count: 5, unusedValue: 125, possibleValue: 200 },
    Quarterly: { count: 2, unusedValue: 80, possibleValue: 120 },
    Semiannually: { count: 0, unusedValue: 0, possibleValue: 0 },
    Annually: { count: 1, unusedValue: 50, possibleValue: 105 },
    Total: { count: 8, unusedValue: 255, possibleValue: 425 }
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

  // Format a dollar value to two decimal places, dropping decimals if whole number
  const fmt = (v: number) => {
    const rounded = Math.round(v * 100) / 100;
    return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2);
  };

  // Round to nearest dollar for hero section (space-constrained)
  const fmtRound = (v: number) => Math.round(v).toString();

  // Calculate stats
  const totalRemainingValue = effectiveMonthlyStats.PeriodBreakdown.Total.unusedValue;
  const totalCreditCount = effectiveMonthlyStats.PeriodBreakdown.Total.count;
  const hasExpiringCredits = effectiveMonthlyStats.ExpiringCredits.Total.count > 0;
  const showExpiringRow = ALWAYS_SHOW_EXPIRING_CREDITS || hasExpiringCredits;

  // Shared hero content (used by both sidebar and header)
  const heroContent = (
    <>
      {/* Hero value row */}
      <div className="hero-value-row">
        <span className="hero-value">${fmt(effectiveMonthlyStats.MonthlyCredits.usedValue)} / ${fmt(effectiveMonthlyStats.MonthlyCredits.possibleValue)}</span>
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
        <span className="expiring-value">{effectiveMonthlyStats.ExpiringCredits.Total.count} {effectiveMonthlyStats.ExpiringCredits.Total.count === 1 ? 'credit' : 'credits'}</span>{effectiveMonthlyStats.ExpiringCredits.Total.unusedValue > 0 ? <> worth <span className="expiring-value">${fmt(effectiveMonthlyStats.ExpiringCredits.Total.unusedValue)}</span></> : null} expiring soon
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
      {/* Hero value + subtitle + View stats */}
      <div className="hero-value-row">
        <div className="hero-value-group">
          <span className="hero-value">${fmt(totalRemainingValue)}</span>
          <span className="hero-subtitle">remaining across {totalCreditCount} active {totalCreditCount === 1 ? 'credit' : 'credits'}</span>
        </div>
        {onDetailedSummaryClick && (
          <button className="button ghost icon small with-text" onClick={onDetailedSummaryClick} aria-label="View stats">
            <Icon name="arrow-trending-up" variant="mini" size={16} />
            View stats
          </button>
        )}
      </div>

      {/* Active credits usage bar */}
      <UsageBar
        segments={[
          {
            label: CREDIT_USAGE_DISPLAY_NAMES.USED,
            value: effectiveMonthlyStats.CurrentCredits.usedCount,
            color: PRIMARY_COLOR,
          },
          {
            label: CREDIT_USAGE_DISPLAY_NAMES.PARTIALLY_USED,
            value: effectiveMonthlyStats.CurrentCredits.partiallyUsedCount,
            color: PRIMARY_LIGHT,
          },
        ]}
        maxValue={effectiveMonthlyStats.CurrentCredits.usedCount + effectiveMonthlyStats.CurrentCredits.partiallyUsedCount + effectiveMonthlyStats.CurrentCredits.unusedCount}
        height={8}
        borderRadius={4}
        showLabels={false}
        animate={true}
        className="credit-summary-usage-bar"
      />
      <div className="credit-summary-count-labels">
        {effectiveMonthlyStats.CurrentCredits.usedCount > 0 && (
          <div className="usage-bar-label">
            <span className="usage-bar-label-dot" style={{ backgroundColor: PRIMARY_COLOR }} />
            <span className="usage-bar-label-text">{effectiveMonthlyStats.CurrentCredits.usedCount} {CREDIT_USAGE_DISPLAY_NAMES.USED}</span>
          </div>
        )}
        {effectiveMonthlyStats.CurrentCredits.partiallyUsedCount > 0 && (
          <div className="usage-bar-label">
            <span className="usage-bar-label-dot" style={{ backgroundColor: PRIMARY_LIGHT }} />
            <span className="usage-bar-label-text">{effectiveMonthlyStats.CurrentCredits.partiallyUsedCount} Partial</span>
          </div>
        )}
        {effectiveMonthlyStats.CurrentCredits.unusedCount > 0 && (
          <div className="usage-bar-label">
            <span className="usage-bar-label-dot usage-bar-label-dot--remaining" />
            <span className="usage-bar-label-text">{effectiveMonthlyStats.CurrentCredits.unusedCount} Unused</span>
          </div>
        )}
      </div>

      {/* Expiring row */}
      {expiringRowContent}
    </div>
  );
};

export default CreditSummary;
