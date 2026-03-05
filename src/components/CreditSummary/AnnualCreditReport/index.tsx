import React from 'react';
import { AnnualStats, PeriodTypeBreakdown, CREDIT_SUMMARY_SECTIONS } from '../../../types';
import COLORS from '../../../types/Colors';
import { InfoDisplay } from '../../../elements';
import Icon from '@/icons';
import UsageBar from '../../UsageBar';
import './AnnualCreditReport.scss';

interface AnnualCreditReportProps {
  annualStats: AnnualStats | null;
  loading: boolean;
  error?: string | null;
  year: number;
}

const PERIOD_TYPE_CONFIG: {
  key: keyof Pick<AnnualStats, 'monthly' | 'quarterly' | 'semiannually' | 'annually'>;
  label: string;
  icon: string;
}[] = [
  { key: 'monthly', label: 'Monthly Credits', icon: CREDIT_SUMMARY_SECTIONS.MONTHLY_CREDITS.icon },
  { key: 'quarterly', label: 'Quarterly Credits', icon: CREDIT_SUMMARY_SECTIONS.CURRENT_CREDITS.icon },
  { key: 'semiannually', label: 'Semiannual Credits', icon: CREDIT_SUMMARY_SECTIONS.ANNUAL_CREDITS.icon },
  { key: 'annually', label: 'Annual Credits', icon: CREDIT_SUMMARY_SECTIONS.ANNUAL_CREDITS.icon },
];

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

const PeriodBreakdownSection: React.FC<{
  breakdown: PeriodTypeBreakdown;
  label: string;
  icon: string;
}> = ({ breakdown, label, icon }) => {
  if (breakdown.periods.length === 0) return null;

  return (
    <div className="summary-section">
      <div className="section-header">
        <Icon name={icon} variant="micro" size={16} color={COLORS.NEUTRAL_DARK_GRAY} />
        <h3 className="section-title">{label}</h3>
      </div>
      <div className="metric-group">
        <div className="metric-item">
          <div className="metric-label">
            Overall: {formatCurrency(breakdown.totalUsed)} / {formatCurrency(breakdown.totalValue)} ({Math.round(breakdown.utilizationRate * 100)}% utilized)
          </div>
          <UsageBar
            segments={[
              {
                label: 'Used',
                value: breakdown.totalUsed,
                color: COLORS.PRIMARY_COLOR,
              },
            ]}
            maxValue={breakdown.totalValue}
            thickness={10}
            borderRadius={5}
            showLabels={false}
            animate={true}
            className="report-usage-bar"
          />
        </div>
        <div className="period-bars">
          {breakdown.periods.map((period) => (
            <div key={period.periodNumber} className="period-bar-item">
              <span className="period-label">
                {period.periodLabel}: {formatCurrency(period.used)} / {formatCurrency(period.totalValue)}
              </span>
              <UsageBar
                segments={[
                  {
                    label: period.periodLabel,
                    value: period.used,
                    color: COLORS.PRIMARY_MEDIUM,
                  },
                ]}
                maxValue={period.totalValue}
                thickness={8}
                borderRadius={4}
                showLabels={false}
                animate={true}
                className="report-usage-bar"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AnnualCreditReport: React.FC<AnnualCreditReportProps> = ({
  annualStats,
  loading,
  error = null,
  year
}) => {
  if (loading && !annualStats) {
    return (
      <InfoDisplay
        type="loading"
        message="Loading annual report..."
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

  if (!annualStats) {
    return (
      <InfoDisplay
        type="default"
        message="No annual stats data available"
        showTitle={false}
        transparent={true}
        showIcon={false}
        centered={true}
      />
    );
  }

  const { summary } = annualStats;

  return (
    <div className="annual-credit-report">
      {/* Annual Summary */}
      <div className="summary-section">
        <div className="section-header">
          <Icon name={CREDIT_SUMMARY_SECTIONS.ANNUAL_CREDITS.icon} variant="micro" size={16} color={COLORS.NEUTRAL_DARK_GRAY} />
          <h3 className="section-title">{year} Annual Summary</h3>
        </div>
        <div className="metric-group">
          <div className="metric-item">
            <div className="metric-label">
              {formatCurrency(summary.totalUsed)} / {formatCurrency(summary.totalValue)} ({Math.round(summary.utilizationRate * 100)}% utilized)
            </div>
            <UsageBar
              segments={[
                {
                  label: 'Used',
                  value: summary.totalUsed,
                  color: COLORS.PRIMARY_COLOR,
                },
              ]}
              maxValue={summary.totalValue}
              thickness={12}
              borderRadius={6}
              showLabels={false}
              animate={true}
              className="report-usage-bar"
            />
          </div>
        </div>
      </div>

      {/* Per-period-type breakdowns */}
      {PERIOD_TYPE_CONFIG.map(({ key, label, icon }) => {
        const breakdown = annualStats[key];
        if (!breakdown || breakdown.periods.length === 0) return null;
        return (
          <PeriodBreakdownSection
            key={key}
            breakdown={breakdown}
            label={label}
            icon={icon}
          />
        );
      })}
    </div>
  );
};

export default AnnualCreditReport;
