'use client';

import { CoCurricular, ClusterCategory } from '@/data/cocurricular';
import FloatingModule from './FloatingModule';
import { Sparkles } from '@react-three/drei';
import { useMemo } from 'react';

// Distinct color mapping for co-curricular clusters
const categoryStyles: Record<ClusterCategory, { color: string, glow: string, border: string }> = {
    'Hackathon': {
        color: '#ff00ff', // Magenta
        glow: 'shadow-[0_0_20px_rgba(255,0,255,0.4)]',
        border: 'border-magenta-500/30',
    },
    'Club': {
        color: '#ffff00', // Yellow/Gold
        glow: 'shadow-[0_0_20px_rgba(255,255,0,0.4)]',
        border: 'border-yellow-500/30',
    },
    'Leadership': {
        color: '#00ffff', // Cyan but brighter
        glow: 'shadow-[0_0_20px_rgba(0,255,255,0.4)]',
        border: 'border-cyan-500/30',
    },
    'Event': {
        color: '#ff4d00', // Neon Orange
        glow: 'shadow-[0_0_20px_rgba(255,77,0,0.4)]',
        border: 'border-orange-500/30',
    }
};

interface EnergyClusterProps {
    data: CoCurricular;
    index: number;
    total: number;
}

export default function EnergyCluster({ data, index, total }: EnergyClusterProps) {
    const style = categoryStyles[data.category];

    const [position, orbitSpeed] = useMemo(() => {
        // These orbit TIGHTER (closer to core) and FASTER
        const angle = (index / total) * Math.PI * 2;
        const radius = 6 + (index % 2) * 3; // Pushed out to 6-9 range
        const height = (Math.random() - 0.5) * 6;

        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        // Significantly faster than academic modules (0.4 - 0.6)
        const speed = 0.4 + (index % 3) * 0.1;

        return [[x, height, z] as [number, number, number], speed];
    }, [index, total]);

    return (
        <FloatingModule
            position={position}
            orbitRadius={Math.sqrt(position[0] ** 2 + position[2] ** 2)}
            orbitSpeed={orbitSpeed}
        >
            <div
                onClick={() => alert(`Engaging Energy Phase: ${data.title}\nRole: ${data.role}`)}
                className={`relative p-3 rounded-lg border border-white/10 bg-black/80 backdrop-blur-2xl overflow-hidden group transition-all duration-300 hover:scale-105 cursor-pointer active:scale-95 ${style.glow}`}
            >
                {/* Particle Emitter Simulation (Drei Sparkles inside the 3D space) */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    {/* Note: Sparkles is a R3F component, it must be sibling or child of mesh.
               Since this is inside <Html>, we can't put Sparkles here.
               We'll place it as a sibling to the Html inside FloatingModule if we want it in 3D,
               or use CSS animations here. Let's stick to CSS/SVG for the "inner" glow here. */}
                </div>

                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-1.5 h-1.5 rounded-full animate-pulse"
                            style={{ backgroundColor: style.color }}
                        />
                        <span
                            style={{ fontFamily: 'var(--font-funky)' }}
                            className="text-[9px] opacity-60 uppercase tracking-widest text-white/80"
                        >
                            {data.category}
                        </span>
                    </div>

                    <h4
                        style={{ fontFamily: 'var(--font-funky)' }}
                        className="text-sm font-bold text-white leading-tight uppercase tracking-tight"
                    >
                        {data.title}
                    </h4>

                    <p
                        style={{ fontFamily: 'var(--font-base)' }}
                        className="text-[11px] text-white/40 font-medium"
                    >
                        {data.role}
                    </p>

                    <p
                        style={{ fontFamily: 'var(--font-base)' }}
                        className="text-[10px] text-white/20 hidden group-hover:block mt-2 italic leading-tight"
                    >
                        {data.description}
                    </p>
                </div>
            </div>

            {/* 3D Particle Trail - This sits in the actual WebGL space */}
            <Sparkles
                count={20}
                scale={2}
                size={2}
                speed={0.5}
                opacity={0.3}
                color={style.color}
            />
        </FloatingModule>
    );
}
