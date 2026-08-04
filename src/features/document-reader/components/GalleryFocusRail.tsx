'use client';

// Riel de miniaturas con perspectiva 3D (versión liviana, inspirada en un
// componente de carrusel encontrado en la comunidad). A diferencia del
// original: sin framer-motion (transiciones CSS puras, ya se acelera por GPU
// vía transform/opacity), sin blur de fondo permanente, y con menos blur por
// tarjeta -solo las 2 vecinas, no 4- para que no cueste rendimiento en
// celulares. El recorte a formato vertical es aceptable aquí porque son
// miniaturas de navegación, no la vista principal de la ilustración (esa
// sigue usando object-contain arriba, sin recortar nada).
import Image from 'next/image';

export interface GalleryFocusRailProps {
  images: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
  title: string;
}

function wrap(value: number, length: number) {
  return ((value % length) + length) % length;
}

export function GalleryFocusRail({ images, activeIndex, onSelect, title }: GalleryFocusRailProps) {
  const count = images.length;
  const visibleOffsets = count > 2 ? [-1, 0, 1] : count === 2 ? [0, 1] : [0];

  return (
    <div
      className="relative flex h-[160px] w-full items-center justify-center overflow-hidden"
      style={{ perspective: '1000px' }}
    >
      {visibleOffsets.map((offset) => {
        const index = wrap(activeIndex + offset, count);
        const isCenter = offset === 0;
        const dist = Math.abs(offset);

        return (
          <button
            key={`${index}-${offset}`}
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`Ver ilustración ${index + 1}`}
            aria-current={isCenter}
            className="absolute left-1/2 top-1/2 aspect-[3/4] w-[110px] cursor-pointer overflow-hidden rounded-xl border-2 shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF69B4]"
            style={{
              // translate(-50%,-50%) primero ancla la tarjeta al centro del
              // contenedor (los hijos "absolute" no respetan items-center /
              // justify-center del padre flex); el resto del transform es el
              // desplazamiento/rotación visual sobre ese punto ya centrado.
              transform: `translate(-50%, -50%) translateX(${offset * 108}px) scale(${isCenter ? 1.15 : 0.85}) rotateY(${offset * -22}deg)`,
              opacity: isCenter ? 1 : 0.55,
              filter: isCenter ? 'none' : `blur(${dist * 1.5}px) brightness(0.6)`,
              zIndex: isCenter ? 20 : 10 - dist,
              borderColor: isCenter ? '#FF69B4' : 'rgba(255,255,255,0.15)',
              transition: 'transform 350ms cubic-bezier(0.22,1,0.36,1), opacity 300ms ease, filter 300ms ease, border-color 300ms ease',
            }}
          >
            <Image
              src={images[index]}
              alt={`${title} - miniatura ${index + 1}`}
              fill
              sizes="110px"
              className="object-cover pointer-events-none"
              unoptimized
            />
          </button>
        );
      })}
    </div>
  );
}
