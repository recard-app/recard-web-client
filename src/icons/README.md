# Icon System

This directory contains a unified icon system for the ReCard application. All icons are accessible through a single import and support consistent theming and sizing.

## Features

- **Unified Import**: Import all icons from `@/icons`
- **Centralized IconRenderer**: Reusable component for rendering both string URLs and React components
- **Variant Support**: Each icon supports `solid`, `outline`, `mini`, and `micro` variants (SVG paths added manually)
- **Color Customization**: Customize icon colors (defaults to primary color from `variables.scss`)
- **Size Flexibility**: Set custom sizes or use SVG defaults
- **TypeScript Support**: Full TypeScript support with proper types

## Usage

### Basic Import

```tsx
import { HomeIcon, SpinnerIcon, IconRenderer } from '@/icons';
```

### Basic Icon Usage

```tsx
// Default usage (solid variant, primary color, default size)
<HomeIcon />

// With variant (SVG paths must be added manually for each variant)
<HomeIcon variant="outline" />
<HomeIcon variant="mini" />
<HomeIcon variant="micro" />

// With custom color
<HomeIcon color="#ff0000" />

// With custom size
<HomeIcon size={32} />
<HomeIcon size="2rem" />

// Combined options
<HomeIcon variant="outline" color="#22CC9D" size={20} />
```

### IconRenderer Usage

```tsx
// For rendering any icon (string URL or React component)
<IconRenderer 
  icon={someIcon} 
  alt="Icon description" 
  className="custom-class"
  size={24}
  color="#22CC9D"
  variant="solid"
/>
```

### Available Icons

- **HomeIcon**: Home/house icon with placeholder rectangles (SVG paths to be added)
- **SpinnerIcon**: Loading spinner (always returns same version regardless of variant)

### Icon Props

All icons accept the following props:

```tsx
interface BaseIconProps {
  variant?: 'solid' | 'outline' | 'mini' | 'micro'; // Default: 'solid'
  color?: string; // Default: '#22CC9D' (primary color)
  size?: number | string; // Default: varies by variant
  className?: string;
  // ...other SVG props
}
```

### IconRenderer Props

```tsx
interface IconRendererProps {
  icon: string | React.ComponentType<any>;
  alt: string;
  className?: string;
  size?: number | string;
  color?: string;
  variant?: IconVariant;
}
```

### Default Sizes by Variant

- **Standard/Solid/Outline**: 24px
- **Mini**: 20px  
- **Micro**: 16px

### Colors

The default color is the primary color from `variables.scss` (`#22CC9D`). You can override this with any valid CSS color value.

## Important Notes

### SVG Paths
- **HomeIcon**: Currently shows placeholder rectangles. SVG paths for each variant (solid, outline, mini, micro) need to be added manually.
- **SpinnerIcon**: Always returns the same version regardless of variant parameter.

### Adding SVG Paths to HomeIcon
To add actual SVG paths to HomeIcon:
1. Edit `/icons/HomeIcon/index.tsx`
2. Replace the `renderPlaceholder()` function with actual SVG path rendering logic
3. Add the specific `<path>` elements for each variant

## Adding New Icons

1. Create a new folder in `/icons` with your icon name (e.g., `/icons/NewIcon`)
2. Create an `index.tsx` file that follows the pattern of existing icons
3. Implement all variants with proper SVG paths (no inference - add manually)
4. Export your icon from the main `/icons/index.tsx` file

### Icon Template

```tsx
import React from 'react';
import { BaseIconProps } from '../types';

const NewIcon: React.FC<BaseIconProps> = ({ 
  variant = 'solid',
  color = '#22CC9D',
  size = 24,
  className = '',
  ...props
}) => {
  // Manual size/viewBox logic based on variant
  const getIconProps = () => {
    switch (variant) {
      case 'mini':
        return { viewBox: '0 0 20 20', defaultSize: 20 };
      case 'micro':
        return { viewBox: '0 0 16 16', defaultSize: 16 };
      default:
        return { viewBox: '0 0 24 24', defaultSize: 24 };
    }
  };

  const { viewBox, defaultSize } = getIconProps();
  const finalSize = size || defaultSize;
  const fillColor = variant === 'outline' ? 'none' : color;
  const strokeColor = variant === 'outline' ? color : 'none';
  
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={finalSize}
      height={finalSize}
      viewBox={viewBox}
      fill={fillColor}
      stroke={strokeColor}
      {...props}
    >
      {/* Add your specific SVG paths for each variant manually */}
    </svg>
  );
};

export default NewIcon;
```

## Integration with Components

The icon system is integrated with components through the centralized `IconRenderer`:

```tsx
import { HomeIcon, IconRenderer } from '@/icons';

// In constants
export const PAGE_ICONS = {
  HOME: HomeIcon,
  // ... other icons
};

// In components
<SidebarItem icon={PAGE_ICONS.HOME} name="Home" />

// Or directly
<IconRenderer icon={PAGE_ICONS.HOME} alt="Home" size={20} />
``` 