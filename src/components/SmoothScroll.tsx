'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useStore } from '@/store/useStore';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    const setScrollProgress = useStore((state) => state.setScrollProgress);
    const gestureActive = useStore((state) => state.gestureActive);

    // Hide system cursor when gesture mode is on
    useEffect(() => {
        if (gestureActive) {
            document.body.style.cursor = 'none';
        } else {
            document.body.style.cursor = '';
        }
        return () => { document.body.style.cursor = ''; };
    }, [gestureActive]);

    useEffect(() => {
        // Register ScrollTrigger primarily if we use GSAP animations keyed to it
        gsap.registerPlugin(ScrollTrigger);

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
        });

        lenis.on('scroll', (e: any) => {
            // e.progress contains a 0-1 value representing total scroll completion
            setScrollProgress(e.progress);
            ScrollTrigger.update();
        });

        // Tie GSAP's ticker to Lenis' scroll animation loop
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);

        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = -(e.clientY / window.innerHeight) * 2 + 1;
            useStore.getState().setCursorPosition(x, y);
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            gsap.ticker.remove((time) => lenis.raf(time * 1000));
            lenis.destroy();
        };
    }, [setScrollProgress]);

    return <>{children}</>;
}

