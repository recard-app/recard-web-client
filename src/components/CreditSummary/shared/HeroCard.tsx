import React from 'react';
import UsagePieIcon from '@/icons/UsagePieIcon';
import COLORS from '@/types/Colors';
import { formatCurrency } from './formatCurrency';

interface HeroCardProps {
  usedValue: number;
  totalValue: number;
  label: string;
}

const HeroCard: React.FC<HeroCardProps> = ({ usedValue, totalValue, label }) => {
  const utilization = totalValue > 0 ? Math.round((usedValue / totalValue) * 100) : 0;
  const remaining = totalValue - usedValue;

  return (
    <div className="report-hero">
      <UsagePieIcon
        percentage={utilization}
        size={108}
        thickness={66}
        color={COLORS.PRIMARY_COLOR}
        trackColor={COLORS.NEUTRAL_GRAY}
        centerText={`${utilization}%`}
        centerTextColor={COLORS.NEUTRAL_BLACK}
        centerSubText="used"
        centerSubTextColor={COLORS.NEUTRAL_MEDIUM_GRAY}
        animate
      />
      <div className="report-hero__stats">
        <span className="report-hero__label">{label}</span>
        <span className="report-hero__total">{formatCurrency(totalValue)}</span>
        <div className="report-hero__columns">
          <div className="report-hero__col">
            <span className="report-hero__col-label">USED</span>
            <span className="report-hero__col-value report-hero__col-value--used">{formatCurrency(usedValue)}</span>
          </div>
          <div className="report-hero__col">
            <span className="report-hero__col-label">REMAINING</span>
            <span className="report-hero__col-value report-hero__col-value--remaining">{formatCurrency(remaining)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroCard;
