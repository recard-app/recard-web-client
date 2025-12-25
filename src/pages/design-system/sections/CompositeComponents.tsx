import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import UsageBar from '@/components/UsageBar';
import { Icon } from '@/icons';
import { ICON_PRIMARY } from '@/types';
import '@/components/CreditCardDetailView/CreditCardDetailView.scss';

const CompositeComponents: React.FC = () => {
  const [toggleStates, setToggleStates] = useState({
    credit: true,
    multiplier: false,
    perk: true,
  });
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
              <PageHeader
                title="My Cards"
                icon={() => <Icon name="card" variant="mini" color={ICON_PRIMARY} size={20} />}
              />
            </div>
          </div>
          <div className="ds-component-item-full">
            <span className="ds-component-name">With subtitle</span>
            <div className="ds-page-header-demo">
              <PageHeader
                title="Credit Cards"
                icon={() => <Icon name="card" variant="mini" color={ICON_PRIMARY} size={20} />}
                subtitle="Manage your credit card collection"
              />
            </div>
          </div>
          <div className="ds-component-item-full">
            <span className="ds-component-name">With actions</span>
            <div className="ds-page-header-demo">
              <PageHeader
                title="My Credits"
                icon={() => <Icon name="banknotes" variant="mini" color={ICON_PRIMARY} size={20} />}
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
                icon={() => <Icon name="history" variant="mini" color={ICON_PRIMARY} size={20} />}
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
                icon={() => <Icon name="home" variant="mini" color={ICON_PRIMARY} size={20} />}
                titleLink="/design"
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

      {/* Disabled Pill */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Disabled Pill</h3>
        <p className="ds-variant-description">
          Small pill badge used to indicate a disabled component (credit, multiplier, or perk) in card detail views.
        </p>
        <div className="ds-component-grid">
          <div className="ds-component-item" style={{ minWidth: '200px' }}>
            <span className="ds-component-name">Standalone</span>
            <div className="card-details">
              <span className="disabled-pill">Disabled</span>
            </div>
          </div>
          <div className="ds-component-item" style={{ minWidth: '300px' }}>
            <span className="ds-component-name">Before credit title</span>
            <div className="card-details">
              <span style={{ fontWeight: 500, color: '#1a1a1a', fontSize: '14px' }}>
                <span className="disabled-pill">Disabled</span>
                Uber Cash Credit
              </span>
            </div>
          </div>
          <div className="ds-component-item" style={{ minWidth: '300px' }}>
            <span className="ds-component-name">Before multiplier name</span>
            <div className="card-details">
              <span style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '14px' }}>
                <span className="disabled-pill">Disabled</span>
                Dining
              </span>
            </div>
          </div>
          <div className="ds-component-item" style={{ minWidth: '300px' }}>
            <span className="ds-component-name">Before perk title</span>
            <div className="card-details">
              <span style={{ fontWeight: 500, color: '#1a1a1a', fontSize: '14px' }}>
                <span className="disabled-pill">Disabled</span>
                Priority Pass Lounge Access
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Inline Toggle Switch */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Inline Toggle Switch</h3>
        <p className="ds-variant-description">
          Compact toggle switch used inline with component items to enable/disable tracking for credits, multipliers, and perks.
        </p>
        <div className="ds-component-grid">
          <div className="ds-component-item" style={{ minWidth: '200px' }}>
            <span className="ds-component-name">Enabled (checked)</span>
            <div className="card-details">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={toggleStates.credit}
                  onChange={(e) => setToggleStates({ ...toggleStates, credit: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
          <div className="ds-component-item" style={{ minWidth: '200px' }}>
            <span className="ds-component-name">Disabled (unchecked)</span>
            <div className="card-details">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={toggleStates.multiplier}
                  onChange={(e) => setToggleStates({ ...toggleStates, multiplier: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
          <div className="ds-component-item" style={{ minWidth: '200px' }}>
            <span className="ds-component-name">Input disabled</span>
            <div className="card-details">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={false}
                  disabled
                  onChange={() => {}}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        <div className="ds-component-grid" style={{ marginTop: '16px' }}>
          <div className="ds-component-item-full">
            <span className="ds-component-name">With label (typical usage)</span>
            <div className="card-details" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={toggleStates.perk}
                  onChange={(e) => setToggleStates({ ...toggleStates, perk: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
              <span style={{ fontSize: '12px', fontWeight: 500, color: toggleStates.perk ? '#22CC9D' : '#666' }}>
                {toggleStates.perk ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Disabled Component States */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Disabled Component States</h3>
        <p className="ds-variant-description">
          Example of how disabled components appear in the card detail view with reduced opacity and the disabled pill.
        </p>
        <div className="ds-component-grid" style={{ flexDirection: 'column' }}>
          <div className="ds-component-item-full">
            <span className="ds-component-name">Enabled credit item</span>
            <div className="card-details">
              <div className="card-section" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                <div className="credits-list">
                  <div className="credit-item">
                    <div className="credit-header">
                      <span className="credit-title">Uber Cash Credit</span>
                      <span className="credit-value">$15</span>
                    </div>
                    <div className="credit-period">Monthly</div>
                    <div className="credit-description">Uber Cash for rides or Uber Eats orders</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="ds-component-item-full">
            <span className="ds-component-name">Disabled credit item (opacity: 0.5 + pill)</span>
            <div className="card-details">
              <div className="card-section" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                <div className="credits-list">
                  <div className="credit-item disabled">
                    <div className="credit-header">
                      <span className="credit-title">
                        <span className="disabled-pill">Disabled</span>
                        Uber Cash Credit
                      </span>
                      <span className="credit-value">$15</span>
                    </div>
                    <div className="credit-period">Monthly</div>
                    <div className="credit-description">Uber Cash for rides or Uber Eats orders</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompositeComponents;
