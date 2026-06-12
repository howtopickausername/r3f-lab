"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { vertexShader } from "./shaders";

const fragmentShader = /* glsl */ `
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec2 vUv;

uniform float uTime;

void main() {
  // Fresnel rim
  float fresnel = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
  fresnel = pow(fresnel, 2.0);
  
  // Hexagonal honeycomb pattern
  vec2 uv = vUv * 8.0;
  float hex = abs(fract(uv.x) - 0.5) + abs(fract(uv.y) - 0.5);
  float honeycomb = smoothstep(0.43, 0.45, hex);
  
  // Animated pulse rings
  float ring = sin(vWorldPosition.y * 12.0 - uTime * 4.0) * 0.5 + 0.5;
  float ring2 = sin(vWorldPosition.y * 8.0 + uTime * 3.0 + 2.0) * 0.5 + 0.5;
  float pulse = ring * ring2;
  
  // Energy veins
  float vein = abs(sin(vUv.x * 20.0 + vUv.y * 18.0 + uTime)) * 
               abs(sin(vUv.y * 15.0 - vUv.x * 12.0 - uTime * 1.5));
  float veins = smoothstep(0.15, 0.0, vein);
  
  vec3 color = vec3(0.2, 0.4, 1.0);       // blue core
  color += fresnel * vec3(0.3, 0.7, 1.0) * 0.6;  // rim glow
  color += pulse * vec3(0.5, 0.6, 1.0) * 0.3;    // pulse rings
  color += veins * vec3(0.7, 0.8, 1.0) * 0.2;    // energy veins
  color *= 0.5 + honeycomb * 0.5;                  // hex grid
  
  float alpha = 0.3 + fresnel * 0.5 + pulse * 0.15;
  alpha = clamp(alpha, 0.0, 1.0);
  
  gl_FragColor = vec4(color, alpha);
}
`;

export function ForceFieldMesh({ position }: { position: [number, number, number] }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const timeRef = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame((_, delta) => {
    if (matRef.current) {
      timeRef.current += delta;
      matRef.current.uniforms.uTime.value = timeRef.current;
    }
  });

  return (
    <mesh position={position}>
      <icosahedronGeometry args={[0.55, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
