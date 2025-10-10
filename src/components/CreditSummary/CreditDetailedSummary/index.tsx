import React from 'react';
import { MonthlyStatsResponse, CREDIT_SUMMARY_SECTIONS } from '../../../types';
import { NEUTRAL_DARK_GRAY } from '../../../types/Colors';
import { InfoDisplay } from '../../../elements';
import Icon from '@/icons';
import './CreditDetailedSummary.scss';

interface CreditDetailedSummaryProps {
  monthlyStats: MonthlyStatsResponse | null;
  loading: boolean;
  isUpdating?: boolean;
  error?: string | null;
}

const CreditDetailedSummary: React.FC<CreditDetailedSummaryProps> = ({
  monthlyStats,
  loading,
  isUpdating = false,
  error = null
}) => {
  if (loading && !monthlyStats) {
    return (
      <InfoDisplay
        type="loading"
        message="Loading detailed credit analytics..."
        showTitle={false}
        transparent={true}
      />
    );
  }

  if (error) {
    return (
      <InfoDisplay
        type="error"
        message={`Error: ${error}`}
        showTitle={false}
        transparent={true}
      />
    );
  }

  if (!monthlyStats) {
    return (
      <InfoDisplay
        type="default"
        message="No detailed analytics data available"
        showTitle={false}
        transparent={true}
        showIcon={false}
        centered={true}
      />
    );
  }

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  // Calculate totals for display
  const totalMonthlyCredits = monthlyStats.MonthlyCredits.usedCount + monthlyStats.MonthlyCredits.partiallyUsedCount + monthlyStats.MonthlyCredits.unusedCount;
  const usedMonthlyCredits = monthlyStats.MonthlyCredits.usedCount;

  const totalCurrentCredits = monthlyStats.CurrentCredits.usedCount + monthlyStats.CurrentCredits.partiallyUsedCount + monthlyStats.CurrentCredits.unusedCount;
  const usedCurrentCredits = monthlyStats.CurrentCredits.usedCount;

  const totalAllCredits = monthlyStats.AllCredits.usedCount + monthlyStats.AllCredits.partiallyUsedCount + monthlyStats.AllCredits.unusedCount;
  const usedAllCredits = monthlyStats.AllCredits.usedCount;

  return (
    <div className="credit-detailed-summary">
      {isUpdating && (
        <div className="updating-overlay">
          <InfoDisplay
            type="loading"
            message="Updating analytics..."
            showTitle={false}
            transparent={true}
          />
        </div>
      )}

      <div className="detailed-simple-stats">
        <div className="stat-line">
          <span className="stat-label">
            <Icon name={CREDIT_SUMMARY_SECTIONS.MONTHLY_CREDITS.icon} variant="micro" size={14} color={NEUTRAL_DARK_GRAY} />
            {CREDIT_SUMMARY_SECTIONS.MONTHLY_CREDITS.displayName}:
          </span>
          <span className="stat-value">
            {formatCurrency(monthlyStats.MonthlyCredits.usedValue)} / {formatCurrency(monthlyStats.MonthlyCredits.possibleValue)} ({usedMonthlyCredits} / {totalMonthlyCredits} credits used)
          </span>
        </div>

        <div className="stat-line">
          <span className="stat-label">
            <Icon name={CREDIT_SUMMARY_SECTIONS.CURRENT_CREDITS.icon} variant="micro" size={14} color={NEUTRAL_DARK_GRAY} />
            {CREDIT_SUMMARY_SECTIONS.CURRENT_CREDITS.displayName}:
          </span>
          <span className="stat-value">
            {formatCurrency(monthlyStats.CurrentCredits.usedValue)} / {formatCurrency(monthlyStats.CurrentCredits.possibleValue)} ({usedCurrentCredits} / {totalCurrentCredits} credits used)
          </span>
        </div>

        <div className="stat-line">
          <span className="stat-label">
            <Icon name={CREDIT_SUMMARY_SECTIONS.ANNUAL_CREDITS.icon} variant="micro" size={14} color={NEUTRAL_DARK_GRAY} />
            {CREDIT_SUMMARY_SECTIONS.ANNUAL_CREDITS.displayName}:
          </span>
          <span className="stat-value">
            {formatCurrency(monthlyStats.AllCredits.usedValue)} / {formatCurrency(monthlyStats.AllCredits.possibleValue)} ({usedAllCredits} / {totalAllCredits} credits used)
          </span>
        </div>

        <div className="stat-line">
          <span className="stat-label">
            <Icon name={CREDIT_SUMMARY_SECTIONS.EXPIRING_CREDITS.icon} variant="micro" size={14} color={NEUTRAL_DARK_GRAY} />
            {CREDIT_SUMMARY_SECTIONS.EXPIRING_CREDITS.displayName}:
          </span>
          <span className="stat-value">
            {monthlyStats.ExpiringCredits.Total.count} credits ({formatCurrency(monthlyStats.ExpiringCredits.Total.unusedValue)})
          </span>
        </div>
      </div>

      <div className="summary-section">
        <h3 className="section-title">Detailed Breakdown</h3>

        <div className="summary-section">
          <h4 className="section-title">{CREDIT_SUMMARY_SECTIONS.MONTHLY_CREDITS.displayName}</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Used Value</span>
              <span className="stat-value">{formatCurrency(monthlyStats.MonthlyCredits.usedValue)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Possible Value</span>
              <span className="stat-value">{formatCurrency(monthlyStats.MonthlyCredits.possibleValue)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Used Count</span>
              <span className="stat-value">{monthlyStats.MonthlyCredits.usedCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Partially Used Count</span>
              <span className="stat-value">{monthlyStats.MonthlyCredits.partiallyUsedCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Unused Count</span>
              <span className="stat-value">{monthlyStats.MonthlyCredits.unusedCount}</span>
            </div>
          </div>
        </div>

        <div className="summary-section">
          <h4 className="section-title">{CREDIT_SUMMARY_SECTIONS.CURRENT_CREDITS.displayName}</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Used Value</span>
              <span className="stat-value">{formatCurrency(monthlyStats.CurrentCredits.usedValue)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Possible Value</span>
              <span className="stat-value">{formatCurrency(monthlyStats.CurrentCredits.possibleValue)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Used Count</span>
              <span className="stat-value">{monthlyStats.CurrentCredits.usedCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Partially Used Count</span>
              <span className="stat-value">{monthlyStats.CurrentCredits.partiallyUsedCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Unused Count</span>
              <span className="stat-value">{monthlyStats.CurrentCredits.unusedCount}</span>
            </div>
          </div>
        </div>

        <div className="summary-section">
          <h4 className="section-title">{CREDIT_SUMMARY_SECTIONS.ANNUAL_CREDITS.displayName}</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Used Value</span>
              <span className="stat-value">{formatCurrency(monthlyStats.AllCredits.usedValue)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Possible Value</span>
              <span className="stat-value">{formatCurrency(monthlyStats.AllCredits.possibleValue)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Used Count</span>
              <span className="stat-value">{monthlyStats.AllCredits.usedCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Partially Used Count</span>
              <span className="stat-value">{monthlyStats.AllCredits.partiallyUsedCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Unused Count</span>
              <span className="stat-value">{monthlyStats.AllCredits.unusedCount}</span>
            </div>
          </div>
        </div>

        <div className="summary-section">
          <h4 className="section-title">{CREDIT_SUMMARY_SECTIONS.EXPIRING_CREDITS.displayName}</h4>
          <div className="expiring-breakdown">
            <div className="expiring-period">
              <h5 className="period-title">Monthly</h5>
              <div className="stats-grid-compact">
                <div className="stat-item">
                  <span className="stat-label">Count</span>
                  <span className="stat-value">{monthlyStats.ExpiringCredits.Monthly.count}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Unused Value</span>
                  <span className="stat-value">{formatCurrency(monthlyStats.ExpiringCredits.Monthly.unusedValue)}</span>
                </div>
              </div>
            </div>

            <div className="expiring-period">
              <h5 className="period-title">Quarterly</h5>
              <div className="stats-grid-compact">
                <div className="stat-item">
                  <span className="stat-label">Count</span>
                  <span className="stat-value">{monthlyStats.ExpiringCredits.Quarterly.count}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Unused Value</span>
                  <span className="stat-value">{formatCurrency(monthlyStats.ExpiringCredits.Quarterly.unusedValue)}</span>
                </div>
              </div>
            </div>

            <div className="expiring-period">
              <h5 className="period-title">Semiannually</h5>
              <div className="stats-grid-compact">
                <div className="stat-item">
                  <span className="stat-label">Count</span>
                  <span className="stat-value">{monthlyStats.ExpiringCredits.Semiannually.count}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Unused Value</span>
                  <span className="stat-value">{formatCurrency(monthlyStats.ExpiringCredits.Semiannually.unusedValue)}</span>
                </div>
              </div>
            </div>

            <div className="expiring-period">
              <h5 className="period-title">Annually</h5>
              <div className="stats-grid-compact">
                <div className="stat-item">
                  <span className="stat-label">Count</span>
                  <span className="stat-value">{monthlyStats.ExpiringCredits.Annually.count}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Unused Value</span>
                  <span className="stat-value">{formatCurrency(monthlyStats.ExpiringCredits.Annually.unusedValue)}</span>
                </div>
              </div>
            </div>

            <div className="expiring-total">
              <h5 className="period-title">Total Expiring</h5>
              <div className="stats-grid-compact highlight">
                <div className="stat-item">
                  <span className="stat-label">Count</span>
                  <span className="stat-value">{monthlyStats.ExpiringCredits.Total.count}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Unused Value</span>
                  <span className="stat-value">{formatCurrency(monthlyStats.ExpiringCredits.Total.unusedValue)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditDetailedSummary;