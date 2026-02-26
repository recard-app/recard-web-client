import React from 'react';

// ===================== VIEWBOX CONSTANTS =====================
export const VIEWBOX = {
  DEFAULT: '0 0 24 24',
  MINI: '0 0 20 20',
  MICRO: '0 0 16 16'
} as const;

// ===================== TYPES =====================
export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'color' | 'fill' | 'stroke'> {
  name: string;
  variant?: string;
  size?: number | string;
  width?: number | string;
  height?: number | string;
    color?: string; 
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number | string;
  viewBox?: string;
    className?: string; 
}

export interface IconPathData {
  [variant: string]: {
    viewBox?: string;
    strokeWidth?: number;
    noFill?: boolean;
    paths: React.ReactNode[];
  };
}

export interface IconDefinition {
  [iconName: string]: IconPathData;
}

// ===================== ICON UTILITIES =====================

// Helper function to create icon variants for backward compatibility with Constants.ts
export const createIconVariant = (name: string, variant: string, color?: string, size?: number) => 
  React.createElement(Icon, { name, variant, color, size });

// IconRenderer component to handle mixed icon types (strings, functions, components)
// This eliminates repeated code in components like SidebarItem and PageHeader
export interface IconRendererProps {
  icon: string | React.ComponentType<any> | ((...args: any[]) => React.ReactElement);
  alt?: string;
  className?: string;
  size?: number | string;
  width?: number | string;
  height?: number | string;
  [key: string]: any; // Allow additional props to be passed through
}

export const IconRenderer: React.FC<IconRendererProps> = ({
  icon,
  alt = '',
  className = '',
  size = 20,
  width,
  height,
  ...props
}) => {
  // Use provided width/height or fall back to size
  const finalWidth = width || size;
  const finalHeight = height || size;

  if (typeof icon === 'string') {
    // Handle string URLs (legacy support)
    return (
      <img 
        src={icon} 
        alt={alt} 
        className={className}
        width={finalWidth}
        height={finalHeight}
        {...props}
      />
    );
  } else if (typeof icon === 'function') {
    // Handle function icons (like those from Constants.ts)
    return (icon as any)({
      className,
      size: finalWidth,
      width: finalWidth,
      height: finalHeight,
      ...props
    });
  } else {
    // Handle React component icons
    return React.createElement(icon, { 
      className,
      size: finalWidth, 
      width: finalWidth, 
      height: finalHeight,
      ...props
    });
  }
};

// ===================== ICON REGISTRY =====================
export const iconRegistry: IconDefinition = {
  'home': {
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />,
        <path key="2" d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
      ]
    },
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" d="M8.543 2.232a.75.75 0 0 0-1.085 0l-5.25 5.5A.75.75 0 0 0 2.75 9H4v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V9h1.25a.75.75 0 0 0 .543-1.268l-5.25-5.5Z" />
      ]
    }
  },
  'account': {
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
      ]
    },
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
      ]
    }
  },
  'sign-out': {
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
      ]
    },
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd" />,
        <path key="2" fillRule="evenodd" d="M6 10a.75.75 0 0 1 .75-.75h9.546l-1.048-.943a.75.75 0 1 1 1.004-1.114l2.5 2.25a.75.75 0 0 1 0 1.114l-2.5 2.25a.75.75 0 1 1-1.004-1.114l1.048-.943H6.75A.75.75 0 0 1 6 10Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M2 4.75A2.75 2.75 0 0 1 4.75 2h3a2.75 2.75 0 0 1 2.75 2.75v.5a.75.75 0 0 1-1.5 0v-.5c0-.69-.56-1.25-1.25-1.25h-3c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h3c.69 0 1.25-.56 1.25-1.25v-.5a.75.75 0 0 1 1.5 0v.5A2.75 2.75 0 0 1 7.75 14h-3A2.75 2.75 0 0 1 2 11.25v-6.5Zm9.47.47a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 1 1-1.06-1.06l.97-.97H5.25a.75.75 0 0 1 0-1.5h7.19l-.97-.97a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
      ]
    }
  },
  'arrow-up': {
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M11.47 2.47a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06l-6.22-6.22V21a.75.75 0 0 1-1.5 0V4.81l-6.22 6.22a.75.75 0 1 1-1.06-1.06l7.5-7.5Z" clipRule="evenodd" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M8 14a.75.75 0 0 1-.75-.75V4.56L4.03 7.78a.75.75 0 0 1-1.06-1.06l4.5-4.5a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06L8.75 4.56v8.69A.75.75 0 0 1 8 14Z" clipRule="evenodd" />
      ]
    }
  },
  'arrow-trending-up': {
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      noFill: true,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
      ]
    },
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M15.22 6.268a.75.75 0 0 1 .968-.431l5.942 2.28a.75.75 0 0 1 .431.97l-2.28 5.94a.75.75 0 1 1-1.4-.537l1.63-4.251-1.086.484a11.2 11.2 0 0 0-5.45 5.173.75.75 0 0 1-1.199.19L9 12.312l-6.22 6.22a.75.75 0 0 1-1.06-1.061l6.75-6.75a.75.75 0 0 1 1.06 0l3.606 3.606a12.695 12.695 0 0 1 5.68-4.974l1.086-.483-4.251-1.632a.75.75 0 0 1-.432-.97Z" clipRule="evenodd" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M12.577 4.878a.75.75 0 0 1 .919-.53l4.78 1.281a.75.75 0 0 1 .531.919l-1.281 4.78a.75.75 0 0 1-1.449-.387l.81-3.022a19.407 19.407 0 0 0-5.594 5.203.75.75 0 0 1-1.139.093L7 10.06l-4.72 4.72a.75.75 0 0 1-1.06-1.061l5.25-5.25a.75.75 0 0 1 1.06 0l3.074 3.073a20.923 20.923 0 0 1 5.545-4.931l-3.042-.815a.75.75 0 0 1-.53-.919Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M9.808 4.057a.75.75 0 0 1 .92-.527l3.116.849a.75.75 0 0 1 .528.915l-.823 3.121a.75.75 0 0 1-1.45-.382l.337-1.281a23.484 23.484 0 0 0-3.609 3.056.75.75 0 0 1-1.07.01L6 8.06l-3.72 3.72a.75.75 0 1 1-1.06-1.061l4.25-4.25a.75.75 0 0 1 1.06 0l1.756 1.755a25.015 25.015 0 0 1 3.508-2.85l-1.46-.398a.75.75 0 0 1-.526-.92Z" clipRule="evenodd" />
      ]
    }
  },
  'arrow-refresh': {
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      noFill: true,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
      ]
    },
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z" clipRule="evenodd" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M13.836 2.477a.75.75 0 0 1 .75.75v3.182a.75.75 0 0 1-.75.75h-3.182a.75.75 0 0 1 0-1.5h1.37l-.84-.841a4.5 4.5 0 0 0-7.08.932.75.75 0 0 1-1.3-.75 6 6 0 0 1 9.44-1.242l.842.84V3.227a.75.75 0 0 1 .75-.75Zm-.911 7.5A.75.75 0 0 1 13.199 11a6 6 0 0 1-9.44 1.241l-.84-.84v1.371a.75.75 0 0 1-1.5 0V9.591a.75.75 0 0 1 .75-.75H5.35a.75.75 0 0 1 0 1.5H3.98l.841.841a4.5 4.5 0 0 0 7.08-.932.75.75 0 0 1 1.025-.273Z" clipRule="evenodd" />
      ]
    }
  },
  'arrow-left': {
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      noFill: true,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M14 8a.75.75 0 0 1-.75.75H4.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.56 7.25h8.69A.75.75 0 0 1 14 8Z" clipRule="evenodd" />
      ]
    }
  },
  'arrow-undo': {
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      noFill: true,
      paths: [
        <path
          key="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
        />
      ]
    },
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path
          key="1"
          fillRule="evenodd"
          d="M9.53 2.47a.75.75 0 0 1 0 1.06L4.81 8.25H15a6.75 6.75 0 0 1 0 13.5h-3a.75.75 0 0 1 0-1.5h3a5.25 5.25 0 1 0 0-10.5H4.81l4.72 4.72a.75.75 0 1 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0Z"
          clipRule="evenodd"
        />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path
          key="1"
          fillRule="evenodd"
          d="M7.793 2.232a.75.75 0 0 1-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 0 1 0 10.75H10.75a.75.75 0 0 1 0-1.5h2.875a3.875 3.875 0 0 0 0-7.75H3.622l4.146 3.957a.75.75 0 0 1-1.036 1.085l-5.5-5.25a.75.75 0 0 1 0-1.085l5.5-5.25a.75.75 0 0 1 1.06.025Z"
          clipRule="evenodd"
        />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path
          key="1"
          fillRule="evenodd"
          d="M12.5 9.75A2.75 2.75 0 0 0 9.75 7H4.56l2.22 2.22a.75.75 0 1 1-1.06 1.06l-3.5-3.5a.75.75 0 0 1 0-1.06l3.5-3.5a.75.75 0 0 1 1.06 1.06L4.56 5.5h5.19a4.25 4.25 0 0 1 0 8.5h-1a.75.75 0 0 1 0-1.5h1a2.75 2.75 0 0 0 2.75-2.75Z"
          clipRule="evenodd"
        />
      ]
    }
  },
  'stop': {
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" d="M5.25 3A2.25 2.25 0 0 0 3 5.25v9.5A2.25 2.25 0 0 0 5.25 17h9.5A2.25 2.25 0 0 0 17 14.75v-9.5A2.25 2.25 0 0 0 14.75 3h-9.5Z" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <rect key="1" width="10" height="10" x="3" y="3" rx="1.5" />
      ]
    }
  },
  'card': {
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" d="M4.5 3.75a3 3 0 0 0-3 3v.75h21v-.75a3 3 0 0 0-3-3h-15Z" />,
        <path key="2" fillRule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-7.5Zm-18 3.75a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" clipRule="evenodd" />
      ]
    },
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" d="M2.5 3A1.5 1.5 0 0 0 1 4.5V5h14v-.5A1.5 1.5 0 0 0 13.5 3h-11Z" />,
        <path key="2" fillRule="evenodd" d="M15 7H1v4.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V7ZM3 10.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75Zm3.75-.75a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5h-2.5Z" clipRule="evenodd" />
      ]
    }
  },
  'bank': {
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
      ]
    },
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" d="M11.584 2.376a.75.75 0 0 1 .832 0l9 6a.75.75 0 1 1-.832 1.248L12 3.901 3.416 9.624a.75.75 0 0 1-.832-1.248l9-6Z" />,
        <path key="2" fillRule="evenodd" d="M20.25 10.332v9.918H21a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1 0-1.5h.75v-9.918a.75.75 0 0 1 .634-.74A49.109 49.109 0 0 1 12 9c2.59 0 5.134.202 7.616.592a.75.75 0 0 1 .634.74Zm-7.5 2.418a.75.75 0 0 0-1.5 0v6.75a.75.75 0 0 0 1.5 0v-6.75Zm3-.75a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 1-1.5 0v-6.75a.75.75 0 0 1 .75-.75ZM9 12.75a.75.75 0 0 0-1.5 0v6.75a.75.75 0 0 0 1.5 0v-6.75Z" clipRule="evenodd" />,
        <path key="3" d="M12 7.875a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M9.674 2.075a.75.75 0 0 1 .652 0l7.25 3.5A.75.75 0 0 1 17 6.957V16.5h.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H3V6.957a.75.75 0 0 1-.576-1.382l7.25-3.5ZM11 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM7.5 9.75a.75.75 0 0 0-1.5 0v5.5a.75.75 0 0 0 1.5 0v-5.5Zm3.25 0a.75.75 0 0 0-1.5 0v5.5a.75.75 0 0 0 1.5 0v-5.5Zm3.25 0a.75.75 0 0 0-1.5 0v5.5a.75.75 0 0 0 1.5 0v-5.5Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M7.605 2.112a.75.75 0 0 1 .79 0l5.25 3.25A.75.75 0 0 1 13 6.707V12.5h.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H3V6.707a.75.75 0 0 1-.645-1.345l5.25-3.25ZM4.5 8.75a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-1.5 0v-3ZM8 8a.75.75 0 0 0-.75.75v3a.75.75 0 0 0 1.5 0v-3A.75.75 0 0 0 8 8Zm2 .75a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-1.5 0v-3ZM8 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
      ]
    }
  },
  'bar-menu': {
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      noFill: true,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      ]
    },
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M2 3.75A.75.75 0 0 1 2.75 3h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 3.75ZM2 8a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 8Zm0 4.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
      ]
    }
  },
  'history': {
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
      ]
    },
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7.75-4.25a.75.75 0 0 0-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 0 0 0-1.5h-2.5v-3.5Z" clipRule="evenodd" />
      ]
    }
  },
  'hand-raised': {
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      noFill: true,
      paths: [
        <path
          key="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.05 4.575a1.575 1.575 0 1 0-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 0 1 3.15 0v1.5m-3.15 0 .075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 0 1 3.15 0V15M6.9 7.575a1.575 1.575 0 1 0-3.15 0v8.175a6.75 6.75 0 0 0 6.75 6.75h2.018a5.25 5.25 0 0 0 3.712-1.538l1.732-1.732a5.25 5.25 0 0 0 1.538-3.712l.003-2.024a.668.668 0 0 1 .198-.471 1.575 1.575 0 1 0-2.228-2.228 3.818 3.818 0 0 0-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0 1 16.35 15m.002 0h-.002"
        />
      ]
    },
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path
          key="1"
          d="M10.5 1.875a1.125 1.125 0 0 1 2.25 0v8.219c.517.162 1.02.382 1.5.659V3.375a1.125 1.125 0 0 1 2.25 0v10.937a4.505 4.505 0 0 0-3.25 2.373 8.963 8.963 0 0 1 4-.935A.75.75 0 0 0 18 15v-2.266a3.368 3.368 0 0 1 .988-2.37 1.125 1.125 0 0 1 1.591 1.59 1.118 1.118 0 0 0-.329.79v3.006h-.005a6 6 0 0 1-1.752 4.007l-1.736 1.736a6 6 0 0 1-4.242 1.757H10.5a7.5 7.5 0 0 1-7.5-7.5V6.375a1.125 1.125 0 0 1 2.25 0v5.519c.46-.452.965-.832 1.5-1.141V3.375a1.125 1.125 0 0 1 2.25 0v6.526c.495-.1.997-.151 1.5-.151V1.875Z"
        />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path
          key="1"
          fillRule="evenodd"
          d="M11 2a1 1 0 1 0-2 0v6.5a.5.5 0 0 1-1 0V3a1 1 0 1 0-2 0v5.5a.5.5 0 0 1-1 0V5a1 1 0 1 0-2 0v7a7 7 0 1 0 14 0V8a1 1 0 1 0-2 0v3.5a.5.5 0 0 1-1 0V3a1 1 0 1 0-2 0v5.5a.5.5 0 0 1-1 0V2Z"
          clipRule="evenodd"
        />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path
          key="1"
          d="M8.5 1a.75.75 0 0 0-.75.75V6.5a.5.5 0 0 1-1 0V2.75a.75.75 0 0 0-1.5 0V7.5a.5.5 0 0 1-1 0V4.75a.75.75 0 0 0-1.5 0v4.5a5.75 5.75 0 0 0 11.5 0v-2.5a.75.75 0 0 0-1.5 0V9.5a.5.5 0 0 1-1 0V2.75a.75.75 0 0 0-1.5 0V6.5a.5.5 0 0 1-1 0V1.75A.75.75 0 0 0 8.5 1Z"
        />
      ]
    }
  },
  'clock': {
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
      ]
    },
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7.75-4.25a.75.75 0 0 0-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 0 0 0-1.5h-2.5v-3.5Z" clipRule="evenodd" />
      ]
    }
  },
  'preferences': {
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" d="M6 12a.75.75 0 0 1-.75-.75v-7.5a.75.75 0 1 1 1.5 0v7.5A.75.75 0 0 1 6 12ZM18 12a.75.75 0 0 1-.75-.75v-7.5a.75.75 0 0 1 1.5 0v7.5A.75.75 0 0 1 18 12ZM6.75 20.25v-1.5a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0ZM18.75 18.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 1.5 0ZM12.75 5.25v-1.5a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0ZM12 21a.75.75 0 0 1-.75-.75v-7.5a.75.75 0 0 1 1.5 0v7.5A.75.75 0 0 1 12 21ZM3.75 15a2.25 2.25 0 1 0 4.5 0 2.25 2.25 0 0 0-4.5 0ZM12 11.25a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5ZM15.75 15a2.25 2.25 0 1 0 4.5 0 2.25 2.25 0 0 0-4.5 0Z" />
      ]
    },
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" d="M17 2.75a.75.75 0 0 0-1.5 0v5.5a.75.75 0 0 0 1.5 0v-5.5ZM17 15.75a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0v-1.5ZM3.75 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75ZM4.5 2.75a.75.75 0 0 0-1.5 0v5.5a.75.75 0 0 0 1.5 0v-5.5ZM10 11a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0v-5.5A.75.75 0 0 1 10 11ZM10.75 2.75a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0v-1.5ZM10 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3.75 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM16.25 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" d="M7.25 13.25V7.5h1.5v5.75a.75.75 0 0 1-1.5 0ZM8.75 2.75V5h.75a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1 0-1.5h.75V2.75a.75.75 0 0 1 1.5 0ZM2.25 9.5a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5H4.5V2.75a.75.75 0 0 0-1.5 0V9.5h-.75ZM10 10.25a.75.75 0 0 1 .75-.75h.75V2.75a.75.75 0 0 1 1.5 0V9.5h.75a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75ZM3 12v1.25a.75.75 0 0 0 1.5 0V12H3ZM11.5 13.25V12H13v1.25a.75.75 0 0 1-1.5 0Z" />
      ]
    }
  },
  'help': {
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
      ]
    },
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8.94 6.94a.75.75 0 1 1-1.061-1.061 3 3 0 1 1 2.871 5.026v.345a.75.75 0 0 1-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 1 0 8.94 6.94ZM10 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-6 3.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM7.293 5.293a1 1 0 1 1 .99 1.667c-.459.134-1.033.566-1.033 1.29v.25a.75.75 0 1 0 1.5 0v-.115a2.5 2.5 0 1 0-2.518-4.153.75.75 0 1 0 1.061 1.06Z" clipRule="evenodd" />
      ]
    }
  },
  'ellipsis-horizontal': {
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M4.5 12a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" clipRule="evenodd" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" d="M3 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM8.5 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM15.5 8.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" d="M2 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM6.5 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM12.5 6.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
      ]
    }
  },
  'ellipsis-vertical': {
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M10.5 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" clipRule="evenodd" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM11.5 15.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" d="M8 2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM8 6.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM9.5 12.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
      ]
    }
  },
  'pencil': {
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />,
        <path key="2" d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
      ]
    },
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />,
        <path key="2" d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474Z" />,
        <path key="2" d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9A.75.75 0 0 1 14 9v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" />
      ]
    }
  },
  'delete': {
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
      ]
    },
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clipRule="evenodd" />
      ]
    }
  },
  'chevron-up': {
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M11.47 7.72a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06L12 9.31l-6.97 6.97a.75.75 0 0 1-1.06-1.06l7.5-7.5Z" clipRule="evenodd" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M9.47 6.47a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L10 8.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06l4.25-4.25Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M11.78 9.78a.75.75 0 0 1-1.06 0L8 7.06 5.28 9.78a.75.75 0 0 1-1.06-1.06l3.25-3.25a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06Z" clipRule="evenodd" />
      ]
    }
  },
  'chevron-down': {
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clipRule="evenodd" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
      ]
    }
  },
  'chevron-right': {
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
      ]
    },
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      noFill: true,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
      ]
    }
  },
  'chevron-double-left': {
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      noFill: true,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5" />
      ]
    },
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M10.72 11.47a.75.75 0 0 0 0 1.06l7.5 7.5a.75.75 0 1 0 1.06-1.06L12.31 12l6.97-6.97a.75.75 0 0 0-1.06-1.06l-7.5 7.5Z" clipRule="evenodd" />,
        <path key="2" fillRule="evenodd" d="M4.72 11.47a.75.75 0 0 0 0 1.06l7.5 7.5a.75.75 0 1 0 1.06-1.06L6.31 12l6.97-6.97a.75.75 0 0 0-1.06-1.06l-7.5 7.5Z" clipRule="evenodd" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M4.72 9.47a.75.75 0 0 0 0 1.06l4.25 4.25a.75.75 0 1 0 1.06-1.06L6.31 10l3.72-3.72a.75.75 0 1 0-1.06-1.06L4.72 9.47Zm9.25-4.25L9.72 9.47a.75.75 0 0 0 0 1.06l4.25 4.25a.75.75 0 1 0 1.06-1.06L11.31 10l3.72-3.72a.75.75 0 0 0-1.06-1.06Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M3.22 7.595a.75.75 0 0 0 0 1.06l3.25 3.25a.75.75 0 0 0 1.06-1.06l-2.72-2.72 2.72-2.72a.75.75 0 0 0-1.06-1.06l-3.25 3.25Zm8.25-3.25-3.25 3.25a.75.75 0 0 0 0 1.06l3.25 3.25a.75.75 0 1 0 1.06-1.06l-2.72-2.72 2.72-2.72a.75.75 0 0 0-1.06-1.06Z" clipRule="evenodd" />
      ]
    }
  },
  'star': {
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
      ]
    },
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M8 1.75a.75.75 0 0 1 .692.462l1.41 3.393 3.664.293a.75.75 0 0 1 .428 1.317l-2.791 2.39.853 3.575a.75.75 0 0 1-1.12.814L7.998 12.08l-3.135 1.915a.75.75 0 0 1-1.12-.814l.852-3.574-2.79-2.39a.75.75 0 0 1 .427-1.318l3.663-.293 1.41-3.393A.75.75 0 0 1 8 1.75Z" clipRule="evenodd" />
      ]
    }
  },
  'snowflake': {
    solid: {
      viewBox: '0 -960 960 960',
      paths: [
        <path
          key="1"
          d="M444-96v-165L316-133l-51-51 179-178v-82h-82L183-265l-51-51 129-128H96v-72h165L133-644l51-51 178 179h82v-82L265-776l51-51 128 128v-165h72v165l128-129 51 51-179 179v82h82l178-179 51 51-128 128h165v72H699l129 128-51 51-179-179h-82v82l179 179-51 51-128-129v165h-72Z"
        />
      ]
    },
    outline: {
      viewBox: '0 -960 960 960',
      paths: [
        <path
          key="1"
          d="M444-96v-165L316-133l-51-51 179-178v-82h-82L183-265l-51-51 129-128H96v-72h165L133-644l51-51 178 179h82v-82L265-776l51-51 128 128v-165h72v165l128-129 51 51-179 179v82h82l178-179 51 51-128 128h165v72H699l129 128-51 51-179-179h-82v82l179 179-51 51-128-129v165h-72Z"
        />
      ]
    },
    mini: {
      viewBox: '0 -960 960 960',
      paths: [
        <path
          key="1"
          d="M444-96v-165L316-133l-51-51 179-178v-82h-82L183-265l-51-51 129-128H96v-72h165L133-644l51-51 178 179h82v-82L265-776l51-51 128 128v-165h72v165l128-129 51 51-179 179v82h82l178-179 51 51-128 128h165v72H699l129 128-51 51-179-179h-82v82l179 179-51 51-128-129v165h-72Z"
        />
      ]
    },
    micro: {
      viewBox: '0 -960 960 960',
      paths: [
        <path
          key="1"
          d="M444-96v-165L316-133l-51-51 179-178v-82h-82L183-265l-51-51 129-128H96v-72h165L133-644l51-51 178 179h82v-82L265-776l51-51 128 128v-165h72v165l128-129 51 51-179 179v82h82l178-179 51 51-128 128h165v72H699l129 128-51 51-179-179h-82v82l179 179-51 51-128-129v165h-72Z"
        />
      ]
    }
  },
  'plus-circle': {
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" />
      ]
    },
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25v2.5h2.5a.75.75 0 0 1 0 1.5h-2.5v2.5a.75.75 0 0 1-1.5 0v-2.5h-2.5a.75.75 0 0 1 0-1.5h2.5v-2.5a.75.75 0 0 1 1.5 0Z" clipRule="evenodd" />
      ]
    }
  },
  'plus-simple': {
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      noFill: true,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      ]
    },
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path
          key="1"
          fillRule="evenodd"
          d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
          clipRule="evenodd"
        />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
      ]
    }
  },
  'search': {
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      ]
    },
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" />
      ]
    }
  },
  'sidebar': {
    open: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      noFill: true,
      paths: [
        <rect key="1" width="18" height="18" x="3" y="3" rx="2"/>,
        <path key="2" d="M9 3v18"/>,
        //<path key="3" d="m14 9 3 3-3 3"/>
      ]
    },
    close: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      noFill: true,
      paths: [
        <rect key="1" width="18" height="18" x="3" y="3" rx="2"/>,
        <path key="2" d="M9 3v18"/>,
        //<path key="3" d="m16 15-3-3 3-3"/>
      ]
    }
  },
  'spinner': {
    default: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 2,
      noFill: true,
      paths: [
        <path key="1" d="M21 12a9 9 0 1 1-6.219-8.56" />
      ]
    }
  },
  'chat-bubble': {
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97ZM6.75 8.25a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H7.5Z" clipRule="evenodd" />
      ]
    },
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 0 0 1.33 0l1.713-3.293a.783.783 0 0 1 .642-.413 41.102 41.102 0 0 0 3.55-.414c1.437-.231 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2ZM6.75 6a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 2.5a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M1 8.74c0 .983.713 1.825 1.69 1.943.904.108 1.817.19 2.737.243.363.02.688.231.85.556l1.052 2.103a.75.75 0 0 0 1.342 0l1.052-2.103c.162-.325.487-.535.85-.556.92-.053 1.833-.134 2.738-.243.976-.118 1.689-.96 1.689-1.942V4.259c0-.982-.713-1.824-1.69-1.942a44.45 44.45 0 0 0-10.62 0C1.712 2.435 1 3.277 1 4.26v4.482Zm3-3.49a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 4 5.25ZM4.75 7a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5h-2.5Z" clipRule="evenodd" />
      ]
    }
  }
  ,
  'history-clock': {
    // From Google Material Icons
    mini: {
      // Use original viewBox from provided SVG to preserve proportions
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="M480-144q-140 0-238-98t-98-238h72q0 109 77.5 186.5T480-216q109 0 186.5-77.5T744-480q0-109-77.5-186.5T480-744q-62 0-114.55 25.6Q312.91-692.8 277-648h107v72H144v-240h72v130q46-60 114.5-95T480-816q70 0 131.13 26.6 61.14 26.6 106.4 71.87 45.27 45.26 71.87 106.4Q816-550 816-480t-26.6 131.13q-26.6 61.14-71.87 106.4-45.26 45.27-106.4 71.87Q550-144 480-144Zm100-200L444-480v-192h72v162l115 115-51 51Z" />
      ]
    },
    micro: {
      // Use original viewBox from provided SVG to preserve proportions
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="M480-144q-140 0-238-98t-98-238h72q0 109 77.5 186.5T480-216q109 0 186.5-77.5T744-480q0-109-77.5-186.5T480-744q-62 0-114.55 25.6Q312.91-692.8 277-648h107v72H144v-240h72v130q46-60 114.5-95T480-816q70 0 131.13 26.6 61.14 26.6 106.4 71.87 45.27 45.26 71.87 106.4Q816-550 816-480t-26.6 131.13q-26.6 61.14-71.87 106.4-45.26 45.27-106.4 71.87Q550-144 480-144Zm100-200L444-480v-192h72v162l115 115-51 51Z" />
      ]
    }
  }
  ,
  'today-calendar': {
    // From Google Material Icons
    micro: {
      // Use original viewBox from provided SVG to preserve proportions
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="M384.23-264Q344-264 316-291.77q-28-27.78-28-68Q288-400 315.77-428q27.78-28 68-28Q424-456 452-428.23q28 27.78 28 68Q480-320 452.23-292q-27.78 28-68 28ZM216-96q-29.7 0-50.85-21.5Q144-139 144-168v-528q0-29 21.15-50.5T216-768h72v-96h72v96h240v-96h72v96h72q29.7 0 50.85 21.5Q816-725 816-696v528q0 29-21.15 50.5T744-96H216Zm0-72h528v-360H216v360Zm0-432h528v-96H216v96Zm0 0v-96 96Z" />
      ]
    }
  },
  'calendar': {
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      noFill: true,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      ]
    },
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M4 1.75a.75.75 0 0 1 1.5 0V3h5V1.75a.75.75 0 0 1 1.5 0V3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2V1.75ZM4.5 6a1 1 0 0 0-1 1v4.5a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-7Z" clipRule="evenodd" />
      ]
    }
  }
  ,
  'calendar-days': {
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      noFill: true,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
      ]
    },
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" d="M12.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8.25 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM10.5 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12.75 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM14.25 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />,
        <path key="2" fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" d="M5.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V12ZM6 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H6ZM7.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H8a.75.75 0 0 1-.75-.75V12ZM8 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H8ZM9.25 10a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H10a.75.75 0 0 1-.75-.75V10ZM10 11.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-.75-.75H10ZM9.25 14a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H10a.75.75 0 0 1-.75-.75V14ZM12 9.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V10a.75.75 0 0 0-.75-.75H12ZM11.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H12a.75.75 0 0 1-.75-.75V12ZM12 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H12ZM13.25 10a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H14a.75.75 0 0 1-.75-.75V10ZM14 11.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-.75-.75H14Z" />,
        <path key="2" fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" d="M5.75 7.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM5 10.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0ZM10.25 7.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM7.25 8.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0ZM8 9.5A.75.75 0 1 0 8 11a.75.75 0 0 0 0-1.5Z" />,
        <path key="2" fillRule="evenodd" d="M4.75 1a.75.75 0 0 0-.75.75V3a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2V1.75a.75.75 0 0 0-1.5 0V3h-5V1.75A.75.75 0 0 0 4.75 1ZM3.5 7a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v4.5a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V7Z" clipRule="evenodd" />
      ]
    }
  }
  ,
  'map-pin': {
    // From Google Material Icons
    micro: {
      viewBox: '0 0 20 20',
      paths: [
        <path key="1" d="M12.5 6C12.5 5.3125 12.2552 4.72396 11.7656 4.23437C11.276 3.74479 10.6875 3.5 10 3.5C9.3125 3.5 8.72396 3.74479 8.23438 4.23437C7.74479 4.72396 7.5 5.3125 7.5 6C7.5 6.6875 7.74479 7.27604 8.23438 7.76562C8.72396 8.25521 9.3125 8.5 10 8.5C10.6875 8.5 11.276 8.25521 11.7656 7.76562C12.2552 7.27604 12.5 6.6875 12.5 6ZM14 6C14 6.98653 13.691 7.84431 13.0729 8.57333C12.4549 9.30222 11.6806 9.75694 10.75 9.9375V18H9.25V9.9375C8.31944 9.75694 7.54514 9.30222 6.92708 8.57333C6.30903 7.84431 6 6.98653 6 6C6 4.88889 6.38889 3.94444 7.16667 3.16667C7.94444 2.38889 8.88889 2 10 2C11.1111 2 12.0556 2.38889 12.8333 3.16667C13.6111 3.94444 14 4.88889 14 6Z" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M11.25 4.5C11.25 3.875 11.0104 3.35417 10.5313 2.9375C10.0521 2.52083 9.46875 2.3125 8.78125 2.3125C8.09375 2.3125 7.51042 2.52083 7.03125 2.9375C6.55208 3.35417 6.3125 3.875 6.3125 4.5C6.3125 5.125 6.55208 5.64583 7.03125 6.0625C7.51042 6.47917 8.09375 6.6875 8.78125 6.6875C9.46875 6.6875 10.0521 6.47917 10.5313 6.0625C11.0104 5.64583 11.25 5.125 11.25 4.5ZM12.5 4.5C12.5 5.29167 12.2344 5.98958 11.7031 6.59375C11.1719 7.19792 10.5156 7.59375 9.73438 7.78125V14H7.82813V7.78125C7.04688 7.59375 6.39063 7.19792 5.85938 6.59375C5.32813 5.98958 5.0625 5.29167 5.0625 4.5C5.0625 3.54167 5.37500 2.75000 6.00000 2.125C6.62500 1.50000 7.59375 1.1875 8.90625 1.1875C10.2188 1.1875 11.1875 1.50000 11.8125 2.125C12.4375 2.75000 12.5 3.54167 12.5 4.5Z" clipRule="evenodd" />
      ]
    }
  }
  ,
  'filter': {
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
      ]
    },
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M3.792 2.938A49.069 49.069 0 0 1 12 2.25c2.797 0 5.54.236 8.209.688a1.857 1.857 0 0 1 1.541 1.836v1.044a3 3 0 0 1-.879 2.121l-6.182 6.182a1.5 1.5 0 0 0-.439 1.061v2.927a3 3 0 0 1-1.658 2.684l-1.757.878A.75.75 0 0 1 9.75 21v-5.818a1.5 1.5 0 0 0-.44-1.06L3.13 7.938a3 3 0 0 1-.879-2.121V4.774c0-.897.64-1.683 1.542-1.836Z" clipRule="evenodd" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 0 1 .628.74v2.288a2.25 2.25 0 0 1-.659 1.59l-4.682 4.683a2.25 2.25 0 0 0-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 0 1 8 18.25v-5.757a2.25 2.25 0 0 0-.659-1.591L2.659 6.22A2.25 2.25 0 0 1 2 4.629V2.34a.75.75 0 0 1 .628-.74Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" d="M14 2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2.172a2 2 0 0 0 .586 1.414l2.828 2.828A2 2 0 0 1 6 9.828v4.363a.5.5 0 0 0 .724.447l2.17-1.085A2 2 0 0 0 10 11.763V9.829a2 2 0 0 1 .586-1.414l2.828-2.828A2 2 0 0 0 14 4.172V2Z" />
      ]
    }
  }
  ,
  'flag': {
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      noFill: true,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
      ]
    },
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M3 2.25a.75.75 0 0 1 .75.75v.54l1.838-.46a9.75 9.75 0 0 1 6.725.738l.108.054A8.25 8.25 0 0 0 18 4.524l3.11-.732a.75.75 0 0 1 .917.81 47.784 47.784 0 0 0 .005 10.337.75.75 0 0 1-.574.812l-3.114.733a9.75 9.75 0 0 1-6.594-.77l-.108-.054a8.25 8.25 0 0 0-5.69-.625l-2.202.55V21a.75.75 0 0 1-1.5 0V3A.75.75 0 0 1 3 2.25Z" clipRule="evenodd" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" d="M3.5 2.75a.75.75 0 0 0-1.5 0v14.5a.75.75 0 0 0 1.5 0v-4.392l1.657-.348a6.449 6.449 0 0 1 4.271.572 7.948 7.948 0 0 0 5.965.524l2.078-.64A.75.75 0 0 0 18 12.25v-8.5a.75.75 0 0 0-.904-.734l-2.38.501a7.25 7.25 0 0 1-4.186-.363l-.502-.2a8.75 8.75 0 0 0-5.053-.439l-1.475.31V2.75Z" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" d="M2.75 2a.75.75 0 0 0-.75.75v10.5a.75.75 0 0 0 1.5 0v-2.624l.33-.083A6.044 6.044 0 0 1 8 11c1.29.645 2.77.807 4.17.457l1.48-.37a.462.462 0 0 0 .35-.448V3.56a.438.438 0 0 0-.544-.425l-1.287.322C10.77 3.808 9.291 3.646 8 3a6.045 6.045 0 0 0-4.17-.457l-.34.085A.75.75 0 0 0 2.75 2Z" />
      ]
    }
  }
  ,
  'gift': {
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
      ]
    },
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" d="M9.375 3a1.875 1.875 0 0 0 0 3.75h1.875v4.5H3.375A1.875 1.875 0 0 1 1.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0 1 12 2.753a3.375 3.375 0 0 1 5.432 3.997h3.943c1.035 0 1.875.84 1.875 1.875v.75c0 1.036-.84 1.875-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 1 0-1.875-1.875V6.75h-1.5V4.875C11.25 3.839 10.41 3 9.375 3ZM11.25 12.75H3v6.75a2.25 2.25 0 0 0 2.25 2.25h6v-9ZM12.75 12.75v9h6.75a2.25 2.25 0 0 0 2.25-2.25v-6.75h-9Z" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M14 6a2.5 2.5 0 0 0-4-3 2.5 2.5 0 0 0-4 3H3.25C2.56 6 2 6.56 2 7.25v.5C2 8.44 2.56 9 3.25 9h6V6h1.5v3h6C17.44 9 18 8.44 18 7.75v-.5C18 6.56 17.44 6 16.75 6H14Zm-1-1.5a1 1 0 0 1-1 1h-1v-1a1 1 0 1 1 2 0Zm-6 0a1 1 0 0 0 1 1h1v-1a1 1 0 0 0-2 0Z" clipRule="evenodd" />,
        <path key="2" d="M9.25 10.5H3v4.75A2.75 2.75 0 0 0 5.75 18h3.5v-7.5ZM10.75 18v-7.5H17v4.75A2.75 2.75 0 0 1 14.25 18h-3.5Z" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M3.75 3.5c0 .563.186 1.082.5 1.5H2a1 1 0 0 0 0 2h5.25V5h1.5v2H14a1 1 0 1 0 0-2h-2.25A2.5 2.5 0 0 0 8 1.714 2.5 2.5 0 0 0 3.75 3.5Zm3.499 0v-.038A1 1 0 1 0 6.25 4.5h1l-.001-1Zm2.5-1a1 1 0 0 0-1 .962l.001.038v1h.999a1 1 0 0 0 0-2Z" clipRule="evenodd" />,
        <path key="2" d="M7.25 8.5H2V12a2 2 0 0 0 2 2h3.25V8.5ZM8.75 14V8.5H14V12a2 2 0 0 1-2 2H8.75Z" />
      ]
    }
  }
  ,
  'globe-alt': {
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      noFill: true,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
      ]
    },
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" d="M21.721 12.752a9.711 9.711 0 0 0-.945-5.003 12.754 12.754 0 0 1-4.339 2.708 18.991 18.991 0 0 1-.214 4.772 17.165 17.165 0 0 0 5.498-2.477ZM14.634 15.55a17.324 17.324 0 0 0 .332-4.647c-.952.227-1.945.347-2.966.347-1.021 0-2.014-.12-2.966-.347a17.515 17.515 0 0 0 .332 4.647 17.385 17.385 0 0 0 5.268 0ZM9.772 17.119a18.963 18.963 0 0 0 4.456 0A17.182 17.182 0 0 1 12 21.724a17.18 17.18 0 0 1-2.228-4.605ZM7.777 15.23a18.87 18.87 0 0 1-.214-4.774 12.753 12.753 0 0 1-4.34-2.708 9.711 9.711 0 0 0-.944 5.004 17.165 17.165 0 0 0 5.498 2.477ZM21.356 14.752a9.765 9.765 0 0 1-7.478 6.817 18.64 18.64 0 0 0 1.988-4.718 18.627 18.627 0 0 0 5.49-2.098ZM2.644 14.752c1.682.971 3.53 1.688 5.49 2.099a18.64 18.64 0 0 0 1.988 4.718 9.765 9.765 0 0 1-7.478-6.816ZM13.878 2.43a9.755 9.755 0 0 1 6.116 3.986 11.267 11.267 0 0 1-3.746 2.504 18.63 18.63 0 0 0-2.37-6.49ZM12 2.276a17.152 17.152 0 0 1 2.805 7.121c-.897.23-1.837.353-2.805.353-.968 0-1.908-.122-2.805-.353A17.151 17.151 0 0 1 12 2.276ZM10.122 2.43a18.629 18.629 0 0 0-2.37 6.49 11.266 11.266 0 0 1-3.746-2.504 9.754 9.754 0 0 1 6.116-3.985Z" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" d="M16.555 5.412a8.028 8.028 0 0 0-3.503-2.81 14.899 14.899 0 0 1 1.663 4.472 8.547 8.547 0 0 0 1.84-1.662ZM13.326 7.825a13.43 13.43 0 0 0-2.413-5.773 8.087 8.087 0 0 0-1.826 0 13.43 13.43 0 0 0-2.413 5.773A8.473 8.473 0 0 0 10 8.5c1.18 0 2.304-.24 3.326-.675ZM6.514 9.376A9.98 9.98 0 0 0 10 10c1.226 0 2.4-.22 3.486-.624a13.54 13.54 0 0 1-.351 3.759A13.54 13.54 0 0 1 10 13.5c-1.079 0-2.128-.127-3.134-.366a13.538 13.538 0 0 1-.352-3.758ZM5.285 7.074a14.9 14.9 0 0 1 1.663-4.471 8.028 8.028 0 0 0-3.503 2.81c.529.638 1.149 1.199 1.84 1.66ZM17.334 6.798a7.973 7.973 0 0 1 .614 4.115 13.47 13.47 0 0 1-3.178 1.72 15.093 15.093 0 0 0 .174-3.939 10.043 10.043 0 0 0 2.39-1.896ZM2.666 6.798a10.042 10.042 0 0 0 2.39 1.896 15.196 15.196 0 0 0 .174 3.94 13.472 13.472 0 0 1-3.178-1.72 7.973 7.973 0 0 1 .615-4.115ZM10 15c.898 0 1.778-.079 2.633-.23a13.473 13.473 0 0 1-1.72 3.178 8.099 8.099 0 0 1-1.826 0 13.47 13.47 0 0 1-1.72-3.178c.855.151 1.735.23 2.633.23ZM14.357 14.357a14.912 14.912 0 0 1-1.305 3.04 8.027 8.027 0 0 0 4.345-4.345c-.953.542-1.971.981-3.04 1.305ZM6.948 17.397a8.027 8.027 0 0 1-4.345-4.345c.953.542 1.971.981 3.04 1.305a14.912 14.912 0 0 0 1.305 3.04Z" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M3.757 4.5c.18.217.376.42.586.608.153-.61.354-1.175.596-1.678A5.53 5.53 0 0 0 3.757 4.5ZM8 1a6.994 6.994 0 0 0-7 7 7 7 0 1 0 7-7Zm0 1.5c-.476 0-1.091.386-1.633 1.427-.293.564-.531 1.267-.683 2.063A5.48 5.48 0 0 0 8 6.5a5.48 5.48 0 0 0 2.316-.51c-.152-.796-.39-1.499-.683-2.063C9.09 2.886 8.476 2.5 8 2.5Zm3.657 2.608a8.823 8.823 0 0 0-.596-1.678c.444.298.842.659 1.182 1.07-.18.217-.376.42-.586.608Zm-1.166 2.436A6.983 6.983 0 0 1 8 8a6.983 6.983 0 0 1-2.49-.456 10.703 10.703 0 0 0 .202 2.6c.72.231 1.49.356 2.288.356.798 0 1.568-.125 2.29-.356a10.705 10.705 0 0 0 .2-2.6Zm1.433 1.85a12.652 12.652 0 0 0 .018-2.609c.405-.276.78-.594 1.117-.947a5.48 5.48 0 0 1 .44 2.262 7.536 7.536 0 0 1-1.575 1.293Zm-2.172 2.435a9.046 9.046 0 0 1-3.504 0c.039.084.078.166.12.244C6.907 13.114 7.523 13.5 8 13.5s1.091-.386 1.633-1.427c.04-.078.08-.16.12-.244Zm1.31.74a8.5 8.5 0 0 0 .492-1.298c.457-.197.893-.43 1.307-.696a5.526 5.526 0 0 1-1.8 1.995Zm-6.123 0a8.507 8.507 0 0 1-.493-1.298 8.985 8.985 0 0 1-1.307-.696 5.526 5.526 0 0 0 1.8 1.995ZM2.5 8.1c.463.5.993.935 1.575 1.293a12.652 12.652 0 0 1-.018-2.608 7.037 7.037 0 0 1-1.117-.947 5.48 5.48 0 0 0-.44 2.262Z" clipRule="evenodd" />
      ]
    }
  }
  ,
  'banknotes': {
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
      ]
    },
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" d="M12 7.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />,
        <path key="2" fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 14.625v-9.75ZM8.25 9.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM18.75 9a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75V9.75a.75.75 0 0 0-.75-.75h-.008ZM4.5 9.75A.75.75 0 0 1 5.25 9h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75V9.75Z" clipRule="evenodd" />,
        <path key="3" d="M2.25 18a.75.75 0 0 0 0 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 0 0-.75-.75H2.25Z" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M1 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4Zm12 4a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM4 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm13-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM1.75 14.5a.75.75 0 0 0 0 1.5c4.417 0 8.693.603 12.749 1.73 1.111.309 2.251-.512 2.251-1.696v-.784a.75.75 0 0 0-1.5 0v.784a.272.272 0 0 1-.35.25A49.043 49.043 0 0 0 1.75 14.5Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3Zm9 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm-6.25-.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM11.5 6A.75.75 0 1 1 13 6a.75.75 0 0 1-1.5 0Z" clipRule="evenodd" />,
        <path key="2" d="M13 11.75a.75.75 0 0 0-1.5 0v.179c0 .15-.138.28-.306.255A65.277 65.277 0 0 0 1.75 11.5a.75.75 0 0 0 0 1.5c3.135 0 6.215.228 9.227.668A1.764 1.764 0 0 0 13 11.928v-.178Z" />
      ]
    }
  }
  ,
  'exclamation-triangle': {
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
      ]
    },
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 1 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
      ]
    }
  }
  ,
  'info-circle': {
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
      ]
    },
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6.75 8a.75.75 0 0 0 0 1.5h.75v1.75a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8.25 8h-1.5Z" clipRule="evenodd" />
      ]
    }
  }
  ,
  'not-used-icon': {
    micro: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="M480.28-96Q401-96 331-126t-122.5-82.5Q156-261 126-330.96t-30-149.5Q96-560 126-629.5q30-69.5 82.5-122T330.96-834q69.96-30 149.5-30t149.04 30q69.5 30 122 82.5T834-629.28q30 69.73 30 149Q864-401 834-331t-82.5 122.5Q699-156 629.28-126q-69.73 30-149 30Zm-.28-72q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z" />
      ]
    },
    mini: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="M480.28-96Q401-96 331-126t-122.5-82.5Q156-261 126-330.96t-30-149.5Q96-560 126-629.5q30-69.5 82.5-122T330.96-834q69.96-30 149.5-30t149.04 30q69.5 30 122 82.5T834-629.28q30 69.73 30 149Q864-401 834-331t-82.5 122.5Q699-156 629.28-126q-69.73 30-149 30Zm-.28-72q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z" />
      ]
    }
  }
  ,
  'not-used-icon-v2': {
    micro: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="M480.28-87.87q-81.19 0-152.62-30.62-71.44-30.62-125-84.17-53.55-53.56-84.17-124.95Q87.87-399 87.87-480.46q0-81.45 30.62-152.38 30.62-70.94 84.17-124.5 53.56-53.55 124.95-84.17 71.39-30.62 152.85-30.62 81.45 0 152.38 30.62 70.94 30.62 124.5 84.17 53.55 53.56 84.17 124.72 30.62 71.16 30.62 152.34 0 81.19-30.62 152.62-30.62 71.44-84.17 125-53.56 53.55-124.72 84.17-71.16 30.62-152.34 30.62Zm-.28-83q129.04 0 219.09-90.04 90.04-90.05 90.04-219.09 0-129.04-90.04-219.09-90.05-90.04-219.09-90.04-129.04 0-219.09 90.04-90.04 90.05-90.04 219.09 0 129.04 90.04 219.09 90.05 90.04 219.09 90.04ZM480-480Z" />
      ]
    },
    mini: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="M480.28-87.87q-81.19 0-152.62-30.62-71.44-30.62-125-84.17-53.55-53.56-84.17-124.95Q87.87-399 87.87-480.46q0-81.45 30.62-152.38 30.62-70.94 84.17-124.5 53.56-53.55 124.95-84.17 71.39-30.62 152.85-30.62 81.45 0 152.38 30.62 70.94 30.62 124.5 84.17 53.55 53.56 84.17 124.72 30.62 71.16 30.62 152.34 0 81.19-30.62 152.62-30.62 71.44-84.17 125-53.56 53.55-124.72 84.17-71.16 30.62-152.34 30.62Zm-.28-83q129.04 0 219.09-90.04 90.04-90.05 90.04-219.09 0-129.04-90.04-219.09-90.05-90.04-219.09-90.04-129.04 0-219.09 90.04-90.04 90.05-90.04 219.09 0 129.04 90.04 219.09 90.05 90.04 219.09 90.04ZM480-480Z" />
      ]
    }
  }
  ,
  'partially-used-icon': {
    micro: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="M480-480Zm-384 0q0-85 34.5-158.5T223-765q58-53 134.5-79T519-862q15 2 23 14t5 27q-3 15-15.5 23.5T504-791q-67-5-127.5 17T269-709q-47 43-74 101.5T168-480q0 130 91 221t221 91q68 0 127-27t102-73q45-48 66-109t16-127q-2-15 6.5-27.5T821-547q15-3 27 5t14 23q8 85-17.5 160.5T766-224q-55 62-129.5 95T480-96q-79 0-149-30t-122.5-82.5Q156-261 126-331T96-480Zm624-120q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35Z" />
      ]
    },
    mini: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="M480-480Zm-384 0q0-85 34.5-158.5T223-765q58-53 134.5-79T519-862q15 2 23 14t5 27q-3 15-15.5 23.5T504-791q-67-5-127.5 17T269-709q-47 43-74 101.5T168-480q0 130 91 221t221 91q68 0 127-27t102-73q45-48 66-109t16-127q-2-15 6.5-27.5T821-547q15-3 27 5t14 23q8 85-17.5 160.5T766-224q-55 62-129.5 95T480-96q-79 0-149-30t-122.5-82.5Q156-261 126-331T96-480Zm624-120q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35Z" />
      ]
    }
  }
  ,
  'used-icon': {
    micro: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="m429-336 238-237-51-51-187 186-85-84-51 51 136 135Zm51 240q-79 0-149-30t-122.5-82.5Q156-261 126-331T96-480q0-80 30-149.5t82.5-122Q261-804 331-834t149-30q80 0 149.5 30t122 82.5Q804-699 834-629.5T864-480q0 79-30 149t-82.5 122.5Q699-156 629.5-126T480-96Zm0-72q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z" />
      ]
    },
    mini: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="m429-336 238-237-51-51-187 186-85-84-51 51 136 135Zm51 240q-79 0-149-30t-122.5-82.5Q156-261 126-331T96-480q0-80 30-149.5t82.5-122Q261-804 331-834t149-30q80 0 149.5 30t122 82.5Q804-699 834-629.5T864-480q0 79-30 149t-82.5 122.5Q699-156 629.5-126T480-96Zm0-72q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z" />
      ]
    }
  }
  ,
  'inactive': {
    micro: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="m768-91-72-72q-48.39 32-103.19 49Q538-97 480.49-97q-79.55 0-149.52-30Q261-157 208.5-209.5T126-331.97q-30-69.97-30-149.52 0-57.51 17-112.32 17-54.8 49-103.19l-72-73 51-51 678 679-51 51Zm-288-78q43.69 0 84.85-12Q606-193 643-216L215-644q-23 37-35 78.15-12 41.16-12 84.85 0 129.67 91.16 220.84Q350.33-169 480-169Zm318-97-53-52q22-37 34.5-78.15Q792-437.31 792-481q0-129.67-91.16-220.84Q609.67-793 480-793q-43 0-84.5 12T317-747l-53-52q48.39-32 103.19-49Q422-865 479.9-865q80.1 0 149.6 30t122 82.5Q804-700 834-630.5t30 149.6q0 57.9-17 112.36T798-266ZM536-531ZM432-427Z" />
      ]
    },
    mini: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="m768-91-72-72q-48.39 32-103.19 49Q538-97 480.49-97q-79.55 0-149.52-30Q261-157 208.5-209.5T126-331.97q-30-69.97-30-149.52 0-57.51 17-112.32 17-54.8 49-103.19l-72-73 51-51 678 679-51 51Zm-288-78q43.69 0 84.85-12Q606-193 643-216L215-644q-23 37-35 78.15-12 41.16-12 84.85 0 129.67 91.16 220.84Q350.33-169 480-169Zm318-97-53-52q22-37 34.5-78.15Q792-437.31 792-481q0-129.67-91.16-220.84Q609.67-793 480-793q-43 0-84.5 12T317-747l-53-52q48.39-32 103.19-49Q422-865 479.9-865q80.1 0 149.6 30t122 82.5Q804-700 834-630.5t30 149.6q0 57.9-17 112.36T798-266ZM536-531ZM432-427Z" />
      ]
    }
  }
  ,
  'disabled': {
    micro: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="m339-288 141-141 141 141 51-51-141-141 141-141-51-51-141 141-141-141-51 51 141 141-141 141 51 51ZM480-96q-79 0-149-30t-122.5-82.5Q156-261 126-331T96-480q0-80 30-149.5t82.5-122Q261-804 331-834t149-30q80 0 149.5 30t122 82.5Q804-699 834-629.5T864-480q0 79-30 149t-82.5 122.5Q699-156 629.5-126T480-96Zm0-72q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z" />
      ]
    },
    mini: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="m339-288 141-141 141 141 51-51-141-141 141-141-51-51-141 141-141-141-51 51 141 141-141 141 51 51ZM480-96q-79 0-149-30t-122.5-82.5Q156-261 126-331T96-480q0-80 30-149.5t82.5-122Q261-804 331-834t149-30q80 0 149.5 30t122 82.5Q804-699 834-629.5T864-480q0 79-30 149t-82.5 122.5Q699-156 629.5-126T480-96Zm0-72q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z" />
      ]
    }
  }
  ,
  'future-icon': {
    micro: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="m614-310 51-51-149-149v-210h-72v240l170 170ZM480-96q-79.38 0-149.19-30T208.5-208.5Q156-261 126-330.96t-30-149.5Q96-560 126-630q30-70 82.5-122t122.46-82q69.96-30 149.5-30t149.55 30.24q70 30.24 121.79 82.08 51.78 51.84 81.99 121.92Q864-559.68 864-480q0 79.38-30 149.19T752-208.5Q700-156 629.87-126T480-96Zm0-384Zm.48 312q129.47 0 220.5-91.5Q792-351 792-480.48q0-129.47-91.02-220.5Q609.95-792 480.48-792 351-792 259.5-700.98 168-609.95 168-480.48 168-351 259.5-259.5T480.48-168Z" />
      ]
    },
    mini: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="m614-310 51-51-149-149v-210h-72v240l170 170ZM480-96q-79.38 0-149.19-30T208.5-208.5Q156-261 126-330.96t-30-149.5Q96-560 126-630q30-70 82.5-122t122.46-82q69.96-30 149.5-30t149.55 30.24q70 30.24 121.79 82.08 51.78 51.84 81.99 121.92Q864-559.68 864-480q0 79.38-30 149.19T752-208.5Q700-156 629.87-126T480-96Zm0-384Zm.48 312q129.47 0 220.5-91.5Q792-351 792-480.48q0-129.47-91.02-220.5Q609.95-792 480.48-792 351-792 259.5-700.98 168-609.95 168-480.48 168-351 259.5-259.5T480.48-168Z" />
      ]
    }
  }
  ,
  'used-icon-filled': {
    solid: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="m429-336 238-237-51-51-187 186-85-84-51 51 136 135Zm51 240q-79 0-149-30t-122.5-82.5Q156-261 126-331T96-480q0-80 30-149.5t82.5-122Q261-804 331-834t149-30q80 0 149.5 30t122 82.5Q804-699 834-629.5T864-480q0 79-30 149t-82.5 122.5Q699-156 629.5-126T480-96Z" />
      ]
    },
    mini: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="m429-336 238-237-51-51-187 186-85-84-51 51 136 135Zm51 240q-79 0-149-30t-122.5-82.5Q156-261 126-331T96-480q0-80 30-149.5t82.5-122Q261-804 331-834t149-30q80 0 149.5 30t122 82.5Q804-699 834-629.5T864-480q0 79-30 149t-82.5 122.5Q699-156 629.5-126T480-96Z" />
      ]
    },
    micro: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="m429-336 238-237-51-51-187 186-85-84-51 51 136 135Zm51 240q-79 0-149-30t-122.5-82.5Q156-261 126-331T96-480q0-80 30-149.5t82.5-122Q261-804 331-834t149-30q80 0 149.5 30t122 82.5Q804-699 834-629.5T864-480q0 79-30 149t-82.5 122.5Q699-156 629.5-126T480-96Z" />
      ]
    }
  }
  ,
  'not-used-icon-filled': {
    solid: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="M480.28-87.87q-81.19 0-152.62-30.62-71.44-30.62-125-84.17-53.55-53.56-84.17-124.95Q87.87-399 87.87-480.46q0-81.45 30.62-152.38 30.62-70.94 84.17-124.5 53.56-53.55 124.95-84.17 71.39-30.62 152.85-30.62 81.45 0 152.38 30.62 70.94 30.62 124.5 84.17 53.55 53.56 84.17 124.72 30.62 71.16 30.62 152.34 0 81.19-30.62 152.62-30.62 71.44-84.17 125-53.56 53.55-124.72 84.17-71.16 30.62-152.34 30.62Zm-.28-83q129.04 0 219.09-90.04 90.04-90.05 90.04-219.09 0-129.04-90.04-219.09-90.05-90.04-219.09-90.04-129.04 0-219.09 90.04-90.04 90.05-90.04 219.09 0 129.04 90.04 219.09 90.05 90.04 219.09 90.04ZM480-480Z" />
      ]
    },
    mini: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="M480.28-87.87q-81.19 0-152.62-30.62-71.44-30.62-125-84.17-53.55-53.56-84.17-124.95Q87.87-399 87.87-480.46q0-81.45 30.62-152.38 30.62-70.94 84.17-124.5 53.56-53.55 124.95-84.17 71.39-30.62 152.85-30.62 81.45 0 152.38 30.62 70.94 30.62 124.5 84.17 53.55 53.56 84.17 124.72 30.62 71.16 30.62 152.34 0 81.19-30.62 152.62-30.62 71.44-84.17 125-53.56 53.55-124.72 84.17-71.16 30.62-152.34 30.62Zm-.28-83q129.04 0 219.09-90.04 90.04-90.05 90.04-219.09 0-129.04-90.04-219.09-90.05-90.04-219.09-90.04-129.04 0-219.09 90.04-90.04 90.05-90.04 219.09 0 129.04 90.04 219.09 90.05 90.04 219.09 90.04ZM480-480Z" />
      ]
    },
    micro: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="M480.28-87.87q-81.19 0-152.62-30.62-71.44-30.62-125-84.17-53.55-53.56-84.17-124.95Q87.87-399 87.87-480.46q0-81.45 30.62-152.38 30.62-70.94 84.17-124.5 53.56-53.55 124.95-84.17 71.39-30.62 152.85-30.62 81.45 0 152.38 30.62 70.94 30.62 124.5 84.17 53.55 53.56 84.17 124.72 30.62 71.16 30.62 152.34 0 81.19-30.62 152.62-30.62 71.44-84.17 125-53.56 53.55-124.72 84.17-71.16 30.62-152.34 30.62Zm-.28-83q129.04 0 219.09-90.04 90.04-90.05 90.04-219.09 0-129.04-90.04-219.09-90.05-90.04-219.09-90.04-129.04 0-219.09 90.04-90.04 90.05-90.04 219.09 0 129.04 90.04 219.09 90.05 90.04 219.09 90.04ZM480-480Z" />
      ]
    }
  }
  ,
  'partially-used-icon-filled': {
    solid: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="M480.28-87.87q-80.95 0-152.39-30.6-71.43-30.6-125.13-84.29-53.69-53.7-84.29-125.09-30.6-71.39-30.6-152.61 0-81.21 30.6-152.15 30.6-70.93 84.29-124.63 53.7-53.69 125.09-84.29 71.39-30.6 152.61-30.6 81.21 0 152.15 30.6 70.93 30.6 124.63 84.29 53.69 53.7 84.29 124.86 30.6 71.15 30.6 152.1 0 80.95-30.6 152.39-30.6 71.43-84.29 125.13-53.7 53.69-124.86 84.29-71.15 30.6-152.1 30.6ZM262.15-262.15 480-480v-309.13q-128.57 0-218.85 90.1-90.28 90.11-90.28 219.53 0 62.02 23.76 117.8 23.76 55.79 67.52 99.55Z" />
      ]
    },
    mini: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="M480.28-87.87q-80.95 0-152.39-30.6-71.43-30.6-125.13-84.29-53.69-53.7-84.29-125.09-30.6-71.39-30.6-152.61 0-81.21 30.6-152.15 30.6-70.93 84.29-124.63 53.7-53.69 125.09-84.29 71.39-30.6 152.61-30.6 81.21 0 152.15 30.6 70.93 30.6 124.63 84.29 53.69 53.7 84.29 124.86 30.6 71.15 30.6 152.1 0 80.95-30.6 152.39-30.6 71.43-84.29 125.13-53.7 53.69-124.86 84.29-71.15 30.6-152.1 30.6ZM262.15-262.15 480-480v-309.13q-128.57 0-218.85 90.1-90.28 90.11-90.28 219.53 0 62.02 23.76 117.8 23.76 55.79 67.52 99.55Z" />
      ]
    },
    micro: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="M480.28-87.87q-80.95 0-152.39-30.6-71.43-30.6-125.13-84.29-53.69-53.7-84.29-125.09-30.6-71.39-30.6-152.61 0-81.21 30.6-152.15 30.6-70.93 84.29-124.63 53.7-53.69 125.09-84.29 71.39-30.6 152.61-30.6 81.21 0 152.15 30.6 70.93 30.6 124.63 84.29 53.69 53.7 84.29 124.86 30.6 71.15 30.6 152.1 0 80.95-30.6 152.39-30.6 71.43-84.29 125.13-53.7 53.69-124.86 84.29-71.15 30.6-152.1 30.6ZM262.15-262.15 480-480v-309.13q-128.57 0-218.85 90.1-90.28 90.11-90.28 219.53 0 62.02 23.76 117.8 23.76 55.79 67.52 99.55Z" />
      ]
    }
  }
  ,
  'inactive-filled': {
    solid: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="m777.09-80.96-75.83-75.58q-49.58 32.95-105.69 50.31-56.12 17.36-115.04 17.36-81.51 0-152.91-30.62-71.4-30.62-124.96-84.17-53.55-53.56-84.17-124.96-30.62-71.4-30.62-152.91 0-58.92 17.36-115.04 17.36-56.11 50.31-105.69l-75.58-76.83 53.39-53.39 697.13 698.13-53.39 53.39ZM480-171.87q43.03 0 83.56-11.76t76.81-34.04l-423.7-423.7q-22.52 36.28-34.16 76.72-11.64 40.43-11.64 83.65 0 128.72 90.21 218.92 90.2 90.21 218.92 90.21Zm327.09-93.41-61.37-60.37q20.08-35.57 31.75-74.81 11.66-39.24 11.66-80.54 0-128.72-90.21-218.92-90.2-90.21-218.92-90.21-40.61 0-80.2 11.16-39.58 11.17-75.15 31.25l-61.37-60.37q48.87-31.52 103.75-48.28 54.89-16.76 112.87-16.76 82.01 0 152.94 30.62 70.94 30.62 124.5 84.17 53.55 53.56 84.17 124.5 30.62 70.93 30.62 152.94 0 57.98-16.76 112.52t-48.28 103.1ZM540.3-535.3ZM431.52-426.52Z" />
      ]
    },
    mini: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="m777.09-80.96-75.83-75.58q-49.58 32.95-105.69 50.31-56.12 17.36-115.04 17.36-81.51 0-152.91-30.62-71.4-30.62-124.96-84.17-53.55-53.56-84.17-124.96-30.62-71.4-30.62-152.91 0-58.92 17.36-115.04 17.36-56.11 50.31-105.69l-75.58-76.83 53.39-53.39 697.13 698.13-53.39 53.39ZM480-171.87q43.03 0 83.56-11.76t76.81-34.04l-423.7-423.7q-22.52 36.28-34.16 76.72-11.64 40.43-11.64 83.65 0 128.72 90.21 218.92 90.2 90.21 218.92 90.21Zm327.09-93.41-61.37-60.37q20.08-35.57 31.75-74.81 11.66-39.24 11.66-80.54 0-128.72-90.21-218.92-90.2-90.21-218.92-90.21-40.61 0-80.2 11.16-39.58 11.17-75.15 31.25l-61.37-60.37q48.87-31.52 103.75-48.28 54.89-16.76 112.87-16.76 82.01 0 152.94 30.62 70.94 30.62 124.5 84.17 53.55 53.56 84.17 124.5 30.62 70.93 30.62 152.94 0 57.98-16.76 112.52t-48.28 103.1ZM540.3-535.3ZM431.52-426.52Z" />
      ]
    },
    micro: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="m777.09-80.96-75.83-75.58q-49.58 32.95-105.69 50.31-56.12 17.36-115.04 17.36-81.51 0-152.91-30.62-71.4-30.62-124.96-84.17-53.55-53.56-84.17-124.96-30.62-71.4-30.62-152.91 0-58.92 17.36-115.04 17.36-56.11 50.31-105.69l-75.58-76.83 53.39-53.39 697.13 698.13-53.39 53.39ZM480-171.87q43.03 0 83.56-11.76t76.81-34.04l-423.7-423.7q-22.52 36.28-34.16 76.72-11.64 40.43-11.64 83.65 0 128.72 90.21 218.92 90.2 90.21 218.92 90.21Zm327.09-93.41-61.37-60.37q20.08-35.57 31.75-74.81 11.66-39.24 11.66-80.54 0-128.72-90.21-218.92-90.2-90.21-218.92-90.21-40.61 0-80.2 11.16-39.58 11.17-75.15 31.25l-61.37-60.37q48.87-31.52 103.75-48.28 54.89-16.76 112.87-16.76 82.01 0 152.94 30.62 70.94 30.62 124.5 84.17 53.55 53.56 84.17 124.5 30.62 70.93 30.62 152.94 0 57.98-16.76 112.52t-48.28 103.1ZM540.3-535.3ZM431.52-426.52Z" />
      ]
    }
  }
  ,
  'future-icon-filled': {
    solid: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="m610.41-308.57 56.5-56.02-147.32-147.32V-718.8h-79.18v240.13l170 170.1ZM480-87.87q-81.29 0-152.53-30.62-71.25-30.62-124.81-84.17-53.55-53.56-84.17-124.95Q87.87-399 87.87-480.46q0-81.45 30.62-152.88 30.62-71.44 84.17-124.5 53.56-53.05 124.95-83.67 71.39-30.62 152.85-30.62 81.45 0 152.89 30.86 71.44 30.86 124.28 83.75 52.85 52.9 83.67 124.42 30.83 71.51 30.83 153.1 0 81.29-30.62 152.53-30.62 71.25-83.67 124.81-53.06 53.55-124.63 84.17Q561.65-87.87 480-87.87ZM480-480Zm.47 309.13q128.29 0 218.47-90.54 90.19-90.55 90.19-219.07 0-128.52-90.18-218.58-90.19-90.07-218.47-90.07t-218.95 90.07Q170.87-609 170.87-480.48t90.66 219.07q90.66 90.54 218.94 90.54Z" />
      ]
    },
    mini: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="m610.41-308.57 56.5-56.02-147.32-147.32V-718.8h-79.18v240.13l170 170.1ZM480-87.87q-81.29 0-152.53-30.62-71.25-30.62-124.81-84.17-53.55-53.56-84.17-124.95Q87.87-399 87.87-480.46q0-81.45 30.62-152.88 30.62-71.44 84.17-124.5 53.56-53.05 124.95-83.67 71.39-30.62 152.85-30.62 81.45 0 152.89 30.86 71.44 30.86 124.28 83.75 52.85 52.9 83.67 124.42 30.83 71.51 30.83 153.1 0 81.29-30.62 152.53-30.62 71.25-83.67 124.81-53.06 53.55-124.63 84.17Q561.65-87.87 480-87.87ZM480-480Zm.47 309.13q128.29 0 218.47-90.54 90.19-90.55 90.19-219.07 0-128.52-90.18-218.58-90.19-90.07-218.47-90.07t-218.95 90.07Q170.87-609 170.87-480.48t90.66 219.07q90.66 90.54 218.94 90.54Z" />
      ]
    },
    micro: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="m610.41-308.57 56.5-56.02-147.32-147.32V-718.8h-79.18v240.13l170 170.1ZM480-87.87q-81.29 0-152.53-30.62-71.25-30.62-124.81-84.17-53.55-53.56-84.17-124.95Q87.87-399 87.87-480.46q0-81.45 30.62-152.88 30.62-71.44 84.17-124.5 53.56-53.05 124.95-83.67 71.39-30.62 152.85-30.62 81.45 0 152.89 30.86 71.44 30.86 124.28 83.75 52.85 52.9 83.67 124.42 30.83 71.51 30.83 153.1 0 81.29-30.62 152.53-30.62 71.25-83.67 124.81-53.06 53.55-124.63 84.17Q561.65-87.87 480-87.87ZM480-480Zm.47 309.13q128.29 0 218.47-90.54 90.19-90.55 90.19-219.07 0-128.52-90.18-218.58-90.19-90.07-218.47-90.07t-218.95 90.07Q170.87-609 170.87-480.48t90.66 219.07q90.66 90.54 218.94 90.54Z" />
      ]
    }
  }
  ,
  'disabled-filled': {
    solid: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="M341.63-288 480-426.37 618.37-288 672-341.63 533.63-480 672-618.37 618.37-672 480-533.63 341.63-672 288-618.37 426.37-480 288-341.63 341.63-288ZM480-87.87q-80.91 0-152.34-30.62-71.44-30.62-125-84.17-53.55-53.56-84.17-125Q87.87-399.09 87.87-480q0-81.91 30.62-152.84 30.62-70.94 84.17-124.5 53.56-53.55 125-84.17 71.43-30.62 152.34-30.62 81.91 0 152.84 30.62 70.94 30.62 124.5 84.17 53.55 53.56 84.17 124.5 30.62 70.93 30.62 152.84 0 80.91-30.62 152.34-30.62 71.44-84.17 125-53.56 53.55-124.5 84.17Q561.91-87.87 480-87.87Zm0-83q129.04 0 219.09-90.04 90.04-90.05 90.04-219.09 0-129.04-90.04-219.09-90.05-90.04-219.09-90.04-129.04 0-219.09 90.04-90.04 90.05-90.04 219.09 0 129.04 90.04 219.09 90.05 90.04 219.09 90.04ZM480-480Z" />
      ]
    },
    mini: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="M341.63-288 480-426.37 618.37-288 672-341.63 533.63-480 672-618.37 618.37-672 480-533.63 341.63-672 288-618.37 426.37-480 288-341.63 341.63-288ZM480-87.87q-80.91 0-152.34-30.62-71.44-30.62-125-84.17-53.55-53.56-84.17-125Q87.87-399.09 87.87-480q0-81.91 30.62-152.84 30.62-70.94 84.17-124.5 53.56-53.55 125-84.17 71.43-30.62 152.34-30.62 81.91 0 152.84 30.62 70.94 30.62 124.5 84.17 53.55 53.56 84.17 124.5 30.62 70.93 30.62 152.84 0 80.91-30.62 152.34-30.62 71.44-84.17 125-53.56 53.55-124.5 84.17Q561.91-87.87 480-87.87Zm0-83q129.04 0 219.09-90.04 90.04-90.05 90.04-219.09 0-129.04-90.04-219.09-90.05-90.04-219.09-90.04-129.04 0-219.09 90.04-90.04 90.05-90.04 219.09 0 129.04 90.04 219.09 90.05 90.04 219.09 90.04ZM480-480Z" />
      ]
    },
    micro: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="M341.63-288 480-426.37 618.37-288 672-341.63 533.63-480 672-618.37 618.37-672 480-533.63 341.63-672 288-618.37 426.37-480 288-341.63 341.63-288ZM480-87.87q-80.91 0-152.34-30.62-71.44-30.62-125-84.17-53.55-53.56-84.17-125Q87.87-399.09 87.87-480q0-81.91 30.62-152.84 30.62-70.94 84.17-124.5 53.56-53.55 125-84.17 71.43-30.62 152.34-30.62 81.91 0 152.84 30.62 70.94 30.62 124.5 84.17 53.55 53.56 84.17 124.5 30.62 70.93 30.62 152.84 0 80.91-30.62 152.34-30.62 71.44-84.17 125-53.56 53.55-124.5 84.17Q561.91-87.87 480-87.87Zm0-83q129.04 0 219.09-90.04 90.04-90.05 90.04-219.09 0-129.04-90.04-219.09-90.05-90.04-219.09-90.04-129.04 0-219.09 90.04-90.04 90.05-90.04 219.09 0 129.04 90.04 219.09 90.05 90.04 219.09 90.04ZM480-480Z" />
      ]
    }
  }
  ,
  'not-used-icon-filled-alt': {
    solid: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="M480-480Zm-392.13 0q0-85 33.9-158.86 33.9-73.86 91.19-127.81 57.28-53.96 133.18-81.51 75.9-27.56 160.9-22.19 17.16 1.04 26.71 14.84 9.55 13.79 6.55 30.94-3 17.16-17.17 27.33-14.17 10.17-31.33 9.13-64.6-2.61-122.35 20.23-57.75 22.83-102.6 65.36-44.85 42.52-70.42 99.22-25.56 56.71-25.56 123.32 0 129.04 90.04 219.09 90.05 90.04 219.09 90.04 65.85 0 122.93-25.56 57.09-25.57 99.61-69.18 44.29-45.61 66.24-103.98 21.96-58.37 19.35-122.21-1.04-17.16 9.13-31.33 10.17-14.17 27.33-17.17 17.15-3 30.94 6.55 13.8 9.55 14.84 26.71 5.37 85-21.57 160.02-26.93 75.02-81.13 133.3-55.95 61.05-130.81 93.45Q562-87.87 480-87.87q-80.91 0-152.35-30.6-71.43-30.6-125.01-84.17-53.57-53.58-84.17-125.01-30.6-71.44-30.6-152.35ZM720-594.5q-52.39 0-88.95-36.55Q594.5-667.61 594.5-720t36.55-88.95Q667.61-845.5 720-845.5t88.95 36.55Q845.5-772.39 845.5-720t-36.55 88.95Q772.39-594.5 720-594.5Z" />
      ]
    },
    mini: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="M480-480Zm-392.13 0q0-85 33.9-158.86 33.9-73.86 91.19-127.81 57.28-53.96 133.18-81.51 75.9-27.56 160.9-22.19 17.16 1.04 26.71 14.84 9.55 13.79 6.55 30.94-3 17.16-17.17 27.33-14.17 10.17-31.33 9.13-64.6-2.61-122.35 20.23-57.75 22.83-102.6 65.36-44.85 42.52-70.42 99.22-25.56 56.71-25.56 123.32 0 129.04 90.04 219.09 90.05 90.04 219.09 90.04 65.85 0 122.93-25.56 57.09-25.57 99.61-69.18 44.29-45.61 66.24-103.98 21.96-58.37 19.35-122.21-1.04-17.16 9.13-31.33 10.17-14.17 27.33-17.17 17.15-3 30.94 6.55 13.8 9.55 14.84 26.71 5.37 85-21.57 160.02-26.93 75.02-81.13 133.3-55.95 61.05-130.81 93.45Q562-87.87 480-87.87q-80.91 0-152.35-30.6-71.43-30.6-125.01-84.17-53.57-53.58-84.17-125.01-30.6-71.44-30.6-152.35ZM720-594.5q-52.39 0-88.95-36.55Q594.5-667.61 594.5-720t36.55-88.95Q667.61-845.5 720-845.5t88.95 36.55Q845.5-772.39 845.5-720t-36.55 88.95Q772.39-594.5 720-594.5Z" />
      ]
    },
    micro: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="M480-480Zm-392.13 0q0-85 33.9-158.86 33.9-73.86 91.19-127.81 57.28-53.96 133.18-81.51 75.9-27.56 160.9-22.19 17.16 1.04 26.71 14.84 9.55 13.79 6.55 30.94-3 17.16-17.17 27.33-14.17 10.17-31.33 9.13-64.6-2.61-122.35 20.23-57.75 22.83-102.6 65.36-44.85 42.52-70.42 99.22-25.56 56.71-25.56 123.32 0 129.04 90.04 219.09 90.05 90.04 219.09 90.04 65.85 0 122.93-25.56 57.09-25.57 99.61-69.18 44.29-45.61 66.24-103.98 21.96-58.37 19.35-122.21-1.04-17.16 9.13-31.33 10.17-14.17 27.33-17.17 17.15-3 30.94 6.55 13.8 9.55 14.84 26.71 5.37 85-21.57 160.02-26.93 75.02-81.13 133.3-55.95 61.05-130.81 93.45Q562-87.87 480-87.87q-80.91 0-152.35-30.6-71.43-30.6-125.01-84.17-53.57-53.58-84.17-125.01-30.6-71.44-30.6-152.35ZM720-594.5q-52.39 0-88.95-36.55Q594.5-667.61 594.5-720t36.55-88.95Q667.61-845.5 720-845.5t88.95 36.55Q845.5-772.39 845.5-720t-36.55 88.95Q772.39-594.5 720-594.5Z" />
      ]
    }
  }
  ,
  'check-circle': {
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
      ]
    },
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm3.844-8.791a.75.75 0 0 0-1.188-.918l-3.7 4.79-1.649-1.833a.75.75 0 1 0-1.114 1.004l2.25 2.5a.75.75 0 0 0 1.15-.043l4.25-5.5Z" clipRule="evenodd" />
      ]
    }
  }
  ,
  'check-simple': {
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      noFill: true,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
      ]
    },
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path
          key="1"
          fillRule="evenodd"
          d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z"
          clipRule="evenodd"
        />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path
          key="1"
          fillRule="evenodd"
          d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
          clipRule="evenodd"
        />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path
          key="1"
          fillRule="evenodd"
          d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
          clipRule="evenodd"
        />
      ]
    }
  }
  ,
  'arrow-uturn-left': {
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M9.53 2.47a.75.75 0 0 1 0 1.06L4.81 8.25H15a6.75 6.75 0 0 1 0 13.5h-3a.75.75 0 0 1 0-1.5h3a5.25 5.25 0 1 0 0-10.5H4.81l4.72 4.72a.75.75 0 1 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
      ]
    },
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M7.793 2.232a.75.75 0 0 1-.025 1.06L3.622 7.25h10.628a5.25 5.25 0 0 1 0 10.5H10a.75.75 0 0 1 0-1.5h4.25a3.75 3.75 0 0 0 0-7.5H3.622l4.146 3.957a.75.75 0 0 1-1.036 1.085l-5.5-5.25a.75.75 0 0 1 0-1.085l5.5-5.25a.75.75 0 0 1 1.06.025Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M7.78 3.47a.75.75 0 0 1 0 1.06L5.56 6.75h5.69a4.75 4.75 0 0 1 0 9.5h-1.5a.75.75 0 0 1 0-1.5h1.5a3.25 3.25 0 0 0 0-6.5H5.56l2.22 2.22a.75.75 0 1 1-1.06 1.06l-3.5-3.5a.75.75 0 0 1 0-1.06l3.5-3.5a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
      ]
    }
  }
  ,
  'x-mark': {
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      ]
    },
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
      ]
    }
  }
  ,
  'visibility-on': {
    micro: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="M480-312q70 0 119-49t49-119q0-70-49-119t-119-49q-70 0-119 49t-49 119q0 70 49 119t119 49Zm0-72q-40 0-68-28t-28-68q0-40 28-68t68-28q40 0 68 28t28 68q0 40-28 68t-68 28Zm0 192q-142.6 0-259.8-78.5Q103-349 48-480q55-131 172.2-209.5Q337.4-768 480-768q142.6 0 259.8 78.5Q857-611 912-480q-55 131-172.2 209.5Q622.6-192 480-192Zm0-288Zm0 216q112 0 207-58t146-158q-51-100-146-158t-207-58q-112 0-207 58T127-480q51 100 146 158t207 58Z" />
      ]
    }
  }
  ,
  'visibility-off': {
    micro: {
      viewBox: '0 -960 960 960',
      paths: [
        <path key="1" d="m637-425-62-62q4-38-23-65.5T487-576l-62-62q13-5 27-7.5t28-2.5q70 0 119 49t49 119q0 14-2.5 28t-8.5 27Zm133 133-52-52q36-28 65.5-61.5T833-480q-49-101-144.5-158.5T480-696q-26 0-51 3t-49 10l-58-58q38-15 77.5-21t80.5-6q143 0 261.5 77.5T912-480q-22 57-58.5 103.5T770-292Zm-2 202L638-220q-38 14-77.5 21t-80.5 7q-143 0-261.5-77.5T48-480q22-57 58-104t84-85L90-769l51-51 678 679-51 51ZM241-617q-35 28-65 61.5T127-480q49 101 144.5 158.5T480-264q26 0 51-3.5t50-9.5l-45-45q-14 5-28 7.5t-28 2.5q-70 0-119-49t-49-119q0-14 3.5-28t6.5-28l-81-81Zm287 89Zm-96 96Z" />
      ]
    }
  }
  ,
  'conversation-bubbles': {
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      noFill: true,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      ]
    },
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />,
        <path key="2" d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" d="M3.505 2.365A41.369 41.369 0 0 1 9 2c1.863 0 3.697.124 5.495.365 1.247.167 2.18 1.108 2.435 2.268a4.45 4.45 0 0 0-.577-.069 43.141 43.141 0 0 0-4.706 0C9.229 4.696 7.5 6.727 7.5 8.998v2.24c0 1.413.67 2.735 1.76 3.562l-2.98 2.98A.75.75 0 0 1 5 17.25v-3.443c-.501-.048-1-.106-1.495-.172C2.033 13.438 1 12.162 1 10.72V5.28c0-1.441 1.033-2.717 2.505-2.914Z" />,
        <path key="2" d="M14 6c-.762 0-1.52.02-2.271.062C10.157 6.148 9 7.472 9 8.998v2.24c0 1.519 1.147 2.839 2.71 2.935.214.013.428.024.642.034.2.009.385.09.518.224l2.35 2.35a.75.75 0 0 0 1.28-.531v-2.07c1.453-.195 2.5-1.463 2.5-2.915V8.998c0-1.526-1.157-2.85-2.729-2.936A41.645 41.645 0 0 0 14 6Z" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" d="M1 8.849c0 1 .738 1.851 1.734 1.947L3 10.82v2.429a.75.75 0 0 0 1.28.53l1.82-1.82A3.484 3.484 0 0 1 5.5 10V9A3.5 3.5 0 0 1 9 5.5h4V4.151c0-1-.739-1.851-1.734-1.947a44.539 44.539 0 0 0-8.532 0C1.738 2.3 1 3.151 1 4.151V8.85Z" />,
        <path key="2" d="M7 9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-.25v1.25a.75.75 0 0 1-1.28.53L9.69 12H9a2 2 0 0 1-2-2V9Z" />
      ]
    }
  },
  'expand-arrows': {
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      noFill: true,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
      ]
    },
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M15 3.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V5.56l-3.97 3.97a.75.75 0 1 1-1.06-1.06l3.97-3.97h-2.69a.75.75 0 0 1-.75-.75Zm-12 0A.75.75 0 0 1 3.75 3h4.5a.75.75 0 0 1 0 1.5H5.56l3.97 3.97a.75.75 0 0 1-1.06 1.06L4.5 5.56v2.69a.75.75 0 0 1-1.5 0v-4.5Zm11.47 11.78a.75.75 0 1 1 1.06-1.06l3.97 3.97v-2.69a.75.75 0 0 1 1.5 0v4.5a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1 0-1.5h2.69l-3.97-3.97Zm-4.94-1.06a.75.75 0 0 1 0 1.06L5.56 19.5h2.69a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 1.5 0v2.69l3.97-3.97a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" d="m13.28 7.78 3.22-3.22v2.69a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.69l-3.22 3.22a.75.75 0 0 0 1.06 1.06ZM2 17.25v-4.5a.75.75 0 0 1 1.5 0v2.69l3.22-3.22a.75.75 0 0 1 1.06 1.06L4.56 16.5h2.69a.75.75 0 0 1 0 1.5h-4.5a.747.747 0 0 1-.75-.75ZM12.22 13.28l3.22 3.22h-2.69a.75.75 0 0 0 0 1.5h4.5a.747.747 0 0 0 .75-.75v-4.5a.75.75 0 0 0-1.5 0v2.69l-3.22-3.22a.75.75 0 1 0-1.06 1.06ZM3.5 4.56l3.22 3.22a.75.75 0 0 0 1.06-1.06L4.56 3.5h2.69a.75.75 0 0 0 0-1.5h-4.5a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 1.5 0V4.56Z" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M2.75 9a.75.75 0 0 1 .75.75v1.69l2.22-2.22a.75.75 0 0 1 1.06 1.06L4.56 12.5h1.69a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75v-3.5A.75.75 0 0 1 2.75 9ZM2.75 7a.75.75 0 0 0 .75-.75V4.56l2.22 2.22a.75.75 0 0 0 1.06-1.06L4.56 3.5h1.69a.75.75 0 0 0 0-1.5h-3.5a.75.75 0 0 0-.75.75v3.5c0 .414.336.75.75.75ZM13.25 9a.75.75 0 0 0-.75.75v1.69l-2.22-2.22a.75.75 0 1 0-1.06 1.06l2.22 2.22H9.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-.75-.75ZM13.25 7a.75.75 0 0 1-.75-.75V4.56l-2.22 2.22a.75.75 0 1 1-1.06-1.06l2.22-2.22H9.75a.75.75 0 0 1 0-1.5h3.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75Z" clipRule="evenodd" />
      ]
    }
  },
  'report-icon': {
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      noFill: true,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      ]
    },
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875ZM9.75 17.25a.75.75 0 0 0-1.5 0V18a.75.75 0 0 0 1.5 0v-.75Zm2.25-3a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75Zm3.75-1.5a.75.75 0 0 0-1.5 0V18a.75.75 0 0 0 1.5 0v-5.25Z" clipRule="evenodd" />,
        <path key="2" d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13ZM13.25 9a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75Zm-6.5 4a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-1.5 0v-.5a.75.75 0 0 1 .75-.75Zm4-1.25a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0 1.5 0v-2.5Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M4 2a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5V6.621a1.5 1.5 0 0 0-.44-1.06L9.94 2.439A1.5 1.5 0 0 0 8.878 2H4Zm6 5.75a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5Zm-2.75 1.5a.75.75 0 0 1 1.5 0v2a.75.75 0 0 1-1.5 0v-2Zm-2 .75a.75.75 0 0 0-.75.75v.5a.75.75 0 0 0 1.5 0v-.5a.75.75 0 0 0-.75-.75Z" clipRule="evenodd" />
      ]
    }
  },
  'question-mark-circle': {
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
      ]
    },
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      noFill: true,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8.94 6.94a.75.75 0 1 1-1.061-1.061 3 3 0 1 1 2.871 5.026v.345a.75.75 0 0 1-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 1 0 8.94 6.94ZM10 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 0 0-2 0v.01a1 1 0 0 0 2 0V5Zm-1 6a1 1 0 0 1-1-1V7a1 1 0 0 1 2 0v3a1 1 0 0 1-1 1Z" clipRule="evenodd" />
      ]
    }
  },
  'bars-3': {
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
      ]
    },
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      noFill: true,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M2 3.75A.75.75 0 0 1 2.75 3h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 3.75ZM2 8a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 8Zm0 4.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
      ]
    }
  }
  ,
  'chat-bubble-oval-left-ellipsis': {
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      noFill: true,
      paths: [
        <path
          key="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
        />
      ]
    },
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path
          key="1"
          fillRule="evenodd"
          d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z"
          clipRule="evenodd"
        />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path
          key="1"
          fillRule="evenodd"
          d="M10 3c-4.31 0-8 3.033-8 7 0 2.024.978 3.825 2.499 5.085a3.478 3.478 0 0 1-.522 1.756.75.75 0 0 0 .584 1.143 5.976 5.976 0 0 0 3.936-1.108c.487.082.99.124 1.503.124 4.31 0 8-3.033 8-7s-3.69-7-8-7Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-2-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm5 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
          clipRule="evenodd"
        />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path
          key="1"
          fillRule="evenodd"
          d="M8 2C4.262 2 1 4.57 1 8c0 1.86.98 3.486 2.455 4.566a3.472 3.472 0 0 1-.469 1.26.75.75 0 0 0 .713 1.14 6.961 6.961 0 0 0 3.06-1.06c.403.062.818.094 1.241.094 3.738 0 7-2.57 7-6s-3.262-6-7-6ZM5 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM8 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
          clipRule="evenodd"
        />
      ]
    }
  }
  ,
  'presentation-chart-bar': {
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      noFill: true,
      paths: [
        <path
          key="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
        />
      ]
    },
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path
          key="1"
          fillRule="evenodd"
          d="M2.25 2.25a.75.75 0 0 0 0 1.5H3v10.5a3 3 0 0 0 3 3h1.21l-1.172 3.513a.75.75 0 0 0 1.424.474l.329-.987h8.418l.33.987a.75.75 0 0 0 1.422-.474l-1.17-3.513H18a3 3 0 0 0 3-3V3.75h.75a.75.75 0 0 0 0-1.5H2.25Zm6.54 15h6.42l.5 1.5H8.29l.5-1.5Zm8.085-8.995a.75.75 0 1 0-.75-1.299 12.81 12.81 0 0 0-3.558 3.05L11.03 8.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l2.47-2.47 1.617 1.618a.75.75 0 0 0 1.146-.102 11.312 11.312 0 0 1 3.612-3.321Z"
          clipRule="evenodd"
        />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path
          key="1"
          fillRule="evenodd"
          d="M1 2.75A.75.75 0 0 1 1.75 2h16.5a.75.75 0 0 1 0 1.5H18v8.75A2.75 2.75 0 0 1 15.25 15h-1.072l.798 3.06a.75.75 0 0 1-1.452.38L13.41 18H6.59l-.114.44a.75.75 0 0 1-1.452-.38L5.823 15H4.75A2.75 2.75 0 0 1 2 12.25V3.5h-.25A.75.75 0 0 1 1 2.75ZM7.373 15l-.391 1.5h6.037l-.392-1.5H7.373ZM13.25 5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0v-5.5a.75.75 0 0 1 .75-.75Zm-6.5 4a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 6.75 9Zm4-1.25a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5Z"
          clipRule="evenodd"
        />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path
          key="1"
          fillRule="evenodd"
          d="M1.75 2a.75.75 0 0 0 0 1.5H2V9a2 2 0 0 0 2 2h.043l-1.004 3.013a.75.75 0 0 0 1.423.474L4.624 14h6.752l.163.487a.75.75 0 1 0 1.422-.474L11.957 11H12a2 2 0 0 0 2-2V3.5h.25a.75.75 0 0 0 0-1.5H1.75Zm8.626 9 .5 1.5H5.124l.5-1.5h4.752ZM5.25 7a.75.75 0 0 0-.75.75v.5a.75.75 0 0 0 1.5 0v-.5A.75.75 0 0 0 5.25 7ZM10 4.75a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5ZM8 5.5a.75.75 0 0 0-.75.75v2a.75.75 0 0 0 1.5 0v-2A.75.75 0 0 0 8 5.5Z"
          clipRule="evenodd"
        />
      ]
    }
  }

  ,
  'wallet': {
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      noFill: true,
      paths: [
        <path
          key="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"
        />
      ]
    },
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path
          key="1"
          d="M2.273 5.625A4.483 4.483 0 0 1 5.25 4.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 3H5.25a3 3 0 0 0-2.977 2.625ZM2.273 8.625A4.483 4.483 0 0 1 5.25 7.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 6H5.25a3 3 0 0 0-2.977 2.625ZM5.25 9a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3H15a.75.75 0 0 0-.75.75 2.25 2.25 0 0 1-4.5 0A.75.75 0 0 0 9 9H5.25Z"
        />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path
          key="1"
          d="M1 4.25a3.733 3.733 0 0 1 2.25-.75h13.5c.844 0 1.623.279 2.25.75A2.25 2.25 0 0 0 16.75 2H3.25A2.25 2.25 0 0 0 1 4.25ZM1 7.25a3.733 3.733 0 0 1 2.25-.75h13.5c.844 0 1.623.279 2.25.75A2.25 2.25 0 0 0 16.75 5H3.25A2.25 2.25 0 0 0 1 7.25ZM7 8a1 1 0 0 1 1 1 2 2 0 1 0 4 0 1 1 0 0 1 1-1h3.75A2.25 2.25 0 0 1 19 10.25v5.5A2.25 2.25 0 0 1 16.75 18H3.25A2.25 2.25 0 0 1 1 15.75v-5.5A2.25 2.25 0 0 1 3.25 8H7Z"
        />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path
          key="1"
          d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v.401a2.986 2.986 0 0 0-1.5-.401h-9c-.546 0-1.059.146-1.5.401V3.5ZM3.5 5A1.5 1.5 0 0 0 2 6.5v.401A2.986 2.986 0 0 1 3.5 6.5h9c.546 0 1.059.146 1.5.401V6.5A1.5 1.5 0 0 0 12.5 5h-9ZM8 10a2 2 0 0 0 1.938-1.505c.068-.268.286-.495.562-.495h2A1.5 1.5 0 0 1 14 9.5v3a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-3A1.5 1.5 0 0 1 3.5 8h2c.276 0 .494.227.562.495A2 2 0 0 0 8 10Z"
        />
      ]
    }
  }
  ,
  'document-text': {
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path key="1" fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clipRule="evenodd" />,
        <path key="2" d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
      ]
    },
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      paths: [
        <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" fillRule="evenodd" d="M4 2a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5V6.621a1.5 1.5 0 0 0-.44-1.06L9.94 2.439A1.5 1.5 0 0 0 8.878 2H4Zm1 5.75a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5H5Zm0 3a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5H5Z" clipRule="evenodd" />
      ]
    }
  },
  'chart-bar': {
    outline: {
      viewBox: VIEWBOX.DEFAULT,
      strokeWidth: 1.5,
      noFill: true,
      paths: [
        <path
          key="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
        />
      ]
    },
    solid: {
      viewBox: VIEWBOX.DEFAULT,
      paths: [
        <path
          key="1"
          d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z"
        />
      ]
    },
    mini: {
      viewBox: VIEWBOX.MINI,
      paths: [
        <path key="1" d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 16.5 2h-1ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 9.5 18h1a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 10.5 6h-1ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 3.5 18h1A1.5 1.5 0 0 0 6 16.5v-5A1.5 1.5 0 0 0 4.5 10h-1Z" />
      ]
    },
    micro: {
      viewBox: VIEWBOX.MICRO,
      paths: [
        <path key="1" d="M12 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-1ZM6.5 6a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V6ZM2 9a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9Z" />
      ]
    }
  },
  'lotus': {
    solid: {
      viewBox: '0 0 512 512',
      paths: [
        <path key="1" d="M429.435,244.898c-21.155,50.07-46.688,81.923-86.492,105.662c57.474-52.359,89.336-158.471,66.959-224.034 c-27.059,0.72-50.312,8.878-74.05,30.25c21.978,51.422,21.076,123.375,0.087,173.592c-3.676,8.8-17.636,23.955-32.088,41.165 c37.983-45.249,48.171-183.32-12.146-253.27C281.638,105.302,269.786,94.36,256,86.574c-13.786,7.786-25.637,18.728-35.703,31.689 c-60.318,69.95-50.13,208.02-12.147,253.27c-14.453-17.21-28.412-32.365-32.087-41.165c-20.991-50.217-21.893-122.17,0.086-173.592 c-23.738-21.372-46.991-29.53-74.05-30.25c-22.378,65.563,9.485,171.675,66.959,224.034 c-39.804-23.739-65.338-55.592-86.493-105.662C56.225,221.229,17.756,218.264,0,224.185c25.152,162.762,183.484,201.24,256,201.24 c72.516,0,230.848-38.478,256-201.24C494.244,218.264,455.775,221.229,429.435,244.898z" />
      ]
    }
  },
  'cherry-blossom': {
    solid: {
      viewBox: '0 0 512 512',
      paths: [
        <path key="1" d="M511.976,213.063l-45.863-9.749l31.374-34.845c-25.373-36.736-80.219-53.454-137.114-40.543 c-5.302-58.1-38.15-105.096-80.929-117.874L256,50.659l-23.444-40.606c-42.779,12.779-75.626,59.775-80.929,117.874 c-56.894-12.911-111.741,3.807-137.113,40.543l31.374,34.844l-45.864,9.749c-1.066,44.634,33.479,90.396,87.097,113.393 c-29.86,50.12-30.91,107.448-3.812,142.931l42.834-19.071l-4.901,46.632c42.12,14.806,96.318-3.907,134.758-47.794 c38.44,43.887,92.638,62.6,134.758,47.794l-4.901-46.632l42.835,19.072c27.097-35.483,26.048-92.811-3.812-142.932 C478.497,303.46,513.042,257.697,511.976,213.063z M315.377,296.385c3.526-2.358,7.678-3.63,11.998-3.63 c3.762,0,7.479,0.998,10.752,2.889c4.986,2.876,8.552,7.525,10.043,13.085c1.49,5.56,0.725,11.369-2.156,16.353 c-3.838,6.65-10.996,10.781-18.68,10.781c-3.765,0-7.484-1-10.758-2.89c-7.126-4.116-11.228-12.025-10.724-20.072l-40.32-23.278 v46.552c7.222,3.587,12.021,11.096,12.021,19.327c0,11.884-9.669,21.551-21.553,21.551c-11.884,0-21.553-9.667-21.553-21.551 c0-8.231,4.799-15.74,12.021-19.327v-46.552l-40.319,23.278c0.504,8.047-3.598,15.956-10.724,20.072 c-3.275,1.889-6.994,2.89-10.758,2.89c-7.684,0-14.842-4.132-18.682-10.781c-2.878-4.984-3.644-10.792-2.154-16.353 c1.49-5.56,5.057-10.209,10.043-13.087c3.272-1.889,6.989-2.887,10.752-2.887c4.321,0,8.473,1.272,11.996,3.63l40.312-23.274 l-40.312-23.272c-3.523,2.359-7.675,3.63-11.996,3.63c-3.762,0-7.479-0.998-10.752-2.89c-4.986-2.876-8.552-7.525-10.043-13.085 c-1.49-5.56-0.724-11.369,2.156-16.353c3.838-6.65,10.995-10.781,18.68-10.781c3.764,0,7.484,1,10.758,2.89 c7.126,4.116,11.228,12.025,10.724,20.072l40.319,23.278v-46.552c-7.222-3.587-12.021-11.096-12.021-19.327 c0-11.884,9.669-21.551,21.553-21.551c11.884,0,21.553,9.667,21.553,21.551c0,8.231-4.799,15.74-12.021,19.327v46.552l40.32-23.278 c-0.504-8.047,3.598-15.956,10.724-20.072c3.275-1.889,6.994-2.89,10.758-2.89c7.684,0,14.842,4.132,18.682,10.781 c2.878,4.984,3.644,10.792,2.154,16.353c-1.49,5.56-5.057,10.209-10.043,13.088c-3.272,1.889-6.989,2.887-10.752,2.887 c-4.32,0-8.472-1.272-11.998-3.63l-40.31,23.272L315.377,296.385z" />
      ]
    }
  },
  'assistant': {
    solid: {
      viewBox: '0 0 256 256',
      paths: [
        <path key="1" d="m249.2 192.7c-0.32-2.43-1.81-3.6-3.15-4.7-2.21-1.84-3.55-4.06-5.16-6.88-5.03-8.66-16.69-19.91-26.77-21.92l-2.21-0.32c3.88-4.32 7.92-10.12 9.69-14.98 4.53-11.49 7.27-22.82 9.32-38.55 1.19-7.72 3.24-14.83 6.22-19.31 2.05-3.23 2.86-6.22 0.48-8.91-0.48-1.1-1.13-2.05-1.76-2.99 0-0.48-0.16-1.27-0.8-1.91-0.63-0.64-0.79-1.59-1.59-2.54-1.73-1.59-5.76-2.54-7.34-1.91-3.71 1.59-7.9 0.64-14.86 0.32-10.08 0.64-18.38 0.8-27.5 5.28-3.63 1.23-6.61 4.22-10.44 6.44-3.14-11.72-10.8-21.49-21.2-29.7-3.77-2.84-5.18-5.05-6.46-6.98 1.89 1.77 3.94 3.51 5.99 5.1 7.28 5.26 12.47 12.52 16.82 20.98-2.21-5.1-6.74-11.21-13.86-17.34-5.01-4-7.55-7.48-8.51-9.54-2.33-2.83-5.02-5.21-7.23-7.89-0.32-2.43-1.43-3.22-2.71-4.01-2.29-2.22-4.34-4.43-8.37-4.45h-1.41c-0.8-0.34-1.6-0.34-2.4 0h-0.32c-2.85 0.64-4.44 2.86-6.33 5.24-9.92 12.54-27.12 24.94-34.08 46.37l-0.48 2.06-0.32 2.23c-4.69-1.12-5.49-4.45-11.65-6.34-9.59-2.84-16.95-3.8-28.45-3.48-3.73 0.16-7.2 0.32-10.34-0.95-3.73-1.43-6.87 0.32-9.16 3.65-0.8 0.47-1.28 1.26-1.44 2.36-0.48 0.47-0.8 1.11-0.96 1.9-1.44 2.22-3.17 5.85-1.59 8.58 5.02 8.66 6.75 16.22 8.04 27.94 2.05 13.37 6.58 32.58 15.01 42.66l2.21 2.53-5.34 1.59c-10.77 3.99-20.66 15.37-26.66 24.67-2.05 2.9-5.93 5.28-6.12 9.12 0 0.63 0.16 1.27 0.32 1.75-0.64 0.79-0.64 1.74 0.31 2.69 1.12 1.11 1.8 2.34 2.27 3.77 1.73 3.99 5.02 5.42 11.67 5.58 6.96 1.11 12.16 4 16.85 6.58 10.93 5.64 25.55 12.59 41.3 13.22h4.53c17.52-1.94 31.19-9.99 40.45-24.94 1.4-2.43 2.36-5.32 2.36-7.86-1.29 1.91-2.36 4.04-3.89 5.12 1.13-3.37 2.76-6.79 3.57-10.31-0.48-0.32-0.64-0.64-0.32-1.44 0.64-1.59 1.28-3.36 1.75-5.11 0.16 1.23 0.48 2.51 0.96 3.68l1.92 4.77-0.96-1.43c4.03 12.54 13.47 23.98 27.29 29.82 8.25 3.63 14.75 5.39 24.06 4.6 14.98-1.11 27.28-7.81 42.27-14.75 5.51-2.73 9.7-4.32 15.7-4.48 2.98-0.32 7.31-2.48 8.71-7.29 0.8-0.95 1.59-1.74 2.23-2.69 0.8-0.96 0.16-2.71-0.16-4.7zm-40.14-77.47c-2.98 16.06-5.47 27.7-17.92 38.89-4.19 1.11-10.03 0.95-13.42 2.7 4.03 0.79 8.22-0.16 11.2 0.32-7.29 7.26-16.25 10.93-30.54 13.76l10.08-0.79 0.32 0.32c-5.85 1.79-11.69 3.68-17.69 2.39l6 2.28-13.77 1.43c1.89 1.59 5.51 0.64 6.92 0.8 0.96 0.95 2.24 0.95 3.36 0.95 5.5 0.63 11.01 1.27 16.67-0.16l-6 1.59c9.44-0.32 19.18-1.43 26.47-5.42 5.5-3.09 10.53-6.57 14.88-9.29l0.32 0.32c11.82 5.58 17.94 12.84 23.6 23.53-11.82 4.17-15.34 6.06-26.11 12.19-10.4 5.26-22.08 9.74-33.4 8.31-6.31-0.95-14.29-3.17-19.79-7.48-6.46-4.48-11.16-7.96-15.85-14.09l-0.95-0.16c-2.4-2.43-4.3-4.47-5.7-7.95-0.63 1.23-0.31 2.98 0.32 4.57-1.22 2.72-3.91 7.52-7.04 10.47-5.34 5.72-13.94 12.51-19.13 14.26-7.12 2.22-12.31 3.33-18.63 3.33-11.98 0-22.04-5.88-34.82-12.02-7.52-4.16-13.18-6.38-23.26-9.11 6.46-12.06 12.77-18.19 24.59-23.29l0.32-0.32c6.96 6.74 16.4 13.84 26.64 16.27 8.43 1.89 16.84 2.21 21.86 1.25l3.73-1.23-4.03-0.48-3.57-0.95 7.48 0.48-1.58-1.23c6.46-1.94 15.38-2.42 16.66-5.85-4.03 0.47-9.05 0.47-12.67-0.48-11.32-1.59-24.41-5.23-32.23-12.33l-4.03-2.53 9.44 0.47c-3.47-2.57-7.66-2.09-12.35-3.68-12.46-8.51-15.31-21.56-17.8-40.93-0.48-9.61-1.44-20.58-4.13-29.86 5.34-0.48 10.53-1.12 15.22-0.96 7.44 0.8 13.44 2.9 21.2 5.33l0.32 0.16 0.32-0.16-0.32 0.32c-1.59 11.71 1.89 24.58 11.19 34.51 0.8 0.95 1.97 1.59 2.77 1.43 1.12-0.32 1.28-1.42 0.96-3.17 0.8 0 0.96-0.8 0.48-2.86-2.69-8.82-2.37-16.38-0.48-22.97 3.47 3.09 6.45 8.83 10.02 10.1-2.49-6.12-6.37-12.01-9.5-16.49 3.13-14.12 10.42-20.6 20.34-30.83 4.03-4.8 8.22-9.12 12.25-13.11 4.03 5.9 9.22 11.04 14.41 16l0.36 0.16 0.15 0.32c8.93 6.7 13.95 13.66 17.08 25.14-3.73 4.8-7.06 10.34-8.95 15.74 3.89-1.94 6.53-7.47 10.72-10.42 3.47 9.93 2.51 19.38-1.52 31.28-0.64 2.11-1.11 4-1.27 6.11l4.69-8.41-2.21 9.45c1.4 1.59 3.45-1.74 5.34-5.57l1.12 0.63c1.07-3.53 3.12-5.63 4.7-8.06 4.7-11.18 6.28-18.14 3.03-29.99l-0.32-1.94c9.44-3.99 18.36-6.81 27.66-6.18 4.35 0.16 7.48 0.64 10.61 1.11-2.98 9.93-4.04 20.62-4.82 32.08z" />,
        <path key="2" d="m149.3 136.9c-0.64-6.13-4.12-12.25-8.15-16.73l-1.58-0.95c-2.3-1.27-4.63-2.38-7.12-2.86-0.8-0.16-1.6-0.16-2.4-0.32-1.12-0.32-2.24-0.32-3.36 0.16-0.8-0.16-1.6-0.16-2.4 0.32-3.33 1.59-8.18 1.59-11.25 4.92-3.33 3.48-6.03 7.64-6.66 12.28v0.64l-0.64 1.42 0.48 0.64-0.8 2.38 0.64 0.64 0.32 3.99 0.79 0.79c1.12 3.33 3.01 6.16 5.31 8.99l0.96 1.11c3.87 3.05 8.16 5.8 15.12 5.48 2.33-0.16 4.63-0.96 6.82-1.99l0.64 0.16 0.64-0.95c3.29-1.75 6.35-4.43 8.8-8.26l1.28-3.63 0.64-0.48c1.28-2.57 1.76-5.35 1.92-7.75z" />
      ]
    }
  },
  'assistant-2': {
    solid: {
      viewBox: '0 0 200 200',
      paths: [
        <path key="1" d="m195.5 78.18c-0.55-0.47 0.03-1.89-1.18-2.37-2.22-0.92-3.12-6.22-10.81-9.53-4.9-1.81-7.2-3.1-9.29-4.32-3.4-1.69-6.2-3.4-14.74-3.11-3.62 0.43-7.17 1.3-10.53 2.64l2.07-0.22 1.65-0.18c-4.51 2.06-13.11 4.93-20.02 9.7-9.12 6.32-12.52 11.65-12.7 19.1-0.05 1.57 1.28 1.37 1.93 0.03 0.44-0.91 1.28-0.41 1.28 0 0 0.77 0.66 0.53 2.74-1.77 3.83-4.14 6.75-6.28 12.93-9.17 7.3-3.42 12.54-4.65 18.33-5.07 4.07-0.3 5.54 1.04 8.85 3.15 2.31 1.55 4.74 2.95 7.26 4.17-3.22 7.45-5.34 14.42-11.75 17.38-3.53 1.05-7.36 2.62-10.73 3.85-5.79 1.57-13.79 2.68-23.43 2.47 0.44 1.13 1.8 2.08 4.86 2.96l-1.17 1 3.91 1.62-3.21 0.6 2.4 1.95 3.9 1.75-2.86-0.36c1.46 1.71 4.57 4.81 11.67 4.86 8.14 0 13.59-2.5 21.09-5 6.38-2.38 11.01-4.35 16.8-13.37 4.26-6.16 6.48-11.77 10.01-18.23 1.01-2.05 1.1-3.05 0.74-4.53z" />,
        <path key="2" d="m165.7 153.3c-1.79-6.08-5.64-10.59-7.05-12.58l0.43 1.37 1.8 2.93-0.74-0.22c-3.22-5.03-14.08-17.55-25.2-22.41-3.53-1.89-5.85-1.89-10.16-1.71-2.53 0.12-3.19 0.79-2.18 2.36l1.8 1.83-2.32 0.05c-0.92 0.52-0.18 1.95 3.35 3 8.6 3.59 12.3 8.89 15.83 13.13 6.04 7.63 8.43 12.25 8.17 17.01-1.34 5.91-2.04 8.92-2.41 12.71-9.29-0.36-15.89-1.36-19.79-5.9-3.05-4.04-5.15-6.99-8.84-11.13-3.53-5.82-6.15-12.11-7.75-20.13l-1.74 5.29-1.06-0.52-0.74 3.59-1.06-2.25-1.26 5.68-1.17-1.57-0.92 4.94-0.44-3.84c-1.27 2.14-1.44 5.99-0.91 8.81 1.17 6.15 4.44 11.26 9.57 18 5.45 7.29 9.19 12.1 19.68 14.93 7.3 1.95 14.6 2.73 23.1 3.91 1.54 0.19 2.46-0.51 3.79-1.18 0.44-0.18 0.27-1.33 1.1-1.7 1.8-0.95 5.33-7.13 6.16-11.72 1.24-8.81 2.94-14.71 0.96-22.68z" />,
        <path key="3" d="m117.1 103.2c-0.36-2.11-0.73-3-1.31-4.32-1.59-2.8-3.9-5.14-6.73-6.7-2.07-1.34-3.91-2.23-6.97-2.8-1.01-0.36-2.17-0.18-3.18 0.34-2.72 0.06-5.35 0.88-7.57 2.46-1.93 0.47-3.63 1.7-4.74 3.51-1.41 1.57-2.51 3.44-3.21 5.51-0.7 2.06-1.13 4.12-1.31 6.42 0.09 1.46 0.52 2.86 1.22 4.08-0.09 1.05 0.27 2.03 1.01 2.69 0.7 2.3 2.11 3.93 4.42 6.04 2.08 2.5 4.06 3.2 7.01 4.45 1.98 0.89 4.05 0.95 6.03 0.2l0.74 0.25 1.16-0.66 0.7 0.36 1.33-1.05 1.26 0.24 1.98-1.82 0.65 0.18 0.44-1.45 0.92-0.12c1.16-1.96 2.81-4.23 4.27-6.34 1.7-3.59 2.14-6.87 1.7-11.29l0.18-0.18zm-34.01 4.6-0.36-0.66 0.53-2.36 0.36 1.34-0.53 1.68zm1.01-5.68-0.36 0.24 0.92-2.3 0.18 0.24-0.74 1.82zm8.6-9.94-0.65-0.47 2.44-0.67 0.36 0.47-2.15 0.67zm17.1 1 0.36-0.12 1.16 1.05-0.43 0.18-1.09-1.11zm6.39 7.91-0.36-1.03 0.54 0.41-0.18 0.62zm-0.36 14.28-0.27-0.36 0.54-0.78 0.27 0.25-0.54 0.89z" />,
        <path key="4" d="m94.16 135.1c-0.92-1.18-1.1-0.66-2.02 1.61l-1.45-1.81-0.74 0.95c-1.17 5.33-0.99 9.91-6.02 18.55-4.26 6.73-8.25 12.78-12.42 15.23-3.53 1.89-8.34 1.53-12.5 2.2l-4.81 0.18c-1.79-8.3-3.25-16.6 0.28-21.3 2.63-2.95 4.09-6.49 6.8-9.59 5.88-6.46 10.91-9.99 17.84-14.26l-0.36-0.95-5.27 0.95 0.74-1.57-2.31 0.36 0.74-2.1-4.59 0.46 1.79-1.58-2.72 0.18-2.39 0.71 1.97-1.86c-3.05 0.36-6.67 0.6-10.51 3.25-5.96 3.53-17.17 18.51-19.8 24.69-1.88 4.52-1.97 6.22-1.61 14.52 0.36 5.89 2.15 13.04 2.71 17.4 0.65 5.18 2.3 5.89 4.61 7.34l0.92-0.12c4.44 1.45 7.75 2.27 12.19 1.81 4.73-0.54 7.69-1.69 12.4-2.15 8.05-1.46 12.04-4.88 18.09-12.09l1.7-2.61-2.07 2.22-0.74-0.36c7.1-10.32 12.46-21.58 12.1-31.42-0.18-3.53-0.83-6.23-2.55-8.84z" />,
        <path key="5" d="m127.8 54.09c-0.27-9.19 0.65-17.07-4.62-24.38-4.63-6.62-12.13-13-17.07-18.51-1.74-2.06-3.96-2.52-5.42-2.4l-0.44-0.24-1.46 0.67-0.53-0.18c-3.13 1.81-7.03 1.81-10.94 5.66-5.54 6.08-9.61 9.03-12.15 14.11-2.62 4.99-2.8 10.1-3.16 16.89l0.65 0.19 0.54-3.67 0.53-0.18c-0.74 11.07 0.58 22.06 5.62 32.37 2.3 4.69 5.35 6.75 9.52 8.47 1.16 0.36 1.69-0.59 1.16-2.29l0.18-1.24 1.16 1.57c1.01-0.78-0.32-3.28-2.95-8.49-4.17-8.64-3.99-22.07-1.46-30.51 1.17-3.67 5.33-5.92 11.83-12.55 4.44 5.45 10.23 7.56 11.93 15.86 0.43 1.71-0.27 5.37 0.09 12.17-0.09 5.44-2.81 17.13-5.76 23.19l0.36 0.57 4.35-4.36-0.09 1.68 1.55-1.95 0.74 1.11 5.7-4.64-0.44 2.95c6.93-4.67 9.55-9.09 10.58-21.87z" />,
        <path key="6" d="m73.87 73.53c-4.81-5.34-11.1-7.4-20.3-10.68-7.41-2.58-10.79-3.69-16.75-3.45-6.38 0.67-9.91 3.01-15.7 5.43-4.44 1.95-7.56 4.19-13.2 6.69-2.95 1.63-3.87 3.9-3.92 5.79l0.65 0.24c-0.53 4.66-0.09 9.61 2.12 13.97s3.32 5.59 5.2 9.6c4.08 7.82 11.09 10.61 19.64 14.1l0.92-0.18-3.75-2.33c9.55 3.07 19.46 4.95 28.66 4.48 5.54-0.67 9.8-1.03 12.85-4.13l2.12-2.16c0.83-1.06 0.18-2.17-1.37-1.7l-1.01-0.47 0.54-2.11c-3.37 0.52-5.44 1.41-13.4 0.94-8.93-0.82-18.13-4.27-23.76-7.47-4.08-2.57-5.24-8.49-9.5-16.46 7.7-3.79 10.23-6.15 17.34-6.39 3.53 0 8.43 2.48 15.54 4.19 6.38 2.45 14.34 7.31 18.97 12.28l0.65-0.24-2.22-5.73 1.89 1.17-1.33-3.95 1.56 1.23-2.62-7.15 2.12 2.45c-0.65-2.57-0.29-5.4-1.94-7.96z" />
      ]
    }
  },
  'assistant-3': {
    solid: {
      viewBox: '0 0 200 200',
      paths: [
        <path key="1" d="M 104.56,6.04 C 107.18,6.46 109.77,7.58 111.78,8.72 L 117.32,10.66 C 113.28,8.07 108.91,6.41 105.16,5.68 L 104.56,6.04 Z" />,
        <path key="2" d="M 138.91,27.97 C 135.81,21.23 130.77,16.47 123.92,13.3 C 118.79,10.86 109.08,6.78 101.58,4.96 L 100.71,4.5 H 97.33 C 91.77,5.28 88.23,5.78 81.88,10.74 C 74.97,14.65 67.88,20.01 65.76,25.62 C 62.48,32.36 61.64,37.24 61.94,40.18 L 62.18,40.02 L 62.34,44.9 L 62.02,44.82 L 62.97,47.18 L 62.65,47.42 C 63.21,53.03 66.23,58.96 69.81,63.92 L 69.97,63.76 C 66.23,58.23 64.81,55.13 63.86,50.01 L 64.18,47.73 L 64.66,48.37 C 64.9,55.61 71.67,66.67 77.76,69.46 C 79.41,70.22 80.21,70.22 80.85,69.7 L 80.53,68.82 L 82.48,69.94 L 84.35,69.86 L 86.14,69.38 L 85.98,68.35 L 83.12,65.91 C 76.19,59.12 73.61,50.73 73.77,43.65 C 73.93,36.26 78.97,31.02 87.23,26.06 C 92.19,23.12 94.86,21.02 98.06,20.78 C 102.26,20.78 109.77,24.86 116.09,27.81 C 124.75,31.89 127.77,36.69 128.33,46.26 C 128.73,52.95 125.16,59.61 120.12,66.39 L 117.01,69.14 L 115.67,72.39 L 122.11,68.82 L 121.39,71.18 L 127.21,67.03 L 126.02,69.62 C 131.13,66.31 136.17,60.63 138.22,54.93 C 140.27,49.81 142.14,44.66 141.58,39.31 C 141.18,36.06 140.23,31.73 138.91,27.97 Z M 140.91,46.42 L 140.67,46.11 C 141.15,43.83 141.23,41.47 140.75,38.72 L 141.15,39.36 C 141.54,41.95 141.54,43.97 140.91,46.42 Z M 138.12,32.72 C 136.33,29.04 134.32,26.52 132.28,24.16 L 132.52,23.76 C 134.91,26.12 137.01,29.28 138.12,32.72 Z" />,
        <path key="3" d="M 195.82,97.86 C 195.5,91.36 193.63,86.24 189.81,81.61 C 186.53,75.11 183.07,70.46 177.16,66.39 C 171.43,63.45 167.01,61.87 160.61,61.79 L 159.97,62.19 L 155.47,62.27 L 155.71,62.59 C 150.17,62.35 140.75,64.87 136.57,69.14 L 135.07,70.62 L 135.39,70.86 C 138.87,67.18 143.37,65.35 148.91,63.92 L 149.55,64.32 L 152.13,63.45 L 152.37,63.05 L 151.18,62.97 C 145.11,64.16 140.43,65.91 136.61,69.7 L 134.11,71.72 L 129.33,78.96 L 129.17,80.7 L 129.57,80.94 L 129.09,86.16 L 130.41,86.64 C 136.06,78.6 146.61,73.16 156.68,73.32 C 165.51,73.32 170.13,78.76 177.28,92.32 C 178.71,95.26 178.87,97.62 178.31,100.15 C 176.84,106.57 171.94,117.95 167.96,122.66 C 164.48,126.73 158.31,128.16 152.93,128.08 C 146.33,127.92 139.81,123.93 133.28,119.28 L 131.09,116.92 L 127.61,115.17 L 127.77,116.92 L 130.49,120.75 L 128.01,119.01 L 131.41,124.77 L 129.01,123.81 L 133.12,128.76 L 131.33,128.08 C 137.05,135.24 147.12,139.79 156.72,141.61 L 160.73,141.53 C 172.78,139.87 182.77,132.32 187.92,121.02 C 190.58,115.81 195.06,107.61 195.78,103.14 L 195.94,101.04 L 195.82,97.86 Z M 138.68,136.01 L 134.91,133.73 L 134.19,132.61 L 134.75,132.77 L 139.07,135.71 L 143.77,137.81 L 138.68,136.01 Z M 166.81,138.8 L 175.23,134.64 L 175.71,135.04 L 166.81,138.8 Z M 194.62,107.37 L 192.61,112.89 L 192.13,112.73 L 195.02,105.41 L 194.62,107.37 Z" />,
        <path key="4" d="M 136.81,158.06 L 136.97,157.74 L 136.65,153.91 L 136.01,152.41 L 136.49,151.37 L 135.07,146.15 L 134.91,146.47 C 133.64,141.59 131.37,137.26 127.81,134.01 L 123.68,131.06 L 119.42,129.4 L 119.18,130.04 L 121.11,131.5 L 119.06,130.47 L 116.09,129.72 L 115.03,130.36 L 113.68,130.04 L 113.04,130.71 L 113.52,132.37 C 121.11,138.64 126.65,147.78 126.49,157.43 C 126.34,164.82 121.87,169.46 112.72,174.42 C 107.78,177.03 106.07,178.86 102.22,178.54 C 96.91,178.54 91.22,174.98 84.62,172.23 C 76.61,168.55 72.11,164.66 71.79,154.62 C 71.47,146.67 76.37,138.64 82.48,132.06 L 84.15,127.72 L 83.32,127.8 L 77.25,132.06 L 78.44,128.76 L 73.65,132.69 L 73.25,132.06 L 69.89,134.72 L 65.64,140.42 L 62.77,146.71 L 62.53,146.31 C 63.94,141.28 66.71,136.94 70.09,133.61 L 69.77,133.37 C 64.38,138.25 60.12,146.51 58.33,153.91 L 57.53,155.93 C 56.62,166.63 62.46,177.61 71.91,183.88 L 74.77,185.71 L 84.71,190.85 L 91.22,193.71 L 97.29,195.13 L 97.69,194.9 L 99.12,195.5 L 102.02,195.26 C 107.82,194.38 111.72,192.96 117.78,188.62 C 124.63,184.79 129.77,181.11 133.88,174.26 C 136.69,168.55 137.92,163.82 137.68,159.04 L 136.81,158.06 Z M 60.94,167.27 L 61.26,167.11 L 66.04,175.46 L 65.56,175.62 L 60.94,167.27 Z M 58.61,159.08 L 58.21,156.13 L 58.61,155.73 V 159.08 Z M 83.04,190.18 L 84.31,190.34 L 86.89,191.76 L 86.73,192.08 L 83.04,190.18 Z M 90.02,193.12 L 93.31,193.91 V 194.3 L 89.74,193.12 H 90.02 Z M 135.63,151.06 L 134.91,148.03 L 135.31,147.87 L 135.95,150.9 L 135.63,151.06 Z M 135.07,147.23 L 131.09,138.01 L 131.41,137.77 L 135.39,146.99 L 135.07,147.23 Z" />,
        <path key="5" d="M 119.62,98.02 L 119.86,97.14 L 118.51,93.31 L 116.41,90.06 L 116.65,89.66 L 113.52,85.41 L 113.04,85.25 L 110.99,82.63 L 108.14,81.05 L 101.21,79.63 L 100.31,80.03 L 99.04,79.63 L 93.89,80.82 L 93.17,81.46 L 89.58,82.23 L 85.62,85.93 L 82.48,90.34 L 80.17,97.06 L 80.33,97.46 L 79.53,100.41 L 80.57,103.66 L 80.25,103.5 C 80.65,106.76 82.68,109.51 84.91,112.13 L 85.15,112.45 C 89.02,116.68 92.71,120.36 99.32,120.75 L 102.18,120.08 L 103.09,120.01 C 108.22,117.91 114.91,114.73 117.78,107.53 C 119.54,103.46 120.18,101.72 119.62,98.02 Z" />,
        <path key="6" d="M 72.11,81.29 L 70.09,77.73 L 72.47,79.87 L 68.42,73.8 L 69.85,73.32 L 68.26,70.78 L 67.86,70.14 L 69.37,70.86 C 64.81,65.63 58.29,62.15 52.39,60.13 L 48.33,58.71 L 46.02,57.75 L 45.11,58.07 L 44.21,57.51 L 37.68,57.91 L 32.82,58.95 C 24.21,62.11 17.12,68.15 12.56,77.37 L 11.77,78.96 L 6.22,89.82 L 5.03,94.62 L 4.71,97.86 L 4.31,99.05 C 4.07,105.65 5.74,112.05 9.86,117.83 C 13.24,123.77 15.83,129.08 22.84,134.04 L 29.07,136.7 C 33.22,137.97 36.96,138.44 40.09,138.05 L 40.33,137.57 L 45.03,137.65 L 45.27,137.18 L 47.61,137.42 L 48.88,136.66 L 49.68,137.06 C 55.14,135.56 60.54,133.13 63.94,130.19 L 63.62,129.72 C 60.14,132.57 55.98,134.68 51.31,135.79 L 50.51,135.31 L 47.53,136.19 L 46.94,135.71 C 53.46,134.84 63.78,129.48 68.18,124.13 L 70.13,120.79 L 70.21,119.05 L 69.41,119.36 L 70.52,113.94 L 69.73,113.38 L 66.67,117.12 C 60.26,122.98 52.59,126.53 42.26,126.53 C 34.61,126.53 29.71,120.16 25.17,111.22 C 22.27,106.68 20.32,103.58 22.03,97.86 C 24.34,90.34 27.92,82.31 31.82,77.17 C 35.61,73.24 40.93,71.66 46.26,71.66 C 53.78,71.58 60.78,76.06 67.31,81.02 L 69.53,83.46 L 72.79,84.81 L 70.78,80.54 L 72.11,81.29 Z M 22.03,67.42 C 25.01,64.4 28.16,62.35 31.82,61.11 L 32.06,61.43 C 28.91,62.62 26.05,64.44 23.19,66.87 L 22.03,67.42 Z M 40.77,58.63 L 44.13,57.99 L 44.37,58.47 L 41.01,58.95 L 40.77,58.63 Z M 54.14,63.17 L 55.02,62.86 L 57.97,63.72 L 64.14,67.26 L 57.73,64.16 L 54.14,63.17 Z" />
      ]
    }
  },
  'assistant-4': {
    solid: {
      viewBox: '0 0 250 250',
      paths: [
        <path key="1" d="M 196.08,69.47 C 193.82,52.16 183.18,36.17 166.36,25.96 C 157.92,20.77 148.41,18.71 139.68,13.96 C 134.82,11.61 131.75,11.16 125.25,10.73 C 123.75,10.63 123.41,11.11 122.98,11.7 C 122.21,11.66 121.41,11.53 120.97,12.02 C 120.22,12.83 119.79,13.26 118.72,13.34 C 116.22,13.56 109.49,18.11 100.13,22.86 C 82.06,32.13 70.17,45.79 65.21,59.89 C 61.28,70.96 65.89,89.87 73.06,97.43 C 74.83,99.35 76.87,101.57 77.58,101.31 C 78.28,101.05 75.98,98.71 75.09,97.16 C 76.82,97.16 79.63,99.97 80.92,101.09 C 83.18,103.1 86.98,105.26 87.87,104.87 C 88.63,104.52 84.06,97.83 82.06,93.98 C 78.95,88.11 76.41,80.17 78.71,71.41 C 83.27,54.05 102.05,45.61 113.04,40.33 C 118.01,38.22 124.78,34.76 125.54,34.94 C 127.41,36.86 128.71,37.3 131.29,38.53 C 138.99,42.12 147.72,45.21 153.31,48.13 C 166.92,55.18 174.31,65.48 176.72,78.91 C 179.07,90.94 173.72,99.79 165.24,108.8 C 164.35,109.79 165.42,110.36 166.87,109.83 C 168.01,109.39 168.99,108.86 170.02,108.16 C 170.68,108.11 170.38,109.92 169.94,110.36 C 170.74,111.48 177.02,109.22 179.92,107.39 C 188.73,102.16 196.39,86.75 196.22,74.98 C 196.56,73.48 196.39,71.09 196.08,69.47 Z" />,
        <path key="2" d="M 243.09,161.87 C 242.02,147.11 234.98,127.04 220.81,119.28 C 211.83,115.39 203.19,113.61 192.92,115.02 C 189.93,115.46 184.21,116.08 183.67,117.75 C 184.65,117.75 187.42,117.22 188.22,117.61 C 186.27,118.69 181.93,120.1 179.16,122.15 C 177.21,123.27 175.71,123.62 177.12,123.97 C 177.65,124.73 185.35,123.62 188.73,123.57 C 200.97,122.82 213.12,129.18 218.04,139.94 C 221.33,147.06 222.22,154.91 221.68,165.39 L 219.82,186.35 V 188.03 C 219.73,188.56 219.43,188.91 218.99,189.21 C 211.12,193.91 200.04,206.68 184.12,212.18 C 173.18,216.07 160.41,214.99 151.76,210.29 C 143.12,207.08 139.22,197.86 136.06,188.07 C 134.72,185.45 133.88,186.35 133.66,191.01 C 133.53,192.18 133.44,192.98 132.91,192.94 C 132.25,191.82 132.03,189.43 130.96,189.43 C 129.72,189.43 127.41,197.19 127.54,201.61 C 127.41,207.82 130.92,214.18 135.22,220.1 C 140.72,227.31 147.63,232.54 158.93,236.08 C 166.01,238.56 173.84,239.18 183.18,237.72 C 195.91,235.94 205.92,230.84 211.83,226.65 C 217.22,223.11 221.82,218.6 226.78,214.97 C 231.91,211.68 237.95,206.03 239.99,202.61 C 240.79,201.21 240.79,199.01 241.72,197.41 C 242.38,196.33 242.16,195.34 241.72,194.31 C 242.52,192.91 242.22,188.91 242.61,181.11 C 242.87,175.42 243.31,168.03 243.09,161.87 Z" />,
        <path key="3" d="M 118.32,111.48 C 111.11,111.48 102.89,119.92 101.28,124.21 C 100.89,126.83 99.07,131.21 97.91,134.93 C 97.47,135.73 97.73,137.09 97.73,137.79 C 97.29,138.92 97.91,139.31 98.04,140.21 C 98.34,144.41 99.91,148.61 103.29,154.26 C 106.92,160.13 112.42,163.63 120.08,166.21 C 121.43,166.74 124.86,167.13 126.11,166.74 C 126.55,166.12 127.71,166.74 128.64,166.21 C 129.48,165.68 130.73,165.68 131.48,165.2 C 132.1,165.64 133.17,165.02 133.79,164.49 C 134.68,164.75 135.12,164.31 136.01,163.61 C 137.08,163.87 137.74,163.12 138.72,162.32 C 139.61,162.58 140.81,161.68 141.61,160.78 C 142.36,161.04 142.94,160.18 143.42,159.33 C 144.67,159.11 145.82,157.06 147.37,155.51 C 148.62,154.71 149.51,153.68 149.38,152.13 C 149.64,151.74 150.12,151.21 150.08,150.22 C 151.23,149.32 151.76,147.06 153.32,145.14 C 154.52,143.74 153.99,142.02 153.41,139.01 C 153.32,137.93 153.62,137.13 153.84,136.14 C 153.93,135.11 152.73,133.94 153.26,132.81 C 151.61,125.12 146.44,117.13 140.72,113.7 C 137.73,111.22 133.79,109.82 129.06,109.56 C 126.81,109.56 124.69,109.34 123.28,109.82 C 121.94,110.12 120.38,110.93 118.32,111.48 Z" />,
        <path key="4" d="M 142.99,115.91 L 143.74,116.08 L 143.91,116.61 L 144.53,116.35 L 142.99,115.09 V 115.91 Z" />,
        <path key="5" d="M 137.73,111.71 L 138.22,111.62 L 138.97,112.06 L 138.58,111.21 L 137.73,111.08 V 111.71 Z" />,
        <path key="6" d="M 132.34,110.21 L 132.91,110.08 V 110.52 L 132.34,110.21 Z" />,
        <path key="7" d="M 118.63,197.32 C 117.83,197.06 116.94,200.22 116.28,200.44 C 115.62,200.66 116.64,197.11 116.64,194.11 C 116.64,191.1 116.94,187.81 116.01,188.11 C 113.84,188.73 110.72,200.31 106.51,205.63 C 100.01,213.84 92.84,215.76 83.01,215.76 C 70.72,215.33 57.16,207.12 50.12,202.42 C 45.82,200.08 38.21,194.32 36.61,193.09 C 36.22,190.93 36.35,187.08 35.92,184.07 C 33.87,173.72 31.42,164.83 31.72,154.91 C 31.72,141.03 39.72,127.82 51.31,121.21 C 57.81,117.72 64.72,117.72 70.22,118.34 C 73.03,118.69 78.11,120.99 78.68,120.64 C 79.93,120.29 78.33,118.61 76.77,117.06 C 75.7,116.12 75.22,115.09 76.77,115.52 C 78.46,116.14 77.62,114.22 75.45,112.31 C 71.28,108.06 64.37,105.22 56.06,105.13 C 49.11,105.39 42.16,105.92 36.08,108.67 C 32.14,110.68 27.32,113.78 24.21,116.83 C 12.11,128.17 7.29,141.71 6.04,158.32 C 4.79,168.62 7.33,177.81 9.15,187.12 C 10.04,194.56 10.43,198.71 13.68,203.9 C 14.84,205.21 18.91,209.63 19.89,209.72 C 20.33,209.76 19.44,208.68 19.89,208.9 C 22.38,211.11 26.81,213.73 29.81,215.51 C 38.91,222.41 47.91,228.06 59.07,231.31 C 65.11,233.7 70.13,234.41 77.3,234.15 C 86.21,234.15 92.25,232.61 99.29,227.91 C 107.28,222.11 115.92,211.63 118.63,197.32 Z" />,
        <path key="8" d="M 98.98,143.09 L 98.63,142.61 V 144.11 L 98.98,143.09 Z" />
      ]
    }
  },
  'cardzen-logo': {
    solid: {
      viewBox: '0 0 256 256',
      paths: [
        <path key="1" d="M 152.44,7.56 C 179.04,2.89 209.22,18.16 227.06,38.36 C 244.89,58.56 253.81,87.49 246.68,116.11 C 248.21,90.56 233.88,63.91 215.96,44.49 C 199.41,25.78 180.29,14.19 152.44,7.72 V 7.56 Z" />,
        <path key="2" d="M 147.72,36.71 C 167.79,29.31 197.15,44.06 209.19,64.77 C 219.21,82.03 223.11,97.09 216.48,116.74 C 216.98,94.24 205.48,75.22 189.75,59.28 C 178.73,48.11 166.39,40.61 147.72,37.29 V 36.71 Z" />,
        <path key="3" d="M 143.79,65.08 C 157.47,56.98 180.29,67.26 188.74,83.06 C 195.41,95.49 194.56,105.57 188.28,116.79 C 187.96,98.36 175.72,75.16 143.88,65.76 L 143.79,65.08 Z" />,
        <path key="4" d="M 236.29,146.95 C 235.81,146.38 235.57,145.66 235.57,144.91 C 235.53,142.47 234.51,140.47 234.31,138.91 C 233.31,131.63 230.09,127.61 226.91,128.29 C 225.92,128.53 225.11,129.93 224.59,131.11 C 223.11,129.42 221.99,127.81 220.93,127.61 C 220.45,128.61 220.11,129.7 219.91,130.82 L 219.42,130.49 C 219.38,131.39 219.29,132.28 219.12,133.16 C 215.07,133.64 211.25,135.39 208.27,138.21 L 207.36,138.09 C 202.99,142.24 199.85,147.66 198.09,152.72 C 196.61,162.96 193.19,174.86 185.71,185.06 C 170.22,206.69 148.06,217.47 121.44,217.75 C 78.01,218.21 40.02,184.25 36.41,137.16 L 36.31,130.76 C 33.81,162.11 50.92,192.73 78.91,209.99 L 78.62,209.84 C 49.11,194.83 32.14,168.73 32.53,133.91 C 32.92,101.44 50.04,70.38 86.28,51.71 L 86.09,51.51 C 65.18,60.73 49.35,74.81 38.14,93.74 C 48.72,69.24 71.79,50.07 105.46,39.98 L 105.27,39.6 C 92.83,41.39 81.66,46.11 70.02,51.32 C 79.94,43.32 87.22,41.23 98.39,37.19 L 98.1,37.04 C 88.96,38.74 80.18,42.03 72.23,46.45 L 71.99,46.16 L 77.08,42.51 L 76.79,42.37 C 40.07,58.12 15.07,95.73 14.83,133.81 C 14.78,143.31 15.84,151.84 17.91,158.75 C 15.12,148.81 14.59,139.82 14.83,130.82 C 16.79,84.06 54.78,27.17 143.21,26.93 V 26.79 C 135.11,25.04 129.12,24.56 121.12,24.61 C 81.23,24.95 48.48,41.88 31.76,68.12 C 49.16,43.27 78.11,21.78 121.32,20.08 C 74.09,19.6 33.41,49.19 17.52,81.21 C 16.04,84.71 14.78,87.76 13.72,89.9 C 20.08,74.99 18.92,77.72 18.11,79.13 C 7.99,97.77 6.13,116.16 6.13,134.7 C 6.13,162.67 17.47,189.93 36.17,210.86 C 48.82,226.61 66.22,236.99 81.37,243.01 L 88.14,244.96 C 85.71,243.89 83.26,242.72 80.83,241.51 C 94.13,246.62 106.22,249.01 119.62,248.82 C 154.91,248.34 178.91,234.97 199.85,214.81 C 210.97,204.72 219.52,192.1 226.49,178.02 C 232.91,166.95 237.63,154.47 236.29,146.95 Z M 121.32,242.03 V 241.84 C 149.93,241.41 170.91,232.28 193.73,210.84 C 174.91,230.71 153.12,241.12 121.32,242.03 Z" />,
        <path key="5" d="M 124.16,44.49 H 116.93 V 44.73 L 124.16,44.49 Z" />
      ]
    }
  }
};

// ===================== MAIN ICON COMPONENT =====================
const Icon: React.FC<IconProps> = ({
  name,
  variant = 'solid',
  size,
  width,
  height,
  color = 'currentColor',
  fillColor,
  strokeColor,
  strokeWidth,
  viewBox,
  className = '',
  ...props
}) => {
  // Get the icon definition from registry
  const iconData = iconRegistry[name];
  
  if (!iconData) {
    console.warn(`Icon "${name}" not found in registry`);
    return null;
  }

  // Get the variant data
  const variantData = iconData[variant];
  
  if (!variantData) {
    console.warn(`Variant "${variant}" not found for icon "${name}"`);
    return null;
  }

  // Determine dimensions
  const finalWidth = width || size || 24;
  const finalHeight = height || size || 24;
  
  // Use viewBox from icon data or provided viewBox
  const finalViewBox = viewBox || variantData.viewBox || VIEWBOX.DEFAULT;
  
  // Check if this icon variant should have no fill based on data
  const shouldHaveNoFill = variantData.noFill || false;
  
  // Determine colors with special handling for no-fill icons
  let finalFillColor = fillColor;
  let finalStrokeColor = strokeColor;
  
  if (shouldHaveNoFill) {
    // For icons marked with noFill: true, default to no fill and stroke color
    finalFillColor = fillColor || 'none';
    finalStrokeColor = strokeColor || color;
  } else {
    // For regular icons, use standard logic
    finalFillColor = fillColor || (variant === 'outline' ? 'none' : color);
    finalStrokeColor = strokeColor || (variant === 'outline' ? color : 'none');
  }
  
  const finalStrokeWidth = strokeWidth || variantData.strokeWidth || (variant === 'outline' || shouldHaveNoFill ? 1.5 : undefined);

  // Add animation class for spinner
  const finalClassName = name === 'spinner' ? `animate-spin ${className}` : className;

  return (
    <svg
      className={finalClassName}
      xmlns="http://www.w3.org/2000/svg"
      width={finalWidth}
      height={finalHeight}
      viewBox={finalViewBox}
      fill={finalFillColor}
      stroke={finalStrokeColor}
      strokeWidth={finalStrokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color }}
      {...props}
    >
      {variantData.paths}
    </svg>
  );
};

// ===================== UTILITY FUNCTIONS =====================
export const registerIcon = (name: string, iconData: IconPathData) => {
  iconRegistry[name] = iconData;
};

export const registerIcons = (icons: IconDefinition) => {
  Object.assign(iconRegistry, icons);
};

// ===================== EXPORTS =====================
export default Icon;
export { Icon };
export { CardIcon } from './cards';
