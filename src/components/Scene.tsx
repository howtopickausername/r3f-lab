'use client';

import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// ═══ Dissolve Shader ═══
const vertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uDissolve;
uniform vec3 uColor;
uniform float uWireframe;
varying vec2 vUv;
varying vec3 vNormal;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

void main() {
  float n = noise(vUv * 6.0 + uTime * 0.5);

  if (uWireframe > 0.5) {
    // wireframe mode: skip dissolve, just edge glow
    float grid = abs(fract(vUv.x * 20.0) - 0.5) + abs(fract(vUv.y * 20.0) - 0.5);
    float alpha = smoothstep(0.02, 0.01, grid);
    if (alpha < 0.1) discard;
    gl_FragColor = vec4(uColor * 1.5, 1.0);
    return;
  }

  if (n < uDissolve) discard;

  float edge = smoothstep(uDissolve, uDissolve + 0.15, n);
  vec3 baseColor = uColor;
  vec3 edgeColor = vec3(1.0, 1.0, 1.0);
  vec3 color = mix(edgeColor, baseColor, edge);

  float diffuse = max(0.0, dot(vNormal, normalize(vec3(1.0, 1.0, 1.0))));
  color *= 0.4 + 0.6 * diffuse;

  gl_FragColor = vec4(color, 1.0);
}`;

// ═══ Palette ═══
const PALETTE = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
];

type GeomType = 'box' | 'sphere' | 'torus' | 'cone' | 'cylinder' | 'octahedron' | 'dodecahedron';
const GEOMS: GeomType[] = ['box', 'sphere', 'torus', 'cone', 'cylinder', 'octahedron', 'dodecahedron'];

function randomModel(id: number) {
  const type = GEOMS[Math.floor(Math.random() * GEOMS.length)];
  const r = 3;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  return {
    id,
    type,
    position: [r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi)] as [number, number, number],
    scale: 0.4 + Math.random() * 0.6,
    color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    dissolveSpeed: 0.3 + Math.random() * 0.7,
    wireframe: Math.random() > 0.8,
  };
}

function DissolveMesh({ model }: { model: ReturnType<typeof randomModel> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const timeRef = useRef(0);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uDissolve: { value: 0.3 },
    uColor: { value: new THREE.Color(model.color) },
    uWireframe: { value: model.wireframe ? 1.0 : 0.0 },
  }), [model.color, model.wireframe]);

  const geom = useMemo(() => {
    switch (model.type) {
      case 'box': return <boxGeometry />;
      case 'sphere': return <sphereGeometry args={[0.5, 32, 32]} />;
      case 'torus': return <torusGeometry args={[0.4, 0.15, 16, 32]} />;
      case 'cone': return <coneGeometry args={[0.5, 0.8, 32]} />;
      case 'cylinder': return <cylinderGeometry args={[0.4, 0.4, 0.8, 32]} />;
      case 'octahedron': return <octahedronGeometry args={[0.5]} />;
      case 'dodecahedron': return <dodecahedronGeometry args={[0.5]} />;
    }
  }, [model.type]);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.3;
    if (matRef.current) {
      timeRef.current += delta;
      matRef.current.uniforms.uTime.value = timeRef.current;
      // dissolve ping-pong: 0 → 1 → 0 → ...
      const t = timeRef.current * model.dissolveSpeed;
      matRef.current.uniforms.uDissolve.value = Math.abs(Math.sin(t)) * 0.9;
    }
  });

  return (
    <mesh ref={meshRef} position={model.position} scale={model.scale}>
      {geom}
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

function ModelGroup({ models }: { models: ReturnType<typeof randomModel>[] }) {
  return <>{models.map((m) => <DissolveMesh key={m.id} model={m} />)}</>;
}

export default function Scene() {
  const [models, setModels] = useState(() => Array.from({ length: 15 }, (_, i) => randomModel(i)));
  const [count, setCount] = useState(15);

  const regenerate = useCallback(() => {
    setModels(Array.from({ length: count }, (_, i) => randomModel(i)));
  }, [count]);

  const addMore = useCallback(() => setCount((c) => c + 5), []);

  useEffect(() => {
    setModels(Array.from({ length: count }, (_, i) => randomModel(i)));
  }, [count]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }} style={{ background: '#050510' }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[8, 6, 8]} intensity={2} />
        <pointLight position={[-6, -4, -4]} intensity={1} color="#6688cc" />
        <ModelGroup models={models} />
        <OrbitControls autoRotate autoRotateSpeed={0.3} enableDamping />
      </Canvas>

      <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, display: 'flex', gap: 8, justifyContent: 'center', zIndex: 10 }}>
        <button onClick={regenerate} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
          🔄 重新生成
        </button>
        <button onClick={addMore} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
          ➕ 加 5 个
        </button>
      </div>
      <div style={{ position: 'absolute', top: 12, left: 16, color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'monospace', zIndex: 10 }}>
        {count} objects · dissolve shader · drag to orbit
      </div>
    </div>
  );
}
