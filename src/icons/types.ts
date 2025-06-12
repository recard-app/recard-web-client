export type IconVariant = 'solid' | 'outline' | 'mini' | 'micro';

export interface BaseIconProps {
  variant?: IconVariant;
  color?: string;
  size?: number | string;
  className?: string;
}

export interface IconComponentProps extends Omit<React.SVGProps<SVGSVGElement>, 'color'> {
  color?: string;
  size?: number | string;
  className?: string;
} 