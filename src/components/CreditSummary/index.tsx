import React from 'react';
import { MonthlyStatsResponse, CREDIT_SUMMARY_SECTIONS, ALWAYS_SHOW_EXPIRING_CREDITS, SHOW_USAGE_BAR_IN_SIDEBAR_MENU } from '../../types';
import { NEUTRAL_DARK_GRAY, PRIMARY_COLOR, WARNING } from '../../types/Colors';
import { InfoDisplay } from '../../elements';
import Icon from '@/icons';
import UsageBar from '../UsageBar';
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
  onDetailedSummaryClick?: () => void;
}

const CreditSummary: React.FC<CreditSummaryProps> = ({
  variant = 'header',
  monthlyStats,
  loading,
  isUpdating = false,
  error = null,
  onDetailedSummaryClick
}) => {
  // Use mock data if debug flag is enabled
  const effectiveMonthlyStats = DEBUG_USE_MOCK_EXPIRING_CREDITS ? MOCK_MONTHLY_STATS : monthlyStats;

  // Only show loading spinner if we're loading and have no data yet (initial load)
  if (loading && !effectiveMonthlyStats) {
    return (
      <InfoDisplay
        type="loading"
        message={variant === 'sidebar' ? "Loading credit details..." : "Loading monthly stats..."}
        showTitle={false}
        transparent={true}
      />
    );
  }

  if (error) {
    return (
      <InfoDisplay
        type="error"
        message={variant === 'sidebar' ? "Error loading stats" : `Error: ${error}`}
        showTitle={false}
        transparent={true}
      />
    );
  }

  if (!effectiveMonthlyStats) {
    return (
      <InfoDisplay
        type="default"
        message={variant === 'sidebar' ? "No stats available" : "No stats data available"}
        showTitle={false}
        transparent={true}
        showIcon={false}
        centered={true}
      />
    );
  }

  // Calculate stats
  const totalMonthlyCredits = effectiveMonthlyStats.MonthlyCredits.usedCount + effectiveMonthlyStats.MonthlyCredits.partiallyUsedCount + effectiveMonthlyStats.MonthlyCredits.unusedCount;
  const usedMonthlyCredits = effectiveMonthlyStats.MonthlyCredits.usedCount;
  const hasExpiringCredits = effectiveMonthlyStats.ExpiringCredits.Total.count > 0;
  const showExpiringRow = ALWAYS_SHOW_EXPIRING_CREDITS || hasExpiringCredits;

  // Shared hero content (used by both sidebar and header)
  const heroContent = (
    <>
      {/* Hero value row: "$150 used" */}
      <div className="hero-value-row">
        <span className="hero-value">${effectiveMonthlyStats.MonthlyCredits.usedValue}</span>
        <span className="hero-label">of monthly credits used</span>
      </div>

      {/* Usage bar */}
      <UsageBar
        segments={[
          {
            label: 'Used',
            value: effectiveMonthlyStats.MonthlyCredits.usedValue,
            color: PRIMARY_COLOR,
          },
        ]}
        maxValue={effectiveMonthlyStats.MonthlyCredits.possibleValue}
        height={8}
        borderRadius={4}
        showLabels={true}
        animate={true}
        className="credit-summary-usage-bar"
        valuePrefix="$"
      />

      {/* Supporting row: "[icon] you have used X/X credits worth up to $XXX this month" */}
      <div className="supporting-row">
        <span className="supporting-icon">
          <Icon name={CREDIT_SUMMARY_SECTIONS.MONTHLY_CREDITS.icon} variant="micro" size={14} color={NEUTRAL_DARK_GRAY} />
        </span>
        <span className="supporting-text">
          You have fully used <span className="supporting-value">{usedMonthlyCredits}/{totalMonthlyCredits}</span> monthly credits worth <span className="supporting-value">${effectiveMonthlyStats.MonthlyCredits.possibleValue}</span>
        </span>
      </div>
    </>
  );

  // Shared expiring row (used by both sidebar and header)
  const expiringRowContent = showExpiringRow && (
    <div className="expiring-row">
      <span className="expiring-icon">
        <Icon name={CREDIT_SUMMARY_SECTIONS.EXPIRING_CREDITS.icon} variant="micro" size={14} color={WARNING} />
      </span>
      <span className="expiring-text">
        <span className="expiring-value">{effectiveMonthlyStats.ExpiringCredits.Total.count} {effectiveMonthlyStats.ExpiringCredits.Total.count === 1 ? 'credit' : 'credits'}</span> worth <span className="expiring-value">${effectiveMonthlyStats.ExpiringCredits.Total.unusedValue}</span> expiring soon
      </span>
    </div>
  );

  // Sidebar variant
  if (variant === 'sidebar') {
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
      <div className="header-content">
        <div className="header-stats">
          {heroContent}
          {expiringRowContent}
        </div>
        {onDetailedSummaryClick && (
          <div className="credit-summary-buttons">
            <button
              className="button ghost icon no-padding"
              onClick={onDetailedSummaryClick}
              aria-label="Expand to view full report"
            >
              <Icon name="expand-arrows" variant="mini" size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditSummary;
