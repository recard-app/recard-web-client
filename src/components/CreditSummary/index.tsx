import React from 'react';
import { MonthlyStatsResponse, CREDIT_SUMMARY_SECTIONS, HIDE_EXPIRING_WHEN_NONE_SIDEBAR } from '../../types';
import { NEUTRAL_DARK_GRAY, PRIMARY_COLOR } from '../../types/Colors';
import { InfoDisplay } from '../../elements';
import Icon from '@/icons';
import UsageBar from '../UsageBar';
import './CreditSummary.scss';

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

  // Only show loading spinner if we're loading and have no data yet (initial load)
  if (loading && !monthlyStats) {
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

  if (!monthlyStats) {
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

  if (variant === 'sidebar') {
    const totalMonthlyCredits = monthlyStats.MonthlyCredits.usedCount + monthlyStats.MonthlyCredits.partiallyUsedCount + monthlyStats.MonthlyCredits.unusedCount;
    const usedMonthlyCredits = monthlyStats.MonthlyCredits.usedCount;
    const hasExpiringCredits = monthlyStats.ExpiringCredits.Total.count > 0;
    const showExpiringRow = !HIDE_EXPIRING_WHEN_NONE_SIDEBAR || hasExpiringCredits;

    return (
      <div className={`credit-summary-sidebar ${isUpdating ? 'updating' : ''}`}>
        <div className="sidebar-stat-row">
          <span className="stat-label">
            <Icon name={CREDIT_SUMMARY_SECTIONS.MONTHLY_CREDITS.icon} variant="micro" size={14} color={NEUTRAL_DARK_GRAY} />
            {CREDIT_SUMMARY_SECTIONS.MONTHLY_CREDITS.displayName}:
          </span>
          <span className="stat-value">
            ${monthlyStats.MonthlyCredits.usedValue} / ${monthlyStats.MonthlyCredits.possibleValue} ({usedMonthlyCredits} / {totalMonthlyCredits} credits used)
          </span>
        </div>
        <UsageBar
          segments={[
            {
              label: 'Used Value',
              value: monthlyStats.MonthlyCredits.usedValue,
              color: PRIMARY_COLOR,
            },
          ]}
          maxValue={monthlyStats.MonthlyCredits.possibleValue}
          height={8}
          borderRadius={4}
          showLabels={false}
          animate={true}
          className="credit-summary-usage-bar"
        />
        {showExpiringRow && (
          <div className="sidebar-stat-row expiring">
            <span className="stat-label">
              <Icon name={CREDIT_SUMMARY_SECTIONS.EXPIRING_CREDITS.icon} variant="micro" size={14} color={NEUTRAL_DARK_GRAY} />
              {CREDIT_SUMMARY_SECTIONS.EXPIRING_CREDITS.displayName}:
            </span>
            <span className="stat-value">
              {monthlyStats.ExpiringCredits.Total.count} credits (${monthlyStats.ExpiringCredits.Total.unusedValue})
            </span>
          </div>
        )}
      </div>
    );
  }

  const totalMonthlyCredits = monthlyStats.MonthlyCredits.usedCount + monthlyStats.MonthlyCredits.partiallyUsedCount + monthlyStats.MonthlyCredits.unusedCount;
  const usedMonthlyCredits = monthlyStats.MonthlyCredits.usedCount;

  return (
    <div className={`credit-summary-header ${isUpdating ? 'updating' : ''}`}>
      <div className="sidebar-stats-header">
        <div className="sidebar-stats-content">
          <div className="sidebar-stat-row">
            <span className="stat-label">
              <Icon name={CREDIT_SUMMARY_SECTIONS.MONTHLY_CREDITS.icon} variant="micro" size={14} color={NEUTRAL_DARK_GRAY} />
              {CREDIT_SUMMARY_SECTIONS.MONTHLY_CREDITS.displayName}:
            </span>
            <span className="stat-value">
              ${monthlyStats.MonthlyCredits.usedValue} / ${monthlyStats.MonthlyCredits.possibleValue} ({usedMonthlyCredits} / {totalMonthlyCredits} credits used)
            </span>
          </div>
          <UsageBar
            segments={[
              {
                label: 'Used Value',
                value: monthlyStats.MonthlyCredits.usedValue,
                color: PRIMARY_COLOR,
              },
            ]}
            maxValue={monthlyStats.MonthlyCredits.possibleValue}
            height={8}
            borderRadius={4}
            showLabels={false}
            animate={true}
            className="credit-summary-usage-bar"
          />
          <div className="sidebar-stat-row expiring">
            <span className="stat-label">
              <Icon name={CREDIT_SUMMARY_SECTIONS.EXPIRING_CREDITS.icon} variant="micro" size={14} color={NEUTRAL_DARK_GRAY} />
              {CREDIT_SUMMARY_SECTIONS.EXPIRING_CREDITS.displayName}:
            </span>
            <span className="stat-value">
              {monthlyStats.ExpiringCredits.Total.count} credits (${monthlyStats.ExpiringCredits.Total.unusedValue})
            </span>
          </div>
        </div>
      </div>
      {onDetailedSummaryClick && (
        <div className="credit-summary-buttons">
          <button
            className="button ghost icon with-text no-padding"
            onClick={onDetailedSummaryClick}
            aria-label="View monthly report"
          >
            <Icon name="report-icon" variant="micro" size={14} />
            See Full Report
          </button>
        </div>
      )}
    </div>
  );
};

export default CreditSummary;