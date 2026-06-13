"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Link from "next/link";
import { makeSnake, randomFood, tick, GRID } from "@/lib/snake";

const CELL = 200;
const INIT_SPEED = 180;

/** Draw the snake game to a 2D canvas */
function draw(canvas: HTMLCanvasElement, snake: {x:number;y:number}[], food: {x:number;y:number}) {
  const ctx = canvas.getContext("2d")!;
  const w = CELL / GRID;

  ctx.fillStyle = "#0d0d1a";
  ctx.fillRect(0, 0, CELL, CELL);

  // Grid lines
  ctx.strokeStyle = "#1a1a33";
  ctx.lineWidth = 0.5;
  for (let i = 1; i < GRID; i++) {
    ctx.beginPath(); ctx.moveTo(i * w, 0); ctx.lineTo(i * w, CELL); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * w); ctx.lineTo(CELL, i * w); ctx.stroke();
  }

  // Food (pulsing)
  const pulse = Math.sin(Date.now() * 0.005) * 0.2 + 0.8;
  ctx.fillStyle = "#ff4466";
  ctx.shadowColor = "#ff4466";
  ctx.shadowBlur = 8 * pulse;
  ctx.beginPath();
  ctx.arc(food.x * w + w / 2, food.y * w + w / 2, (w / 2 - 2) * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Snake body
  snake.forEach((p, i) => {
    const ratio = 1 - i / (snake.length + 5);
    const r = Math.floor(51 + ratio * 153);
    const g = Math.floor(204 + ratio * 51);
    const b = Math.floor(68 + ratio * 85);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    const pad = i === 0 ? 1 : 2;
    ctx.fillRect(p.x * w + pad, p.y * w + pad, w - pad * 2, w - pad * 2);
  });
}

// ─── 3D Components ───

function ConsoleMesh({ texture }: { texture: THREE.Texture }) {
  return (
    <group position={[0, -0.3, 0.5]} rotation={[0.25, 0, 0]}>
      <mesh>
        <boxGeometry args={[0.9, 1.2, 0.08]} />
        <meshStandardMaterial color="#c0c0d0" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.18, 0.045]}>
        <boxGeometry args={[0.7, 0.5, 0.01]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.18, 0.048]}>
        <planeGeometry args={[0.6, 0.4]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      <mesh position={[-0.2, -0.35, 0.045]}>
        <boxGeometry args={[0.18, 0.18, 0.015]} />
        <meshStandardMaterial color="#555" roughness={0.5} />
      </mesh>
      <mesh position={[0.2, -0.3, 0.045]}>
        <cylinderGeometry args={[0.06, 0.06, 0.015, 16]} />
        <meshStandardMaterial color="#e04060" roughness={0.3} />
      </mesh>
      <mesh position={[0.3, -0.38, 0.045]}>
        <cylinderGeometry args={[0.06, 0.06, 0.015, 16]} />
        <meshStandardMaterial color="#e04060" roughness={0.3} />
      </mesh>
    </group>
  );
}

function Character() {
  return (
    <group position={[0, -0.2, 0]}>
      <mesh position={[0, 0.8, 0]}><sphereGeometry args={[0.2, 32, 32]} /><meshStandardMaterial color="#f4c9a0" roughness={0.6} /></mesh>
      <mesh position={[0, 0.45, 0]}><cylinderGeometry args={[0.15, 0.2, 0.5, 16]} /><meshStandardMaterial color="#4a90d9" roughness={0.5} /></mesh>
      <mesh position={[-0.28, 0.5, 0]} rotation={[0, 0, -0.4]}><cylinderGeometry args={[0.06, 0.06, 0.5, 8]} /><meshStandardMaterial color="#4a90d9" roughness={0.5} /></mesh>
      <mesh position={[0.28, 0.5, 0]} rotation={[0, 0, 0.4]}><cylinderGeometry args={[0.06, 0.06, 0.5, 8]} /><meshStandardMaterial color="#4a90d9" roughness={0.5} /></mesh>
      <mesh position={[-0.1, -0.05, 0]}><cylinderGeometry args={[0.07, 0.07, 0.4, 8]} /><meshStandardMaterial color="#3a3a3a" roughness={0.7} /></mesh>
      <mesh position={[0.1, -0.05, 0]}><cylinderGeometry args={[0.07, 0.07, 0.4, 8]} /><meshStandardMaterial color="#3a3a3a" roughness={0.7} /></mesh>
    </group>
  );
}

function Room() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#3a3045" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.3, -2]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#2a2535" roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.65, 0.5]}>
        <boxGeometry args={[1.5, 0.06, 0.8]} />
        <meshStandardMaterial color="#6a5a4a" roughness={0.5} />
      </mesh>
      <pointLight position={[1, 2, 0]} intensity={4} color="#ffe8c0" />
      <pointLight position={[-1, 1, 1]} intensity={2} color="#ffe8c0" />
      <ambientLight intensity={0.8} />
    </group>
  );
}

// ─── Main ───

export default function SnakePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const texRef = useRef<THREE.CanvasTexture | null>(null);
  const snakeRef = useRef(makeSnake());
  const foodRef = useRef(randomFood(makeSnake()));
  const dirRef = useRef("RIGHT");
  const bufRef = useRef("RIGHT");
  const speedRef = useRef(INIT_SPEED);
  const lastRef = useRef(0);
  const mountedRef = useRef(false);

  const [score, setScore] = useState(0);
  const [dead, setDead] = useState(false);
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  // Game loop
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const drawNow = () => {
      const c = canvasRef.current;
      if (!c) return;
      draw(c, snakeRef.current, foodRef.current);
      if (texRef.current) texRef.current.needsUpdate = true;
    };

    // Create texture after canvas is mounted
    const c = canvasRef.current;
    if (c) {
      texRef.current = new THREE.CanvasTexture(c);
      texRef.current.minFilter = THREE.NearestFilter;
      texRef.current.magFilter = THREE.NearestFilter;
      setTexture(texRef.current);
      drawNow();
    }

    let frameId: number;
    const loop = (time: number) => {
      frameId = requestAnimationFrame(loop);

      if (dead) return;
      if (time - lastRef.current < speedRef.current) return;
      lastRef.current = time;

      dirRef.current = bufRef.current;
      const result = tick(snakeRef.current, dirRef.current, foodRef.current);
      snakeRef.current = result.snake;
      foodRef.current = result.food;

      if (result.ate) {
        setScore((s) => s + 1);
        speedRef.current = Math.max(70, speedRef.current - 4);
      }
      if (result.dead) {
        setDead(true);
      }

      drawNow();
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [dead]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const d = dirRef.current;
      if (e.key === "ArrowUp" && d !== "DOWN") bufRef.current = "UP";
      if (e.key === "ArrowDown" && d !== "UP") bufRef.current = "DOWN";
      if (e.key === "ArrowLeft" && d !== "RIGHT") bufRef.current = "LEFT";
      if (e.key === "ArrowRight" && d !== "LEFT") bufRef.current = "RIGHT";
      if (e.key === "r" || e.key === "R") reset();
      e.preventDefault();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dead]);

  const reset = () => {
    snakeRef.current = makeSnake();
    foodRef.current = randomFood(makeSnake());
    dirRef.current = "RIGHT";
    bufRef.current = "RIGHT";
    speedRef.current = INIT_SPEED;
    lastRef.current = 0;
    setScore(0);
    setDead(false);
    const c = canvasRef.current;
    if (c) {
      draw(c, snakeRef.current, foodRef.current);
      if (texRef.current) texRef.current.needsUpdate = true;
    }
  };

  const press = (dir: string) => {
    const d = dirRef.current;
    if (dir === "UP" && d !== "DOWN") bufRef.current = "UP";
    if (dir === "DOWN" && d !== "UP") bufRef.current = "DOWN";
    if (dir === "LEFT" && d !== "RIGHT") bufRef.current = "LEFT";
    if (dir === "RIGHT" && d !== "LEFT") bufRef.current = "RIGHT";
  };

  return (
    <>
      <canvas ref={canvasRef} width={CELL} height={CELL} hidden />

      <div style={{ position: "absolute", inset: 0 }}>
        <Canvas
          camera={{ position: [0, 0.5, 2.5], fov: 50 }}
          gl={{ antialias: true }}
          onCreated={({ gl }) => {
            gl.setClearColor(new THREE.Color("#1a1525"));
          }}
          style={{ background: "#1a1525" }}
        >
          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            minDistance={1.5}
            maxDistance={6}
            minPolarAngle={Math.PI * 0.3}
            maxPolarAngle={Math.PI * 0.65}
          />
          <Room />
          <Character />
          {texture && <ConsoleMesh texture={texture} />}
        </Canvas>
      </div>

      {/* UI */}
      <div style={{ position: "absolute", top: 12, left: 16, zIndex: 99, display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/" style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "monospace", textDecoration: "none" }}>
          ← Back
        </Link>
        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, fontFamily: "monospace" }}>
          Score: {score}
          {dead && " · GAME OVER"}
        </span>
      </div>
      <div style={{ position: "absolute", top: 38, left: 16, zIndex: 99, color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "monospace" }}>
        D-pad to play · ↻ to restart
      </div>

      {/* Always-visible restart button */}
      <div style={{ position: "absolute", bottom: 80, left: 20, zIndex: 99 }}>
        <button
          onTouchStart={(e) => { e.preventDefault(); reset(); }}
          onClick={reset}
          style={{
            padding: "8px 18px", background: "rgba(255,255,255,0.15)", color: "#fff",
            border: "2px solid rgba(255,255,255,0.5)", borderRadius: 20,
            cursor: "pointer", fontSize: 14, fontWeight: 500, backdropFilter: "blur(8px)",
          }}
        >
          ↻
        </button>
      </div>

      {/* D-pad */}
      <div style={{
        position: "absolute", bottom: 20, right: 20, zIndex: 99,
        display: "grid", gridTemplateColumns: "44px 44px 44px", gridTemplateRows: "44px 44px 44px", gap: 2,
      }}>
        <button onTouchStart={(e) => { e.preventDefault(); press("UP"); }} onClick={() => press("UP")} style={dpStyle}>▲</button>
        <button onTouchStart={(e) => { e.preventDefault(); press("LEFT"); }} onClick={() => press("LEFT")} style={{ ...dpStyle, gridColumn: 1, gridRow: 2 }}>◀</button>
        <button onTouchStart={(e) => { e.preventDefault(); press("RIGHT"); }} onClick={() => press("RIGHT")} style={{ ...dpStyle, gridColumn: 3, gridRow: 2 }}>▶</button>
        <button onTouchStart={(e) => { e.preventDefault(); press("DOWN"); }} onClick={() => press("DOWN")} style={{ ...dpStyle, gridColumn: 2, gridRow: 3 }}>▼</button>
      </div>
    </>
  );
}

const dpStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 8,
  cursor: "pointer",
  color: "white",
  fontSize: 18,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
