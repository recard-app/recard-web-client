import React from 'react';

interface LegendDotProps {
  color: string;
  label: string;
}

const LegendDot: React.FC<LegendDotProps> = ({ color, label }) => (
  <div className="report-legend-dot">
    <span className="report-legend-dot__circle" style={{ backgroundColor: color }} />
    <span className="report-legend-dot__label">{label}</span>
  </div>
);

export default LegendDot;
