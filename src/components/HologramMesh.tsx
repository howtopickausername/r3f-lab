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
  vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0)); // camera-facing approximation
  float fresnel = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
  fresnel = pow(fresnel, 2.5);
  
  // Scan lines
  float scanline = sin(vWorldPosition.y * 30.0 + uTime * 5.0) * 0.5 + 0.5;
  float scanline2 = sin(vWorldPosition.y * 15.0 - uTime * 3.0) * 0.5 + 0.5;
  float scan = scanline * scanline2;
  
  // Hex grid
  float hex = abs(fract(vUv.x * 12.0) - 0.5) + abs(fract(vUv.y * 14.0) - 0.5);
  float hexGrid = smoothstep(0.38, 0.42, hex);
  
  vec3 color = vec3(0.1, 0.3, 0.9); // blue base
  color += fresnel * vec3(0.3, 0.6, 1.0); // rim glow
  color += scan * 0.15; // scan lines
  color *= 0.4 + hexGrid * 0.6; // hex pattern
  
  float alpha = 0.3 + fresnel * 0.5 + scan * 0.2;
  alpha = clamp(alpha, 0.0, 1.0);
  
  gl_FragColor = vec4(color, alpha);
}
`;

export function HologramMesh({ position }: { position: [number, number, number] }) {
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
      <sphereGeometry args={[0.55, 48, 48]} />
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
