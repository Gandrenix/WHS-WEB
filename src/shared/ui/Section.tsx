import React from 'react';

export interface SectionProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({ id, children, className = '' }: SectionProps) {
  return (
    <section id={id} className={`py-16 md:py-24 ${className}`.trim()}>
      {children}
    </section>
  );
}
