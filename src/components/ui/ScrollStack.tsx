'use client';

import { useLayoutEffect, useRef, useCallback, ReactNode } from 'react';
import Lenis from 'lenis';

interface ScrollStackItemProps {
  children: ReactNode;
  itemClassName?: string;
}

export const ScrollStackItem = ({ children, itemClassName = '' }: ScrollStackItemProps) => (
  <div
    className={`scroll-stack-card relative w-full h-auto min-h-[250px] my-0 p-1 box-border origin-top will-change-transform ${itemClassName}`.trim()}
    style={{
      backfaceVisibility: 'hidden',
      transformStyle: 'preserve-3d'
    }}
  >
    {children}
  </div>
);

interface ScrollStackProps {
  children: ReactNode;
  className?: string;
  itemDistance?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  useWindowScroll?: boolean;
}

const ScrollStack = ({
  children,
  className = '',
  itemDistance = 40,
  itemStackDistance = 10,
  stackPosition = '20%',
  useWindowScroll = false,
}: ScrollStackProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const lenisRef = useRef<Lenis | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Helper to get consistent offsets
  const getElementOffset = useCallback((element: HTMLElement) => {
    if (useWindowScroll && typeof window !== 'undefined') {
      const rect = element.getBoundingClientRect();
      return rect.top + window.scrollY;
    }
    return element.offsetTop;
  }, [useWindowScroll]);

  const updateTransforms = useCallback(() => {
    const scroller = useWindowScroll ? document.documentElement : scrollerRef.current;
    if (!scroller) return;

    const scrollTop = useWindowScroll ? window.scrollY : (scroller as HTMLElement).scrollTop;
    const containerHeight = useWindowScroll ? window.innerHeight : (scroller as HTMLElement).clientHeight;
    
    // Find the end marker
    const endMarker = scrollerRef.current?.querySelector('.scroll-stack-end') as HTMLElement;
    if (!endMarker) return;
    
    const endMarkerTop = getElementOffset(endMarker);
    const stackStartPx = (parseFloat(stackPosition) / 100) * containerHeight;

    cardsRef.current.forEach((card, i) => {
      // Calculate where this card SHOULD be in the stack flow
      // Simplification: We need fixed reference points. 
      const containerTop = getElementOffset(scrollerRef.current!);
      const cardRelativeTop = card.offsetTop; // Relative to container
      
      // Absolute Top of card in document flow (without transform)
      const absCardTop = containerTop + cardRelativeTop;
            
      let translateY = 0;
      let scale = 1;
      let blur = 0;
      let opacity = 1;
      
      if (scrollTop >= absCardTop - stackStartPx - (i * itemStackDistance)) {
          // It should be sticking
          if (scrollTop < endMarkerTop - containerHeight) {
             // Pinning phase
             translateY = scrollTop - absCardTop + stackStartPx + (i * itemStackDistance);
             
             // Check if NEXT item has hit the stack?
             if (i < cardsRef.current.length - 1) {
                 const nextCard = cardsRef.current[i+1];
                 const nextCardAbsTop = containerTop + nextCard.offsetTop;
                 const nextCardHit = scrollTop >= nextCardAbsTop - stackStartPx - ((i+1) * itemStackDistance);
                 
                 if (nextCardHit) {
                     // Being covered
                     scale = 0.95; // Slight shrink
                     opacity = 0.5; // Slight fade
                     blur = 2;
                 }
             }
          } else {
             // Exit phase (scrolling away with container)
             translateY = (endMarkerTop - containerHeight) - absCardTop + stackStartPx + (i * itemStackDistance);
          }
      }
      
      // Apply
      card.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
      card.style.filter = blur > 0 ? `blur(${blur}px)` : 'none';
      card.style.opacity = opacity.toString();
      card.style.zIndex = i.toString();
    });
    
  }, [useWindowScroll, stackPosition, itemStackDistance, getElementOffset]);

  const handleScroll = useCallback(() => {
     requestAnimationFrame(updateTransforms);
  }, [updateTransforms]);

  useLayoutEffect(() => {
    if (!scrollerRef.current) return;
    
    // Collect cards
    cardsRef.current = Array.from(scrollerRef.current.querySelectorAll('.scroll-stack-card')) as HTMLElement[];
    
    // Setup spacing
    cardsRef.current.forEach((card, i) => {
        // Natural spacing
        card.style.marginBottom = `${itemDistance}px`;
    });

    if (useWindowScroll) {
        window.addEventListener('scroll', handleScroll);
        // Optional: Lenis for window
        const lenis = new Lenis();
        lenis.on('scroll', handleScroll);
        
        const raf = (time: number) => {
            lenis.raf(time);
            animationFrameRef.current = requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
        lenisRef.current = lenis;
    }

    updateTransforms();

    return () => {
        if (useWindowScroll) {
            window.removeEventListener('scroll', handleScroll);
            if (lenisRef.current) lenisRef.current.destroy();
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        }
    };
  }, [useWindowScroll, itemDistance, handleScroll, updateTransforms]);

  return (
    <div ref={scrollerRef} className={`relative w-full ${className}`}>
        {/* Spacer to allow scrolling "through" the stack duration */}
        <div className="relative">
            {children}
        </div>
        {/* Invisible spacer to create height for the pinning duration */}
        <div className="scroll-stack-end h-px" /> 
    </div>
  );
};

export default ScrollStack;
