'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useCardStore } from '@/store/useCardStore';
import { useStore } from '@/store/useStore';
import { soundManager } from '@/lib/sounds';

const categoryColors: Record<string, string> = {
    'Core CS': '#3b82f6',
    'Machine Learning / AI': '#a855f7',
    'Systems': '#10b881',
    'Networking': '#f59e0b',
    'Programming': '#f43f5e',
    'Electives': '#14b8a6',
    'Hackathon': '#ff00ff',
    'Club': '#ffff00',
    'Leadership': '#00ffff',
    'Event': '#ff4d00',
};

export default function CardCarousel() {
    const courses = useCardStore((s) => s.courses);
    const coCurriculars = useCardStore((s) => s.coCurriculars);
    const initialize = useCardStore((s) => s.initialize);
    const startTransition = useStore((s) => s.startTransition);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isAutoRotating, setIsAutoRotating] = useState(true);
    const autoResumeRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => { initialize(); }, [initialize]);

    const allItems = [
        ...courses.map(c => ({ ...c, type: 'course' as const, accent: categoryColors[c.category] || '#00b4ff' })),
        ...coCurriculars.map(c => ({ ...c, type: 'activity' as const, accent: categoryColors[c.category] || '#00b4ff', skills: [] as string[] })),
    ];

    const total = allItems.length;

    // Auto-rotation
    useEffect(() => {
        if (!isAutoRotating || total === 0) return;
        const interval = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % total);
        }, 1200); // Super fast rotation
        return () => clearInterval(interval);
    }, [isAutoRotating, total]);

    const goTo = useCallback((index: number) => {
        setIsAutoRotating(false);
        setActiveIndex(((index % total) + total) % total);
        if (autoResumeRef.current) clearTimeout(autoResumeRef.current);
        autoResumeRef.current = setTimeout(() => setIsAutoRotating(true), 2500); // Quick resume
    }, [total]);

    // Listen for gesture events from GestureController
    useEffect(() => {
        const handler = (e: Event) => {
            const { action } = (e as CustomEvent).detail;
            if (action === 'carousel_next') goTo(activeIndex + 1);
            if (action === 'carousel_prev') goTo(activeIndex - 1);
        };
        window.addEventListener('vanyx-gesture', handler);
        return () => window.removeEventListener('vanyx-gesture', handler);
    }, [goTo, activeIndex]);

    const handleCardClick = (slug: string, index: number) => {
        if (index === activeIndex) {
            soundManager.init();
            soundManager.playClick();
            startTransition(`/blog/${slug}`);
        } else {
            soundManager.init();
            soundManager.playHover();
            goTo(index);
        }
    };

    if (total === 0) return null;

    // Card positioning
    const getCardStyle = (index: number) => {
        let offset = index - activeIndex;
        if (offset > total / 2) offset -= total;
        if (offset < -total / 2) offset += total;

        const isActive = offset === 0;
        const absOffset = Math.abs(offset);
        if (absOffset > 4) return null;

        // Tighter X-spacing, deeper Z-spacing for a stronger 3D ring effect
        const x = offset * 240;
        const z = -absOffset * 180;
        const y = Math.sin(offset) * 20; // Slight wave effect

        // Stronger Y rotation to face inwards like a cylinder
        const rotY = offset * -25;

        const scale = isActive ? 1.05 : Math.max(0.6, 1 - absOffset * 0.18);
        const opacity = isActive ? 1 : Math.max(0.15, 1 - absOffset * 0.25);

        return { x, y, z, rotY, scale, opacity, isActive, absOffset };
    };

    return (
        <section className="relative z-20 py-20 pointer-events-auto overflow-hidden">
            {/* Header */}
            <div className="px-8 md:px-24 mb-12 text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="w-8 h-px bg-cyan-500/30" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-cyan-400/60">All Modules</span>
                    <div className="w-8 h-px bg-cyan-500/30" />
                </div>
                <h2 className="text-heading text-white text-xl md:text-2xl" style={{ fontFamily: 'var(--font-funky)' }}>
                    Explore the Archive
                </h2>
            </div>

            {/* 3D Carousel */}
            <div
                className="relative w-full h-[400px] md:h-[440px]"
                style={{ perspective: '1400px' }}
                onMouseEnter={() => setIsAutoRotating(false)}
                onMouseLeave={() => setIsAutoRotating(true)}
            >
                {/* Floating glow */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[500px] h-[60px] rounded-full opacity-15"
                    style={{ background: 'radial-gradient(ellipse, rgba(0,180,255,0.4), transparent 70%)', filter: 'blur(25px)' }} />

                {/* Cards */}
                <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
                    {allItems.map((item, i) => {
                        const style = getCardStyle(i);
                        if (!style) return null;

                        return (
                            <div
                                key={item.id}
                                className="absolute transition-all duration-500" // matched fast speed
                                style={{
                                    transform: `translateX(${style.x}px) translateY(${style.y}px) translateZ(${style.z}px) rotateY(${style.rotY}deg) scale(${style.scale})`,
                                    opacity: style.opacity,
                                    zIndex: 10 - style.absOffset,
                                    transformStyle: 'preserve-3d',
                                    transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)'
                                }}
                            >
                                <div
                                    onClick={() => handleCardClick(item.slug, i)}
                                    onMouseEnter={() => { soundManager.init(); soundManager.playHover(); }}
                                    className={`w-[260px] md:w-[280px] p-5 rounded-xl border backdrop-blur-2xl cursor-pointer select-none transition-all duration-500 ${style.isActive
                                        ? 'border-white/15 bg-black/85'
                                        : 'border-white/5 bg-black/60 hover:bg-black/70'
                                        }`}
                                    style={{
                                        boxShadow: style.isActive
                                            ? `0 25px 80px rgba(0,0,0,0.9), 0 0 3px ${item.accent}44, 0 0 50px ${item.accent}10`
                                            : '0 10px 40px rgba(0,0,0,0.7)',
                                    }}
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-1.5 h-3 rounded-full" style={{ backgroundColor: item.accent }} />
                                        <span className="text-[8px] font-mono uppercase tracking-[0.25em] text-white/35">{item.category}</span>
                                        <div className="flex-1" />
                                        <span className="text-[7px] font-mono text-white/12">{item.id}</span>
                                    </div>

                                    <h3 className="text-[14px] md:text-[15px] font-bold text-white uppercase tracking-tight leading-tight mb-2"
                                        style={{ fontFamily: 'var(--font-funky)' }}>
                                        {item.title}
                                    </h3>

                                    <div className={`h-0.5 mb-3 transition-all duration-700 rounded-full ${style.isActive ? 'w-full' : 'w-0'}`}
                                        style={{ backgroundColor: item.accent }} />

                                    <p className="text-[11px] text-white/40 leading-relaxed line-clamp-2 mb-3"
                                        style={{ fontFamily: 'var(--font-base)' }}>
                                        {item.description}
                                    </p>

                                    {item.type === 'course' && item.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {item.skills.slice(0, 3).map(s => (
                                                <span key={s} className="text-[7px] font-mono bg-white/5 px-1.5 py-0.5 rounded text-white/25 border border-white/5">{s}</span>
                                            ))}
                                        </div>
                                    )}
                                    {'role' in item && item.role && (
                                        <div className="px-2 py-1 rounded-sm bg-white/5 border-l-2 text-[8px] font-mono text-white/40 mb-3"
                                            style={{ borderLeftColor: item.accent }}>
                                            {item.role}
                                        </div>
                                    )}

                                    {style.isActive && (
                                        <div className="flex items-center gap-2 pt-2 border-t border-white/5 animate-fadeIn">
                                            <span className="text-[9px] font-mono uppercase tracking-[0.3em]" style={{ color: item.accent }}>Launch</span>
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                <path d="M2 6H10M10 6L7 3M10 6L7 9" stroke={item.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <div className="flex-1" />
                                            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: item.accent }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Navigation Dots */}
            <div className="flex items-center justify-center gap-6 mt-6">
                <div className="flex items-center gap-1.5">
                    {allItems.map((item, i) => (
                        <button
                            key={item.id}
                            onClick={() => goTo(i)}
                            className={`rounded-full transition-all duration-300 ${i === activeIndex ? 'w-5 h-1.5' : 'w-1.5 h-1.5 hover:opacity-60'
                                }`}
                            style={{
                                backgroundColor: i === activeIndex ? item.accent : 'rgba(255,255,255,0.12)',
                                boxShadow: i === activeIndex ? `0 0 8px ${item.accent}66` : 'none',
                            }}
                        />
                    ))}
                </div>
            </div>

            <p className="text-center mt-4 text-[8px] font-mono text-white/10 uppercase tracking-wider">
                Hover edges to scroll • Click active card to launch • Use gestures ☝
            </p>
        </section>
    );
}
