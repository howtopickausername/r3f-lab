"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ═══ Snake Game Logic ═══
const GRID = 10;
const CANVAS_SIZE = 200;

type Point = { x: number; y: number };

function randomFood(snake: Point[]): Point {
  let p: Point;
  do {
    p = {
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID),
    };
  } while (snake.some((s) => s.x === p.x && s.y === p.y));
  return p;
}

function moveSnake(
  snake: Point[],
  direction: string,
  food: Point
): { snake: Point[]; food: Point; ate: boolean } {
  const head = snake[0];
  const newHead = { ...head };
  if (direction === "UP") newHead.y = (newHead.y - 1 + GRID) % GRID;
  if (direction === "DOWN") newHead.y = (newHead.y + 1) % GRID;
  if (direction === "LEFT") newHead.x = (newHead.x - 1 + GRID) % GRID;
  if (direction === "RIGHT") newHead.x = (newHead.x + 1) % GRID;

  // Self-collision
  if (snake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
    return { snake: [{ x: 2, y: 4 }, { x: 1, y: 4 }, { x: 0, y: 4 }], food, ate: false };
  }

  const newSnake = [newHead, ...snake];
  const ate = newHead.x === food.x && newHead.y === food.y;
  if (!ate) newSnake.pop();

  return { snake: newSnake, food: ate ? randomFood(newSnake) : food, ate };
}

// ═══ Console Mesh (Game Boy shape) ═══
function ConsoleMesh({ screenTexture }: { screenTexture: THREE.Texture }) {
  return (
    <group position={[0, -0.3, 0.5]} rotation={[0.2, 0, 0]}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.9, 1.2, 0.08]} />
        <meshStandardMaterial color="#c0c0d0" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Screen bezel */}
      <mesh position={[0, 0.18, 0.045]}>
        <boxGeometry args={[0.7, 0.5, 0.01]} />
        <meshStandardMaterial color="#333" roughness={0.8} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0.18, 0.048]}>
        <planeGeometry args={[0.6, 0.4]} />
        <meshBasicMaterial map={screenTexture} />
      </mesh>
      {/* D-pad */}
      <mesh position={[-0.2, -0.35, 0.045]}>
        <boxGeometry args={[0.18, 0.18, 0.015]} />
        <meshStandardMaterial color="#444" roughness={0.6} />
      </mesh>
      {/* A / B buttons */}
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

// ═══ Simple Character ═══
function Character() {
  return (
    <group position={[0, -0.2, 0]}>
      {/* Head */}
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="#f4c9a0" roughness={0.6} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.5, 16]} />
        <meshStandardMaterial color="#4a90d9" roughness={0.5} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.28, 0.5, 0]} rotation={[0, 0, -0.4]}>
        <cylinderGeometry args={[0.06, 0.06, 0.5, 8]} />
        <meshStandardMaterial color="#4a90d9" roughness={0.5} />
      </mesh>
      <mesh position={[0.28, 0.5, 0]} rotation={[0, 0, 0.4]}>
        <cylinderGeometry args={[0.06, 0.06, 0.5, 8]} />
        <meshStandardMaterial color="#4a90d9" roughness={0.5} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.1, -0.05, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.4, 8]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.7} />
      </mesh>
      <mesh position={[0.1, -0.05, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.4, 8]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.7} />
      </mesh>
    </group>
  );
}

// ═══ Room (floor, wall, decor) ═══
function Room() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#2a2035" roughness={0.9} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 0.3, -2]} receiveShadow>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#1a1525" roughness={0.8} />
      </mesh>
      {/* Desk */}
      <mesh position={[0, -0.65, 0.5]}>
        <boxGeometry args={[1.5, 0.06, 0.8]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.5} />
      </mesh>
      {/* Lamp glow */}
      <pointLight position={[0.5, 1.5, -0.5]} intensity={2} color="#ffe8c0" />
      <ambientLight intensity={0.4} />
    </group>
  );
}

// ═══ Main Scene ═══
export default function SnakeScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const screenTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const snakeRef = useRef<Point[]>([
    { x: 2, y: 4 },
    { x: 1, y: 4 },
    { x: 0, y: 4 },
  ]);
  const foodRef = useRef<Point>({ x: 6, y: 4 });
  const dirRef = useRef("RIGHT");
  const dirBufferRef = useRef("RIGHT");
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const tickRef = useRef(0);
  const speedRef = useRef(200); // ms per tick

  // Draw snake to canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const cellW = CANVAS_SIZE / GRID;
    const cellH = CANVAS_SIZE / GRID;

    // Background
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Grid lines
    ctx.strokeStyle = "#222244";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellW, 0);
      ctx.lineTo(i * cellW, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellH);
      ctx.lineTo(CANVAS_SIZE, i * cellH);
      ctx.stroke();
    }

    // Food (pulsing)
    const pulse = Math.sin(Date.now() * 0.005) * 0.2 + 0.8;
    ctx.fillStyle = "#ff4444";
    ctx.shadowColor = "#ff4444";
    ctx.shadowBlur = 8 * pulse;
    ctx.beginPath();
    ctx.arc(
      foodRef.current.x * cellW + cellW / 2,
      foodRef.current.y * cellH + cellH / 2,
      (cellW / 2 - 2) * pulse,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Snake
    const snake = snakeRef.current;
    snake.forEach((p, i) => {
      const ratio = 1 - i / (snake.length + 5);
      const r = Math.floor(0x33 + ratio * 0x99);
      const g = Math.floor(0xcc + ratio * 0x33);
      const b = Math.floor(0x44 + ratio * 0x55);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      const pad = i === 0 ? 1 : 2;
      ctx.fillRect(p.x * cellW + pad, p.y * cellH + pad, cellW - pad * 2, cellH - pad * 2);
    });

    // Update texture
    if (screenTextureRef.current) {
      screenTextureRef.current.needsUpdate = true;
    }
  }, []);

  // Game tick
  useEffect(() => {
    if (!started || gameOver) return;

    let lastTick = 0;
    let frameId: number;

    const loop = (time: number) => {
      frameId = requestAnimationFrame(loop);
      if (time - lastTick < speedRef.current) return;
      lastTick = time;

      dirRef.current = dirBufferRef.current;
      const result = moveSnake(snakeRef.current, dirRef.current, foodRef.current);
      snakeRef.current = result.snake;
      foodRef.current = result.food;

      if (result.ate) {
        setScore((s) => s + 1);
        speedRef.current = Math.max(80, speedRef.current - 3);
      }

      // Check game over: if snake reset to short
      if (result.snake.length <= 3 && snakeRef.current.length > 3) {
        setGameOver(true);
      }

      draw();
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [started, gameOver, draw]);

  // Create CanvasTexture on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    screenTextureRef.current = new THREE.CanvasTexture(canvas);
    screenTextureRef.current.minFilter = THREE.NearestFilter;
    screenTextureRef.current.magFilter = THREE.NearestFilter;
    setTexture(screenTextureRef.current);
    draw();
  }, [draw]);

  // Keyboard input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (gameOver) return;
      const d = dirRef.current;
      if (e.key === "ArrowUp" && d !== "DOWN") dirBufferRef.current = "UP";
      if (e.key === "ArrowDown" && d !== "UP") dirBufferRef.current = "DOWN";
      if (e.key === "ArrowLeft" && d !== "RIGHT") dirBufferRef.current = "LEFT";
      if (e.key === "ArrowRight" && d !== "LEFT") dirBufferRef.current = "RIGHT";
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (gameOver) reset();
        else setStarted((s) => !s);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gameOver]);

  const reset = () => {
    snakeRef.current = [
      { x: 2, y: 4 },
      { x: 1, y: 4 },
      { x: 0, y: 4 },
    ];
    foodRef.current = { x: 6, y: 4 };
    dirRef.current = "RIGHT";
    dirBufferRef.current = "RIGHT";
    speedRef.current = 200;
    setScore(0);
    setGameOver(false);
    setStarted(true);
    draw();
  };

  return (
    <>
      {/* Hidden canvas for Snake rendering */}
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        style={{ display: "none" }}
      />

      <Canvas
        camera={{ position: [0, 0.5, 2.5], fov: 50 }}
        gl={{ antialias: true }}
        style={{ background: "#0a0a0f" }}
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
        {texture && <ConsoleMesh screenTexture={texture} />}
      </Canvas>

      {/* On-screen D-pad for mobile */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          display: "grid",
          gridTemplateColumns: "50px 50px 50px",
          gridTemplateRows: "50px 50px 50px",
          gap: 2,
          zIndex: 20,
        }}
      >
        {/* UP */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            if (dirRef.current !== "DOWN") dirBufferRef.current = "UP";
          }}
          onClick={() => {
            if (dirRef.current !== "DOWN") dirBufferRef.current = "UP";
          }}
          style={{
            gridColumn: 2,
            gridRow: 1,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 8,
            cursor: "pointer",
            color: "white",
            fontSize: 18,
          }}
        >
          ▲
        </button>
        {/* LEFT */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            if (dirRef.current !== "RIGHT") dirBufferRef.current = "LEFT";
          }}
          onClick={() => {
            if (dirRef.current !== "RIGHT") dirBufferRef.current = "LEFT";
          }}
          style={{
            gridColumn: 1,
            gridRow: 2,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 8,
            cursor: "pointer",
            color: "white",
            fontSize: 18,
          }}
        >
          ◀
        </button>
        {/* RIGHT */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            if (dirRef.current !== "LEFT") dirBufferRef.current = "RIGHT";
          }}
          onClick={() => {
            if (dirRef.current !== "LEFT") dirBufferRef.current = "RIGHT";
          }}
          style={{
            gridColumn: 3,
            gridRow: 2,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 8,
            cursor: "pointer",
            color: "white",
            fontSize: 18,
          }}
        >
          ▶
        </button>
        {/* DOWN */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            if (dirRef.current !== "UP") dirBufferRef.current = "DOWN";
          }}
          onClick={() => {
            if (dirRef.current !== "UP") dirBufferRef.current = "DOWN";
          }}
          style={{
            gridColumn: 2,
            gridRow: 3,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 8,
            cursor: "pointer",
            color: "white",
            fontSize: 18,
          }}
        >
          ▼
        </button>
      </div>

      {/* Start / Reset / Info */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 16,
          color: "rgba(255,255,255,0.7)",
          fontSize: 12,
          fontFamily: "monospace",
          zIndex: 20,
        }}
      >
        Score: {score}
        {gameOver && " · GAME OVER"}
      </div>
      {(!started || gameOver) && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 20,
            zIndex: 20,
          }}
        >
          <button
            onClick={reset}
            style={{
              padding: "8px 18px",
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              border: "2px solid rgba(255,255,255,0.5)",
              borderRadius: 20,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
              backdropFilter: "blur(8px)",
            }}
          >
            {gameOver ? "🔄 重新开始" : "▶ 开始游戏"}
          </button>
        </div>
      )}
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 16,
          color: "rgba(255,255,255,0.35)",
          fontSize: 10,
          fontFamily: "monospace",
          zIndex: 20,
        }}
      >
        Arrow keys / D-pad · Space to pause
      </div>
    </>
  );
}
