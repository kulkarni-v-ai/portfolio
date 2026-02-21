'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';

const vertexShader = `
uniform float uTime;
uniform float uScroll;
uniform float uParallaxX;
uniform float uParallaxY;
attribute float aSize;

varying vec2 vUv;
varying vec3 vColor;

void main() {
  vUv = uv;
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  
  // Parallax effect based on mouse and scroll
  // The further away (z is more negative), the slower they move
  float zDistance = abs(modelPosition.z);
  modelPosition.x += uParallaxX * 0.05 * zDistance;
  modelPosition.y += uParallaxY * 0.05 * zDistance;
  
  // Downward drift based on scroll
  modelPosition.y += uScroll * 15.0;
  
  // Keep particles looping in view
  modelPosition.y = mod(modelPosition.y + 50.0, 100.0) - 50.0;
  
  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;
  
  // Attenuate size based on distance and individual particle size
  gl_PointSize = aSize * (100.0 / -viewPosition.z);
  
  // Simple twinkling effect
  float twinkle = sin(uTime * 2.0 + modelPosition.x * 10.0) * 0.5 + 0.5;
  gl_PointSize *= (0.5 + twinkle * 0.5);
  
  vColor = color;
}
`;

const fragmentShader = `
uniform float uScroll;

varying vec2 vUv;
varying vec3 vColor;

void main() {
  // Create a soft glowing circle for each particle
  vec2 coords = gl_PointCoord - vec2(0.5);
  float distanceToCenter = length(coords);
  
  if (distanceToCenter > 0.5) discard;
  
  // Soft edge
  float alpha = 1.0 - (distanceToCenter * 2.0);
  alpha = pow(alpha, 1.5);
  
  // React to orb color based on scroll progress
  vec3 baseColor = vec3(0.0, 0.5, 1.0); // Electric blue
  vec3 color1 = vec3(0.0, 0.8, 1.0); // Cyan
  vec3 color2 = vec3(1.0, 0.8, 0.0); // Yellow
  vec3 color3 = vec3(1.0, 0.4, 0.0); // Orange
  vec3 color4 = vec3(1.0, 0.1, 0.1); // Red

  // Interpolate particle color based on global scroll state
  vec3 reactiveColor = baseColor;
  reactiveColor = mix(reactiveColor, color1, smoothstep(0.0, 0.25, uScroll));
  reactiveColor = mix(reactiveColor, color2, smoothstep(0.25, 0.5, uScroll));
  reactiveColor = mix(reactiveColor, color3, smoothstep(0.5, 0.75, uScroll));
  reactiveColor = mix(reactiveColor, color4, smoothstep(0.75, 1.0, uScroll));

  // Mix individual particle color with the reactive global color
  vec3 finalColor = mix(vColor, reactiveColor, 0.7);

  gl_FragColor = vec4(finalColor, alpha * 0.6); // 0.6 opacity for subtlety
}
`;

export default function DeepSpace() {
    const pointsRef = useRef<THREE.Points>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    // Only 20-30% Neural Network, rest is deep space dust. 
    // We use 1500 particles for high performance
    const particleCount = 1500;

    const [positions, colors, sizes] = useMemo(() => {
        const pos = new Float32Array(particleCount * 3);
        const col = new Float32Array(particleCount * 3);
        const siz = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            // Distribute within a large volume
            pos[i3] = (Math.random() - 0.5) * 80;     // x
            pos[i3 + 1] = (Math.random() - 0.5) * 100; // y
            pos[i3 + 2] = (Math.random() - 0.5) * 50 - 20; // z (mostly behind everything)

            // Base subtle colors (whites, light blues)
            const isNeural = Math.random() > 0.75; // 25% neural

            if (isNeural) {
                // Neural particles have more vibrant base color and are larger
                col[i3] = 0.5 + Math.random() * 0.5;
                col[i3 + 1] = 0.8 + Math.random() * 0.2;
                col[i3 + 2] = 1.0;
                siz[i] = Math.random() * 3.0 + 2.0;
            } else {
                // Deep space dust is faint and small
                col[i3] = 0.2;
                col[i3 + 1] = 0.2;
                col[i3 + 2] = 0.3;
                siz[i] = Math.random() * 1.5 + 0.5;
            }
        }

        return [pos, col, siz];
    }, []);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uScroll: { value: 0 },
            uParallaxX: { value: 0 },
            uParallaxY: { value: 0 },
        }),
        []
    );

    useFrame((state, delta) => {
        const { scrollProgress, cursorPosition } = useStore.getState();

        if (materialRef.current) {
            // Speed up the time-based drift as we scroll
            const speedMultiplier = 0.2 + scrollProgress * 1.5;
            materialRef.current.uniforms.uTime.value += delta * speedMultiplier;

            // Smoothly interpolate scroll
            materialRef.current.uniforms.uScroll.value = THREE.MathUtils.lerp(
                materialRef.current.uniforms.uScroll.value,
                scrollProgress,
                0.05
            );

            // Custom damped parallax using cursor
            materialRef.current.uniforms.uParallaxX.value = THREE.MathUtils.damp(
                materialRef.current.uniforms.uParallaxX.value,
                cursorPosition.x,
                2,
                delta
            );

            materialRef.current.uniforms.uParallaxY.value = THREE.MathUtils.damp(
                materialRef.current.uniforms.uParallaxY.value,
                cursorPosition.y,
                2,
                delta
            );
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                    count={particleCount}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    args={[colors, 3]}
                    count={particleCount}
                    array={colors}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-aSize"
                    args={[sizes, 1]}
                    count={particleCount}
                    array={sizes}
                    itemSize={1}
                />
            </bufferGeometry>
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                vertexColors={true}
            />
        </points>
    );
}
