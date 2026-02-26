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
  
  // Solar flare like distortion using simplex noise
  float noise = snoise(position * 1.5 + uTime * uPulseSpeed);
  vNoise = noise;
  
  // Scroll-linked scale and intensity
  float displacement = noise * uDistortion;
  vec3 newPosition = position + normal * displacement;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

const fragmentShader = `
uniform float uScroll;
uniform float uGlow;
uniform float uTime;

varying vec2 vUv;
varying float vNoise;
varying vec3 vNormal;

void main() {
  // Sun-themed color palette:
  // Starts electric blue/cyan, transforms into gold/orange/red solar flare
  vec3 c_blue = vec3(0.0, 0.5, 1.0);  // Deep Electric Blue
  vec3 c_cyan = vec3(0.0, 1.0, 1.0);  // Bright Cyan
  vec3 c_gold = vec3(1.0, 0.8, 0.1);  // Radiant Gold
  vec3 c_orange = vec3(1.0, 0.4, 0.0); // Solar Orange
  vec3 c_fire = vec3(1.0, 0.1, 0.0);   // Sun Fire Red

  // Transition based on scroll
  vec3 baseColor = c_blue;
  baseColor = mix(baseColor, c_cyan, smoothstep(0.0, 0.2, uScroll));
  baseColor = mix(baseColor, c_gold, smoothstep(0.2, 0.5, uScroll));
  baseColor = mix(baseColor, c_orange, smoothstep(0.5, 0.8, uScroll));
  baseColor = mix(baseColor, c_fire, smoothstep(0.8, 1.0, uScroll));
  
  // Apply plasma-like variability using noise and time
  float plasma = sin(vNoise * 10.0 + uTime) * 0.5 + 0.5;
  vec3 finalColor = mix(baseColor * 0.3, baseColor * 1.8, vNoise * 0.5 + 0.5);
  finalColor = mix(finalColor, vec3(1.0, 1.0, 0.9), plasma * 0.2 * uScroll); // Highlight flares as we scroll

  // Fresnel rim glow
  float fresnel = dot(vNormal, vec3(0.0, 0.0, 1.0));
  fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
  fresnel = pow(fresnel, 2.5);
  
  finalColor += baseColor * fresnel * uGlow;

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export default function AICore() {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const setCoreRef = useStore(state => state.setCoreRef);

    useEffect(() => {
        if (meshRef.current) {
            setCoreRef(meshRef.current);
        }
    }, [setCoreRef]);

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

    useFrame((state, delta) => {
        const { scrollProgress, cursorPosition } = useStore.getState();

        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value += delta;
            materialRef.current.uniforms.uScroll.value = THREE.MathUtils.lerp(
                materialRef.current.uniforms.uScroll.value,
                scrollProgress,
                0.05
            );

            // Dynamically increase activity as we "ignite" on scroll
            materialRef.current.uniforms.uDistortion.value = 0.22 + scrollProgress * 0.45;
            materialRef.current.uniforms.uPulseSpeed.value = 0.4 + scrollProgress * 1.6;
            materialRef.current.uniforms.uGlow.value = 1.0 + scrollProgress * 1.5;
        }

        if (meshRef.current) {
            const aspect = state.size.width / state.size.height;
            const isMobile = aspect < 1;

            // 1. Side-by-Side Placement logic:
            // At the start (scroll 0), it's at [0, 0, 0]
            // At the end (scroll 1), it moves to the left (e.g., x: -4) 
            const sideBySideProgress = THREE.MathUtils.smoothstep(scrollProgress, 0.4, 0.9);
            const targetX = THREE.MathUtils.lerp(0, -4.5, sideBySideProgress);

            meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.05);

            // Responsive Scaling
            const responsiveScale = isMobile ? 0.55 : 0.85;
            meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, responsiveScale, 0.1));

            // Floating breathe
            const floatY = Math.sin(state.clock.getElapsedTime() * 0.4) * 0.15;
            meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, floatY, 0.05);

            // Rotate based on mouse
            const targetRotationX = cursorPosition.y * 0.4;
            const targetRotationY = cursorPosition.x * 0.4;

            meshRef.current.rotation.x = THREE.MathUtils.damp(meshRef.current.rotation.x, targetRotationX, 4, delta);
            meshRef.current.rotation.y = THREE.MathUtils.damp(meshRef.current.rotation.y, targetRotationY, 4, delta);
        }
    });

    return (
        <mesh
            ref={meshRef}
            position={[0, 0, 0]}
            renderOrder={10}
        >
            <sphereGeometry args={[1.2, 128, 128]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
                depthTest={true}
                depthWrite={true}
            />
        </mesh>
    );
}
