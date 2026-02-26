'use client';

import { CoCurricular, ClusterCategory } from '@/data/cocurricular';
import FloatingModule from './FloatingModule';
import { Sparkles } from '@react-three/drei';
import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { soundManager } from '@/lib/sounds';

const categoryStyles: Record<ClusterCategory, { color: string, glow: string }> = {
    'Hackathon': { color: '#ff00ff', glow: 'rgba(255, 0, 255, 0.3)' },
    'Club': { color: '#ffff00', glow: 'rgba(255, 255, 0, 0.3)' },
    'Leadership': { color: '#00ffff', glow: 'rgba(0, 255, 255, 0.3)' },
    'Event': { color: '#ff4d00', glow: 'rgba(255, 77, 0, 0.3)' },
};

interface EnergyClusterProps {
    data: CoCurricular;
    index: number;
    total: number;
}

export default function EnergyCluster({ data, index, total }: EnergyClusterProps) {
    const startTransition = useStore(state => state.startTransition);
    const style = categoryStyles[data.category];

    const [position, orbitSpeed] = useMemo(() => {
        const angle = (index / total) * Math.PI * 2;
        const radius = 18 + (index % 2) * 6;
        const height = (Math.random() - 0.5) * 15;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const speed = 0.2 + (index % 3) * 0.1;
        return [[x, height, z] as [number, number, number], speed];
    }, [index, total]);

    const handleClick = () => {
        soundManager.init();
        soundManager.playClick();
        startTransition(`/blog/${data.slug}`);
    };

    const handleHover = () => {
        soundManager.init();
        soundManager.playHover();
    };

    return (
        <FloatingModule
            position={position}
            orbitRadius={Math.sqrt(position[0] ** 2 + position[2] ** 2)}
            orbitSpeed={orbitSpeed}
            ui={
                <div
                    onClick={handleClick}
                    onMouseEnter={handleHover}
                    className="relative w-48 p-4 rounded-lg border border-white/10 bg-black/90 backdrop-blur-3xl group transition-all duration-500 cursor-pointer active:scale-95 select-none card-hover-flip"
                    style={{ boxShadow: `0 0 30px rgba(0, 0, 0, 0.7), 0 0 1px ${style.color}66` }}
                >
                    <div className="absolute top-0 right-0 p-1">
                        <div className="text-[7px] font-mono opacity-20 group-hover:opacity-60 transition-opacity">
                            PHASE_{index.toString().padStart(2, '0')}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ backgroundColor: style.color }} />
                            <span className="text-[8px] font-mono uppercase tracking-[0.3em] text-white/40">{data.category}</span>
                        </div>

                        <h4 className="text-[13px] font-bold text-white uppercase tracking-tight leading-tight group-hover:text-white" style={{ fontFamily: 'var(--font-funky)' }}>
                            {data.title}
                        </h4>

                        <div className="px-2 py-0.5 rounded-sm bg-white/5 border-l-2 text-[9px] font-mono text-white/50" style={{ borderLeftColor: style.color }}>
                            {data.role}
                        </div>

                        <p className="text-[10px] text-white/30 hidden group-hover:block transition-all duration-500 italic mt-1 leading-relaxed border-t border-white/5 pt-2">
                            {data.description}
                        </p>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 pt-1">
                            <span className="text-[9px] font-mono uppercase tracking-[0.3em]" style={{ color: style.color }}>Explore</span>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="transition-transform group-hover:translate-x-1 duration-300">
                                <path d="M2 6H10M10 6L7 3M10 6L7 9" stroke={style.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>

                    <div className="mt-3 w-full h-[1px] bg-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 h-full w-2/3 opacity-50" style={{ backgroundColor: style.color }} />
                        <div className="absolute top-0 left-0 h-full w-full animate-progress-glow" style={{ background: `linear-gradient(90deg, transparent, ${style.color}, transparent)` }} />
                    </div>
                </div>
            }
        >
            <Sparkles count={25} scale={2.2} size={2.5} speed={0.6} opacity={0.4} color={style.color} />
        </FloatingModule>
    );
}
