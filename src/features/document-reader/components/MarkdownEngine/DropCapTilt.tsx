'use client';

import { useRef, useState } from 'react';

export interface DropCapTiltProps {
  letter: string;
  color?: string;
}

export function DropCapTilt({ letter, color = '#8B2FE0' }: DropCapTiltProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState('');
  const [textShadowStyle, setTextShadowStyle] = useState(
    `2px 4px 0 white, 5px 7px 0 ${color}66`
  );
  const [isHovered, setIsHovered] = useState(false);

  const maxTilt = 15;
  const perspective = 300;
  const tiltMultiplier = 2.25;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const percentageX = mouseX / width;
    const percentageY = mouseY / height;

    const tiltX = (maxTilt / 2 - percentageX * maxTilt).toFixed(2);
    const tiltY = (percentageY * maxTilt - maxTilt / 2).toFixed(2);

    const calcTransform = `perspective(${perspective}px) rotateY(${tiltY}deg) rotateX(${tiltX}deg) scale3d(1,1,1)`;
    const shadowWhite = `${tiltX}px ${-Number(tiltY)}px 0 white`;
    const shadowColor = `${Number(tiltX) * tiltMultiplier}px ${-Number(tiltY) * tiltMultiplier}px 0 ${color}66`;

    setTransformStyle(calcTransform);
    setTextShadowStyle(`${shadowWhite}, ${shadowColor}`);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransformStyle(`perspective(${perspective}px) rotateX(0deg) rotateY(0deg)`);
    setTextShadowStyle(`2px 4px 0 white, 5px 7px 0 ${color}66`);
  };

  return (
    <span
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="float-left inline-block relative overflow-hidden mr-4 mb-2 p-3 sm:p-4 border rounded-lg border-[#8B2FE0]/60 select-none cursor-pointer font-serif font-extrabold text-5xl sm:text-7xl leading-none bg-[#120A08]/90 backdrop-blur-md shadow-2xl transition-shadow hover:shadow-[#8B2FE0]/20"
      style={{
        color: color,
        borderColor: `${color}aa`,
      }}
    >
      <span
        className="transition-transform duration-150 ease-out inline-block"
        style={{
          transform: transformStyle,
          textShadow: textShadowStyle,
          willChange: isHovered ? 'transform, text-shadow' : 'auto',
        }}
      >
        {letter}
      </span>
    </span>
  );
}
