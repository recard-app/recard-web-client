import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MonthlyStatsResponse } from '../../types';
import { InfoDisplay } from '../../elements';
import Icon from '@/icons';
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
  const navigate = useNavigate();

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
    const usedMonthlyCredits = monthlyStats.MonthlyCredits.usedCount + monthlyStats.MonthlyCredits.partiallyUsedCount;

    return (
      <div className="credit-summary-sidebar">
        <div className="sidebar-stat-row">
          <span className="stat-label">Monthly:</span>
          <span className="stat-value">
            {isUpdating ? "Updating..." : `$${monthlyStats.MonthlyCredits.usedValue} / $${monthlyStats.MonthlyCredits.possibleValue} (${usedMonthlyCredits} / ${totalMonthlyCredits} credits used)`}
          </span>
        </div>
        <div className="sidebar-stat-row expiring">
          <span className="stat-label">Expiring:</span>
          <span className="stat-value">
            {isUpdating ? "Updating..." : `${monthlyStats.ExpiringCredits.Total.count} credits ($${monthlyStats.ExpiringCredits.Total.unusedValue})`}
          </span>
        </div>
      </div>
    );
  }

  const totalMonthlyCredits = monthlyStats.MonthlyCredits.usedCount + monthlyStats.MonthlyCredits.partiallyUsedCount + monthlyStats.MonthlyCredits.unusedCount;
  const usedMonthlyCredits = monthlyStats.MonthlyCredits.usedCount + monthlyStats.MonthlyCredits.partiallyUsedCount;

  return (
    <div className="credit-summary-header">
      <div className="sidebar-stats-header">
        <div className="sidebar-stats-content">
          <div className="sidebar-stat-row">
            <span className="stat-label">Monthly:</span>
            <span className="stat-value">
              {isUpdating ? "Updating..." : `$${monthlyStats.MonthlyCredits.usedValue} / $${monthlyStats.MonthlyCredits.possibleValue} (${usedMonthlyCredits} / ${totalMonthlyCredits} credits used)`}
            </span>
          </div>
          <div className="sidebar-stat-row expiring">
            <span className="stat-label">Expiring:</span>
            <span className="stat-value">
              {isUpdating ? "Updating..." : `${monthlyStats.ExpiringCredits.Total.count} credits ($${monthlyStats.ExpiringCredits.Total.unusedValue})`}
            </span>
          </div>
        </div>
        {onDetailedSummaryClick && (
          <button
            className="button ghost icon"
            onClick={onDetailedSummaryClick}
            aria-label="View detailed analytics"
            title="View detailed analytics"
          >
            <Icon name="expand-arrows" variant="micro" size={16} />
          </button>
        )}
      </div>
      <div>
        <button
          className="button ghost icon with-text"
          onClick={() => navigate('/my-credits/history')}
        >
          <Icon name="history-clock" variant="micro" size={14} />
          See All Credits
        </button>
      </div>
    </div>
  );
};

export default CreditSummary;