"use client";

import { useRef, useEffect, useCallback, useState, Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

const BUILD_TIME = Date.now();

// ═══ Snake Game Logic ═══
const GRID = 10;
const CANVAS_SIZE = 200;
const INITIAL_SPEED = 180;

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

function makeSnake(): Point[] {
  return [{ x: 2, y: 4 }, { x: 1, y: 4 }, { x: 0, y: 4 }];
}

const OPPOSITES: Record<string, string> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };

function tick(snake: Point[], dir: string, food: Point): { snake: Point[]; food: Point; ate: boolean; dead: boolean } {
  const head = snake[0];
  const newHead = { x: head.x, y: head.y };
  if (dir === "UP") newHead.y = (newHead.y - 1 + GRID) % GRID;
  if (dir === "DOWN") newHead.y = (newHead.y + 1) % GRID;
  if (dir === "LEFT") newHead.x = (newHead.x - 1 + GRID) % GRID;
  if (dir === "RIGHT") newHead.x = (newHead.x + 1) % GRID;

  // Self-collision (skip tail tip if didn't eat)
  const body = snake.slice(0, -1);
  if (body.some((s) => s.x === newHead.x && s.y === newHead.y)) {
    return { snake, food, ate: false, dead: true };
  }

  const ate = newHead.x === food.x && newHead.y === food.y;
  const newSnake = [newHead, ...snake];
  if (!ate) newSnake.pop();

  return { snake: newSnake, food: ate ? randomFood(newSnake) : food, ate, dead: false };
}

// ═══ Console Model (GLB) ═══
function ConsoleModel({ 
  screenTexture, 
  onDebug 
}: { 
  screenTexture: THREE.Texture; 
  onDebug?: (msg: string) => void;
}) {
  const gltf = useGLTF("/r3f-lab/models/gameboy-retro.glb");
  const scene = gltf.scene;

  // Clone scene to avoid mutating cached GLTF
  const clonedScene = useMemo(() => {
    let foundScreen = false;
    const meshNames: string[] = [];
    
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        meshNames.push(child.name);
      }
      if (child.name === "screen.001" && child instanceof THREE.Mesh) {
        child.material = new THREE.MeshBasicMaterial({ map: screenTexture });
        foundScreen = true;
      }
    });
    
    onDebug?.("Meshes: " + meshNames.join(", "));
    onDebug?.(foundScreen ? "✅ screen.001 FOUND" : "❌ screen.001 NOT FOUND");
    return clone;
  }, [scene, screenTexture, onDebug]);

  return <primitive object={clonedScene} position={[0, -0.25, 0.6]} rotation={[0.2, 0, 0]} scale={0.85} />;
}

// ═══ Character ═══
function Character() {
  return (
    <group position={[0, -0.2, 0]}>
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="#f4c9a0" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.5, 16]} />
        <meshStandardMaterial color="#4a90d9" roughness={0.5} />
      </mesh>
      <mesh position={[-0.28, 0.5, 0]} rotation={[0, 0, -0.4]}>
        <cylinderGeometry args={[0.06, 0.06, 0.5, 8]} />
        <meshStandardMaterial color="#4a90d9" roughness={0.5} />
      </mesh>
      <mesh position={[0.28, 0.5, 0]} rotation={[0, 0, 0.4]}>
        <cylinderGeometry args={[0.06, 0.06, 0.5, 8]} />
        <meshStandardMaterial color="#4a90d9" roughness={0.5} />
      </mesh>
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

// ═══ Room ═══
function Room() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#2a2035" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.3, -2]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#1a1525" roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.65, 0.5]}>
        <boxGeometry args={[1.5, 0.06, 0.8]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.5} />
      </mesh>
      <pointLight position={[0.5, 1.5, -0.5]} intensity={2} color="#ffe8c0" />
      <ambientLight intensity={0.4} />
    </group>
  );
}

// ═══ Log System ═══
type LogEntry = { ts: string; msg: string };

function timeStr() {
  return new Date().toISOString().slice(11, 23);
}

function LogPanel({ logs }: { logs: LogEntry[] }) {
  const [open, setOpen] = useState(false);
  if (logs.length === 0) return null;
  const last = logs.slice(-3);
  return (
    <div style={{ position: "absolute", top: 60, left: 12, right: 12, zIndex: 999, fontFamily: "monospace", pointerEvents: "auto" }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button onTouchStart={(e) => { e.preventDefault(); setOpen(!open); }} onClick={() => setOpen(!open)}
          style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 4, padding: "2px 8px", cursor: "pointer" }}>
          {open ? "▲ 收起日志" : "▼ 日志"}
        </button>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>{logs.length} entries</span>
      </div>
      {!open && (
        <div style={{ marginTop: 4, color: "rgba(255,255,255,0.35)", fontSize: 10, lineHeight: 1.4 }}>
          {last.map((l, i) => <div key={i}>{l.ts} {l.msg}</div>)}
        </div>
      )}
      {open && (
        <div style={{ marginTop: 4, color: "rgba(255,255,255,0.45)", fontSize: 10, lineHeight: 1.5,
          background: "rgba(0,0,0,0.85)", borderRadius: 6, padding: 8, maxHeight: 160, overflowY: "auto",
          border: "1px solid rgba(255,255,255,0.15)", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
          {logs.map((l, i) => <div key={i}>{l.ts} {l.msg}</div>)}
        </div>
      )}
    </div>
  );
}

// ═══ Main Scene ═══
export default function SnakeScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const screenTexRef = useRef<THREE.CanvasTexture | null>(null);
  const snakeRef = useRef<Point[]>(makeSnake());
  const foodRef = useRef<Point>(randomFood(makeSnake()));
  const dirRef = useRef("RIGHT");
  const dirBufRef = useRef("RIGHT");
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const [debugLines, setDebugLines] = useState<string[]>([]);
  const addDebug = useCallback((msg: string) => {
    setDebugLines(prev => [...prev.slice(-10), msg]);
  }, []);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const log = useCallback((msg: string) => {
    setLogs((prev) => [...prev.slice(-199), { ts: timeStr(), msg }]);
    setDebugLines((prev) => [...prev.slice(-10), msg]); // also show in debug panel
  }, []);
  const speedRef = useRef(INITIAL_SPEED);
  const lastTickRef = useRef(0);

  // Draw snake to 2D canvas
  const draw = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d")!;
    const cw = CANVAS_SIZE / GRID;

    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Grid
    ctx.strokeStyle = "#222244";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath(); ctx.moveTo(i * cw, 0); ctx.lineTo(i * cw, CANVAS_SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * cw); ctx.lineTo(CANVAS_SIZE, i * cw); ctx.stroke();
    }

    // Food (pulse)
    const pulse = Math.sin(Date.now() * 0.005) * 0.2 + 0.8;
    ctx.fillStyle = "#ff4444";
    ctx.shadowColor = "#ff4444";
    ctx.shadowBlur = 8 * pulse;
    ctx.beginPath();
    ctx.arc(foodRef.current.x * cw + cw / 2, foodRef.current.y * cw + cw / 2, (cw / 2 - 2) * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Snake
    const s = snakeRef.current;
    s.forEach((p, i) => {
      const ratio = 1 - i / (s.length + 5);
      const r = Math.floor(0x33 + ratio * 0x99);
      const g = Math.floor(0xcc + ratio * 0x33);
      const b = Math.floor(0x44 + ratio * 0x55);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      const pad = i === 0 ? 1 : 2;
      ctx.fillRect(p.x * cw + pad, p.y * cw + pad, cw - pad * 2, cw - pad * 2);
    });

    screenTexRef.current && (screenTexRef.current.needsUpdate = true);
  }, []);

  // Game loop (auto-starts)
  useEffect(() => {
    let frameId: number;
    let tickCount = 0;

    const loop = (time: number) => {
      frameId = requestAnimationFrame(loop);
      if (gameOver) return;
      if (time - lastTickRef.current < speedRef.current) return;
      lastTickRef.current = time;

      dirRef.current = dirBufRef.current;
      const result = tick(snakeRef.current, dirRef.current, foodRef.current);
      snakeRef.current = result.snake;
      foodRef.current = result.food;

      if (result.ate) {
        setScore((s) => s + 1);
        speedRef.current = Math.max(70, speedRef.current - 4);
      }
      if (result.dead) {
        log("☠ DEATH! len=" + result.snake.length);
        setGameOver(true);
      }

      tickCount++;
      if (tickCount % 30 === 0) {
        log("⏱ tick #" + tickCount + " speed=" + speedRef.current + " len=" + snakeRef.current.length);
      }

      draw();
    };

    log("▲ Game loop started");
    frameId = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(frameId); };
  }, [gameOver, draw, log]);

  // CanvasTexture
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    screenTexRef.current = new THREE.CanvasTexture(cvs);
    screenTexRef.current.minFilter = THREE.NearestFilter;
    screenTexRef.current.magFilter = THREE.NearestFilter;
    setTexture(screenTexRef.current);
    log("▲ CanvasTexture created: " + CANVAS_SIZE + "x" + CANVAS_SIZE);
    draw();
  }, [draw, log]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const d = dirRef.current;
      if (e.key === "ArrowUp" && d !== "DOWN") dirBufRef.current = "UP";
      if (e.key === "ArrowDown" && d !== "UP") dirBufRef.current = "DOWN";
      if (e.key === "ArrowLeft" && d !== "RIGHT") dirBufRef.current = "LEFT";
      if (e.key === "ArrowRight" && d !== "LEFT") dirBufRef.current = "RIGHT";
      if (e.key === "r" || e.key === "R") reset();
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gameOver]);

  const reset = () => {
    snakeRef.current = makeSnake();
    foodRef.current = randomFood(makeSnake());
    dirRef.current = "RIGHT";
    dirBufRef.current = "RIGHT";
    speedRef.current = INITIAL_SPEED;
    lastTickRef.current = 0;
    setScore(0);
    setGameOver(false);
    draw();
  };

  const press = (key: string) => {
    const d = dirRef.current;
    if (key === "UP" && d !== "DOWN") dirBufRef.current = "UP";
    if (key === "DOWN" && d !== "UP") dirBufRef.current = "DOWN";
    if (key === "LEFT" && d !== "RIGHT") dirBufRef.current = "LEFT";
    if (key === "RIGHT" && d !== "LEFT") dirBufRef.current = "RIGHT";
  };

  return (
    <>
      <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} style={{ display: "none" }} />

      <div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}>
        <Canvas
          camera={{ position: [0, 0.5, 2.5], fov: 50 }}
          gl={{ antialias: true }}
          style={{ background: "#0a0a0f" }}
        >
          <OrbitControls
            enableDamping dampingFactor={0.08}
            minDistance={1.5} maxDistance={6}
            minPolarAngle={Math.PI * 0.3} maxPolarAngle={Math.PI * 0.65}
          />
          <Room />
          <Character />
          {texture && (
            <Suspense fallback={<mesh><boxGeometry args={[0.5,0.5,0.5]} /><meshBasicMaterial color="red" /></mesh>}>
              <ConsoleModel screenTexture={texture} onDebug={log} />
            </Suspense>
          )}
        </Canvas>
      </div>

      <LogPanel logs={logs} />

      {/* Info */}
      <div style={{ position: "absolute", top: 12, left: 16, color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "monospace", zIndex: 25 }}>
        Score: {score} {gameOver && "· GAME OVER"} <span style={{color:"rgba(255,255,255,0.25)",fontSize:10}}>v{BUILD_TIME}</span>
      </div>
      {debugLines.length > 0 && (
        <div style={{ position: "absolute", top: 36, left: 16, color: "rgba(255,255,100,0.7)", fontSize: 9, fontFamily: "monospace", zIndex: 99, background: "rgba(0,0,0,0.7)", padding: "2px 6px", borderRadius: 4, maxWidth: "90%" }}>
          {debugLines.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}
      <div style={{ position: "absolute", top: 36, left: 16, color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "monospace", zIndex: 25 }}>
        Arrow keys · R to restart
      </div>

      {/* Reset button when game over */}
      {gameOver && (
        <div style={{ position: "absolute", bottom: 80, left: 20, zIndex: 25 }}>
          <button
            onClick={reset}
            style={{
              padding: "8px 18px", background: "rgba(255,255,255,0.15)", color: "#fff",
              border: "2px solid rgba(255,255,255,0.5)", borderRadius: 20,
              cursor: "pointer", fontSize: 14, fontWeight: 500, backdropFilter: "blur(8px)",
            }}
          >
            🔄 重新开始
          </button>
        </div>
      )}

      {/* D-pad for mobile */}
      <div style={{
        position: "absolute", bottom: 20, right: 20, zIndex: 25,
        display: "grid", gridTemplateColumns: "44px 44px 44px", gridTemplateRows: "44px 44px 44px", gap: 2,
      }}>
        <button onTouchStart={(e) => { e.preventDefault(); press("UP"); }} onClick={() => press("UP")}
          style={btnStyle}>
          ▲
        </button>
        <button onTouchStart={(e) => { e.preventDefault(); press("LEFT"); }} onClick={() => press("LEFT")}
          style={{ ...btnStyle, gridColumn: 1, gridRow: 2 }}>
          ◀
        </button>
        <button onTouchStart={(e) => { e.preventDefault(); press("RIGHT"); }} onClick={() => press("RIGHT")}
          style={{ ...btnStyle, gridColumn: 3, gridRow: 2 }}>
          ▶
        </button>
        <button onTouchStart={(e) => { e.preventDefault(); press("DOWN"); }} onClick={() => press("DOWN")}
          style={{ ...btnStyle, gridColumn: 2, gridRow: 3 }}>
          ▼
        </button>
      </div>
    </>
  );
}

const btnStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 8, cursor: "pointer", color: "white", fontSize: 18,
  display: "flex", alignItems: "center", justifyContent: "center",
};
