'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { soundManager } from '@/lib/sounds';

export default function RocketTransition() {
    const router = useRouter();
    const isTransitioning = useStore((s) => s.isTransitioning);
    const transitionTarget = useStore((s) => s.transitionTarget);
    const endTransition = useStore((s) => s.endTransition);
    const [phase, setPhase] = useState<'idle' | 'launch' | 'warp' | 'arrive'>('idle');

    useEffect(() => {
        if (!isTransitioning || !transitionTarget) return;

        // Initialize sounds on first interaction
        soundManager.init();
        soundManager.playRocketLaunch();

        setPhase('launch');

        const warpTimer = setTimeout(() => setPhase('warp'), 500);
        const navigateTimer = setTimeout(() => {
            router.push(transitionTarget);
        }, 1000);
        const arriveTimer = setTimeout(() => {
            setPhase('arrive');
        }, 1500);
        const doneTimer = setTimeout(() => {
            setPhase('idle');
            endTransition();
        }, 2100);

        return () => {
            clearTimeout(warpTimer);
            clearTimeout(navigateTimer);
            clearTimeout(arriveTimer);
            clearTimeout(doneTimer);
        };
    }, [isTransitioning, transitionTarget, router, endTransition]);

    return (
        <>
            {/* Transparent overlay — 3D scene remains visible behind */}
            <div
                className="fixed inset-0 z-[9998] pointer-events-none"
                style={{
                    background: phase === 'warp'
                        ? 'radial-gradient(ellipse at 50% 100%, rgba(0,180,255,0.08) 0%, transparent 60%)'
                        : 'transparent',
                    transition: 'background 0.3s ease',
                }}
            />

            {/* Speed lines / warp streaks — visible over the 3D canvas */}
            {(phase === 'launch' || phase === 'warp') && (
                <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
                    {Array.from({ length: 60 }).map((_, i) => {
                        const x = Math.random() * 100;
                        const delay = Math.random() * 0.4;
                        const duration = 0.2 + Math.random() * 0.3;
                        const width = 1 + Math.random() * 2;
                        const isCenter = Math.abs(x - 50) < 15;
                        return (
                            <div
                                key={i}
                                className="absolute rounded-full"
                                style={{
                                    width: `${width}px`,
                                    height: phase === 'warp' ? `${30 + Math.random() * 70}%` : '5%',
                                    left: `${x}%`,
                                    top: '-5%',
                                    background: `linear-gradient(180deg, ${isCenter ? 'rgba(0,180,255,0.6)' : 'rgba(255,255,255,0.4)'}, transparent)`,
                                    animation: `warpStreak ${duration}s ${delay}s linear infinite`,
                                    opacity: phase === 'warp' ? 0.7 : 0.3,
                                    transition: 'opacity 0.3s, height 0.3s',
                                }}
                            />
                        );
                    })}
                </div>
            )}

            {/* Plasma Morph Orb */}
            <div
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] pointer-events-none transition-all"
                style={{
                    width: phase === 'idle' ? '0px' : phase === 'warp' ? '300vw' : '0px',
                    height: phase === 'idle' ? '0px' : phase === 'warp' ? '300vw' : '0px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #00f0ff 0%, #0066cc 60%, #050505 100%)',
                    transitionDuration: phase === 'warp' ? '0.8s' : '0.4s',
                    transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)', // Smooth expansion
                    filter: `drop-shadow(0 0 50px rgba(0,255,255,0.8)) blur(${phase === 'warp' ? '0px' : '20px'})`,
                    opacity: phase === 'launch' || phase === 'warp' ? 1 : 0,
                }}
            >
                {/* Inner Brightness */}
                <div
                    className="absolute inset-0 rounded-full animate-pulse z-10"
                    style={{
                        background: 'radial-gradient(circle at center, rgba(255,255,255,0.9) 0%, transparent 40%)'
                    }}
                />
            </div>

            {/* Dark background fade during warp */}
            <div
                className="fixed inset-0 z-[9997] pointer-events-none transition-opacity duration-700"
                style={{
                    backgroundColor: 'rgba(5, 5, 5, 1)',
                    opacity: phase === 'warp' ? 1 : 0,
                }}
            />
        </>
    );
}
