'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import DevMoon from './DevMoon';

const devTools = [
    { name: 'React', color: '#61DAFB', icon: 'react', slug: 'react', description: 'Component-based UI library for building interactive interfaces', proficiency: 95 },
    { name: 'Next.js', color: '#ffffff', icon: 'nextdotjs', slug: 'nextjs', description: 'Full-stack React framework with SSR, routing, and API routes', proficiency: 90 },
    { name: 'TypeScript', color: '#3178C6', icon: 'typescript', slug: 'typescript', description: 'Typed superset of JavaScript for robust, scalable applications', proficiency: 92 },
    { name: 'Three.js', color: '#ffffff', icon: 'threedotjs', slug: 'threejs', description: '3D graphics library for WebGL rendering and animations', proficiency: 85 },
    { name: 'TailwindCSS', color: '#06B6D4', icon: 'tailwindcss', slug: 'tailwindcss', description: 'Utility-first CSS framework for rapid UI development', proficiency: 93 },
    { name: 'Node.js', color: '#339933', icon: 'nodedotjs', slug: 'nodejs', description: 'JavaScript runtime for server-side applications and APIs', proficiency: 88 },
    { name: 'Git', color: '#F05032', icon: 'git', slug: 'git', description: 'Distributed version control for collaborative development', proficiency: 90 },
];

const planetVertexShader = `
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
}
`;

const planetFragmentShader = `
uniform vec3 uColor;
uniform vec3 uEmissive;
uniform float uFresnelPower;

varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    // Fresnel effect
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), uFresnelPower);
    
    vec3 finalColor = mix(uColor, uEmissive, fresnel);
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

function OrbitPath({ radius, inclination }: { radius: number, inclination: number }) {
    const points = useMemo(() => {
        const p = [];
        for (let i = 0; i <= 64; i++) {
            const angle = (i / 64) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = Math.sin(angle) * Math.sin(inclination) * radius;
            p.push(new THREE.Vector3(x, y, z));
        }
        return p;
    }, [radius, inclination]);

    return <Line points={points} color="#00ffff" lineWidth={1} transparent opacity={0.08} renderOrder={2} />;
}

function SaturnRings() {
    const points = useMemo(() => {
        const p = new Float32Array(3000 * 3);
        const colors = new Float32Array(3000 * 3);
        for (let i = 0; i < 3000; i++) {
            const i3 = i * 3;
            const radius = 5.5 + Math.random() * 3.5;
            const angle = Math.random() * Math.PI * 2;
            p[i3] = Math.cos(angle) * radius;
            p[i3 + 1] = (Math.random() - 0.5) * 0.15;
            p[i3 + 2] = Math.sin(angle) * radius;

            const mixedColor = new THREE.Color('#00ffff').lerp(new THREE.Color('#ffffff'), Math.random() * 0.5);
            colors[i3] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;
        }
        return [p, colors];
    }, []);

    const ref = useRef<THREE.Points>(null);
    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.y += delta * 0.15;
        }
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={3000}
                    array={points[0]}
                    itemSize={3}
                    args={[points[0], 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={3000}
                    array={points[1]}
                    itemSize={3}
                    args={[points[1], 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.04}
                vertexColors
                transparent
                opacity={0.3}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}

export default function TechPlanet() {
    const planetRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const uniforms = useMemo(() => ({
        uColor: { value: new THREE.Color('#050505') },
        uEmissive: { value: new THREE.Color('#00b4ff') },
        uFresnelPower: { value: 2.0 }
    }), []);

    useFrame((state, delta) => {
        const { scrollProgress, cursorPosition } = useStore.getState();
        const aspect = state.size.width / state.size.height;
        const isMobile = aspect < 1;

        if (groupRef.current) {
            const centeringProgress = THREE.MathUtils.smoothstep(scrollProgress, 0.2, 0.6);
            const sideBySideProgress = THREE.MathUtils.smoothstep(scrollProgress, 0.7, 0.95);

            let targetXBase = THREE.MathUtils.lerp(25, 0, centeringProgress);
            targetXBase = THREE.MathUtils.lerp(targetXBase, 4.5, sideBySideProgress);

            const discoveryIntensity = isMobile ? 0 : 2;
            const targetXOffset = cursorPosition.x * discoveryIntensity;

            const targetX = targetXBase + targetXOffset;

            const manifestationThreshold = 0.15;
            const scrollEffect = THREE.MathUtils.smoothstep(scrollProgress, manifestationThreshold, manifestationThreshold + 0.15);

            const responsiveScale = isMobile ? 0.50 : 0.85;
            const targetScale = scrollEffect * responsiveScale;

            groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05);
            groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.1));

            const targetY = isMobile ? 5 : 8 - scrollProgress * 4;
            groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);

            groupRef.current.visible = groupRef.current.scale.x > 0.001;

            if (materialRef.current) {
                const sunTint = new THREE.Color('#00b4ff').lerp(new THREE.Color('#ffd700'), sideBySideProgress);
                materialRef.current.uniforms.uEmissive.value.copy(sunTint);
            }
        }

        if (planetRef.current) {
            planetRef.current.rotation.y += delta * 0.12;
        }
    });

    return (
        <group ref={groupRef} position={[40, 10, -30]} scale={0}>
            <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
                <mesh ref={planetRef} renderOrder={1}>
                    <sphereGeometry args={[4, 64, 64]} />
                    <shaderMaterial
                        ref={materialRef}
                        vertexShader={planetVertexShader}
                        fragmentShader={planetFragmentShader}
                        uniforms={uniforms}
                        depthWrite={true}
                        depthTest={true}
                    />

                    <mesh scale={1.08}>
                        <sphereGeometry args={[4, 32, 32]} />
                        <meshStandardMaterial
                            color="#00ffff"
                            transparent
                            opacity={0.04}
                            side={THREE.BackSide}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>

                    <SaturnRings />
                </mesh>
            </Float>

            {devTools.map((tool, index) => {
                const orbitRadius = 11 + (index * 2.0);
                const orbitSpeed = 0.06 + (index * 0.03);
                const phaseShift = (index / devTools.length) * Math.PI * 2;
                const inclination = (index % 2 === 0 ? 1 : -1) * 0.12;

                return (
                    <group key={tool.name}>
                        <OrbitPath radius={orbitRadius} inclination={inclination} />
                        <DevMoon
                            name={tool.name}
                            color={tool.color}
                            icon={tool.icon}
                            slug={tool.slug}
                            description={tool.description}
                            proficiency={tool.proficiency}
                            orbitRadius={orbitRadius}
                            orbitSpeed={orbitSpeed}
                            phaseShift={phaseShift}
                            inclination={inclination}
                        />
                    </group>
                );
            })}

            <pointLight intensity={60} color="#00ffff" distance={35} decay={2} />
        </group>
    );
}
