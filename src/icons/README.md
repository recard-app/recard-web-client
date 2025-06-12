# Icon System

A flexible, consolidated icon system that allows for complete control over icon appearance and variants.

## Features

- **Single Component**: One `Icon` component handles all icons
- **Flexible Variants**: Each icon can have custom variants (not limited to solid/outline/mini/micro)
- **Complete Control**: Full control over size, colors, viewBox, stroke, fill, etc.
- **Easy Registration**: Simple way to add new icons
- **Type Safety**: Full TypeScript support
- **Performance**: Optimized with centralized registry

## Basic Usage

```tsx
import Icon from '@/icons';

// Basic usage
<Icon name="home" />

// With variant
<Icon name="home" variant="outline" />

// With custom size
<Icon name="home" size={32} />

// With custom colors
<Icon name="home" color="#FF0000" />
```

## Available Icons

Current available icons:
- `home` (solid, outline, mini, micro)
- `account` (solid, outline, mini, micro)
- `sign-out` (solid, outline, mini, micro)
- `card` (solid, outline, mini, micro)
- `history` (solid, outline, mini, micro)
- `preferences` (solid, outline, mini, micro)
- `sidebar` (open, close)
- `spinner` (default)

## Icon Props

```tsx
interface IconProps {
  name: string;           // Icon name (required)
  variant?: string;       // Icon variant (default: 'solid')
  size?: number | string; // Square size
  width?: number | string; // Custom width
  height?: number | string; // Custom height
  color?: string;         // Icon color (default: 'currentColor')
  fillColor?: string;     // Custom fill color
  strokeColor?: string;   // Custom stroke color
  strokeWidth?: number | string; // Custom stroke width
  viewBox?: string;       // Custom viewBox
  className?: string;     // CSS classes
  // ...all other SVG props
}
```

## Advanced Examples

### Different Variants
```tsx
<Icon name="home" variant="solid" />
<Icon name="home" variant="outline" />
<Icon name="home" variant="mini" />
<Icon name="home" variant="micro" />
```

### Custom Sizing
```tsx
<Icon name="account" size={16} />
<Icon name="account" size={24} />
<Icon name="account" width={32} height={16} />
```

### Custom Colors
```tsx
<Icon name="card" color="#FF0000" />
<Icon name="card" variant="outline" strokeColor="#00FF00" strokeWidth={2} />
<Icon name="preferences" fillColor="#0000FF" />
```

### Complete Control
```tsx
<Icon 
  name="home" 
  variant="outline"
  size={48}
  strokeColor="#22CC9D"
  strokeWidth={3}
  fillColor="none"
  viewBox="0 0 48 48"
  className="hover:text-blue-500"
/>
```

## Adding New Icons

### Method 1: Register Single Icon
```tsx
import { registerIcon } from '@/icons';

registerIcon('my-icon', {
  solid: {
    viewBox: '0 0 24 24',
    paths: [
      <path key="1" d="your-svg-path-here" />
    ]
  },
  outline: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.5,
    paths: [
      <path key="1" strokeLinecap="round" strokeLinejoin="round" d="your-outline-path" />
    ]
  },
  'custom-variant': {
    viewBox: '0 0 32 32',
    paths: [
      <path key="1" d="custom-variant-path" />
    ]
  }
});
```

### Method 2: Register Multiple Icons
```tsx
import { registerIcons } from '@/icons';

registerIcons({
  'icon-one': {
    solid: {
      viewBox: '0 0 24 24',
      paths: [<path key="1" d="..." />]
    }
  },
  'icon-two': {
    solid: {
      viewBox: '0 0 24 24', 
      paths: [<path key="1" d="..." />]
    }
  }
});
```

### Method 3: Direct Registry Modification
You can also directly add icons to the `iconRegistry` object in `index.tsx`.

## Icon Utilities

### createIconVariant

A helper function for creating icon variants with specific parameters. Useful for backward compatibility and creating icon configurations.

```tsx
import { createIconVariant } from '@/icons';

// Create a variant with specific color and size
const homeIcon = createIconVariant('home', 'solid', '#FFFFFF', 24);

// Use in component
const MyComponent = () => (
  <div>
    {homeIcon}
  </div>
);
```

### IconRenderer

A utility component that handles mixed icon types (strings, functions, React components). This eliminates repeated conditional rendering logic across components.

```tsx
import { IconRenderer } from '@/icons';

const MyComponent = ({ icon }) => (
  <div>
    <IconRenderer 
      icon={icon} // Can be string URL, function, or React component
      alt="My icon"
      className="my-icon-class"
      size={20}
    />
  </div>
);

// Works with all these icon types:
// String URL: "https://example.com/icon.png"
// Function: () => <Icon name="home" variant="solid" />
// Component: HomeIcon
```

#### IconRenderer Props

- `icon`: The icon to render (string URL, function, or React component)
- `alt`: Alt text for images (default: '')
- `className`: CSS class name (default: '')
- `size`: Icon size in pixels (default: 20)
- `width`: Specific width (overrides size)
- `height`: Specific height (overrides size)
- Additional props are passed through to the rendered element

## Migration from Old System

### Before (Old System)
```tsx
import { HomeIcon, AccountIcon } from '@/icons';

<HomeIcon variant="outline" size={24} color="#FF0000" />
<AccountIcon variant="solid" className="text-blue-500" />
```

### After (New System)
```tsx
import Icon from '@/icons';

<Icon name="home" variant="outline" size={24} color="#FF0000" />
<Icon name="account" variant="solid" className="text-blue-500" />
```

## Benefits

1. **Consistency**: All icons use the same interface
2. **Flexibility**: Not limited to predefined variants
3. **Performance**: No need for separate component files
4. **Maintainability**: Easy to add/modify icons
5. **Bundle Size**: Smaller bundle size with tree-shaking
6. **Type Safety**: Full TypeScript intellisense support

## Best Practices

1. Use semantic names for icons (`home`, `user`, `settings`)
2. Keep variant names consistent across similar icons
3. Use the default size (24px) when possible for consistency
4. Prefer `color` prop over `fillColor`/`strokeColor` for simple cases
5. Use `className` for responsive sizing with Tailwind CSS

## Example Component

See `example-usage.tsx` for a comprehensive demonstration of all features.

## Advanced Features

### ViewBox Scaling

The icon system automatically scales the viewBox based on the icon size to maintain proper proportions:

```tsx
// ViewBox automatically scales with size
<Icon name="home" size={48} /> // ViewBox adjusts for 48px icon
<Icon name="home" size={16} /> // ViewBox adjusts for 16px icon

// You can still override viewBox manually if needed
<Icon name="home" size={48} viewBox="0 0 100 100" />
```

### Special Icon Handling

#### Spinner Icons
- **Automatic animation**: Spinner icons automatically get the `animate-spin` class
- **No fill by default**: Spinners render with stroke only for cleaner appearance
- **Built-in CSS**: Animation keyframes are automatically injected

```tsx
<Icon name="spinner" size={20} /> // Automatically animated and stroke-only
```

#### Sidebar Icons  
- **No fill by default**: Sidebar icons render with stroke only
- **Clean appearance**: Better visual consistency for UI elements

```tsx
<Icon name="sidebar" variant="open" />
<Icon name="sidebar" variant="close" />
```

### Manual Fill/Stroke Control

You can override the automatic fill/stroke behavior:

```tsx
// Force fill on normally no-fill icons
<Icon name="spinner" fillColor="red" strokeColor="none" />

// Force stroke on normally filled icons
<Icon name="home" fillColor="none" strokeColor="blue" strokeWidth={2} />
``` 