'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        {
          autoAlpha: 0,
          scale: 0.98,
          filter: 'blur(4px)',
        },
        {
          autoAlpha: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 1,
          ease: 'power2.out',
          clearProps: 'all'
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [pathname]);

  return (
    <div ref={containerRef} style={{ opacity: 0, backgroundColor: '#383838' }}>
      {children}
    </div>
  );
}
