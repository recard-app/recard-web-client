import React from 'react';
import { InfoDisplay } from '@/elements';

const types = ['default', 'error', 'info', 'warning', 'success', 'loading'] as const;

const InfoDisplaySection: React.FC = () => {
  return (
    <>
      <h2 className="ds-section-title">InfoDisplay</h2>
      <p className="ds-section-description">
        Status messages with semantic colors and icons for feedback, errors, and loading states
      </p>

      {/* All Types */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Types</h3>
        <div className="ds-component-grid">
          {types.map((type) => (
            <div key={type} className="ds-component-item" style={{ minWidth: '280px' }}>
              <span className="ds-component-name">type="{type}"</span>
              <InfoDisplay type={type} message={`This is a ${type} message`} />
            </div>
          ))}
        </div>
      </div>

      {/* Centered Variant */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Centered Variant</h3>
        <div className="ds-component-item-full">
          <span className="ds-component-name">centered=true</span>
          <InfoDisplay type="info" message="This message is centered in its container" centered />
        </div>
        <div className="ds-component-item-full" style={{ marginTop: '12px' }}>
          <span className="ds-component-name">centered + error</span>
          <InfoDisplay type="error" message="Centered error message" centered />
        </div>
        <div className="ds-component-item-full" style={{ marginTop: '12px' }}>
          <span className="ds-component-name">centered + loading</span>
          <InfoDisplay type="loading" message="Loading your data..." centered />
        </div>
      </div>

      {/* Transparent Variant */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Transparent Variant</h3>
        <div className="ds-component-grid">
          <div className="ds-component-item" style={{ minWidth: '280px' }}>
            <span className="ds-component-name">transparent=true</span>
            <InfoDisplay type="error" message="Transparent background" transparent />
          </div>
          <div className="ds-component-item" style={{ minWidth: '280px' }}>
            <span className="ds-component-name">transparent + warning</span>
            <InfoDisplay type="warning" message="Transparent warning" transparent />
          </div>
        </div>
      </div>

      {/* Show/Hide Title */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Title Visibility</h3>
        <div className="ds-component-grid">
          <div className="ds-component-item" style={{ minWidth: '280px' }}>
            <span className="ds-component-name">showTitle=true (default)</span>
            <InfoDisplay type="error" message="Something went wrong" />
          </div>
          <div className="ds-component-item" style={{ minWidth: '280px' }}>
            <span className="ds-component-name">showTitle=false</span>
            <InfoDisplay type="error" message="Something went wrong" showTitle={false} />
          </div>
        </div>
      </div>

      {/* Show/Hide Icon */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Icon Visibility</h3>
        <div className="ds-component-grid">
          <div className="ds-component-item" style={{ minWidth: '280px' }}>
            <span className="ds-component-name">showIcon=true (default)</span>
            <InfoDisplay type="success" message="Action completed" />
          </div>
          <div className="ds-component-item" style={{ minWidth: '280px' }}>
            <span className="ds-component-name">showIcon=false</span>
            <InfoDisplay type="success" message="Action completed" showIcon={false} />
          </div>
        </div>
      </div>

      {/* Hide Overflow */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Overflow Handling</h3>
        <div className="ds-component-grid">
          <div className="ds-component-item" style={{ minWidth: '280px', maxWidth: '350px' }}>
            <span className="ds-component-name">hideOverflow=true</span>
            <InfoDisplay 
              type="info" 
              message="This is a very long message that will be truncated when it exceeds the maximum width of the container" 
              hideOverflow 
            />
          </div>
        </div>
      </div>

      {/* Combined Modifiers */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Combined Modifiers</h3>
        <div className="ds-component-item-full">
          <span className="ds-component-name">centered + transparent + showTitle=false</span>
          <InfoDisplay 
            type="warning" 
            message="Rate limit reached. Please try again later." 
            centered 
            transparent 
            showTitle={false} 
          />
        </div>
      </div>
    </>
  );
};

export default InfoDisplaySection;

