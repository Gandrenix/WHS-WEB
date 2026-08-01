'use client';

import { useEffect, useRef } from 'react';
import { renderStarsBackground } from 'asciify-engine';

export interface StarsBackgroundProps {
  children?: React.ReactNode;
  opacity?: number;
  count?: number;
  speed?: number;
  fontSize?: number;
  color?: string;
  accentColor?: string;
  density?: number;
  className?: string;
}

interface StarParticle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  char: string;
  size: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  speedX: number;
  speedY: number;
}

export function StarsBackground({
  children,
  opacity = 0.8,
  count = 180,
  speed = 0.6,
  fontSize = 14,
  color = '#FFFFFF',
  accentColor = '#E0AAFF',
  density = 0.6,
  className = '',
}: StarsBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const startTime = performance.now();


    // ASCII Star Glyphs
    const starChars = ['✦', '★', '✧', '✴', '❇', '∗', '°', '•', '*', '.'];
    const accentColors = [accentColor, '#FFFFFF', '#C084FC', '#A855F7', '#7ED957'];

    let stars: StarParticle[] = [];

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width || window.innerWidth;
      const height = rect.height || window.innerHeight;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      // Simple, elegant star count scaled smoothly
      const calculatedCount = Math.floor((width * height) / 10000) * density + 50;
      const numStars = Math.min(count, calculatedCount);
      stars = [];

      for (let i = 0; i < numStars; i++) {
        const char = starChars[Math.floor(Math.random() * starChars.length)];
        const isBigStar = ['✦', '★', '✴'].includes(char);
        const isMediumStar = ['✧', '❇', '∗'].includes(char);

        // Subtle star sizes
        const starSize = isBigStar
          ? Math.floor(Math.random() * 6 + 16)
          : isMediumStar
          ? Math.floor(Math.random() * 4 + 11)
          : Math.floor(Math.random() * 3 + 7);

        const starColor = accentColors[Math.floor(Math.random() * accentColors.length)];
        const baseAlpha = isBigStar ? Math.random() * 0.3 + 0.5 : Math.random() * 0.3 + 0.3;

        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          baseX: Math.random() * width,
          baseY: Math.random() * height,
          char,
          size: starSize,
          color: starColor,
          alpha: baseAlpha,
          baseAlpha,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
          speedX: (Math.random() - 0.5) * 0.15 * speed,
          speedY: (Math.random() - 0.5) * 0.15 * speed,
        });
      }
    };

    resizeCanvas();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    // Mouse interaction listener
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    // Main render loop combining asciify-engine & custom particle physics
    const render = (time: number) => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      const elapsed = (time - startTime) / 1000;

      ctx.clearRect(0, 0, width, height);

      // Render native asciify-engine stars background layer
      try {
        renderStarsBackground(
          ctx,
          width,
          height,
          elapsed,
          mouseRef.current.active ? { x: mouseRef.current.x, y: mouseRef.current.y } : undefined,
          {
            count: Math.floor(count * 0.5),
            fontSize: Math.floor(fontSize * 0.8),
            speed: speed,
            color: color,
            accentColor: accentColor,
            chars: '✦★✧∗°•*.',
          }
        );
      } catch (e) {
        // Fallback gracefully if asciify-engine encounters context nuances
      }

      // Render dense custom ASCII star particles with glow & gravity physics
      const mouse = mouseRef.current;
      const attractionRadius = 220;

      stars.forEach((star) => {
        // Drifting motion
        star.x += star.speedX;
        star.y += star.speedY;

        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        // Mouse gravity pull effect
        let renderX = star.x;
        let renderY = star.y;

        if (mouse.active) {
          const dx = mouse.x - star.x;
          const dy = mouse.y - star.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < attractionRadius) {
            const force = (1 - dist / attractionRadius) * 28;
            const angle = Math.atan2(dy, dx);
            renderX += Math.cos(angle) * force;
            renderY += Math.sin(angle) * force;
          }
        }

        // Subtle twinkle luminance calculation
        const twinkle = Math.sin(elapsed * star.twinkleSpeed * 100 + star.twinklePhase);
        const currentAlpha = Math.min(1, Math.max(0.25, star.baseAlpha + twinkle * 0.25)) * opacity;

        // Draw star glyph with font-family monospace
        ctx.font = `400 ${star.size}px "JetBrains Mono", "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Subtle, elegant glow
        if (['✦', '★', '✴'].includes(star.char)) {
          ctx.shadowColor = star.color;
          ctx.shadowBlur = 6;
        } else if (['✧', '❇', '∗'].includes(star.char)) {
          ctx.shadowColor = star.color;
          ctx.shadowBlur = 3;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = star.color;
        ctx.globalAlpha = currentAlpha;
        ctx.fillText(star.char, renderX, renderY);
      });

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [opacity, count, speed, fontSize, color, accentColor, density]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-500"
        style={{ opacity }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

