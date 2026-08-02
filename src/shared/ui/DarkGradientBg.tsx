'use client';

import type React from 'react';
import { StarsBackground } from './StarsBackground';

export interface DarkGradientBgProps {
  children?: React.ReactNode;
  className?: string;
  showStars?: boolean;
  starCount?: number;
  starSpeed?: number;
  accentColor?: string;
}

export function DarkGradientBg({
  children,
  className = '',
  showStars = true,
  starCount = 180,
  starSpeed = 0.6,
  accentColor = '#E0AAFF',
}: DarkGradientBgProps) {
  return (
    <div className={`relative min-h-screen w-full bg-black overflow-hidden ${className}`}>
      {/* Background Gradient & Skewed Streaks Layer (z-0) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-100"
          style={{
            background: 'radial-gradient(100% 100% at 0% 0%, rgb(35, 25, 20) 0%, rgb(13, 10, 8) 100%)',
            maskImage:
              'radial-gradient(125% 100% at 0% 0%, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 88%, rgba(0, 0, 0, 0) 100%)',
            WebkitMaskImage:
              'radial-gradient(125% 100% at 0% 0%, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 88%, rgba(0, 0, 0, 0) 100%)',
          }}
        >
          {/* Skewed fading cyan/purple WHS streaks */}
          <div
            className="absolute inset-0 opacity-25"
            style={{
              background: 'linear-gradient(rgb(139, 47, 224) 0%, rgba(139, 47, 224, 0) 100%)',
              maskImage:
                'linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0) 36%, rgb(0, 0, 0) 55%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0, 0) 97%)',
              WebkitMaskImage:
                'linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0) 36%, rgb(0, 0, 0) 55%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0, 0) 97%)',
              transform: 'skewX(45deg)',
            }}
          />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: 'linear-gradient(rgb(126, 217, 87) 0%, rgba(126, 217, 87, 0) 100%)',
              maskImage:
                'linear-gradient(90deg, rgba(0, 0, 0, 0) 11%, rgb(0, 0, 0) 25%, rgba(0, 0, 0, 0.55) 41%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0, 0) 97%)',
              WebkitMaskImage:
                'linear-gradient(90deg, rgba(0, 0, 0, 0) 11%, rgb(0, 0, 0) 25%, rgba(0, 0, 0, 0.55) 41%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0, 0) 97%)',
              transform: 'skewX(45deg)',
            }}
          />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: 'linear-gradient(rgb(192, 132, 252) 0%, rgba(192, 132, 252, 0) 100%)',
              maskImage:
                'linear-gradient(90deg, rgba(0, 0, 0, 0) 9%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0.55) 28%, rgba(0, 0, 0, 0.424) 40%, rgb(0, 0, 0) 48%, rgba(0, 0, 0, 0.267) 54%, rgba(0, 0, 0, 0.13) 78%, rgb(0, 0, 0) 88%, rgba(0, 0, 0, 0) 97%)',
              WebkitMaskImage:
                'linear-gradient(90deg, rgba(0, 0, 0, 0) 9%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0.55) 28%, rgba(0, 0, 0, 0.424) 40%, rgb(0, 0, 0) 48%, rgba(0, 0, 0, 0.267) 54%, rgba(0, 0, 0, 0.13) 78%, rgb(0, 0, 0) 88%, rgba(0, 0, 0, 0) 97%)',
              transform: 'skewX(45deg)',
            }}
          />
        </div>
      </div>

      {/* Dot Grid Pattern Overlay (z-5) */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none z-5"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Subtle Radial Highlight (z-5) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#8B2FE0]/10 via-transparent to-transparent pointer-events-none z-5" />

      {/* Optional ASCII Stars Layer & Content Layer (z-10 / z-20) */}
      {showStars ? (
        <StarsBackground
          count={starCount}
          speed={starSpeed}
          accentColor={accentColor}
          opacity={0.8}
          className="relative z-10 min-h-screen"
        >
          <div className="relative z-20">{children}</div>
        </StarsBackground>
      ) : (
        <div className="relative z-20">{children}</div>
      )}
    </div>
  );
}
