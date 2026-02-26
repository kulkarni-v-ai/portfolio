'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Preload } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { useCardStore } from '@/store/useCardStore';
import AICore from './AICore';
import DeepSpace from './DeepSpace';
import AcademicModule from './AcademicModule';
import EnergyCluster from './EnergyCluster';
import Galaxy from './webgl/Galaxy';
import TechPlanet from './webgl/TechPlanet';

function SceneController() {
    const gestureZoomRef = useRef(0);
    const gestureRotateRef = useRef({ x: 0, y: 0 });

    // Listen for gesture events
    useEffect(() => {
        const handler = (e: Event) => {
            const { action, direction, x, y } = (e as CustomEvent).detail;
            if (action === 'zoom') {
                gestureZoomRef.current += direction === 'in' ? -2 : 2;
                gestureZoomRef.current = THREE.MathUtils.clamp(gestureZoomRef.current, -10, 10);
            }
            if (action === 'rotate') {
                gestureRotateRef.current = { x: (x - 0.5) * 4, y: (y - 0.5) * 4 };
            }
        };
        window.addEventListener('vanyx-gesture', handler);
        return () => window.removeEventListener('vanyx-gesture', handler);
    }, []);

    useFrame((state) => {
        const { scrollProgress } = useStore.getState();
        const camera = state.camera as THREE.PerspectiveCamera;
        const aspect = state.size.width / state.size.height;
        const isMobile = aspect < 1;

        const baseFOV = isMobile ? 60 : 45;
        const targetFOV = baseFOV - scrollProgress * 15 + gestureZoomRef.current;

        if (camera.isPerspectiveCamera) {
            camera.fov = THREE.MathUtils.lerp(camera.fov, targetFOV, 0.05);
            camera.updateProjectionMatrix();
        }

        let targetX = 0;
        if (!isMobile) {
            if (scrollProgress > 0.1 && scrollProgress < 0.5) {
                targetX = -3;
            } else if (scrollProgress >= 0.5 && scrollProgress < 0.9) {
                targetX = 3;
            }
        }

        // Apply gesture rotation
        targetX += gestureRotateRef.current.x;
        const targetY = gestureRotateRef.current.y * 0.5;

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.03);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.03);

        // Decay gesture values
        gestureZoomRef.current *= 0.98;
        gestureRotateRef.current.x *= 0.95;
        gestureRotateRef.current.y *= 0.95;
    });

    return null;
}

function CardStoreInitializer() {
    const initialize = useCardStore((s) => s.initialize);
    useEffect(() => { initialize(); }, [initialize]);
    return null;
}

function DynamicModules() {
    const courses = useCardStore((s) => s.courses);
    const coCurriculars = useCardStore((s) => s.coCurriculars);

    return (
        <>
            {courses.map((course, index) => (
                <AcademicModule
                    key={course.id}
                    course={course}
                    index={index}
                    totalCourses={courses.length}
                />
            ))}
            {coCurriculars.map((item, index) => (
                <EnergyCluster
                    key={item.id}
                    data={item}
                    index={index}
                    total={coCurriculars.length}
                />
            ))}
        </>
    );
}

export default function Scene() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-[#050505]">
            <Canvas
                camera={{ position: [0, 0, 10], fov: 45 }}
                dpr={[1, 2]}
                gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
                style={{ pointerEvents: 'auto' }}
            >
                <Suspense fallback={null}>
                    <CardStoreInitializer />
                    <SceneController />
                    <Environment preset="city" />
                    <ambientLight intensity={0.2} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />

                    <DeepSpace />
                    <Galaxy />
                    <TechPlanet />

                    <Physics gravity={[0, 0, 0]}>
                        <AICore />
                        <DynamicModules />
                    </Physics>

                    <Preload all />
                </Suspense>
            </Canvas>
        </div>
    );
}
