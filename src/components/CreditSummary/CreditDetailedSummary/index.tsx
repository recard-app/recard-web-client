import React from 'react';
import { MonthlyStatsResponse, CREDIT_SUMMARY_SECTIONS, CREDIT_USAGE_DISPLAY_COLORS } from '../../../types';
import COLORS from '../../../types/Colors';
import { InfoDisplay } from '../../../elements';
import Icon from '@/icons';
import UsageBar from '../../UsageBar';
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
  // Toggle this flag to show/hide mock expiring credits data
  const SHOW_MOCK_EXPIRING_DATA = false;
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

  // Calculate totals for each section
  const totalMonthlyCredits = monthlyStats.MonthlyCredits.usedCount + monthlyStats.MonthlyCredits.partiallyUsedCount + monthlyStats.MonthlyCredits.unusedCount;
  const totalCurrentCredits = monthlyStats.CurrentCredits.usedCount + monthlyStats.CurrentCredits.partiallyUsedCount + monthlyStats.CurrentCredits.unusedCount;
  const totalAllCredits = monthlyStats.AllCredits.usedCount + monthlyStats.AllCredits.partiallyUsedCount + monthlyStats.AllCredits.unusedCount;

  // Calculate totals for expiring credits
  const totalExpiringValue =
    monthlyStats.ExpiringCredits.Monthly.unusedValue +
    monthlyStats.ExpiringCredits.Quarterly.unusedValue +
    monthlyStats.ExpiringCredits.Semiannually.unusedValue +
    monthlyStats.ExpiringCredits.Annually.unusedValue;

  const totalExpiringCount =
    monthlyStats.ExpiringCredits.Monthly.count +
    monthlyStats.ExpiringCredits.Quarterly.count +
    monthlyStats.ExpiringCredits.Semiannually.count +
    monthlyStats.ExpiringCredits.Annually.count;

  // Mock data for expiring credits (for testing visualization)
  const mockExpiringCredits = {
    Monthly: { count: 3, unusedValue: 150.00 },
    Quarterly: { count: 2, unusedValue: 200.00 },
    Semiannually: { count: 1, unusedValue: 100.00 },
    Annually: { count: 1, unusedValue: 300.00 },
  };
  const mockTotalExpiringValue = 750.00;
  const mockTotalExpiringCount = 7;

  // Use mock data if flag is enabled and no real data exists
  const useMockData = SHOW_MOCK_EXPIRING_DATA && totalExpiringValue === 0 && totalExpiringCount === 0;
  const expiringData = useMockData ? mockExpiringCredits : monthlyStats.ExpiringCredits;
  const expiringTotalValue = useMockData ? mockTotalExpiringValue : totalExpiringValue;
  const expiringTotalCount = useMockData ? mockTotalExpiringCount : totalExpiringCount;

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

      {/* Section 1: Monthly Credits */}
      <div className="summary-section">
        <div className="section-header">
          <Icon name={CREDIT_SUMMARY_SECTIONS.MONTHLY_CREDITS.icon} variant="micro" size={16} color={COLORS.NEUTRAL_DARK_GRAY} />
          <h3 className="section-title">{CREDIT_SUMMARY_SECTIONS.MONTHLY_CREDITS.displayName}</h3>
        </div>
        <div className="metric-group">
          <div className="metric-item">
            <div className="metric-label">Dollar Value: {formatCurrency(monthlyStats.MonthlyCredits.usedValue)} / {formatCurrency(monthlyStats.MonthlyCredits.possibleValue)}</div>
            <UsageBar
              segments={[
                {
                  label: 'Used Value',
                  value: monthlyStats.MonthlyCredits.usedValue,
                  color: COLORS.PRIMARY_COLOR,
                },
              ]}
              maxValue={monthlyStats.MonthlyCredits.possibleValue}
              thickness={12}
              borderRadius={6}
              showLabels={false}
              animate={true}
              className="detailed-summary-usage-bar"
            />
          </div>
          <div className="metric-item">
            <div className="metric-label">Credit Count Breakdown</div>
            <UsageBar
              segments={[
                {
                  label: 'Used',
                  value: monthlyStats.MonthlyCredits.usedCount,
                  color: CREDIT_USAGE_DISPLAY_COLORS.USED,
                },
                {
                  label: 'Partially Used',
                  value: monthlyStats.MonthlyCredits.partiallyUsedCount,
                  color: CREDIT_USAGE_DISPLAY_COLORS.PARTIALLY_USED,
                },
                {
                  label: 'Unused',
                  value: monthlyStats.MonthlyCredits.unusedCount,
                  color: COLORS.NEUTRAL_GRAY,
                },
              ]}
              maxValue={totalMonthlyCredits}
              thickness={12}
              borderRadius={6}
              showLabels={true}
              animate={true}
              className="detailed-summary-usage-bar"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Credits to Date */}
      <div className="summary-section">
        <div className="section-header">
          <Icon name={CREDIT_SUMMARY_SECTIONS.CURRENT_CREDITS.icon} variant="micro" size={16} color={COLORS.NEUTRAL_DARK_GRAY} />
          <h3 className="section-title">{CREDIT_SUMMARY_SECTIONS.CURRENT_CREDITS.displayName}</h3>
        </div>
        <div className="metric-group">
          <div className="metric-item">
            <div className="metric-label">Dollar Value: {formatCurrency(monthlyStats.CurrentCredits.usedValue)} / {formatCurrency(monthlyStats.CurrentCredits.possibleValue)}</div>
            <UsageBar
              segments={[
                {
                  label: 'Used Value',
                  value: monthlyStats.CurrentCredits.usedValue,
                  color: COLORS.PRIMARY_COLOR,
                },
              ]}
              maxValue={monthlyStats.CurrentCredits.possibleValue}
              thickness={12}
              borderRadius={6}
              showLabels={false}
              animate={true}
              className="detailed-summary-usage-bar"
            />
          </div>
          <div className="metric-item">
            <div className="metric-label">Credit Count Breakdown</div>
            <UsageBar
              segments={[
                {
                  label: 'Used',
                  value: monthlyStats.CurrentCredits.usedCount,
                  color: CREDIT_USAGE_DISPLAY_COLORS.USED,
                },
                {
                  label: 'Partially Used',
                  value: monthlyStats.CurrentCredits.partiallyUsedCount,
                  color: CREDIT_USAGE_DISPLAY_COLORS.PARTIALLY_USED,
                },
                {
                  label: 'Unused',
                  value: monthlyStats.CurrentCredits.unusedCount,
                  color: COLORS.NEUTRAL_GRAY,
                },
              ]}
              maxValue={totalCurrentCredits}
              thickness={12}
              borderRadius={6}
              showLabels={true}
              animate={true}
              className="detailed-summary-usage-bar"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Annual Credits */}
      <div className="summary-section">
        <div className="section-header">
          <Icon name={CREDIT_SUMMARY_SECTIONS.ANNUAL_CREDITS.icon} variant="micro" size={16} color={COLORS.NEUTRAL_DARK_GRAY} />
          <h3 className="section-title">{CREDIT_SUMMARY_SECTIONS.ANNUAL_CREDITS.displayName}</h3>
        </div>
        <div className="metric-group">
          <div className="metric-item">
            <div className="metric-label">Dollar Value: {formatCurrency(monthlyStats.AllCredits.usedValue)} / {formatCurrency(monthlyStats.AllCredits.possibleValue)}</div>
            <UsageBar
              segments={[
                {
                  label: 'Used Value',
                  value: monthlyStats.AllCredits.usedValue,
                  color: COLORS.PRIMARY_COLOR,
                },
              ]}
              maxValue={monthlyStats.AllCredits.possibleValue}
              thickness={12}
              borderRadius={6}
              showLabels={false}
              animate={true}
              className="detailed-summary-usage-bar"
            />
          </div>
          <div className="metric-item">
            <div className="metric-label">Credit Count Breakdown</div>
            <UsageBar
              segments={[
                {
                  label: 'Used',
                  value: monthlyStats.AllCredits.usedCount,
                  color: CREDIT_USAGE_DISPLAY_COLORS.USED,
                },
                {
                  label: 'Partially Used',
                  value: monthlyStats.AllCredits.partiallyUsedCount,
                  color: CREDIT_USAGE_DISPLAY_COLORS.PARTIALLY_USED,
                },
                {
                  label: 'Unused',
                  value: monthlyStats.AllCredits.unusedCount,
                  color: COLORS.NEUTRAL_GRAY,
                },
              ]}
              maxValue={totalAllCredits}
              thickness={12}
              borderRadius={6}
              showLabels={true}
              animate={true}
              className="detailed-summary-usage-bar"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Expiring Credits */}
      <div className="summary-section">
        <div className="section-header">
          <Icon name={CREDIT_SUMMARY_SECTIONS.EXPIRING_CREDITS.icon} variant="micro" size={16} color={COLORS.NEUTRAL_DARK_GRAY} />
          <h3 className="section-title">{CREDIT_SUMMARY_SECTIONS.EXPIRING_CREDITS.displayName}</h3>
        </div>
        <div className="metric-group">
          <div className="metric-item">
            <div className="metric-label">Dollar Value by Period: {formatCurrency(expiringTotalValue)} Total</div>
            <UsageBar
              segments={[
                {
                  label: 'Monthly',
                  value: expiringData.Monthly.unusedValue,
                  color: COLORS.ERROR,
                },
                {
                  label: 'Quarterly',
                  value: expiringData.Quarterly.unusedValue,
                  color: COLORS.WARNING,
                },
                {
                  label: 'Semiannually',
                  value: expiringData.Semiannually.unusedValue,
                  color: COLORS.WARNING_YELLOW,
                },
                {
                  label: 'Annually',
                  value: expiringData.Annually.unusedValue,
                  color: COLORS.ACCENT_MEDIUM,
                },
              ]}
              maxValue={expiringTotalValue}
              thickness={12}
              borderRadius={6}
              showLabels={true}
              labelsVertical={true}
              animate={true}
              className="detailed-summary-usage-bar"
            />
          </div>
          <div className="metric-item">
            <div className="metric-label">Credit Count by Period: {expiringTotalCount} Total</div>
            <UsageBar
              segments={[
                {
                  label: 'Monthly',
                  value: expiringData.Monthly.count,
                  color: COLORS.ERROR,
                },
                {
                  label: 'Quarterly',
                  value: expiringData.Quarterly.count,
                  color: COLORS.WARNING,
                },
                {
                  label: 'Semiannually',
                  value: expiringData.Semiannually.count,
                  color: COLORS.WARNING_YELLOW,
                },
                {
                  label: 'Annually',
                  value: expiringData.Annually.count,
                  color: COLORS.ACCENT_MEDIUM,
                },
              ]}
              maxValue={expiringTotalCount}
              thickness={12}
              borderRadius={6}
              showLabels={true}
              labelsVertical={true}
              animate={true}
              className="detailed-summary-usage-bar"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditDetailedSummary;