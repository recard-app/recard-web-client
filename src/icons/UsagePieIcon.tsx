import React, { useEffect, useState } from 'react';

interface UsagePieIconProps {
  percentage: number;
  size: number;
  color: string;
  trackColor?: string;
  centerText?: string;
  centerTextColor?: string;
  centerSubText?: string;
  centerSubTextColor?: string;
  animate?: boolean;
  thickness?: number;

  className?: string;
  style?: React.CSSProperties;
}

// Ring geometry: center at (480, -480), outer radius 392, inner radius 309
const CENTER_X = 480;
const CENTER_Y = -480;
const RING_RADIUS = 350.5;
const RING_THICKNESS = 83;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// Opacity for the background track ring (unfilled portion)
const TRACK_OPACITY = 0.25;

const ANIMATION_DURATION_MS = 600;

const UsagePieIcon: React.FC<UsagePieIconProps> = ({ percentage, size, color, trackColor, centerText, centerTextColor, centerSubText, centerSubTextColor, animate = true, thickness, className, style }) => {
  const clampedPct = Math.max(0, Math.min(100, percentage));
  const [animatedPct, setAnimatedPct] = useState(animate ? 0 : clampedPct);

  useEffect(() => {
    if (!animate) {
      setAnimatedPct(clampedPct);
      return;
    }
    // Trigger animation on next frame so the initial 0 renders first
    const frame = requestAnimationFrame(() => {
      setAnimatedPct(clampedPct);
    });
    return () => cancelAnimationFrame(frame);
  }, [clampedPct, animate]);

  const dashLength = (animatedPct / 100) * CIRCUMFERENCE;
  const gapLength = CIRCUMFERENCE - dashLength;

  const ringThickness = thickness ?? RING_THICKNESS;
  const outerEdge = RING_RADIUS + ringThickness / 2 + 4;
  const vbX = CENTER_X - outerEdge;
  const vbY = CENTER_Y - outerEdge;
  const vbSize = outerEdge * 2;

  const fontSize = 173;
  const subFontSize = 110;
  const hasSubText = !!(centerText && centerSubText);

  return (
    <svg
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={`${vbX} ${vbY} ${vbSize} ${vbSize}`}
    >
      {/* Background track ring (dimmed) */}
      <circle
        cx={CENTER_X}
        cy={CENTER_Y}
        r={RING_RADIUS}
        fill="none"
        stroke={trackColor || color}
        strokeWidth={ringThickness}
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
          strokeWidth={ringThickness}
          strokeDasharray={`${dashLength} ${gapLength}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(-90 ${CENTER_X} ${CENTER_Y})`}
          style={animate ? {
            transition: `stroke-dasharray ${ANIMATION_DURATION_MS}ms ease-out`,
          } : undefined}
        />
      )}

      {/* Center text */}
      {centerText && (
        <text
          x={CENTER_X}
          y={hasSubText ? CENTER_Y - subFontSize * 0.7 : CENTER_Y}
          textAnchor="middle"
          dominantBaseline="central"
          fill={centerTextColor || color}
          fontSize={fontSize}
          fontWeight="700"
          fontFamily="inherit"
        >
          {centerText}
        </text>
      )}

      {/* Center sub-text */}
      {hasSubText && (
        <text
          x={CENTER_X}
          y={CENTER_Y + fontSize * 0.7}
          textAnchor="middle"
          dominantBaseline="central"
          fill={centerSubTextColor || centerTextColor || color}
          fontSize={subFontSize}
          fontWeight="700"
          fontFamily="inherit"
        >
          {centerSubText}
        </text>
      )}
    </svg>
  );
};

export default UsagePieIcon;
