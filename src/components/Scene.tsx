'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, Stars, Preload } from '@react-three/drei';
import { Suspense } from 'react';

export default function Scene() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-[#050505]">
            <Canvas
                camera={{ position: [0, 0, 10], fov: 45 }}
                dpr={[1, 2]} // Optimize for pixel density while capping at 2 for performance
                gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
            >
                <Suspense fallback={null}>
                    <Environment preset="city" />
                    <ambientLight intensity={0.2} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />

                    <Stars
                        radius={100}
                        depth={50}
                        count={5000}
                        factor={4}
                        saturation={0}
                        fade
                        speed={1}
                    />

                    {/* Replace this with actual models/particles in the future */}
                    {/* <AICore /> */}

                    <Preload all />
                </Suspense>
            </Canvas>
        </div>
    );
}
