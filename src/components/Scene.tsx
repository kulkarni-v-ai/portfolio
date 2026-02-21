'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Preload } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { Suspense } from 'react';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import AICore from './AICore';
import DeepSpace from './DeepSpace';
import AcademicModule from './AcademicModule';
import EnergyCluster from './EnergyCluster';
import { coursesData } from '@/data/courses';
import { coCurricularData } from '@/data/cocurricular';

function SceneController() {
    useFrame((state) => {
        const { scrollProgress } = useStore.getState();

        // Use type assertion to access PerspectiveCamera specific properties
        const camera = state.camera as THREE.PerspectiveCamera;

        // 1. Zoom Camera (FOV) based on scroll
        const targetFOV = 45 - scrollProgress * 15;
        if (camera.isPerspectiveCamera) {
            camera.fov = THREE.MathUtils.lerp(camera.fov, targetFOV, 0.05);
            camera.updateProjectionMatrix();
        }

        // 2. Lateral Camera Shift (Slide to side for text sections)
        let targetX = 0;
        if (scrollProgress > 0.1 && scrollProgress < 0.5) {
            targetX = -3; // Camera moves left -> Core appears right
        } else if (scrollProgress >= 0.5 && scrollProgress < 0.9) {
            targetX = 3; // Camera moves right -> Core appears left
        }

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.03);
    });

    return null;
}

export default function Scene() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-[#050505]">
            <Canvas
                camera={{ position: [0, 0, 10], fov: 45 }}
                dpr={[1, 2]} // Optimize for pixel density while capping at 2 for performance
                gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
            >
                <Suspense fallback={null}>
                    <SceneController />
                    <Environment preset="city" />
                    <ambientLight intensity={0.2} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />

                    <DeepSpace />

                    <Physics gravity={[0, 0, 0]}>
                        <AICore />

                        {/* Statically map over coursesData to create orbiting academic modules */}
                        {coursesData.map((course, index) => (
                            <AcademicModule
                                key={course.id}
                                course={course}
                                index={index}
                                totalCourses={coursesData.length}
                            />
                        ))}

                        {/* Co-curricular Energy Clusters */}
                        {coCurricularData.map((item, index) => (
                            <EnergyCluster
                                key={item.id}
                                data={item}
                                index={index}
                                total={coCurricularData.length}
                            />
                        ))}
                    </Physics>

                    <Preload all />
                </Suspense>
            </Canvas>
        </div>
    );
}
