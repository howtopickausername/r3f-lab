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
  // Crystal facets from normals
  vec3 n = vNormal;
  
  // Rainbow dispersion based on normal angle
  float angle = dot(n, vec3(0.4, 0.6, 0.2)) * 0.5 + 0.5;
  
  // Multiple specular highlights from different "light" directions
  vec3 lightDirs[3];
  lightDirs[0] = normalize(vec3(1.0, 0.8, 0.6));
  lightDirs[1] = normalize(vec3(-0.6, 0.4, 0.8));
  lightDirs[2] = normalize(vec3(0.3, -0.5, 0.7));
  
  vec3 specColor[3];
  specColor[0] = vec3(1.0, 0.3, 0.8); // pink
  specColor[1] = vec3(0.3, 1.0, 0.9); // cyan
  specColor[2] = vec3(0.9, 0.9, 0.3); // yellow
  
  vec3 color = vec3(0.05, 0.02, 0.1); // purple base
  
  for (int i = 0; i < 3; i++) {
    float spec = pow(max(dot(n, lightDirs[i]), 0.0), 60.0);
    color += specColor[i] * spec * 0.8;
  }
  
  // Broad specular
  float broad = pow(max(dot(n, normalize(vec3(0.5, 0.5, 1.0))), 0.0), 8.0);
  color += vec3(0.5, 0.3, 0.9) * broad * 0.4;
  
  // Rainbow tint from angle
  float hue = angle + uTime * 0.1;
  vec3 rainbow = 0.5 + 0.5 * cos(6.28318 * (hue + vec3(0.0, 0.33, 0.67)));
  color += rainbow * 0.15;
  
  // Fresnel edge
  float fresnel = 1.0 - abs(dot(n, vec3(0.0, 0.0, 1.0)));
  color += vec3(0.6, 0.2, 0.9) * pow(fresnel, 3.0) * 0.3;
  
  gl_FragColor = vec4(color, 1.0);
}
`;

export function CrystalMesh({ position }: { position: [number, number, number] }) {
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
    <mesh position={position} rotation={[0, Math.PI / 4, 0]}>
      <octahedronGeometry args={[0.55, 0]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}
