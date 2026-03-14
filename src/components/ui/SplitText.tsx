"use client";

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

// Register plugins safely
if (typeof window !== 'undefined') {
    try {
        gsap.registerPlugin(ScrollTrigger, GSAPSplitText);
    } catch (e) {
        console.warn("GSAP plugins could not be registered", e);
    }
}

interface SplitTextProps {
    text: string;
    className?: string;
    delay?: number;
    duration?: number;
    ease?: string;
    splitType?: "chars" | "words" | "lines";
    from?: gsap.TweenVars;
    to?: gsap.TweenVars;
    threshold?: number;
    rootMargin?: string;
    textAlign?: "left" | "right" | "center" | "justify" | "start" | "end";
    tag?: string;
    onLetterAnimationComplete?: () => void;
    startDelay?: number; // Added to support entry delay
}

const SplitText = ({
    text,
    className = '',
    delay = 30, // Default stagger delay in ms (per character)
    duration = 1.0,
    ease = 'power3.out',
    splitType = 'chars',
    from = { opacity: 0, y: 40 },
    to = { opacity: 1, y: 0 },
    threshold = 0.1,
    rootMargin = '-100px',
    textAlign = 'center',
    tag = 'p',
    onLetterAnimationComplete,
    startDelay = 0 // Initial delay before animation starts
}: SplitTextProps) => {
    const ref = useRef<HTMLParagraphElement>(null);
    const animationCompletedRef = useRef(false);
    const onCompleteRef = useRef(onLetterAnimationComplete);
    const [fontsLoaded, setFontsLoaded] = useState(false);

    // Keep callback ref updated
    useEffect(() => {
        onCompleteRef.current = onLetterAnimationComplete;
    }, [onLetterAnimationComplete]);

    useEffect(() => {
        if (typeof document !== 'undefined') {
            if (document.fonts.status === 'loaded') {
                setFontsLoaded(true);
            } else {
                document.fonts.ready.then(() => {
                    setFontsLoaded(true);
                });
            }
        }
    }, []);

    useGSAP(
        () => {
            if (!ref.current || !text || !fontsLoaded) return;
            // Prevent re-animation if already completed
            if (animationCompletedRef.current) return;
            const el = ref.current;

            // @ts-ignore
            if (el._rbsplitInstance) {
                // @ts-ignore
                try { el._rbsplitInstance.revert(); } catch (_) { }
                // @ts-ignore
                el._rbsplitInstance = null;
            }

            const startPct = (1 - threshold) * 100;
            const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
            const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
            const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
            const sign =
                marginValue === 0
                    ? ''
                    : marginValue < 0
                        ? `-=${Math.abs(marginValue)}${marginUnit}`
                        : `+=${marginValue}${marginUnit}`;
            const start = `top ${startPct}%${sign}`;

            let targets: any;
            const assignTargets = (self: any) => {
                if (splitType.includes('chars') && self.chars.length) targets = self.chars;
                if (!targets && splitType.includes('words') && self.words.length) targets = self.words;
                if (!targets && splitType.includes('lines') && self.lines.length) targets = self.lines;
                if (!targets) targets = self.chars || self.words || self.lines;
            };

            // Check if GSAPSplitText is available
            if (typeof GSAPSplitText === 'undefined') {
                console.warn("GSAPSplitText plugin is missing. Text will not animate.");
                gsap.to(el, { opacity: 1, duration: 0.5 }); // Fallback simple fade in
                return;
            }

            try {
                // @ts-ignore
                const splitInstance = new GSAPSplitText(el, {
                    type: splitType,
                    smartWrap: true,
                    autoSplit: splitType === 'lines',
                    linesClass: 'split-line',
                    wordsClass: 'split-word',
                    charsClass: 'split-char',
                    reduceWhiteSpace: false,
                    onSplit: (self: any) => {
                        assignTargets(self);
                        return gsap.fromTo(
                            targets,
                            { ...from },
                            {
                                ...to,
                                duration,
                                ease,
                                stagger: delay / 1000,
                                delay: startDelay / 1000,
                                scrollTrigger: {
                                    trigger: el,
                                    start,
                                    once: true,
                                    fastScrollEnd: true,
                                    anticipatePin: 0.4
                                },
                                onComplete: () => {
                                    animationCompletedRef.current = true;
                                    onCompleteRef.current?.();
                                },
                                willChange: 'transform, opacity',
                                force3D: true
                            }
                        );
                    }
                });
                // @ts-ignore
                el._rbsplitInstance = splitInstance;
            } catch (e) {
                console.error("Error initializing SplitText", e);
                gsap.to(el, { opacity: 1, duration: 0.3 });
            }

            return () => {
                ScrollTrigger.getAll().forEach(st => {
                    if (st.trigger === el) st.kill();
                });
                try {
                    // @ts-ignore
                    if (el._rbsplitInstance) el._rbsplitInstance.revert();
                } catch (_) { }
                // @ts-ignore
                el._rbsplitInstance = null;
            };
        },
        {
            dependencies: [
                text,
                delay,
                duration,
                ease,
                splitType,
                JSON.stringify(from),
                JSON.stringify(to),
                threshold,
                rootMargin,
                fontsLoaded,
                startDelay
            ],
            scope: ref
        }
    );

    const renderTag = () => {
        const style: React.CSSProperties = {
            textAlign,
            wordWrap: 'break-word',
            willChange: 'transform, opacity'
        };
        const classes = `split-parent overflow-hidden inline-block whitespace-normal ${className}`;
        
        const Component = tag as any;

        return (
            <Component ref={ref} style={style} className={classes}>
                {text}
            </Component>
        );
    };
    return renderTag();
};

export default SplitText;
