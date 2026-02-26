'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';

const vertexShader = `
uniform float uTime;
uniform float uSize;

attribute float aScale;
attribute vec3 aRandomness;

varying vec3 vColor;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Spin
    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCenter = length(modelPosition.xz);
    float angleOffset = (1.0 / distanceToCenter) * uTime * 0.2;
    angle += angleOffset;
    
    modelPosition.x = cos(angle) * distanceToCenter;
    modelPosition.z = sin(angle) * distanceToCenter;

    // Randomness
    modelPosition.xyz += aRandomness;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Size
    gl_PointSize = uSize * aScale;
    gl_PointSize *= (1.0 / - viewPosition.z);

    vColor = color;
}
`;

const fragmentShader = `
varying vec3 vColor;

void main() {
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    float strength = 0.05 / distanceToCenter;
    strength = pow(strength, 2.0);

    vec3 color = mix(vec3(0.0), vColor, strength);
    gl_FragColor = vec4(color, 1.0);
}
`;

export default function Galaxy() {
    const pointsRef = useRef<THREE.Points>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const parameters = useMemo(() => ({
        count: 50000,
        size: 25,
        radius: 60,
        branches: 3,
        spin: 1,
        randomness: 0.2,
        randomnessPower: 3,
        insideColor: '#ff6030',
        outsideColor: '#1b3984'
    }), []);

    const [positions, colors, scales, randomness] = useMemo(() => {
        const pos = new Float32Array(parameters.count * 3);
        const col = new Float32Array(parameters.count * 3);
        const sca = new Float32Array(parameters.count);
        const ran = new Float32Array(parameters.count * 3);

        const colorInside = new THREE.Color(parameters.insideColor);
        const colorOutside = new THREE.Color(parameters.outsideColor);

        for (let i = 0; i < parameters.count; i++) {
            const i3 = i * 3;

            // Position
            const radius = Math.random() * parameters.radius;
            const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;
            const spinAngle = radius * parameters.spin;

            pos[i3] = Math.cos(branchAngle + spinAngle) * radius;
            pos[i3 + 1] = 0;
            pos[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius;

            // Randomness
            const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
            const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
            const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;

            ran[i3] = randomX;
            ran[i3 + 1] = randomY;
            ran[i3 + 2] = randomZ;

            // Color
            const mixedColor = colorInside.clone();
            mixedColor.lerp(colorOutside, radius / parameters.radius);

            col[i3] = mixedColor.r;
            col[i3 + 1] = mixedColor.g;
            col[i3 + 2] = mixedColor.b;

            // Scale
            sca[i] = Math.random();
        }

        return [pos, col, sca, ran];
    }, [parameters]);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uSize: { value: parameters.size }
    }), [parameters.size]);

    useFrame((state, delta) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value += delta;
        }
        if (pointsRef.current) {
            // Very slow background rotation
            pointsRef.current.rotation.y += delta * 0.02;
        }
    });

    return (
        <points ref={pointsRef} position={[0, -20, -100]} rotation={[Math.PI / 6, 0, 0]} renderOrder={-1}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={parameters.count}
                    array={positions}
                    itemSize={3}
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={parameters.count}
                    array={colors}
                    itemSize={3}
                    args={[colors, 3]}
                />
                <bufferAttribute
                    attach="attributes-aScale"
                    count={parameters.count}
                    array={scales}
                    itemSize={1}
                    args={[scales, 1]}
                />
                <bufferAttribute
                    attach="attributes-aRandomness"
                    count={parameters.count}
                    array={randomness}
                    itemSize={3}
                    args={[randomness, 3]}
                />
            </bufferGeometry>
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
                depthTest={false}
                blending={THREE.AdditiveBlending}
                vertexColors={true}
            />
        </points>
    );
}
