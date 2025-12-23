import React, { useState } from 'react';
import { ToggleSwitch, SearchField } from '@/elements';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const FormElements: React.FC = () => {
  const [toggleStates, setToggleStates] = useState({
    basic: false,
    checked: true,
    disabled: false,
  });

  const [sliderValues, setSliderValues] = useState({
    single: [50],
    range: [25, 75],
  });

  return (
    <>
      <h2 className="ds-section-title">Form Elements</h2>
      <p className="ds-section-description">
        Input controls for user interaction including toggles, selects, sliders, and search fields
      </p>

      {/* Toggle Switch */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Toggle Switch</h3>
        <div className="ds-component-grid">
          <div className="ds-component-item" style={{ minWidth: '200px' }}>
            <span className="ds-component-name">checked=false</span>
            <ToggleSwitch
              id="toggle-off"
              label="Off state"
              checked={toggleStates.basic}
              onChange={(checked) => setToggleStates({ ...toggleStates, basic: checked })}
            />
          </div>
          <div className="ds-component-item" style={{ minWidth: '200px' }}>
            <span className="ds-component-name">checked=true</span>
            <ToggleSwitch
              id="toggle-on"
              label="On state"
              checked={toggleStates.checked}
              onChange={(checked) => setToggleStates({ ...toggleStates, checked: checked })}
            />
          </div>
          <div className="ds-component-item" style={{ minWidth: '200px' }}>
            <span className="ds-component-name">disabled=true</span>
            <ToggleSwitch
              id="toggle-disabled"
              label="Disabled"
              checked={toggleStates.disabled}
              onChange={(checked) => setToggleStates({ ...toggleStates, disabled: checked })}
              disabled
            />
          </div>
        </div>
      </div>

      {/* Select */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Select</h3>
        <div className="ds-component-grid">
          <div className="ds-component-item" style={{ minWidth: '200px' }}>
            <span className="ds-component-name">size="default"</span>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="ds-component-item" style={{ minWidth: '200px' }}>
            <span className="ds-component-name">size="sm"</span>
            <Select>
              <SelectTrigger size="sm">
                <SelectValue placeholder="Small select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="ds-component-item" style={{ minWidth: '200px' }}>
            <span className="ds-component-name">With default value</span>
            <Select defaultValue="option2">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Slider */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Slider</h3>
        <div className="ds-component-grid">
          <div className="ds-component-item" style={{ minWidth: '250px' }}>
            <span className="ds-component-name">Single value</span>
            <div style={{ padding: '8px 0' }}>
              <Slider
                value={sliderValues.single}
                onValueChange={(value) => setSliderValues({ ...sliderValues, single: value })}
                max={100}
                step={1}
              />
            </div>
            <span style={{ fontSize: '12px', color: '#666' }}>Value: {sliderValues.single[0]}</span>
          </div>
          <div className="ds-component-item" style={{ minWidth: '250px' }}>
            <span className="ds-component-name">Range (two thumbs)</span>
            <div style={{ padding: '8px 0' }}>
              <Slider
                value={sliderValues.range}
                onValueChange={(value) => setSliderValues({ ...sliderValues, range: value })}
                max={100}
                step={1}
              />
            </div>
            <span style={{ fontSize: '12px', color: '#666' }}>
              Range: {sliderValues.range[0]} - {sliderValues.range[1]}
            </span>
          </div>
          <div className="ds-component-item" style={{ minWidth: '250px' }}>
            <span className="ds-component-name">Custom color</span>
            <div style={{ padding: '8px 0' }}>
              <Slider
                defaultValue={[60]}
                max={100}
                step={1}
                style={{ '--slider-range-color': '#22CC9D' } as React.CSSProperties}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search Field */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Search Field</h3>
        <div className="ds-component-grid">
          <div className="ds-component-item" style={{ minWidth: '250px' }}>
            <span className="ds-component-name">Default</span>
            <SearchField placeholder="Search..." />
          </div>
          <div className="ds-component-item" style={{ minWidth: '250px' }}>
            <span className="ds-component-name">With value</span>
            <SearchField placeholder="Search..." defaultValue="credit cards" />
          </div>
          <div className="ds-component-item" style={{ minWidth: '250px' }}>
            <span className="ds-component-name">Custom placeholder</span>
            <SearchField placeholder="Find transactions..." />
          </div>
        </div>
      </div>

      {/* Input States */}
      <div className="ds-variant-group">
        <h3 className="ds-variant-label">Input States (Search Field)</h3>
        <div className="ds-component-grid">
          <div className="ds-component-item" style={{ minWidth: '250px' }}>
            <span className="ds-component-name">Disabled</span>
            <SearchField placeholder="Disabled search" disabled />
          </div>
          <div className="ds-component-item" style={{ minWidth: '250px' }}>
            <span className="ds-component-name">Read only</span>
            <SearchField placeholder="Read only" defaultValue="locked value" readOnly />
          </div>
        </div>
      </div>
    </>
  );
};

export default FormElements;

