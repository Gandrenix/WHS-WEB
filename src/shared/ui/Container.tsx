import React from 'react';

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`container-custom ${className}`.trim()}>
      {children}
    </div>
  );
}
