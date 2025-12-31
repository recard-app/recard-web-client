import React from 'react';
import './UsageBar.scss';

export interface UsageBarSegment {
  label: string;
  value: number;
  color: string;
}

export interface UsageBarProps {
  segments: UsageBarSegment[];
  maxValue: number;
  height?: number;
  thickness?: number;
  borderRadius?: number;
  showLabels?: boolean;
  labelsVertical?: boolean;
  animate?: boolean;
  className?: string;
  valuePrefix?: string;
}

const UsageBar: React.FC<UsageBarProps> = ({
  segments,
  maxValue,
  height = 8,
  thickness,
  borderRadius = 4,
  showLabels = false,
  labelsVertical = false,
  animate = true,
  className = '',
  valuePrefix = '',
}) => {
  // Use thickness if provided, otherwise fall back to height
  const barHeight = thickness ?? height;
  // Filter out segments with zero or negative values
  const validSegments = segments.filter(segment => segment.value > 0);

  // Calculate total value from all segments
  const totalValue = validSegments.reduce((sum, segment) => sum + segment.value, 0);

  // Calculate percentage for each segment
  const segmentPercentages = validSegments.map(segment => ({
    ...segment,
    percentage: maxValue > 0 ? (segment.value / maxValue) * 100 : 0,
  }));

  // Calculate used percentage (total vs max)
  const usedPercentage = maxValue > 0 ? Math.min((totalValue / maxValue) * 100, 100) : 0;
  const remainingPercentage = 100 - usedPercentage;

  return (
    <div className={`usage-bar-container ${className}`}>
      <div
        className={`usage-bar ${animate ? 'usage-bar--animate' : ''}`}
        style={{
          height: `${barHeight}px`,
          borderRadius: `${borderRadius}px`,
        }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={maxValue}
        aria-valuenow={totalValue}
        aria-label={`Usage: ${totalValue} of ${maxValue}`}
      >
        {validSegments.length > 0 ? (
          <>
            {segmentPercentages.map((segment, index) => {
              const isFirst = index === 0;
              const isLast = index === segmentPercentages.length - 1;
              const isOnlySegment = validSegments.length === 1;

              return (
                <div
                  key={`${segment.label}-${index}`}
                  className="usage-bar-segment"
                  style={{
                    width: `${segment.percentage}%`,
                    backgroundColor: segment.color,
                    borderTopLeftRadius: isFirst || isOnlySegment ? `${borderRadius}px` : '0',
                    borderBottomLeftRadius: isFirst || isOnlySegment ? `${borderRadius}px` : '0',
                    borderTopRightRadius: (isLast && remainingPercentage === 0) || isOnlySegment ? `${borderRadius}px` : '0',
                    borderBottomRightRadius: (isLast && remainingPercentage === 0) || isOnlySegment ? `${borderRadius}px` : '0',
                  }}
                  title={`${segment.label}: ${valuePrefix}${segment.value}`}
                />
              );
            })}
            {remainingPercentage > 0 && (
              <div
                className="usage-bar-segment usage-bar-segment--remaining"
                style={{
                  width: `${remainingPercentage}%`,
                  borderTopRightRadius: `${borderRadius}px`,
                  borderBottomRightRadius: `${borderRadius}px`,
                }}
                title={`Remaining: ${valuePrefix}${maxValue - totalValue}`}
              />
            )}
          </>
        ) : (
          <div
            className="usage-bar-segment usage-bar-segment--empty"
            style={{
              width: '100%',
              borderRadius: `${borderRadius}px`,
            }}
            title="No usage"
          />
        )}
      </div>

      {showLabels && (
        <div className={`usage-bar-labels ${labelsVertical ? 'usage-bar-labels--vertical' : ''}`}>
          {validSegments.map((segment, index) => (
            <div key={`${segment.label}-label-${index}`} className="usage-bar-label">
              <span
                className="usage-bar-label-dot"
                style={{ backgroundColor: segment.color }}
              />
              <span className="usage-bar-label-text">
                {segment.label}: {valuePrefix}{segment.value}
              </span>
            </div>
          ))}
          {(remainingPercentage > 0 || validSegments.length === 0) && (
            <div className="usage-bar-label">
              <span className="usage-bar-label-dot usage-bar-label-dot--remaining" />
              <span className="usage-bar-label-text">
                Remaining: {valuePrefix}{maxValue - totalValue}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UsageBar;
