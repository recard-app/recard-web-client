import React from 'react';

interface ReportCardProps {
  children: React.ReactNode;
  className?: string;
  borderColor?: string;
}

const ReportCard: React.FC<ReportCardProps> = ({ children, className, borderColor }) => (
  <div
    className={`report-card ${className ?? ''}`}
    style={borderColor ? { border: `1px solid ${borderColor}` } : undefined}
  >
    {children}
  </div>
);

export default ReportCard;
