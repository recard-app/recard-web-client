import React from 'react';
import { AnnualStats, PeriodTypeBreakdown, PeriodEntry } from '../../../types';
import { InfoDisplay } from '../../../elements';
import {
  ReportCard,
  SectionHeader,
  HeroCard,
  CadenceRow,
  SummaryPill,
  PeriodRow,
} from '../shared';
import AnnualCreditReportSkeleton from './AnnualCreditReportSkeleton';
import '../shared/shared.scss';
import './AnnualCreditReport.scss';

interface AnnualCreditReportProps {
  annualStats: AnnualStats | null;
  loading: boolean;
  error?: string | null;
  year: number;
}

const CADENCE_CONFIG: {
  key: keyof Pick<AnnualStats, 'monthly' | 'quarterly' | 'semiannually' | 'annually'>;
  label: string;
}[] = [
  { key: 'monthly', label: 'Monthly' },
  { key: 'quarterly', label: 'Quarterly' },
  { key: 'semiannually', label: 'Semiannual' },
  { key: 'annually', label: 'Annual' },
];

const DETAIL_SECTIONS: {
  key: keyof Pick<AnnualStats, 'monthly' | 'quarterly' | 'semiannually' | 'annually'>;
  title: string;
  allLabels: string[];
}[] = [
  {
    key: 'monthly',
    title: 'Monthly Detail',
    allLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
  {
    key: 'quarterly',
    title: 'Quarterly Detail',
    allLabels: ['Q1', 'Q2', 'Q3', 'Q4'],
  },
  {
    key: 'semiannually',
    title: 'Semiannual Detail',
    allLabels: ['H1', 'H2'],
  },
  {
    key: 'annually',
    title: 'Annual Detail',
    allLabels: [], // will use the year dynamically
  },
];

const PeriodDetailSection: React.FC<{
  breakdown: PeriodTypeBreakdown;
  title: string;
  allLabels: string[];
  year: number;
}> = ({ breakdown, title, allLabels, year }) => {
  // Build a map of periodNumber -> PeriodEntry for quick lookup
  const periodMap = new Map<number, PeriodEntry>();
  for (const p of breakdown.periods) {
    periodMap.set(p.periodNumber, p);
  }

  // For annual detail, use the year as the only label
  const labels = allLabels.length > 0 ? allLabels : [String(year)];

  return (
    <ReportCard>
      <SectionHeader title={title} />
      <SummaryPill usedValue={breakdown.totalUsed} totalValue={breakdown.totalValue} />
      {labels.map((label, idx) => {
        const periodNumber = idx + 1;
        const entry = periodMap.get(periodNumber);
        const hasData = entry && (entry.used > 0 || entry.totalValue > 0);
        return (
          <PeriodRow
            key={label}
            label={label}
            usedValue={entry?.used ?? 0}
            totalValue={entry?.totalValue ?? 0}
            muted={!hasData}
          />
        );
      })}
    </ReportCard>
  );
};

const AnnualCreditReport: React.FC<AnnualCreditReportProps> = ({
  annualStats,
  loading,
  error = null,
  year,
}) => {
  if (loading && !annualStats) {
    return <AnnualCreditReportSkeleton />;
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
      {/* Section 1: Hero Card */}
      <ReportCard>
        <HeroCard
          usedValue={summary.totalUsed}
          totalValue={summary.totalValue}
          label={`${year} TOTAL`}
        />
      </ReportCard>

      {/* Section 2: By Cadence */}
      <ReportCard>
        <SectionHeader title="By Period" />
        {CADENCE_CONFIG.map(({ key, label }) => {
          const breakdown = annualStats[key];
          if (!breakdown || breakdown.periods.length === 0) return null;
          return (
            <CadenceRow
              key={key}
              label={label}
              usedValue={breakdown.totalUsed}
              totalValue={breakdown.totalValue}
            />
          );
        })}
      </ReportCard>

      {/* Sections 3-6: Period Detail Sections */}
      {DETAIL_SECTIONS.map(({ key, title, allLabels }) => {
        const breakdown = annualStats[key];
        if (!breakdown || breakdown.periods.length === 0) return null;
        return (
          <PeriodDetailSection
            key={key}
            breakdown={breakdown}
            title={title}
            allLabels={allLabels}
            year={year}
          />
        );
      })}
    </div>
  );
};

export default AnnualCreditReport;
