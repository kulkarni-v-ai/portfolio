'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { Html } from '@react-three/drei';
import { useStore } from '@/store/useStore';

interface FloatingModuleProps {
    position: [number, number, number];
    children: React.ReactNode;
    orbitRadius?: number;
    orbitSpeed?: number;
}

export default function FloatingModule({
    position,
    children,
    orbitRadius = 5,
    orbitSpeed = 0.2,
}: FloatingModuleProps) {
    const bodyRef = useRef<RapierRigidBody>(null);

    // Random phase offset so multiple modules don't clump together
    const randomPhase = useMemo(() => Math.random() * Math.PI * 2, []);

    useFrame((state, delta) => {
        if (!bodyRef.current) return;

        const { cursorPosition, scrollProgress } = useStore.getState();
        const time = state.clock.getElapsedTime();

        // Calculate target orbit position based on time, speed, and scroll
        // Expand orbital field as we scroll down to make it feel more expansive
        const currentRadius = orbitRadius + scrollProgress * 6;
        const currentSpeed = orbitSpeed + scrollProgress * 0.3;

        const targetX = Math.cos(time * currentSpeed + randomPhase) * currentRadius;

        // Add a secondary slow vertical drift to the "base" height
        const verticalDrift = Math.sin(time * 0.3 + randomPhase) * 2;
        const targetY = position[1] + verticalDrift + Math.sin(time * currentSpeed * 0.5 + randomPhase) * 1.5;

        const targetZ = Math.sin(time * currentSpeed + randomPhase) * currentRadius;

        const currentPos = bodyRef.current.translation();

        // Soft spring force pulling the module toward its orbit position
        // Keeping the multiplier low prevents snapping and game-like jerking
        const forceX = (targetX - currentPos.x) * 0.3;
        const forceY = (targetY - currentPos.y) * 0.3;
        const forceZ = (targetZ - currentPos.z) * 0.3;

        // Magnetic cursor hover (repel)
        // Map normalized 2D cursor (-1 to 1) to rough 3D screen space coordinates
        const cursor3DX = cursorPosition.x * 12;
        const cursor3DY = cursorPosition.y * 12;

        const dx = currentPos.x - cursor3DX;
        const dy = currentPos.y - cursor3DY;
        const dDist = Math.sqrt(dx * dx + dy * dy);

        let repelX = 0;
        let repelY = 0;

        // Apply soft repulsive force if cursor is near
        if (dDist < 4.0) {
            const repelForce = (4.0 - dDist) * 1.5;
            repelX = (dx / dDist) * repelForce;
            repelY = (dy / dDist) * repelForce;
        }

        // Apply combined soft impulses directly to the physics body
        // Boosted force multiplier to ensure movement is visible
        bodyRef.current.applyImpulse({
            x: (forceX + repelX) * delta * 15,
            y: (forceY + repelY) * delta * 15,
            z: forceZ * delta * 15,
        }, true);
    });

    return (
        <RigidBody
            ref={bodyRef}
            position={position}
            linearDamping={2.5}  // High damping for sluggish, space-like calm motion
            angularDamping={2.5}
            gravityScale={0}     // Anti-gravity
            canSleep={false}
            colliders="hull"     // Simple collisions between floating modules
        >
            {/* Invisible bounding box for physics collisions so they bounce off each other softly */}
            <mesh visible={false}>
                <boxGeometry args={[3.2, 2.2, 0.5]} />
            </mesh>

            {/* Futuristic Glass UI Panel */}
            <Html
                transform
                distanceFactor={10}
                position={[0, 0, 0]}
                occlude="blending"
                className="pointer-events-auto"
            >
                <div className="w-52 p-3 rounded-lg border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_0_30px_rgba(0,180,255,0.05)] transition-all duration-500 hover:border-blue-500/40 hover:bg-blue-900/10 hover:shadow-[0_0_40px_rgba(0,150,255,0.2)] text-white cursor-pointer select-none">
                    {children}
                </div>
            </Html>
        </RigidBody>
    );
}
