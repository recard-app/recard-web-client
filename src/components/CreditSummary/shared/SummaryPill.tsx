import React from 'react';
import { formatCurrency } from './formatCurrency';

interface SummaryPillProps {
  usedValue: number;
  totalValue: number;
}

const SummaryPill: React.FC<SummaryPillProps> = ({ usedValue, totalValue }) => {
  const utilization = totalValue > 0 ? Math.round((usedValue / totalValue) * 100) : 0;
  const hasUsage = utilization > 0;

  return (
    <div className={`report-summary-pill ${hasUsage ? 'report-summary-pill--active' : ''}`}>
      <span className="report-summary-pill__values">
        <strong>{formatCurrency(usedValue)}</strong> / {formatCurrency(totalValue)}
      </span>
      <span className={`report-summary-pill__util ${hasUsage ? 'report-summary-pill__util--active' : ''}`}>
        {utilization}% utilized
      </span>
    </div>
  );
};

export default SummaryPill;
