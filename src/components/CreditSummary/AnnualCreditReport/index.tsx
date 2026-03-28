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
        <span className="section-summary-fraction">
          {formatCurrency(breakdown.totalUsed)} / {formatCurrency(breakdown.totalValue)}
        </span>
        <span className="utilization-badge">
          {Math.round(breakdown.utilizationRate * 100)}%
        </span>
      </div>
      <div className="period-bars">
        {breakdown.periods.map((period) => (
          <div key={period.periodNumber} className="period-bar-item">
            <div className="period-item-header">
              <span className="period-label">{period.periodLabel}</span>
              <span className="period-fraction">
                {formatCurrency(period.used)} / {formatCurrency(period.totalValue)}
              </span>
            </div>
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
      {/* Hero Summary Cards */}
      <div className="hero-cards">
        <div className="hero-card">
          <div className="hero-card-label">Total Value</div>
          <div className="hero-card-value">{formatCurrency(summary.totalValue)}</div>
          <div className="hero-card-sub">{formatCurrency(summary.totalUsed)} used</div>
        </div>
        <div className="hero-card">
          <div className="hero-card-label">Utilization</div>
          <div className="hero-card-value">{Math.round(summary.utilizationRate * 100)}%</div>
          <div className="hero-card-sub">{formatCurrency(summary.totalValue - summary.totalUsed)} remaining</div>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="summary-bar-section">
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
