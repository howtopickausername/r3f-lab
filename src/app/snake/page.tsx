"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Link from "next/link";

// ═══ Snake Game Logic ═══
const GRID = 10;
const CELL = 200;
const SPEED = 180;

type Pt = { x: number; y: number };
function makeSnake(): Pt[] { return [{x:2,y:4},{x:1,y:4},{x:0,y:4}]; }
function randFood(s: Pt[]): Pt { let p:Pt; do { p={x:Math.floor(Math.random()*GRID),y:Math.floor(Math.random()*GRID)}; }while(s.some(q=>q.x===p.x&&q.y===p.y));return p; }

function tick(s:Pt[],d:string,f:Pt):{s:Pt[],f:Pt,ate:boolean,dead:boolean}{
  const h=s[0],nh={x:h.x,y:h.y};
  if(d==="UP")nh.y=(nh.y-1+GRID)%GRID;
  if(d==="DOWN")nh.y=(nh.y+1)%GRID;
  if(d==="LEFT")nh.x=(nh.x-1+GRID)%GRID;
  if(d==="RIGHT")nh.x=(nh.x+1)%GRID;
  const body=s.slice(0,-1);
  if(body.some(q=>q.x===nh.x&&q.y===nh.y))return{s,f,ate:false,dead:true};
  const ate=nh.x===f.x&&nh.y===f.y;
  const ns=[nh,...s];if(!ate)ns.pop();
  return{s:ns,f:ate?randFood(ns):f,ate,dead:false};
}

// ═══ Draw to Canvas ═══
function drawGame(cvs:HTMLCanvasElement,snake:Pt[],food:Pt){
  const ctx=cvs.getContext("2d")!,w=CELL/GRID;
  ctx.fillStyle="#0d0d1a";ctx.fillRect(0,0,CELL,CELL);
  ctx.strokeStyle="#1a1a33";ctx.lineWidth=0.5;
  for(let i=0;i<=GRID;i++){ctx.beginPath();ctx.moveTo(i*w,0);ctx.lineTo(i*w,CELL);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i*w);ctx.lineTo(CELL,i*w);ctx.stroke()}
  const p=Math.sin(Date.now()*0.005)*0.2+0.8;
  ctx.fillStyle="#ff4466";ctx.shadowColor="#ff4466";ctx.shadowBlur=8*p;
  ctx.beginPath();ctx.arc(food.x*w+w/2,food.y*w+w/2,(w/2-2)*p,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  snake.forEach((p,i)=>{const r=1-i/(snake.length+5);ctx.fillStyle=`rgb(${Math.floor(51+r*153)},${Math.floor(204+r*51)},${Math.floor(68+r*85)})`;const pad=i===0?1:2;ctx.fillRect(p.x*w+pad,p.y*w+pad,w-pad*2,w-pad*2)});
}

// ═══ 3D Components ═══
function ConsoleMesh({tex}:{tex:THREE.Texture}){
  return <group position={[0,-0.3,0.5]} rotation={[0.25,0,0]}>
    <mesh><boxGeometry args={[0.9,1.2,0.08]}/><meshStandardMaterial color="#c0c0d0" roughness={0.4} metalness={0.3}/></mesh>
    <mesh position={[0,0.18,0.045]}><boxGeometry args={[0.7,0.5,0.01]}/><meshStandardMaterial color="#1a1a1a" roughness={0.8}/></mesh>
    <mesh position={[0,0.18,0.048]}><planeGeometry args={[0.6,0.4]}/><meshBasicMaterial map={tex}/></mesh>
    <mesh position={[-0.2,-0.35,0.045]}><boxGeometry args={[0.18,0.18,0.015]}/><meshStandardMaterial color="#444" roughness={0.6}/></mesh>
    <mesh position={[0.2,-0.3,0.045]}><cylinderGeometry args={[0.06,0.06,0.015,16]}/><meshStandardMaterial color="#e04060" roughness={0.3}/></mesh>
    <mesh position={[0.3,-0.38,0.045]}><cylinderGeometry args={[0.06,0.06,0.015,16]}/><meshStandardMaterial color="#e04060" roughness={0.3}/></mesh>
  </group>;
}

function Char(){
  return <group position={[0,-0.2,0]}>
    <mesh position={[0,0.8,0]}><sphereGeometry args={[0.2,32,32]}/><meshStandardMaterial color="#f4c9a0" roughness={0.6}/></mesh>
    <mesh position={[0,0.45,0]}><cylinderGeometry args={[0.15,0.2,0.5,16]}/><meshStandardMaterial color="#4a90d9" roughness={0.5}/></mesh>
    <mesh position={[-0.28,0.5,0]} rotation={[0,0,-0.4]}><cylinderGeometry args={[0.06,0.06,0.5,8]}/><meshStandardMaterial color="#4a90d9" roughness={0.5}/></mesh>
    <mesh position={[0.28,0.5,0]} rotation={[0,0,0.4]}><cylinderGeometry args={[0.06,0.06,0.5,8]}/><meshStandardMaterial color="#4a90d9" roughness={0.5}/></mesh>
    <mesh position={[-0.1,-0.05,0]}><cylinderGeometry args={[0.07,0.07,0.4,8]}/><meshStandardMaterial color="#3a3a3a" roughness={0.7}/></mesh>
    <mesh position={[0.1,-0.05,0]}><cylinderGeometry args={[0.07,0.07,0.4,8]}/><meshStandardMaterial color="#3a3a3a" roughness={0.7}/></mesh>
  </group>;
}

function Room(){
  return <group>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.5,0]}><planeGeometry args={[6,6]}/><meshStandardMaterial color="#2a2035" roughness={0.9}/></mesh>
    <mesh position={[0,0.3,-2]}><planeGeometry args={[6,4]}/><meshStandardMaterial color="#1a1525" roughness={0.8}/></mesh>
    <mesh position={[0,-0.65,0.5]}><boxGeometry args={[1.5,0.06,0.8]}/><meshStandardMaterial color="#5a4a3a" roughness={0.5}/></mesh>
    <pointLight position={[0.5,1.5,-0.5]} intensity={2} color="#ffe8c0"/>
    <ambientLight intensity={0.4}/>
  </group>;
}

// ═══ Main ═══
export default function SnakePage() {
  const cvsRef = useRef<HTMLCanvasElement>(null);
  const texRef = useRef<THREE.CanvasTexture|null>(null);
  const snakeRef = useRef<Pt[]>(makeSnake());
  const foodRef = useRef<Pt>(randFood(makeSnake()));
  const dirRef = useRef("RIGHT");
  const bufRef = useRef("RIGHT");
  const speedRef = useRef(SPEED);
  const lastRef = useRef(0);
  const [score, setScore] = useState(0);
  const [dead, setDead] = useState(false);
  const [tex, setTex] = useState<THREE.CanvasTexture|null>(null);

  // Draw
  const draw = useCallback(()=>{
    const c=cvsRef.current; if(!c)return;
    drawGame(c,snakeRef.current,foodRef.current);
    texRef.current&&(texRef.current.needsUpdate=true);
  },[]);

  // Game loop
  useEffect(()=>{
    let id:number;
    const loop=(t:number)=>{
      id=requestAnimationFrame(loop);
      if(dead)return;
      if(t-lastRef.current<speedRef.current)return;
      lastRef.current=t;
      dirRef.current=bufRef.current;
      const r=tick(snakeRef.current,dirRef.current,foodRef.current);
      snakeRef.current=r.s;foodRef.current=r.f;
      if(r.ate){setScore(s=>s+1);speedRef.current=Math.max(70,speedRef.current-4);}
      if(r.dead)setDead(true);
      draw();
    };
    id=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(id);
  },[dead,draw]);

  // Texture
  useEffect(()=>{
    const c=cvsRef.current;if(!c)return;
    texRef.current=new THREE.CanvasTexture(c);
    texRef.current.minFilter=THREE.NearestFilter;
    texRef.current.magFilter=THREE.NearestFilter;
    setTex(texRef.current);draw();
  },[draw]);

  // Keys
  useEffect(()=>{
    const k=(e:KeyboardEvent)=>{
      const d=dirRef.current;
      if(e.key==="ArrowUp"&&d!=="DOWN")bufRef.current="UP";
      if(e.key==="ArrowDown"&&d!=="UP")bufRef.current="DOWN";
      if(e.key==="ArrowLeft"&&d!=="RIGHT")bufRef.current="LEFT";
      if(e.key==="ArrowRight"&&d!=="LEFT")bufRef.current="RIGHT";
      if(e.key==="r"||e.key==="R")reset();
      e.preventDefault();
    };
    addEventListener("keydown",k);
    return ()=>removeEventListener("keydown",k);
  },[dead]);

  const reset=()=>{
    snakeRef.current=makeSnake();foodRef.current=randFood(makeSnake());
    dirRef.current="RIGHT";bufRef.current="RIGHT";
    speedRef.current=SPEED;lastRef.current=0;
    setScore(0);setDead(false);draw();
  };

  const press=(d:string)=>{
    const cd=dirRef.current;
    if(d==="UP"&&cd!=="DOWN")bufRef.current="UP";
    if(d==="DOWN"&&cd!=="UP")bufRef.current="DOWN";
    if(d==="LEFT"&&cd!=="RIGHT")bufRef.current="LEFT";
    if(d==="RIGHT"&&cd!=="LEFT")bufRef.current="RIGHT";
  };

  return <>
    <canvas ref={cvsRef} width={CELL} height={CELL} hidden/>

    <div style={{position:"absolute",inset:0}}>
      <Canvas camera={{position:[0,0.5,2.5],fov:50}} gl={{antialias:true}} style={{background:"#0a0a0f"}}>
        <OrbitControls enableDamping dampingFactor={0.08} minDistance={1.5} maxDistance={6} minPolarAngle={Math.PI*.3} maxPolarAngle={Math.PI*.65}/>
        <Room/><Char/>{tex&&<ConsoleMesh tex={tex}/>}
      </Canvas>
    </div>

    {/* Score & controls — all zIndex: 99 to beat Canvas */}
    <div style={{position:"absolute",top:12,left:16,zIndex:99,display:"flex",alignItems:"center",gap:12}}>
      <Link href="/" style={{color:"rgba(255,255,255,0.5)",fontSize:11,fontFamily:"monospace",textDecoration:"none"}}>← Back</Link>
      <span style={{color:"rgba(255,255,255,0.7)",fontSize:13,fontFamily:"monospace"}}>Score: {score} {dead&&"· GAME OVER"}</span>
    </div>
    <div style={{position:"absolute",top:36,left:16,zIndex:99,color:"rgba(255,255,255,0.35)",fontSize:11,fontFamily:"monospace"}}>Arrow keys · R to restart</div>

    {dead&&<div style={{position:"absolute",bottom:80,left:20,zIndex:99}}>
      <button onClick={reset} style={bS}>🔄 重新开始</button>
    </div>}

    {/* D-pad */}
    <div style={{position:"absolute",bottom:20,right:20,zIndex:99,display:"grid",gridTemplateColumns:"44px 44px 44px",gridTemplateRows:"44px 44px 44px",gap:2}}>
      <button onTouchStart={e=>{e.preventDefault();press("UP")}} onClick={()=>press("UP")} style={dS}>▲</button>
      <button onTouchStart={e=>{e.preventDefault();press("LEFT")}} onClick={()=>press("LEFT")} style={{...dS,gridColumn:1,gridRow:2}}>◀</button>
      <button onTouchStart={e=>{e.preventDefault();press("RIGHT")}} onClick={()=>press("RIGHT")} style={{...dS,gridColumn:3,gridRow:2}}>▶</button>
      <button onTouchStart={e=>{e.preventDefault();press("DOWN")}} onClick={()=>press("DOWN")} style={{...dS,gridColumn:2,gridRow:3}}>▼</button>
    </div>
  </>;
}

const bS:React.CSSProperties={padding:"8px 18px",background:"rgba(255,255,255,0.15)",color:"#fff",border:"2px solid rgba(255,255,255,0.5)",borderRadius:20,cursor:"pointer",fontSize:14,fontWeight:500,backdropFilter:"blur(8px)"};
const dS:React.CSSProperties={background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,cursor:"pointer",color:"white",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"};
