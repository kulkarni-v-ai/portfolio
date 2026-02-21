'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';

const vertexShader = `
uniform float uTime;
uniform float uScroll;
uniform float uPulseSpeed;
uniform float uDistortion;

varying vec2 vUv;
varying float vNoise;
varying vec3 vNormal;

// Simplex 3D Noise 
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 1.0/7.0; // N=7
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  
  // Calculate noise based on time and pulse speed
  float noise = snoise(position * 1.5 + uTime * uPulseSpeed);
  vNoise = noise;
  
  // Displace vertex along its normal
  vec3 newPosition = position + normal * noise * uDistortion;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

const fragmentShader = `
uniform float uScroll;
uniform float uGlow;

varying vec2 vUv;
varying float vNoise;
varying vec3 vNormal;

void main() {
  // Color progression based on uScroll:
  // 0.0 - Electric blue (0.0, 0.5, 1.0)
  // 0.25 - Blue + Cyan (0.0, 0.8, 1.0)
  // 0.5 - Yellow veins (1.0, 0.8, 0.0)
  // 0.75 - Orange glow (1.0, 0.4, 0.0)
  // 1.0 - Subtle red accents (1.0, 0.1, 0.1)
  
  vec3 c0 = vec3(0.0, 0.5, 1.0); // Electric blue
  vec3 c1 = vec3(0.0, 0.8, 1.0); // Cyan
  vec3 c2 = vec3(1.0, 0.8, 0.0); // Yellow
  vec3 c3 = vec3(1.0, 0.4, 0.0); // Orange
  vec3 c4 = vec3(1.0, 0.1, 0.1); // Red

  // Smoothly interpolate between colors based on scroll
  vec3 color = c0;
  color = mix(color, c1, smoothstep(0.0, 0.25, uScroll));
  color = mix(color, c2, smoothstep(0.25, 0.5, uScroll));
  color = mix(color, c3, smoothstep(0.5, 0.75, uScroll));
  color = mix(color, c4, smoothstep(0.75, 1.0, uScroll));
  
  // Add noise variation
  vec3 finalColor = mix(color * 0.5, color * 1.5, vNoise * 0.5 + 0.5);
  
  // Fresnel glow effect
  float fresnel = dot(vNormal, vec3(0.0, 0.0, 1.0));
  fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
  fresnel = pow(fresnel, 3.0);
  
  finalColor += color * fresnel * uGlow;

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export default function AICore() {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const setCoreRef = useStore(state => state.setCoreRef);

    // Register this mesh as the "Core" in the global store for occlusion
    useEffect(() => {
        if (meshRef.current) {
            setCoreRef(meshRef.current);
        }
    }, [setCoreRef]);

    // Setup Shader Uniforms once
    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uScroll: { value: 0 },
            uPulseSpeed: { value: 0.5 },
            uDistortion: { value: 0.2 },
            uGlow: { value: 1.0 },
        }),
        []
    );

    // Animation Loop (60fps)
    useFrame((state, delta) => {
        // Read directly from the Zustand store outside of React's reactive cycle
        // to maintain high performance.
        const { scrollProgress, cursorPosition } = useStore.getState();

        // 1. Update Shader Uniforms
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value += delta;

            // Map scroll progress to shader parameters
            // e.g., distortion and pulse speed increase as you scroll down
            const targetScroll = scrollProgress;
            // Interpolate the scroll value linearly to make the transition smooth
            materialRef.current.uniforms.uScroll.value = THREE.MathUtils.lerp(
                materialRef.current.uniforms.uScroll.value,
                targetScroll,
                0.05
            );

            materialRef.current.uniforms.uDistortion.value = 0.2 + targetScroll * 0.5;
            materialRef.current.uniforms.uPulseSpeed.value = 0.5 + targetScroll * 1.5;
            materialRef.current.uniforms.uGlow.value = 1.0 + targetScroll * 2.0;
        }

        // 2. Handle Cursor Interaction & Floating Motion
        if (meshRef.current) {
            // Add a subtle vertical "breathing" float
            const floatY = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
            meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, floatY, 0.05);

            // Rotate the orb slightly based on mouse position
            const targetRotationX = cursorPosition.y * 0.5;
            const targetRotationY = cursorPosition.x * 0.5;

            meshRef.current.rotation.x = THREE.MathUtils.damp(
                meshRef.current.rotation.x,
                targetRotationX,
                4, // lambda
                delta
            );
            meshRef.current.rotation.y = THREE.MathUtils.damp(
                meshRef.current.rotation.y,
                targetRotationY,
                4, // lambda
                delta
            );
        }
    });

    return (
        <mesh
            ref={meshRef}
            position={[0, 0, 0]}
            renderOrder={999} // Max priority
        >
            {/* Reduced size for better scene composition */}
            <sphereGeometry args={[1.2, 128, 128]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                wireframe={false}
                transparent={true}
                depthTest={false}  // Always draw over other 3D objects
                depthWrite={true}  // Still write to depth for HTML occlusion (drei)
            />
        </mesh>
    );
}
