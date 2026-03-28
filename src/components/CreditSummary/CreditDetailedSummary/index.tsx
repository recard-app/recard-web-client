import React from 'react';
import { MonthlyStatsResponse, CREDIT_USAGE_DISPLAY_NAMES } from '../../../types';
import COLORS from '../../../types/Colors';
import { InfoDisplay } from '../../../elements';
import UsageBar from '../../UsageBar';
import {
  ReportCard,
  SectionHeader,
  HeroCard,
  CadenceRow,
  LegendDot,
  formatCurrency,
} from '../shared';
import CreditDetailedSummarySkeleton from './CreditDetailedSummarySkeleton';
import '../shared/shared.scss';
import './CreditDetailedSummary.scss';

interface CreditDetailedSummaryProps {
  monthlyStats: MonthlyStatsResponse | null;
  loading: boolean;
  isUpdating?: boolean;
  error?: string | null;
}

const CADENCE_KEYS = ['Monthly', 'Quarterly', 'Semiannually', 'Annually'] as const;
const CADENCE_LABELS: Record<string, string> = {
  Monthly: 'Monthly',
  Quarterly: 'Quarterly',
  Semiannually: 'Semiannual',
  Annually: 'Annual',
};

const CreditDetailedSummary: React.FC<CreditDetailedSummaryProps> = ({
  monthlyStats,
  loading,
  isUpdating = false,
  error = null,
}) => {
  // Toggle this flag to show/hide mock expiring credits data
  const SHOW_MOCK_EXPIRING_DATA = false;

  if (loading && !monthlyStats) {
    return <CreditDetailedSummarySkeleton />;
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

  // Hero data: overall active credits
  const activeTotalPossible = monthlyStats.PeriodBreakdown.Total.possibleValue;
  const activeTotalUsed = activeTotalPossible - monthlyStats.PeriodBreakdown.Total.unusedValue;

  // Credit count data
  const { usedCount, partiallyUsedCount, unusedCount } = monthlyStats.CurrentCredits;
  const totalCount = usedCount + partiallyUsedCount + unusedCount;
  const usedAndPartialCount = usedCount + partiallyUsedCount;

  // Expiring credits
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

  // Mock data for testing
  const mockExpiringCredits = {
    Monthly: { count: 3, unusedValue: 150.00 },
    Quarterly: { count: 2, unusedValue: 200.00 },
    Semiannually: { count: 1, unusedValue: 100.00 },
    Annually: { count: 1, unusedValue: 300.00 },
  };
  const mockTotalExpiringValue = 750.00;
  const mockTotalExpiringCount = 7;

  const useMockData = SHOW_MOCK_EXPIRING_DATA && totalExpiringValue === 0 && totalExpiringCount === 0;
  const expiringData = useMockData ? mockExpiringCredits : monthlyStats.ExpiringCredits;
  const expiringTotalValue = useMockData ? mockTotalExpiringValue : totalExpiringValue;
  const expiringTotalCount = useMockData ? mockTotalExpiringCount : totalExpiringCount;

  const hasExpiring = expiringTotalValue > 0 || expiringTotalCount > 0;

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

      {/* Section 1: Hero Card */}
      <ReportCard>
        <HeroCard
          usedValue={activeTotalUsed}
          totalValue={activeTotalPossible}
          label="ACTIVE CREDITS"
        />
      </ReportCard>

      {/* Section 2: By Cadence */}
      <ReportCard>
        <SectionHeader title="By Period" />
        {CADENCE_KEYS.map((key) => {
          const data = monthlyStats.PeriodBreakdown[key];
          if (data.count === 0) return null;
          const usedValue = data.possibleValue - data.unusedValue;
          return (
            <CadenceRow
              key={key}
              label={CADENCE_LABELS[key]}
              usedValue={usedValue}
              totalValue={data.possibleValue}
            />
          );
        })}
      </ReportCard>

      {/* Section 3: Credit Count */}
      <ReportCard>
        <SectionHeader
          title="Credit Count"
          rightText={`${usedAndPartialCount} / ${totalCount}`}
        />
        <UsageBar
          segments={[
            {
              label: CREDIT_USAGE_DISPLAY_NAMES.USED,
              value: usedCount,
              color: COLORS.PRIMARY_COLOR,
            },
            {
              label: CREDIT_USAGE_DISPLAY_NAMES.PARTIALLY_USED,
              value: partiallyUsedCount,
              color: COLORS.PRIMARY_LIGHT,
            },
          ]}
          maxValue={totalCount}
          thickness={8}
          borderRadius={4}
          showLabels={false}
          animate
        />
        <div className="credit-count-legend">
          <LegendDot color={COLORS.PRIMARY_COLOR} label={`${usedCount} Redeemed`} />
          <LegendDot color={COLORS.PRIMARY_LIGHT} label={`${partiallyUsedCount} Partial`} />
          <LegendDot color={COLORS.NEUTRAL_LIGHT_GRAY} label={`${unusedCount} Unused`} />
        </div>
      </ReportCard>

      {/* Section 4: Expiring Credits */}
      {hasExpiring && (
        <ReportCard borderColor={COLORS.WARNING}>
          <SectionHeader
            title="Expiring Credits"
            icon="clock"
            iconColor={COLORS.WARNING}
            rightText={`${formatCurrency(expiringTotalValue)} at risk`}
            rightTextColor={COLORS.WARNING_BADGE_TEXT}
          />

          <div className="expiring-sections">
            {/* By Value */}
            <div className="expiring-subsection">
              <div className="expiring-subsection__header">
                <span className="expiring-subsection__label">By Value</span>
                <span className="expiring-subsection__total">{formatCurrency(expiringTotalValue)}</span>
              </div>
              <UsageBar
                segments={[
                  { label: 'Monthly', value: expiringData.Monthly.unusedValue, color: COLORS.ERROR },
                  { label: 'Quarterly', value: expiringData.Quarterly.unusedValue, color: COLORS.WARNING },
                  { label: 'Semiannual', value: expiringData.Semiannually.unusedValue, color: COLORS.WARNING_YELLOW },
                  { label: 'Annual', value: expiringData.Annually.unusedValue, color: COLORS.ACCENT_MEDIUM },
                ]}
                maxValue={expiringTotalValue}
                thickness={8}
                borderRadius={4}
                showLabels={false}
                animate
              />
              <div className="credit-count-legend">
                {expiringData.Monthly.unusedValue > 0 && (
                  <LegendDot color={COLORS.ERROR} label={`Monthly: ${formatCurrency(expiringData.Monthly.unusedValue)}`} />
                )}
                {expiringData.Quarterly.unusedValue > 0 && (
                  <LegendDot color={COLORS.WARNING} label={`Quarterly: ${formatCurrency(expiringData.Quarterly.unusedValue)}`} />
                )}
                {expiringData.Semiannually.unusedValue > 0 && (
                  <LegendDot color={COLORS.WARNING_YELLOW} label={`Semiannual: ${formatCurrency(expiringData.Semiannually.unusedValue)}`} />
                )}
                {expiringData.Annually.unusedValue > 0 && (
                  <LegendDot color={COLORS.ACCENT_MEDIUM} label={`Annual: ${formatCurrency(expiringData.Annually.unusedValue)}`} />
                )}
              </div>
            </div>

            {/* By Count */}
            <div className="expiring-subsection">
              <div className="expiring-subsection__header">
                <span className="expiring-subsection__label">By Count</span>
                <span className="expiring-subsection__total">{expiringTotalCount} credits</span>
              </div>
              <UsageBar
                segments={[
                  { label: 'Monthly', value: expiringData.Monthly.count, color: COLORS.ERROR },
                  { label: 'Quarterly', value: expiringData.Quarterly.count, color: COLORS.WARNING },
                  { label: 'Semiannual', value: expiringData.Semiannually.count, color: COLORS.WARNING_YELLOW },
                  { label: 'Annual', value: expiringData.Annually.count, color: COLORS.ACCENT_MEDIUM },
                ]}
                maxValue={expiringTotalCount}
                thickness={8}
                borderRadius={4}
                showLabels={false}
                animate
              />
              <div className="credit-count-legend">
                {expiringData.Monthly.count > 0 && (
                  <LegendDot color={COLORS.ERROR} label={`Monthly: ${expiringData.Monthly.count}`} />
                )}
                {expiringData.Quarterly.count > 0 && (
                  <LegendDot color={COLORS.WARNING} label={`Quarterly: ${expiringData.Quarterly.count}`} />
                )}
                {expiringData.Semiannually.count > 0 && (
                  <LegendDot color={COLORS.WARNING_YELLOW} label={`Semiannual: ${expiringData.Semiannually.count}`} />
                )}
                {expiringData.Annually.count > 0 && (
                  <LegendDot color={COLORS.ACCENT_MEDIUM} label={`Annual: ${expiringData.Annually.count}`} />
                )}
              </div>
            </div>
          </div>
        </ReportCard>
      )}
    </div>
  );
};

export default CreditDetailedSummary;
