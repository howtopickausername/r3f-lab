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
uniform float uMelt;

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

void main() {
  // Melt based on Y position + noise
  float meltThreshold = 0.2 + sin(uTime * 0.5) * 0.15;
  float localNoise = noise(vPosition.xy * 5.0) * 0.1;
  float melt = smoothstep(meltThreshold + localNoise, meltThreshold + localNoise - 0.05, vPosition.y);
  
  // Ice color: light blue with internal refraction-like variation
  vec3 iceColor = vec3(0.6, 0.8, 0.95);
  vec3 deepIce = vec3(0.1, 0.3, 0.6);
  vec3 color = mix(iceColor, deepIce, abs(vNormal.y) * 0.6);
  
  // Water/melt drips: blue-green tint
  vec3 waterColor = vec3(0.2, 0.6, 0.8);
  
  // Drip lines
  float drip = smoothstep(0.5, 0.0, fract(vUv.y * 20.0 + noise(vUv * 8.0 + uTime) * 0.8));
  color += drip * vec3(0.3, 0.5, 0.7) * 0.3;
  
  // Specular highlights (ice is shiny)
  float spec = pow(max(dot(vNormal, normalize(vec3(0.5, 0.8, 0.3))), 0.0), 40.0);
  color += vec3(0.8, 0.9, 1.0) * spec;
  
  // Mix ice → water based on melt
  float melted = smoothstep(0.0, 0.3, melt);
  color = mix(color, waterColor, melted);
  
  // Add transparency to melted parts
  float alpha = 1.0 - melt * 0.4;
  
  // Lighting
  float light = dot(vNormal, normalize(vec3(0.3, 1.0, 0.5)));
  light = 0.4 + light * 0.6;
  color *= light;
  
  gl_FragColor = vec4(color, alpha);
}
`;

export function IceMeltMesh({ position }: { position: [number, number, number] }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const timeRef = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMelt: { value: 0.3 },
    }),
    []
  );

  useFrame((_, delta) => {
    if (matRef.current) {
      timeRef.current += delta;
      matRef.current.uniforms.uTime.value = timeRef.current;
      matRef.current.uniforms.uMelt.value =
        (Math.sin(timeRef.current * 0.4) + 1.0) * 0.35;
    }
  });

  return (
    <mesh position={position} rotation={[0.2, Math.PI / 6, 0]}>
      <boxGeometry args={[0.8, 0.9, 0.8]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}
