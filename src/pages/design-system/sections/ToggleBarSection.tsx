import React, { useState } from 'react';
import { ToggleBar, ToggleBarButton } from '@/components/ui/toggle-bar/toggle-bar';
import { TabBar } from '@/elements';

const sizes = ['default', 'small', 'mini'] as const;
const variants = ['default', 'outline', 'ghost'] as const;

const ToggleBarSection: React.FC = () => {
  const [activeSize, setActiveSize] = useState<Record<string, string>>({});
  const [activeVariant, setActiveVariant] = useState<Record<string, string>>({});
  const [activeTabBar, setActiveTabBar] = useState<Record<string, string>>({
    'two-options': 'option1',
    'three-options': 'daily',
    'four-options': 'active',
    'small-size': 'tab1'
  });

  return (
    <>
      <h2 className="ds-section-title">Toggle Bar</h2>
      <p className="ds-section-description">
        Side-by-side button group for switching between options, like a chocolate candy bar
      </p>

      {/* Sizes */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Sizes</h3>
        <div className="ds-component-grid">
          {sizes.map((size) => (
            <div key={size} className="ds-component-item">
              <span className="ds-component-name">size="{size}"</span>
              <ToggleBar>
                <ToggleBarButton
                  size={size}
                  pressed={activeSize[size] === 'option1'}
                  onPressedChange={() => setActiveSize({ ...activeSize, [size]: 'option1' })}
                >
                  Option 1
                </ToggleBarButton>
                <ToggleBarButton
                  size={size}
                  pressed={activeSize[size] === 'option2'}
                  onPressedChange={() => setActiveSize({ ...activeSize, [size]: 'option2' })}
                >
                  Option 2
                </ToggleBarButton>
              </ToggleBar>
            </div>
          ))}
        </div>
      </div>

      {/* Variants */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Variants</h3>
        <div className="ds-component-grid">
          {variants.map((variant) => (
            <div key={variant} className="ds-component-item">
              <span className="ds-component-name">variant="{variant}"</span>
              <ToggleBar>
                <ToggleBarButton
                  variant={variant}
                  pressed={activeVariant[variant] === 'option1'}
                  onPressedChange={() => setActiveVariant({ ...activeVariant, [variant]: 'option1' })}
                >
                  Option 1
                </ToggleBarButton>
                <ToggleBarButton
                  variant={variant}
                  pressed={activeVariant[variant] === 'option2'}
                  onPressedChange={() => setActiveVariant({ ...activeVariant, [variant]: 'option2' })}
                >
                  Option 2
                </ToggleBarButton>
              </ToggleBar>
            </div>
          ))}
        </div>
      </div>

      {/* Pressed States */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Pressed States</h3>
        <div className="ds-component-grid">
          <div className="ds-component-item">
            <span className="ds-component-name">First pressed</span>
            <ToggleBar>
              <ToggleBarButton pressed>Active</ToggleBarButton>
              <ToggleBarButton pressed={false}>Inactive</ToggleBarButton>
            </ToggleBar>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">Second pressed</span>
            <ToggleBar>
              <ToggleBarButton pressed={false}>Inactive</ToggleBarButton>
              <ToggleBarButton pressed>Active</ToggleBarButton>
            </ToggleBar>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">None pressed</span>
            <ToggleBar>
              <ToggleBarButton pressed={false}>Option 1</ToggleBarButton>
              <ToggleBarButton pressed={false}>Option 2</ToggleBarButton>
            </ToggleBar>
          </div>
        </div>
      </div>

      {/* Multiple Options */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Multiple Options</h3>
        <div className="ds-component-grid">
          <div className="ds-component-item" style={{ minWidth: '300px' }}>
            <span className="ds-component-name">3 options</span>
            <ToggleBar>
              <ToggleBarButton pressed size="small">Daily</ToggleBarButton>
              <ToggleBarButton pressed={false} size="small">Weekly</ToggleBarButton>
              <ToggleBarButton pressed={false} size="small">Monthly</ToggleBarButton>
            </ToggleBar>
          </div>
          <div className="ds-component-item" style={{ minWidth: '350px' }}>
            <span className="ds-component-name">4 options</span>
            <ToggleBar>
              <ToggleBarButton pressed={false} size="mini">All</ToggleBarButton>
              <ToggleBarButton pressed size="mini">Active</ToggleBarButton>
              <ToggleBarButton pressed={false} size="mini">Pending</ToggleBarButton>
              <ToggleBarButton pressed={false} size="mini">Archived</ToggleBarButton>
            </ToggleBar>
          </div>
        </div>
      </div>

      {/* Size + Variant Combinations */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Size + Variant Combinations</h3>
        <div className="ds-component-grid">
          <div className="ds-component-item">
            <span className="ds-component-name">mini + ghost</span>
            <ToggleBar>
              <ToggleBarButton size="mini" variant="ghost" pressed>Yes</ToggleBarButton>
              <ToggleBarButton size="mini" variant="ghost" pressed={false}>No</ToggleBarButton>
            </ToggleBar>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">small + outline</span>
            <ToggleBar>
              <ToggleBarButton size="small" variant="outline" pressed>Enabled</ToggleBarButton>
              <ToggleBarButton size="small" variant="outline" pressed={false}>Disabled</ToggleBarButton>
            </ToggleBar>
          </div>
        </div>
      </div>

      {/* Tab Bar Section */}
      <h2 className="ds-section-title" style={{ marginTop: '3rem' }}>Tab Bar</h2>
      <p className="ds-section-description">
        Full-width pill-style navigation tabs for switching between views or pages
      </p>

      {/* Tab Bar - Basic */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Basic Usage</h3>
        <div className="ds-component-grid">
          <div className="ds-component-item" style={{ minWidth: '280px' }}>
            <span className="ds-component-name">2 options</span>
            <TabBar
              options={[
                { id: 'option1', label: 'Summary' },
                { id: 'option2', label: 'By Card' }
              ]}
              activeId={activeTabBar['two-options']}
              onChange={(id) => setActiveTabBar({ ...activeTabBar, 'two-options': id })}
            />
          </div>
        </div>
      </div>

      {/* Tab Bar - Multiple Options */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Multiple Options</h3>
        <div className="ds-component-grid">
          <div className="ds-component-item" style={{ minWidth: '320px' }}>
            <span className="ds-component-name">3 options</span>
            <TabBar
              options={[
                { id: 'daily', label: 'Daily' },
                { id: 'weekly', label: 'Weekly' },
                { id: 'monthly', label: 'Monthly' }
              ]}
              activeId={activeTabBar['three-options']}
              onChange={(id) => setActiveTabBar({ ...activeTabBar, 'three-options': id })}
            />
          </div>
          <div className="ds-component-item" style={{ minWidth: '380px' }}>
            <span className="ds-component-name">4 options</span>
            <TabBar
              options={[
                { id: 'all', label: 'All' },
                { id: 'active', label: 'Active' },
                { id: 'pending', label: 'Pending' },
                { id: 'archived', label: 'Archived' }
              ]}
              activeId={activeTabBar['four-options']}
              onChange={(id) => setActiveTabBar({ ...activeTabBar, 'four-options': id })}
            />
          </div>
        </div>
      </div>

      {/* Tab Bar - Sizes */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Sizes</h3>
        <div className="ds-component-grid">
          <div className="ds-component-item" style={{ minWidth: '280px' }}>
            <span className="ds-component-name">size="default"</span>
            <TabBar
              options={[
                { id: 'tab1', label: 'Tab 1' },
                { id: 'tab2', label: 'Tab 2' }
              ]}
              activeId={activeTabBar['small-size'] === 'tab1' ? 'tab1' : 'tab2'}
              onChange={(id) => setActiveTabBar({ ...activeTabBar, 'small-size': id })}
            />
          </div>
          <div className="ds-component-item" style={{ minWidth: '280px' }}>
            <span className="ds-component-name">size="small"</span>
            <TabBar
              options={[
                { id: 'tab1', label: 'Tab 1' },
                { id: 'tab2', label: 'Tab 2' }
              ]}
              activeId={activeTabBar['small-size'] === 'tab1' ? 'tab1' : 'tab2'}
              onChange={(id) => setActiveTabBar({ ...activeTabBar, 'small-size': id })}
              size="small"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ToggleBarSection;

