import React from 'react';
import UsageBar from '@/components/UsageBar';
import COLORS from '@/types/Colors';
import { formatCurrency } from './formatCurrency';

interface CadenceRowProps {
  label: string;
  usedValue: number;
  totalValue: number;
}

const CadenceRow: React.FC<CadenceRowProps> = ({ label, usedValue, totalValue }) => (
  <div className="report-cadence-row">
    <div className="report-cadence-row__header">
      <span className="report-cadence-row__label">{label}</span>
      <span className="report-cadence-row__values">
        {formatCurrency(usedValue)} / {formatCurrency(totalValue)}
      </span>
    </div>
    <UsageBar
      segments={[{ label, value: usedValue, color: COLORS.PRIMARY_COLOR }]}
      maxValue={totalValue}
      thickness={6}
      borderRadius={3}
      showLabels={false}
      animate
    />
  </div>
);

export default CadenceRow;
