'use client';

import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { DissolveMesh } from './DissolveMesh';
import { HologramMesh } from './HologramMesh';
import { LavaMesh } from './LavaMesh';
import { CrystalMesh } from './CrystalMesh';
import { ForceFieldMesh } from './ForceFieldMesh';
import { IceMeltMesh } from './IceMeltMesh';

// ═══ Original Dissolve Shader (multiple random objects) ═══
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
    float grid = abs(fract(vUv.x * 20.0) - 0.5) + abs(fract(vUv.y * 20.0) - 0.5);
    float alpha = smoothstep(0.02, 0.01, grid);
    if (alpha < 0.1) discard;
    gl_FragColor = vec4(uColor * 1.5, 1.0);
    return;
  }

  if (n < uDissolve) discard;

  float edge = smoothstep(uDissolve, uDissolve + 0.15, n);
  vec3 color = mix(vec3(1.0, 1.0, 1.0), uColor, edge);
  float diffuse = max(0.0, dot(vNormal, normalize(vec3(1.0, 1.0, 1.0))));
  color *= 0.4 + 0.6 * diffuse;

  gl_FragColor = vec4(color, 1.0);
}`;

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
    id, type,
    position: [r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi)] as [number, number, number],
    scale: 0.4 + Math.random() * 0.6,
    color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    dissolveSpeed: 0.3 + Math.random() * 0.7,
    wireframe: Math.random() > 0.8,
  };
}

function DissolveObj({ model }: { model: ReturnType<typeof randomModel> }) {
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
      matRef.current.uniforms.uDissolve.value = Math.abs(Math.sin(timeRef.current * model.dissolveSpeed)) * 0.9;
    }
  });

  return (
    <mesh ref={meshRef} position={model.position} scale={model.scale}>
      {geom}
      <shaderMaterial ref={matRef} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} transparent />
    </mesh>
  );
}

// ═══ Gallery Mode: 6 objects, each a different effect ═══
const GALLERY_LAYOUT: { pos: [number, number, number]; label: string }[] = [
  { pos: [-2.5, 1.2, 0], label: '溶解' },
  { pos: [0, 1.2, 0], label: '全息' },
  { pos: [2.5, 1.2, 0], label: '熔岩' },
  { pos: [-2.5, -1.5, 0], label: '水晶' },
  { pos: [0, -1.5, 0], label: '力场' },
  { pos: [2.5, -1.5, 0], label: '融冰' },
];

export default function Scene() {
  const [mode, setMode] = useState<'gallery' | 'dissolve'>('gallery');
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
      {mode === 'gallery' ? (
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }} gl={{ antialias: true }} style={{ background: '#0a0a0f' }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 5]} intensity={1.5} />
          <pointLight position={[-5, -3, 3]} intensity={0.8} color="#8888ff" />
          <OrbitControls enableDamping dampingFactor={0.08} autoRotate autoRotateSpeed={0.3} minDistance={4} maxDistance={15} />
          <DissolveMesh position={GALLERY_LAYOUT[0].pos} />
          <HologramMesh position={GALLERY_LAYOUT[1].pos} />
          <LavaMesh position={GALLERY_LAYOUT[2].pos} />
          <CrystalMesh position={GALLERY_LAYOUT[3].pos} />
          <ForceFieldMesh position={GALLERY_LAYOUT[4].pos} />
          <IceMeltMesh position={GALLERY_LAYOUT[5].pos} />
        </Canvas>
      ) : (
        <Canvas camera={{ position: [0, 0, 7], fov: 50 }} style={{ background: '#050510' }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[8, 6, 8]} intensity={2} />
          <pointLight position={[-6, -4, -4]} intensity={1} color="#6688cc" />
          {models.map((m) => <DissolveObj key={m.id} model={m} />)}
          <OrbitControls autoRotate autoRotateSpeed={0.3} enableDamping />
        </Canvas>
      )}

      {/* UI Overlay */}
      <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', zIndex: 10, padding: '0 16px' }}>
        <button
          onClick={() => setMode('gallery')}
          style={{
            padding: '8px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 14, fontWeight: 500,
            background: mode === 'gallery' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.5)',
            color: mode === 'gallery' ? '#fff' : 'rgba(255,255,255,0.5)',
            border: `2px solid ${mode === 'gallery' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)'}`,
            backdropFilter: 'blur(8px)', transition: 'all 0.2s',
          }}
        >
          🎨 效果画廊
        </button>
        <button
          onClick={() => setMode('dissolve')}
          style={{
            padding: '8px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 14, fontWeight: 500,
            background: mode === 'dissolve' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.5)',
            color: mode === 'dissolve' ? '#fff' : 'rgba(255,255,255,0.5)',
            border: `2px solid ${mode === 'dissolve' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)'}`,
            backdropFilter: 'blur(8px)', transition: 'all 0.2s',
          }}
        >
          🟡 溶解随机
        </button>
        {mode === 'dissolve' && (
          <>
            <button onClick={regenerate} style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, cursor: 'pointer', fontSize: 14 }}>
              🔄 重新生成
            </button>
            <button onClick={addMore} style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, cursor: 'pointer', fontSize: 14 }}>
              ➕ 加 5 个
            </button>
          </>
        )}
      </div>

      <div style={{ position: 'absolute', top: 12, left: 16, color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'monospace', zIndex: 10 }}>
        {mode === 'gallery' ? '6 effects · drag to orbit' : `${count} objects · dissolve shader · drag to orbit`}
      </div>
    </div>
  );
}
