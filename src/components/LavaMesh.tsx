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

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv * 4.0;
  float n1 = fbm(uv + uTime * 0.3);
  float n2 = fbm(uv * 1.5 - uTime * 0.2 + 5.0);
  float n = n1 * 0.7 + n2 * 0.3;
  
  // Color ramp: dark red → orange → yellow → white
  vec3 dark  = vec3(0.6, 0.1, 0.0);
  vec3 mid   = vec3(1.0, 0.3, 0.0);
  vec3 hot   = vec3(1.0, 0.8, 0.2);
  vec3 white = vec3(1.0, 0.95, 0.8);
  
  float t = n;
  vec3 color = mix(dark, mid, smoothstep(0.2, 0.4, t));
  color = mix(color, hot, smoothstep(0.4, 0.6, t));
  color = mix(color, white, smoothstep(0.7, 0.9, t));
  
  // Glow at edges
  float edge = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
  color += edge * vec3(0.4, 0.1, 0.0);
  
  gl_FragColor = vec4(color, 1.0);
}
`;

export function LavaMesh({ position }: { position: [number, number, number] }) {
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
      <dodecahedronGeometry args={[0.5, 0]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}
