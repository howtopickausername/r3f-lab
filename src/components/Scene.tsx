'use client';

import { useRef, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

// ── 调色板 ──
const PALETTE = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
];

// ── 几何体类型 ──
type GeomType = 'box' | 'sphere' | 'torus' | 'cone' | 'cylinder' | 'octahedron' | 'dodecahedron';

const GEOMS: GeomType[] = ['box', 'sphere', 'torus', 'cone', 'cylinder', 'octahedron', 'dodecahedron'];

interface Model {
  id: number;
  type: GeomType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  speed: number;
  axis: 'x' | 'y' | 'z';
  wireframe: boolean;
}

function randomModel(id: number): Model {
  const type = GEOMS[Math.floor(Math.random() * GEOMS.length)];
  const r = 3.5;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  return {
    id,
    type,
    position: [
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
    ],
    rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
    scale: [0.4 + Math.random() * 0.8, 0.4 + Math.random() * 0.8, 0.4 + Math.random() * 0.8],
    color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    speed: 0.2 + Math.random() * 0.8,
    axis: ['x', 'y', 'z'][Math.floor(Math.random() * 3)] as 'x' | 'y' | 'z',
    wireframe: Math.random() > 0.7,
  };
}

function GeomMesh({ model }: { model: Model }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geom = useMemo(() => {
    switch (model.type) {
      case 'box': return <boxGeometry args={[1, 1, 1]} />;
      case 'sphere': return <sphereGeometry args={[0.6, 32, 32]} />;
      case 'torus': return <torusGeometry args={[0.5, 0.2, 16, 32]} />;
      case 'cone': return <coneGeometry args={[0.6, 1, 32]} />;
      case 'cylinder': return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
      case 'octahedron': return <octahedronGeometry args={[0.6]} />;
      case 'dodecahedron': return <dodecahedronGeometry args={[0.6]} />;
    }
  }, [model.type]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation[model.axis] += delta * model.speed;
    }
  });

  return (
    <mesh ref={meshRef} position={model.position} rotation={model.rotation} scale={model.scale}>
      {geom}
      <meshStandardMaterial
        color={model.color}
        wireframe={model.wireframe}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
}

function Scene() {
  const [models, setModels] = useState<Model[]>(() =>
    Array.from({ length: 20 }, (_, i) => randomModel(i))
  );
  const [count, setCount] = useState(20);

  const regenerate = useCallback(() => {
    setModels(Array.from({ length: count }, (_, i) => randomModel(i)));
  }, [count]);

  const addMore = useCallback(() => {
    const newCount = count + 5;
    setCount(newCount);
    setModels(Array.from({ length: newCount }, (_, i) => randomModel(i)));
  }, [count]);

  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }} style={{ background: '#0a0a12' }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -5, -5]} intensity={0.5} color="#4488ff" />
        <spotLight position={[0, 8, 0]} angle={0.6} intensity={0.8} penumbra={0.5} />
        <Environment preset="city" />

        {models.map((m) => (
          <GeomMesh key={m.id} model={m} />
        ))}

        <OrbitControls autoRotate autoRotateSpeed={0.3} enableDamping />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex gap-2 justify-center">
        <button
          onClick={regenerate}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg 
                     border border-white/20 backdrop-blur text-sm transition-all"
        >
          🔄 重新生成
        </button>
        <button
          onClick={addMore}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg 
                     border border-white/20 backdrop-blur text-sm transition-all"
        >
          ➕ 加 5 个
        </button>
      </div>
      <div className="absolute top-4 left-4 text-white/40 text-xs font-mono">
        {count} objects · drag to orbit · scroll to zoom
      </div>
    </div>
  );
}

export default Scene;
