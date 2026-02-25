import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../styling/themes';

function camelToKebab(key: string): string {
  return key.replace(/([A-Z])/g, '-$1').toLowerCase();
}

const colorGroups: { label: string; keys: (keyof ThemeColors)[] }[] = [
  {
    label: 'Primary Colors',
    keys: ['primaryLightest', 'primaryLight', 'primaryColor', 'primaryMedium', 'primaryDark', 'primaryDarkest'],
  },
  {
    label: 'Accent Colors',
    keys: ['accentLightest', 'accentColor', 'accentMedium', 'accentDark'],
  },
  {
    label: 'Neutral Colors',
    keys: ['neutralWhite', 'neutralLightestGray', 'neutralLightGray', 'neutralGray', 'neutralMediumGray', 'neutralDarkGray', 'neutralBlack'],
  },
  {
    label: 'Semantic Colors',
    keys: ['success', 'warningYellow', 'warning', 'error', 'info'],
  },
];

const typography = [
  { name: '$font-h1', size: '3rem', sample: 'Heading 1' },
  { name: '$font-h2', size: '2rem', sample: 'Heading 2' },
  { name: '$font-h3', size: '1.4rem', sample: 'Heading 3' },
  { name: '$font-h4', size: '1.3rem', sample: 'Heading 4' },
  { name: '$font-h5', size: '1.2rem', sample: 'Heading 5' },
  { name: '$font-h6', size: '1.125rem', sample: 'Heading 6' },
  { name: '$font-base', size: '1rem', sample: 'Base text (16px)' },
  { name: '$font-chat', size: '0.92rem', sample: 'Chat text size' },
  { name: '$font-sm', size: '0.875rem', sample: 'Small text (14px)' },
  { name: '$font-xs', size: '0.75rem', sample: 'Extra small (12px)' },
  { name: '$font-xxs', size: '0.6875rem', sample: 'Extra extra small (11px)' },
];

const fontFamilies = [
  { name: 'Cal Sans', variable: '$font-cal-sans', sample: 'The quick brown fox jumps over the lazy dog' },
  { name: 'Inter', variable: '$font-inter', sample: 'The quick brown fox jumps over the lazy dog' },
  { name: 'Manrope', variable: '$font-manrope', sample: 'The quick brown fox jumps over the lazy dog' },
];

const spacing = [
  { name: '$space-1', value: '4px' },
  { name: '$space-2', value: '8px' },
  { name: '$space-3', value: '12px' },
  { name: '$space-4', value: '16px' },
  { name: '$space-5', value: '20px' },
  { name: '$space-6', value: '24px' },
  { name: '$space-8', value: '32px' },
  { name: '$space-10', value: '40px' },
  { name: '$space-12', value: '48px' },
];

const shadows = [
  { name: '$shadow-sm', value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
  { name: '$shadow-base', value: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' },
  { name: '$shadow-md', value: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' },
  { name: '$shadow-lg', value: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
  { name: '$shadow-xl', value: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' },
];

const radii = [
  { name: '$radius-sm', value: '2px' },
  { name: '$radius-base', value: '4px' },
  { name: '$radius-md', value: '6px' },
  { name: '$radius-lg', value: '8px' },
  { name: '$radius-xl', value: '12px' },
  { name: '$radius-2xl', value: '16px' },
  { name: '$radius-full', value: '9999px' },
];

const DesignTokens: React.FC = () => {
  const { colors } = useTheme();

  return (
    <>
      <h2 className="ds-section-title">Design Tokens</h2>
      <p className="ds-section-description">
        Core design variables that define the visual language of the application
      </p>

      {colorGroups.map((group) => (
        <div key={group.label} className="ds-variant-group">
          <h3 className="ds-variant-label">{group.label}</h3>
          <div className="ds-color-grid">
            {group.keys.map((key) => {
              const value = colors[key];
              const name = camelToKebab(key);
              return (
                <div key={key} className="ds-color-swatch">
                  <div className="ds-color-preview" style={{ backgroundColor: value }} />
                  <div className="ds-color-info">
                    <span className="ds-color-name">{name}</span>
                    <span className="ds-color-value">{value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Typography - Font Families */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Font Families</h3>
        <div className="ds-typography-grid">
          {fontFamilies.map((font) => (
            <div key={font.name} className="ds-typography-sample">
              <span className="ds-typography-label">{font.variable}</span>
              <span 
                className="ds-typography-text" 
                style={{ 
                  fontFamily: font.name === 'Cal Sans' ? '"Cal Sans", sans-serif' : 
                              font.name === 'Inter' ? '"Inter", sans-serif' : 
                              '"Manrope", sans-serif',
                  fontSize: '1.25rem'
                }}
              >
                {font.sample}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Typography - Sizes */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Font Sizes</h3>
        <div className="ds-typography-grid">
          {typography.map((type) => (
            <div key={type.name} className="ds-typography-sample">
              <span className="ds-typography-label">{type.name}</span>
              <span className="ds-typography-text" style={{ fontSize: type.size }}>
                {type.sample}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Spacing */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Spacing Scale</h3>
        <div className="ds-spacing-grid">
          {spacing.map((space) => (
            <div key={space.name} className="ds-spacing-sample">
              <div 
                className="ds-spacing-box" 
                style={{ width: space.value, height: space.value }} 
              />
              <span className="ds-spacing-label">{space.name}</span>
              <span className="ds-spacing-label">{space.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Shadows */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Box Shadows</h3>
        <div className="ds-shadow-grid">
          {shadows.map((shadow) => (
            <div key={shadow.name} className="ds-shadow-sample">
              <div className="ds-shadow-box" style={{ boxShadow: shadow.value }} />
              <span className="ds-shadow-label">{shadow.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Border Radius */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Border Radius</h3>
        <div className="ds-radius-grid">
          {radii.map((radius) => (
            <div key={radius.name} className="ds-radius-sample">
              <div className="ds-radius-box" style={{ borderRadius: radius.value }} />
              <span className="ds-radius-label">{radius.name}</span>
              <span className="ds-radius-label">{radius.value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default DesignTokens;

