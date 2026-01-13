import React from 'react';
import { Icon } from '@/icons';

const ButtonSection: React.FC = () => {
  return (
    <>
      <h2 className="ds-section-title">Button</h2>
      <p className="ds-section-description">
        Primary action component with multiple variants and sizes for different use cases.
        Uses global SCSS button mixins from globals.scss and mixins.scss.
      </p>

      {/* Variants */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Variants</h3>
        <div className="ds-component-grid">
          <div className="ds-component-item">
            <span className="ds-component-name">Primary (default)</span>
            <span className="ds-component-class">class="button"</span>
            <button className="button">Primary</button>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">Secondary</span>
            <span className="ds-component-class">class="button secondary"</span>
            <button className="button secondary">Secondary</button>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">Outline</span>
            <span className="ds-component-class">class="button outline"</span>
            <button className="button outline">Outline</button>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">Ghost</span>
            <span className="ds-component-class">class="button ghost"</span>
            <button className="button ghost">Ghost</button>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">Destructive</span>
            <span className="ds-component-class">class="button destructive"</span>
            <button className="button destructive">Destructive</button>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">No Outline</span>
            <span className="ds-component-class">class="button no-outline"</span>
            <button className="button no-outline">No Outline</button>
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Sizes</h3>
        <div className="ds-component-grid">
          <div className="ds-component-item">
            <span className="ds-component-name">Default</span>
            <span className="ds-component-class">class="button"</span>
            <button className="button">Default Size</button>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">Mini</span>
            <span className="ds-component-class">class="button mini"</span>
            <button className="button mini">Mini</button>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">Small</span>
            <span className="ds-component-class">class="button small"</span>
            <button className="button small">Small</button>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">Large</span>
            <span className="ds-component-class">class="button large"</span>
            <button className="button large">Large</button>
          </div>
        </div>
      </div>

      {/* With Icons */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">With Icons</h3>
        <div className="ds-component-grid">
          <div className="ds-component-item">
            <span className="ds-component-name">Icon only</span>
            <span className="ds-component-class">class="button icon"</span>
            <button className="button icon">
              <Icon name="plus-circle" variant="mini" size={16} />
            </button>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">Icon with text</span>
            <span className="ds-component-class">class="button icon with-text"</span>
            <button className="button icon with-text">
              <Icon name="plus-circle" variant="mini" size={16} />
              Add Item
            </button>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">Ghost icon with text</span>
            <span className="ds-component-class">class="button ghost icon with-text"</span>
            <button className="button ghost icon with-text">
              <Icon name="preferences" variant="mini" size={16} />
              Settings
            </button>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">Destructive icon</span>
            <span className="ds-component-class">class="button destructive icon with-text"</span>
            <button className="button destructive icon with-text">
              <Icon name="delete" variant="mini" size={16} />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Icon Sizes */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Icon Button Sizes</h3>
        <div className="ds-component-grid">
          <div className="ds-component-item">
            <span className="ds-component-name">Mini icon</span>
            <span className="ds-component-class">class="button icon mini"</span>
            <button className="button icon mini">
              <Icon name="plus-circle" variant="micro" size={12} />
            </button>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">Small icon</span>
            <span className="ds-component-class">class="button icon small"</span>
            <button className="button icon small">
              <Icon name="plus-circle" variant="mini" size={16} />
            </button>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">Large icon</span>
            <span className="ds-component-class">class="button icon large"</span>
            <button className="button icon large">
              <Icon name="plus-circle" variant="mini" size={20} />
            </button>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">Square icon</span>
            <span className="ds-component-class">class="button icon small square"</span>
            <button className="button icon small square">
              <Icon name="plus-circle" variant="mini" size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* States */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">States</h3>
        <div className="ds-component-grid">
          <div className="ds-component-item">
            <span className="ds-component-name">Normal</span>
            <span className="ds-component-class">class="button"</span>
            <button className="button">Normal</button>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">Disabled (attr)</span>
            <span className="ds-component-class">&lt;button disabled&gt;</span>
            <button className="button" disabled>Disabled</button>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">Disabled (class)</span>
            <span className="ds-component-class">class="button disabled"</span>
            <button className="button disabled">Disabled</button>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">Loading</span>
            <span className="ds-component-class">class="button loading"</span>
            <button className="button loading">Loading...</button>
          </div>
        </div>
      </div>

      {/* Ghost Destructive */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Ghost Destructive Combination</h3>
        <div className="ds-component-grid">
          <div className="ds-component-item">
            <span className="ds-component-name">Ghost + Destructive</span>
            <span className="ds-component-class">class="button ghost destructive"</span>
            <button className="button ghost destructive">Cancel</button>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">Ghost Destructive Icon</span>
            <span className="ds-component-class">class="button ghost destructive icon"</span>
            <button className="button ghost destructive icon">
              <Icon name="delete" variant="mini" size={16} />
            </button>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">Ghost Destructive + Text</span>
            <span className="ds-component-class">class="button ghost destructive icon with-text"</span>
            <button className="button ghost destructive icon with-text">
              <Icon name="delete" variant="mini" size={16} />
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* Size + Variant Combinations */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Size + Variant Combinations</h3>
        <div className="ds-component-grid">
          <div className="ds-component-item">
            <span className="ds-component-name">Small + Outline</span>
            <span className="ds-component-class">class="button small outline"</span>
            <button className="button small outline">Small Outline</button>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">Mini + Secondary</span>
            <span className="ds-component-class">class="button mini secondary"</span>
            <button className="button mini secondary">Mini Secondary</button>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">Large + Destructive</span>
            <span className="ds-component-class">class="button large destructive"</span>
            <button className="button large destructive">Large Destructive</button>
          </div>
          <div className="ds-component-item">
            <span className="ds-component-name">Small + Ghost + Icon</span>
            <span className="ds-component-class">class="button small ghost icon with-text"</span>
            <button className="button small ghost icon with-text">
              <Icon name="preferences" variant="mini" size={16} />
              Edit
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ButtonSection;
