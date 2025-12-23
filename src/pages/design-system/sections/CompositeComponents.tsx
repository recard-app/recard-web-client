import React from 'react';
import PageHeader from '@/components/PageHeader';
import UsageBar from '@/components/UsageBar';
import { Icon } from '@/icons';

const CompositeComponents: React.FC = () => {
  return (
    <>
      <h2 className="ds-section-title">Composite Components</h2>
      <p className="ds-section-description">
        Higher-level components built from primitives for common UI patterns
      </p>

      {/* PageHeader */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">PageHeader</h3>
        <div className="ds-component-grid" style={{ flexDirection: 'column' }}>
          <div className="ds-component-item-full">
            <span className="ds-component-name">Basic</span>
            <div className="ds-page-header-demo">
              <PageHeader title="My Cards" />
            </div>
          </div>
          <div className="ds-component-item-full">
            <span className="ds-component-name">With subtitle</span>
            <div className="ds-page-header-demo">
              <PageHeader 
                title="Credit Cards" 
                subtitle="Manage your credit card collection"
              />
            </div>
          </div>
          <div className="ds-component-item-full">
            <span className="ds-component-name">With actions</span>
            <div className="ds-page-header-demo">
              <PageHeader 
                title="My Credits" 
                withActions
                actions={
                  <button className="button small icon with-text">
                    <Icon name="plus" variant="mini" size={16} />
                    Add Credit
                  </button>
                }
              />
            </div>
          </div>
          <div className="ds-component-item-full">
            <span className="ds-component-name">With help button</span>
            <div className="ds-page-header-demo">
              <PageHeader 
                title="Transaction History" 
                showHelpButton
                onHelpClick={() => alert('Help clicked!')}
              />
            </div>
          </div>
          <div className="ds-component-item-full">
            <span className="ds-component-name">With title link</span>
            <div className="ds-page-header-demo">
              <PageHeader 
                title="Back to Dashboard" 
                titleLink="/design-system"
              />
            </div>
          </div>
        </div>
      </div>

      {/* UsageBar */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">UsageBar</h3>
        <div className="ds-component-grid" style={{ flexDirection: 'column' }}>
          <div className="ds-component-item-full">
            <span className="ds-component-name">Single segment</span>
            <div className="ds-usage-bar-demo">
              <UsageBar
                segments={[{ label: 'Used', value: 65, color: '#22CC9D' }]}
                maxValue={100}
              />
            </div>
          </div>
          <div className="ds-component-item-full">
            <span className="ds-component-name">Multiple segments</span>
            <div className="ds-usage-bar-demo">
              <UsageBar
                segments={[
                  { label: 'Groceries', value: 150, color: '#22CC9D' },
                  { label: 'Dining', value: 75, color: '#2563EB' },
                  { label: 'Gas', value: 50, color: '#F59E0B' },
                ]}
                maxValue={500}
              />
            </div>
          </div>
          <div className="ds-component-item-full">
            <span className="ds-component-name">With labels (showLabels=true)</span>
            <div className="ds-usage-bar-demo">
              <UsageBar
                segments={[
                  { label: 'Completed', value: 8, color: '#22CC9D' },
                  { label: 'Pending', value: 3, color: '#F59E0B' },
                ]}
                maxValue={15}
                showLabels
              />
            </div>
          </div>
          <div className="ds-component-item-full">
            <span className="ds-component-name">Vertical labels (labelsVertical=true)</span>
            <div className="ds-usage-bar-demo">
              <UsageBar
                segments={[
                  { label: 'Travel', value: 500, color: '#22CC9D' },
                  { label: 'Shopping', value: 300, color: '#2563EB' },
                  { label: 'Entertainment', value: 200, color: '#EF4444' },
                ]}
                maxValue={1500}
                showLabels
                labelsVertical
              />
            </div>
          </div>
          <div className="ds-component-item-full">
            <span className="ds-component-name">Custom height (thickness=12)</span>
            <div className="ds-usage-bar-demo">
              <UsageBar
                segments={[{ label: 'Progress', value: 75, color: '#2563EB' }]}
                maxValue={100}
                thickness={12}
              />
            </div>
          </div>
          <div className="ds-component-item-full">
            <span className="ds-component-name">Custom border radius (borderRadius=0)</span>
            <div className="ds-usage-bar-demo">
              <UsageBar
                segments={[{ label: 'Progress', value: 60, color: '#22CC9D' }]}
                maxValue={100}
                borderRadius={0}
              />
            </div>
          </div>
          <div className="ds-component-item-full">
            <span className="ds-component-name">No animation (animate=false)</span>
            <div className="ds-usage-bar-demo">
              <UsageBar
                segments={[{ label: 'Static', value: 45, color: '#F59E0B' }]}
                maxValue={100}
                animate={false}
              />
            </div>
          </div>
          <div className="ds-component-item-full">
            <span className="ds-component-name">Exceeded max (overflow)</span>
            <div className="ds-usage-bar-demo">
              <UsageBar
                segments={[{ label: 'Over limit', value: 120, color: '#EF4444' }]}
                maxValue={100}
                showLabels
              />
            </div>
          </div>
          <div className="ds-component-item-full">
            <span className="ds-component-name">Empty (no segments)</span>
            <div className="ds-usage-bar-demo">
              <UsageBar
                segments={[]}
                maxValue={100}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompositeComponents;
