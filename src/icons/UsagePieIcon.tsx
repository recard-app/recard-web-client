import React from 'react';

interface UsagePieIconProps {
  percentage: number;
  size: number;
  color: string;

  className?: string;
  style?: React.CSSProperties;
}

// SVG geometry derived from the not-used-icon-v2 ring path
const CENTER_X = 480;
const CENTER_Y = -480;
// Outer radius ~392, inner radius ~309 => midpoint ~350.5, thickness ~83
const RING_RADIUS = 350.5;
const RING_THICKNESS = 83;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// Opacity for the background track ring (unfilled portion)
const TRACK_OPACITY = 0.25;

const UsagePieIcon: React.FC<UsagePieIconProps> = ({ percentage, size, color, className, style }) => {
  const clampedPct = Math.max(0, Math.min(100, percentage));
  const dashLength = (clampedPct / 100) * CIRCUMFERENCE;
  const gapLength = CIRCUMFERENCE - dashLength;

  return (
    <svg
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 -960 960 960"
    >
      {/* Background track ring (dimmed) */}
      <circle
        cx={CENTER_X}
        cy={CENTER_Y}
        r={RING_RADIUS}
        fill="none"
        stroke={color}
        strokeWidth={RING_THICKNESS}
        opacity={TRACK_OPACITY}
      />

      {/* Dynamic fill arc */}
      {clampedPct > 0 && (
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={RING_RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={RING_THICKNESS}
          strokeDasharray={`${dashLength} ${gapLength}`}
          strokeDashoffset={0}
          strokeLinecap="butt"
          transform={`rotate(-90 ${CENTER_X} ${CENTER_Y})`}
        />
      )}
    </svg>
  );
};

export default UsagePieIcon;
