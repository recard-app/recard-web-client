import React from 'react';
import clsx from 'clsx';
import './ContentContainer.scss';

type ContentContainerSize = 'sm' | 'md' | 'lg';

interface ContentContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: ContentContainerSize;
  framed?: boolean; // When true, adds border, shadow, and radius similar to auth cards
}

const ContentContainer: React.FC<ContentContainerProps> = ({
  children,
  className = '',
  size = 'md',
  framed = false,
}) => {
  const sizeClass = `content-container--${size}` as const;

  return (
    <div className={clsx('content-container', sizeClass, framed && 'content-container--framed', className)}>
      {children}
    </div>
  );
};

export default ContentContainer;


