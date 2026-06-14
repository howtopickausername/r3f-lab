"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Link from "next/link";
import { makeSnake, randomFood, tick, GRID } from "@/lib/snake";

const CELL = 200;
const INIT_SPEED = 180;

type LogEntry = { ts: string; msg: string };

// ═══ Log System ═══
function timeStr() {
  return new Date().toISOString().slice(11, 23);
}

function LogPanel({ logs }: { logs: LogEntry[] }) {
  const [open, setOpen] = useState(false);
  const copyAll = () => {
    const text = logs.map((l) => `${l.ts} ${l.msg}`).join("\n");
    navigator.clipboard.writeText(text).catch(() => {});
  };
  const last = logs.slice(-3);

  return (
    <div style={{ position: "absolute", top: 60, left: 12, right: 12, zIndex: 999, fontFamily: "monospace", pointerEvents: "auto" }}>
      {/* Toggle / copy bar */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button
          onClick={() => setOpen(!open)}
          onTouchStart={(e) => { e.preventDefault(); setOpen(!open); }}
          style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 4, padding: "2px 8px", cursor: "pointer" }}
        >
          {open ? "▲ 收起日志" : "▼ 日志"}
        </button>
        <button
          onClick={copyAll}
          onTouchStart={(e) => { e.preventDefault(); copyAll(); }}
          style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 4, padding: "2px 8px", cursor: "pointer" }}
        >
          📋 复制
        </button>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>
          {logs.length} entries
        </span>
      </div>

      {/* Collapsed: last 3 lines */}
      {!open && (
        <div style={{ marginTop: 4, color: "rgba(255,255,255,0.35)", fontSize: 10, lineHeight: 1.4 }}>
          {last.map((l, i) => <div key={i}>{l.ts} {l.msg}</div>)}
        </div>
      )}

      {/* Expanded: full scrollable log */}
      {open && (
        <div style={{
          marginTop: 4, color: "rgba(255,255,255,0.45)", fontSize: 10, lineHeight: 1.5,
          background: "rgba(0,0,0,0.85)", borderRadius: 6, padding: 8,
          maxHeight: 160, overflowY: "auto", border: "1px solid rgba(255,255,255,0.15)",
          whiteSpace: "pre-wrap", wordBreak: "break-all",
        }}>
          {logs.map((l, i) => (
            <div key={i}>{l.ts} {l.msg}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══ Draw ═══
function drawGame(canvas: HTMLCanvasElement, snake: {x:number;y:number}[], food: {x:number;y:number}) {
  const ctx = canvas.getContext("2d")!;
  const w = CELL / GRID;
  ctx.fillStyle = "#0d0d1a"; ctx.fillRect(0, 0, CELL, CELL);
  ctx.strokeStyle = "#1a1a33"; ctx.lineWidth = 0.5;
  for (let i = 1; i < GRID; i++) {
    ctx.beginPath(); ctx.moveTo(i * w, 0); ctx.lineTo(i * w, CELL); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * w); ctx.lineTo(CELL, i * w); ctx.stroke();
  }
  const pulse = Math.sin(Date.now() * 0.005) * 0.2 + 0.8;
  ctx.fillStyle = "#ff4466"; ctx.shadowColor = "#ff4466"; ctx.shadowBlur = 8 * pulse;
  ctx.beginPath(); ctx.arc(food.x * w + w / 2, food.y * w + w / 2, (w / 2 - 2) * pulse, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
  snake.forEach((p, i) => {
    const ratio = 1 - i / (snake.length + 5);
    ctx.fillStyle = `rgb(${Math.floor(51 + ratio * 153)},${Math.floor(204 + ratio * 51)},${Math.floor(68 + ratio * 85)})`;
    const pad = i === 0 ? 1 : 2;
    ctx.fillRect(p.x * w + pad, p.y * w + pad, w - pad * 2, w - pad * 2);
  });
}

// ═══ 3D ═══
function ConsoleMesh({ texRef }: { texRef: React.MutableRefObject<THREE.CanvasTexture | null> }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  useEffect(() => {
    const m = meshRef.current;
    const t = texRef.current;
    if (m && t) {
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.map = t;
      mat.color.set("#ffffff");
      mat.needsUpdate = true;
    }
  }, [texRef]);
  return (
    <group position={[0, -0.3, 0.5]} rotation={[0.25, 0, 0]}>
      <mesh><boxGeometry args={[0.9, 1.2, 0.08]} /><meshStandardMaterial color="#c0c0d0" roughness={0.4} metalness={0.3} /></mesh>
      <mesh position={[0, 0.18, 0.045]}><boxGeometry args={[0.7, 0.5, 0.01]} /><meshStandardMaterial color="#1a1a1a" roughness={0.8} /></mesh>
      <mesh ref={meshRef} position={[0, 0.18, 0.1]}>
        <planeGeometry args={[0.6, 0.4]} />
        <meshBasicMaterial color="#111122" />
      </mesh>
      <mesh position={[-0.2, -0.35, 0.045]}><boxGeometry args={[0.18, 0.18, 0.015]} /><meshStandardMaterial color="#555" roughness={0.5} /></mesh>
      <mesh position={[0.2, -0.3, 0.045]}><cylinderGeometry args={[0.06, 0.06, 0.015, 16]} /><meshStandardMaterial color="#e04060" roughness={0.3} /></mesh>
      <mesh position={[0.3, -0.38, 0.045]}><cylinderGeometry args={[0.06, 0.06, 0.015, 16]} /><meshStandardMaterial color="#e04060" roughness={0.3} /></mesh>
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}><planeGeometry args={[6, 6]} /><meshStandardMaterial color="#3a3045" roughness={0.9} /></mesh>
      <mesh position={[0, 0.3, -2]}><planeGeometry args={[6, 4]} /><meshStandardMaterial color="#2a2535" roughness={0.8} /></mesh>
      <mesh position={[0, -0.65, 0.5]}><boxGeometry args={[1.5, 0.06, 0.8]} /><meshStandardMaterial color="#6a5a4a" roughness={0.5} /></mesh>
      <pointLight position={[1, 2, 0]} intensity={4} color="#ffe8c0" />
      <pointLight position={[-1, 1, 1]} intensity={2} color="#ffe8c0" />
      <ambientLight intensity={0.8} />
    </group>
  );
}

// ═══ Main ═══
export default function SnakePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameCanvasRef = useRef<HTMLCanvasElement | null>(null);
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
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const log = useCallback((msg: string) => {
    setLogs((prev) => [...prev.slice(-199), { ts: timeStr(), msg }]);
  }, []);

  // Game loop
  useEffect(() => {
    if (mountedRef.current) {
      log("useEffect[dead] re-run, dead=" + dead + " (skipping init)");
      return;
    }
    mountedRef.current = true;
    log("▲ Mounted: starting game loop");

    // Create 2D canvas programmatically (hidden canvas may lack context on mobile)
    let gameCanvas = canvasRef.current;
    if (!gameCanvas) {
      gameCanvas = document.createElement("canvas");
      gameCanvas.width = CELL;
      gameCanvas.height = CELL;
      log("▲ Created canvas programmatically");
    }
    const ctx = gameCanvas.getContext("2d");
    if (!ctx) {
      log("⚠ FATAL: no 2d context!");
      return;
    }
    gameCanvasRef.current = gameCanvas;
    // Test draw: red rectangle
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(0, 0, CELL, CELL);
    const pixel = ctx.getImageData(10, 10, 1, 1).data;
    log("▲ 2D context OK, test pixel=[" + pixel[0] + "," + pixel[1] + "," + pixel[2] + "]");
    ctx.clearRect(0, 0, CELL, CELL);

    const drawNow = () => {
      drawGame(gameCanvas!, snakeRef.current, foodRef.current);
      if (texRef.current) texRef.current.needsUpdate = true;
    };

    // Create texture from game canvas
    texRef.current = new THREE.CanvasTexture(gameCanvas);
    texRef.current.minFilter = THREE.NearestFilter;
    texRef.current.magFilter = THREE.NearestFilter;
    log("▲ CanvasTexture created: " + CELL + "x" + CELL);
    drawNow();

    let frameId: number;
    let tickCount = 0;
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
        log("☠ DEATH! snake len=" + result.snake.length);
        setDead(true);
      }

      tickCount++;
      if (tickCount % 30 === 0) {
        log("⏱ tick #" + tickCount + " speed=" + speedRef.current + " len=" + snakeRef.current.length);
      }

      drawNow();
    };

    frameId = requestAnimationFrame(loop);
    log("▲ Game loop started");
    return () => { log("▼ Game loop cleaned up"); cancelAnimationFrame(frameId); };
  }, [dead, log]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const d = dirRef.current;
      if (e.key === "ArrowUp" && d !== "DOWN") { bufRef.current = "UP"; log("KEY: UP"); }
      if (e.key === "ArrowDown" && d !== "UP") { bufRef.current = "DOWN"; log("KEY: DOWN"); }
      if (e.key === "ArrowLeft" && d !== "RIGHT") { bufRef.current = "LEFT"; log("KEY: LEFT"); }
      if (e.key === "ArrowRight" && d !== "LEFT") { bufRef.current = "RIGHT"; log("KEY: RIGHT"); }
      if (e.key === "r" || e.key === "R") { log("KEY: R → reset()"); reset(); }
      e.preventDefault();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dead]);

  const reset = useCallback(() => {
    log("↻ reset() called. dead=" + dead + " gameCanvas=" + !!gameCanvasRef.current + " tex=" + !!texRef.current);
    snakeRef.current = makeSnake();
    foodRef.current = randomFood(makeSnake());
    dirRef.current = "RIGHT";
    bufRef.current = "RIGHT";
    speedRef.current = INIT_SPEED;
    lastRef.current = 0;
    setScore(0);
    setDead(false);
    const c = gameCanvasRef.current;
    if (c) {
      drawGame(c, snakeRef.current, foodRef.current);
      if (texRef.current) texRef.current.needsUpdate = true;
      log("↻ reset: drawGame + needsUpdate done");
    } else {
      log("⚠ reset: gameCanvas is null!");
    }
  }, [dead, log]);

  const press = useCallback((dir: string) => {
    const d = dirRef.current;
    if (dir === "UP" && d !== "DOWN") { bufRef.current = "UP"; log("BTN: UP"); }
    else if (dir === "DOWN" && d !== "UP") { bufRef.current = "DOWN"; log("BTN: DOWN"); }
    else if (dir === "LEFT" && d !== "RIGHT") { bufRef.current = "LEFT"; log("BTN: LEFT"); }
    else if (dir === "RIGHT" && d !== "LEFT") { bufRef.current = "RIGHT"; log("BTN: RIGHT"); }
    else log("BTN: " + dir + " IGNORED (opposite=" + d + ")");
  }, [log]);

  return (
    <>
      <canvas ref={canvasRef} width={CELL} height={CELL} hidden />

      {/* 3D Canvas */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        <Canvas
          camera={{ position: [0, 0.5, 2.5], fov: 50 }}
          gl={{ antialias: true }}
          onCreated={({ gl }) => { gl.setClearColor(new THREE.Color("#1a1525")); log("▲ Canvas onCreated"); }}
          style={{ background: "#1a1525" }}
        >
          <OrbitControls
            enableDamping dampingFactor={0.08}
            minDistance={1.5} maxDistance={6}
            minPolarAngle={Math.PI * 0.3} maxPolarAngle={Math.PI * 0.65}
          />
          <Room />
          <Character />
          <ConsoleMesh texRef={texRef} />
        </Canvas>
      </div>

      {/* Touch overlay for OrbitControls */}
      <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }} />

      {/* Log panel */}
      <LogPanel logs={logs} />

      {/* UI — all pointer-events: auto so they beat the Canvas */}
      <div style={{ position: "absolute", top: 12, left: 16, zIndex: 100, display: "flex", alignItems: "center", gap: 12, pointerEvents: "auto" }}>
        <Link href="/" style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "monospace", textDecoration: "none" }}>
          ← Back
        </Link>
        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, fontFamily: "monospace" }}>
          Score: {score}{dead && " · GAME OVER"}
        </span>
      </div>

      <div style={{ position: "absolute", bottom: 80, left: 20, zIndex: 100, pointerEvents: "auto" }}>
        <button
          onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); reset(); }}
          onClick={(e) => { e.stopPropagation(); reset(); }}
          style={{
            padding: "10px 20px", background: "rgba(255,255,255,0.15)", color: "#fff",
            border: "2px solid rgba(255,255,255,0.5)", borderRadius: 20,
            cursor: "pointer", fontSize: 14, fontWeight: 500, backdropFilter: "blur(8px)",
            touchAction: "manipulation",
          }}
        >
          ↻ 重来
        </button>
      </div>

      {/* D-pad */}
      <div style={{ position: "absolute", bottom: 20, right: 20, zIndex: 100, display: "grid", gridTemplateColumns: "48px 48px 48px", gridTemplateRows: "48px 48px 48px", gap: 3, pointerEvents: "auto" }}>
        <button onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); press("UP"); }} onClick={() => press("UP")} style={dpS}>▲</button>
        <button onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); press("LEFT"); }} onClick={() => press("LEFT")} style={{ ...dpS, gridColumn: 1, gridRow: 2 }}>◀</button>
        <button onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); press("RIGHT"); }} onClick={() => press("RIGHT")} style={{ ...dpS, gridColumn: 3, gridRow: 2 }}>▶</button>
        <button onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); press("DOWN"); }} onClick={() => press("DOWN")} style={{ ...dpS, gridColumn: 2, gridRow: 3 }}>▼</button>
      </div>
    </>
  );
}

const dpS: React.CSSProperties = {
  background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8,
  cursor: "pointer", color: "white", fontSize: 20,
  display: "flex", alignItems: "center", justifyContent: "center",
  touchAction: "manipulation",
};
