import React from 'react';
import UsageBar from '@/components/UsageBar';
import COLORS from '@/types/Colors';
import { formatCurrency } from './formatCurrency';

interface PeriodRowProps {
  label: string;
  usedValue: number;
  totalValue: number;
  muted?: boolean;
}

const PeriodRow: React.FC<PeriodRowProps> = ({ label, usedValue, totalValue, muted = false }) => (
  <div className={`report-period-row ${muted ? 'report-period-row--muted' : ''}`}>
    <span className="report-period-row__label">{label}</span>
    <div className="report-period-row__bar">
      <UsageBar
        segments={[{ label, value: usedValue, color: COLORS.PRIMARY_COLOR }]}
        maxValue={totalValue > 0 ? totalValue : 1}
        thickness={4}
        borderRadius={2}
        showLabels={false}
        animate
      />
    </div>
    <span className="report-period-row__values">
      {formatCurrency(usedValue)} / {formatCurrency(totalValue)}
    </span>
  </div>
);

export default PeriodRow;
