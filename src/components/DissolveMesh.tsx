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
uniform float uDissolve;

float hash(vec3 p) {
  float h = dot(p, vec3(127.1, 311.7, 74.7));
  return fract(sin(h) * 43758.5453);
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
        mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
        mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}

void main() {
  float n = noise(vPosition * 3.0 + uTime * 0.5);
  float edge = smoothstep(uDissolve, uDissolve + 0.05, n);
  if (edge < 0.05) discard;

  vec3 baseColor = vec3(0.9, 0.7, 0.2);
  vec3 edgeColor = vec3(1.0, 0.5, 0.1);
  float isEdge = smoothstep(uDissolve, uDissolve + 0.05, n) - smoothstep(uDissolve + 0.05, uDissolve + 0.12, n);
  vec3 color = mix(baseColor, edgeColor, isEdge);

  float light = dot(vNormal, normalize(vec3(0.5, 1.0, 0.8)));
  light = mix(0.3, 1.0, light * 0.5 + 0.5);
  color *= light;

  gl_FragColor = vec4(color, 1.0);
}
`;

export function DissolveMesh({ position }: { position: [number, number, number] }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const timeRef = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDissolve: { value: 0.3 },
    }),
    []
  );

  useFrame((_, delta) => {
    if (matRef.current) {
      timeRef.current += delta;
      matRef.current.uniforms.uTime.value = timeRef.current;
      matRef.current.uniforms.uDissolve.value =
        (Math.sin(timeRef.current * 0.6) + 1.0) * 0.45;
    }
  });

  return (
    <mesh position={position} rotation={[0.3, 0, 0]}>
      <torusGeometry args={[0.5, 0.2, 32, 64]} />
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
