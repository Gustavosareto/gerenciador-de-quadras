"use client";

import { useEffect, useRef, useMemo, ReactNode, RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
    children: ReactNode;
    scrollContainerRef?: RefObject<HTMLElement>;
    enableBlur?: boolean;
    baseOpacity?: number;
    baseRotation?: number;
    blurStrength?: number;
    containerClassName?: string;
    textClassName?: string;
    rotationEnd?: string;
    wordAnimationEnd?: string;
}

const ScrollReveal = ({
    children,
    scrollContainerRef,
    enableBlur = true,
    baseOpacity = 0.1,
    baseRotation = 3,
    blurStrength = 4,
    containerClassName = '',
    textClassName = '',
    rotationEnd = 'top 60%',
    wordAnimationEnd = 'top 30%'
}: ScrollRevealProps) => {
    const containerRef = useRef<HTMLHeadingElement>(null);

    const splitText = useMemo(() => {
        const text = typeof children === 'string' ? children : '';
        return text.split(/(\s+)/).map((word, index) => {
            if (word.match(/^\s+$/)) return <span key={index}>{word}</span>;
            return (
                <span className="inline-block word" key={index}>
                    {word}
                </span>
            );
        });
    }, [children]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const scroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                el,
                { transformOrigin: 'center center', rotate: baseRotation, opacity: 0 },
                {
                    ease: 'power2.out',
                    rotate: 0,
                    opacity: 1,
                    scrollTrigger: {
                        trigger: el,
                        scroller,
                        start: 'top 95%',
                        end: rotationEnd,
                        scrub: true
                    }
                }
            );

            const wordElements = el.querySelectorAll('.word');

            gsap.fromTo(
                wordElements,
                { opacity: baseOpacity },
                {
                    ease: 'none',
                    opacity: 1,
                    stagger: 0.05,
                    scrollTrigger: {
                        trigger: el,
                        scroller,
                        start: 'top 90%',
                        end: wordAnimationEnd,
                        scrub: true
                    }
                }
            );

            if (enableBlur) {
                gsap.fromTo(
                    wordElements,
                    { filter: `blur(${blurStrength}px)` },
                    {
                        ease: 'none',
                        filter: 'blur(0px)',
                        stagger: 0.05,
                        scrollTrigger: {
                            trigger: el,
                            scroller,
                            start: 'top 90%',
                            end: wordAnimationEnd,
                            scrub: true
                        }
                    }
                );
            }
        }, el);

        return () => ctx.revert();
    }, [scrollContainerRef, baseRotation, rotationEnd, baseOpacity, wordAnimationEnd, enableBlur, blurStrength]);

    return (
        <h2
            ref={containerRef}
            className={`text-4xl md:text-6xl font-black tracking-tighter leading-[0.95] text-white ${containerClassName}`}
        >
            <span className={textClassName}>{splitText}</span>
        </h2>
    );
};

export default ScrollReveal;
