'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { soundManager } from '@/lib/sounds';

export default function MiniOrb() {
    const pathname = usePathname();
    const isHome = pathname === '/';
    const [showTooltip, setShowTooltip] = useState(false);
    const [pulsing, setPulsing] = useState(false);

    // Periodic pulse
    useEffect(() => {
        if (isHome) return;
        const interval = setInterval(() => {
            setPulsing(true);
            setTimeout(() => setPulsing(false), 1500);
        }, 8000);
        return () => clearInterval(interval);
    }, [isHome]);

    // Don't show on home page (full orb is in 3D scene)
    if (isHome) return null;

    return (
        <div className="fixed top-6 left-6 z-[100] pointer-events-auto">
            <div
                className="relative cursor-pointer group"
                onClick={() => {
                    soundManager.init();
                    soundManager.playPing();
                    setShowTooltip(!showTooltip);
                }}
                onMouseEnter={() => {
                    soundManager.init();
                    soundManager.playHover();
                }}
            >
                {/* Glow rings */}
                <div
                    className={`absolute inset-0 rounded-full transition-all duration-1000 ${pulsing ? 'scale-[2.5] opacity-0' : 'scale-100 opacity-30'}`}
                    style={{
                        background: 'radial-gradient(circle, rgba(0,180,255,0.3), transparent 70%)',
                    }}
                />
                <div className="absolute inset-[-4px] rounded-full border border-cyan-500/20 group-hover:border-cyan-500/50 transition-all duration-500" />

                {/* Orb */}
                <div
                    className="w-8 h-8 rounded-full relative overflow-hidden group-hover:scale-110 transition-transform duration-300 flex items-center justify-center"
                    style={{
                        background: 'radial-gradient(circle at 30% 30%, #00f0ff, #0066cc, #001a33)',
                        boxShadow: '0 0 20px rgba(0,180,255,0.4), 0 0 60px rgba(0,180,255,0.15), inset 0 0 20px rgba(0,180,255,0.2)',
                    }}
                >
                    {/* Inner AI Eye */}
                    <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#fff,0_0_15px_#00f0ff] animate-pulse z-10" />

                    {/* Inner shimmer */}
                    <div
                        className="absolute inset-0 rounded-full animate-spin"
                        style={{
                            animationDuration: '6s',
                            background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.1), transparent, rgba(0,200,255,0.1), transparent)',
                        }}
                    />
                </div>

                {/* Status indicator */}
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black shadow-[0_0_6px_rgba(52,211,153,0.6)]">
                    <div className="w-full h-full rounded-full animate-ping bg-emerald-400 opacity-50" />
                </div>
            </div>

            {/* Tooltip */}
            {showTooltip && (
                <div
                    className="absolute top-12 left-0 w-56 p-4 rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl"
                    style={{ boxShadow: '0 0 30px rgba(0,0,0,0.8), 0 0 2px rgba(0,180,255,0.2)' }}
                >
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-cyan-400/60">VANYX AI</span>
                    </div>
                    <p className="text-[11px] text-white/50 leading-relaxed mb-3" style={{ fontFamily: 'var(--font-base)' }}>
                        AI Assistant monitoring your experience. Click cards in the main view to explore modules.
                    </p>
                    <a
                        href="/"
                        className="text-[9px] font-mono uppercase tracking-[0.2em] text-cyan-300/60 hover:text-cyan-300 transition-colors"
                    >
                        ← Return to Core
                    </a>
                </div>
            )}
        </div>
    );
}
