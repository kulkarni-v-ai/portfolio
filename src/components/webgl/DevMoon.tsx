'use client';

import { useRef, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { soundManager } from '@/lib/sounds';
import { useStore } from '@/store/useStore';

interface DevMoonProps {
    name: string;
    color: string;
    icon: string;
    slug: string;
    description?: string;
    proficiency?: number;
    orbitRadius: number;
    orbitSpeed: number;
    phaseShift: number;
    inclination: number;
}

export default function DevMoon({
    name,
    color,
    icon,
    slug,
    description = '',
    proficiency = 80,
    orbitRadius,
    orbitSpeed,
    phaseShift,
    inclination
}: DevMoonProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const [opacity, setOpacity] = useState(1);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const frozenAngleRef = useRef<number | null>(null);

    useFrame((state) => {
        if (!groupRef.current) return;

        const time = state.clock.getElapsedTime();

        // Pause orbit when hovered or expanded — freeze at current angle
        let angle: number;
        if (isHovered || isExpanded) {
            if (frozenAngleRef.current === null) {
                frozenAngleRef.current = time * orbitSpeed + phaseShift;
            }
            angle = frozenAngleRef.current;
        } else {
            frozenAngleRef.current = null;
            angle = time * orbitSpeed + phaseShift;
        }

        const x = Math.cos(angle) * orbitRadius;
        const z = Math.sin(angle) * orbitRadius;
        const y = Math.sin(angle) * Math.sin(inclination) * orbitRadius;

        groupRef.current.position.set(x, y, z);

        if (meshRef.current) {
            meshRef.current.rotation.y += isHovered ? 0.005 : 0.02;
            const targetScale = isHovered ? 1.5 : 1;
            meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);
        }

        const depthOpacity = z < -2 ? THREE.MathUtils.smoothstep(z, -10, -2) : 1;
        const targetOpacity = Math.max(0.1, depthOpacity);
        if (Math.abs(opacity - targetOpacity) > 0.01) {
            setOpacity(THREE.MathUtils.lerp(opacity, targetOpacity, 0.1));
        }
    });

    const iconUrl = `https://cdn.simpleicons.org/${icon}/${color.replace('#', '')}`;
    const startTransition = useStore(state => state.startTransition);

    const handleClick = useCallback(() => {
        soundManager.init();
        soundManager.playClick();
        setIsExpanded(!isExpanded);

        // Navigate on click
        startTransition(`/blog/${slug}`);
    }, [isExpanded, slug, startTransition]);

    const handlePointerOver = useCallback(() => {
        setIsHovered(true);
        soundManager.init();
        soundManager.playHover();
        document.body.style.cursor = 'pointer';
    }, []);

    const handlePointerOut = useCallback(() => {
        setIsHovered(false);
        document.body.style.cursor = 'default';
    }, []);

    return (
        <group ref={groupRef}>
            {/* Clickable sphere — larger hitbox for easier clicking */}
            <mesh
                ref={meshRef}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
                onClick={(e) => { e.stopPropagation(); handleClick(); }}
                renderOrder={3}
            >
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={isHovered ? 3.0 : isExpanded ? 2.5 : 1.5}
                    metalness={0.9}
                    roughness={0.1}
                    transparent
                    opacity={opacity}
                    depthTest={true}
                />
            </mesh>

            {/* Invisible larger hitbox for easier hover/click */}
            <mesh
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
                onClick={(e) => { e.stopPropagation(); handleClick(); }}
            >
                <sphereGeometry args={[0.7, 8, 8]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>

            {/* Glow ring */}
            {(isHovered || isExpanded) && (
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.45, 0.65, 32]} />
                    <meshBasicMaterial
                        color={color}
                        transparent
                        opacity={isHovered ? 0.5 : 0.3}
                        side={THREE.DoubleSide}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            )}

            {isHovered && (
                <pointLight intensity={10} color={color} distance={5} decay={2} />
            )}

            <Html
                distanceFactor={10}
                position={[0, 0.9, 0]}
                center
                occlude="blending"
                style={{
                    opacity,
                    transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
                    transform: `scale(${opacity * 0.5 + 0.5})`,
                }}
                className="pointer-events-auto select-none"
            >
                <div
                    onClick={() => handleClick()}
                    onMouseEnter={() => { setIsHovered(true); soundManager.init(); soundManager.playHover(); }}
                    onMouseLeave={() => setIsHovered(false)}
                    className="cursor-pointer"
                >
                    {/* Label pill */}
                    <div
                        style={{
                            borderColor: `${color}55`,
                            background: isHovered ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0.85)',
                            boxShadow: isHovered
                                ? `0 0 30px ${color}55, 0 0 2px ${color}88`
                                : `0 0 15px ${color}22`,
                        }}
                        className={`flex items-center gap-2 px-3 py-2 backdrop-blur-xl border transition-all duration-300 hover:scale-110 ${isExpanded ? 'rounded-t-xl rounded-b-none' : 'rounded-full'}`}
                    >
                        <div className="w-4 h-4 flex items-center justify-center">
                            <img
                                src={iconUrl}
                                alt={name}
                                className="w-full h-full object-contain"
                                onLoad={(e) => (e.currentTarget.style.opacity = '1')}
                                style={{ opacity: 0, transition: 'opacity 0.5s' }}
                            />
                        </div>
                        <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-white/90 uppercase whitespace-nowrap">
                            {name}
                        </span>
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none"
                            className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                            <path d="M1 3L4 6L7 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    {/* Expanded panel */}
                    {isExpanded && (
                        <div
                            className="px-4 py-3 backdrop-blur-xl border border-t-0 rounded-b-xl"
                            style={{
                                borderColor: `${color}55`,
                                background: 'rgba(0, 0, 0, 0.95)',
                                boxShadow: `0 12px 40px ${color}22`,
                                minWidth: '210px',
                            }}
                        >
                            {description && (
                                <p className="text-[10px] text-white/50 leading-relaxed mb-3" style={{ fontFamily: 'var(--font-base)' }}>
                                    {description}
                                </p>
                            )}

                            {/* Proficiency */}
                            <div className="mb-2">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[7px] font-mono uppercase tracking-[0.3em] text-white/30">Proficiency</span>
                                    <span className="text-[9px] font-mono font-bold" style={{ color }}>{proficiency}%</span>
                                </div>
                                <div className="w-full h-[4px] bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000"
                                        style={{
                                            width: `${proficiency}%`,
                                            background: `linear-gradient(90deg, ${color}88, ${color})`,
                                            boxShadow: `0 0 10px ${color}66`,
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-white/5">
                                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: color }} />
                                <span className="text-[7px] font-mono text-white/20 uppercase tracking-wider">
                                    Orbit paused • Click to dismiss
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </Html>
        </group>
    );
}
