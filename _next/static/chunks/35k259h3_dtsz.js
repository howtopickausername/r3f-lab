(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,44117,e=>{"use strict";var o=e.i(43476),r=e.i(71645),i=e.i(75056),a=e.i(25234),t=e.i(30297),s=e.i(90072);let l=`
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec2 vUv;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,n=`
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
`;function c({position:e}){let i=(0,r.useRef)(null),t=(0,r.useRef)(0),s=(0,r.useMemo)(()=>({uTime:{value:0},uDissolve:{value:.3}}),[]);return(0,a.useFrame)((e,o)=>{i.current&&(t.current+=o,i.current.uniforms.uTime.value=t.current,i.current.uniforms.uDissolve.value=(Math.sin(.6*t.current)+1)*.45)}),(0,o.jsxs)("mesh",{position:e,rotation:[.3,0,0],children:[(0,o.jsx)("torusGeometry",{args:[.5,.2,32,64]}),(0,o.jsx)("shaderMaterial",{ref:i,vertexShader:l,fragmentShader:n,uniforms:s,transparent:!0})]})}let v=`
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec2 vUv;

uniform float uTime;

void main() {
  vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0)); // camera-facing approximation
  float fresnel = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
  fresnel = pow(fresnel, 2.5);
  
  // Scan lines
  float scanline = sin(vWorldPosition.y * 30.0 + uTime * 5.0) * 0.5 + 0.5;
  float scanline2 = sin(vWorldPosition.y * 15.0 - uTime * 3.0) * 0.5 + 0.5;
  float scan = scanline * scanline2;
  
  // Hex grid
  float hex = abs(fract(vUv.x * 12.0) - 0.5) + abs(fract(vUv.y * 14.0) - 0.5);
  float hexGrid = smoothstep(0.38, 0.42, hex);
  
  vec3 color = vec3(0.1, 0.3, 0.9); // blue base
  color += fresnel * vec3(0.3, 0.6, 1.0); // rim glow
  color += scan * 0.15; // scan lines
  color *= 0.4 + hexGrid * 0.6; // hex pattern
  
  float alpha = 0.3 + fresnel * 0.5 + scan * 0.2;
  alpha = clamp(alpha, 0.0, 1.0);
  
  gl_FragColor = vec4(color, alpha);
}
`;function u({position:e}){let i=(0,r.useRef)(null),t=(0,r.useRef)(0),s=(0,r.useMemo)(()=>({uTime:{value:0}}),[]);return(0,a.useFrame)((e,o)=>{i.current&&(t.current+=o,i.current.uniforms.uTime.value=t.current)}),(0,o.jsxs)("mesh",{position:e,children:[(0,o.jsx)("sphereGeometry",{args:[.55,48,48]}),(0,o.jsx)("shaderMaterial",{ref:i,vertexShader:l,fragmentShader:v,uniforms:s,transparent:!0,depthWrite:!1})]})}let f=`
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec2 vUv;

uniform float uTime;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv * 4.0;
  float n1 = fbm(uv + uTime * 0.3);
  float n2 = fbm(uv * 1.5 - uTime * 0.2 + 5.0);
  float n = n1 * 0.7 + n2 * 0.3;
  
  // Color ramp: dark red → orange → yellow → white
  vec3 dark  = vec3(0.6, 0.1, 0.0);
  vec3 mid   = vec3(1.0, 0.3, 0.0);
  vec3 hot   = vec3(1.0, 0.8, 0.2);
  vec3 white = vec3(1.0, 0.95, 0.8);
  
  float t = n;
  vec3 color = mix(dark, mid, smoothstep(0.2, 0.4, t));
  color = mix(color, hot, smoothstep(0.4, 0.6, t));
  color = mix(color, white, smoothstep(0.7, 0.9, t));
  
  // Glow at edges
  float edge = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
  color += edge * vec3(0.4, 0.1, 0.0);
  
  gl_FragColor = vec4(color, 1.0);
}
`;function m({position:e}){let i=(0,r.useRef)(null),t=(0,r.useRef)(0),s=(0,r.useMemo)(()=>({uTime:{value:0}}),[]);return(0,a.useFrame)((e,o)=>{i.current&&(t.current+=o,i.current.uniforms.uTime.value=t.current)}),(0,o.jsxs)("mesh",{position:e,children:[(0,o.jsx)("dodecahedronGeometry",{args:[.5,0]}),(0,o.jsx)("shaderMaterial",{ref:i,vertexShader:l,fragmentShader:f,uniforms:s})]})}let d=`
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
`;function h({position:e}){let i=(0,r.useRef)(null),t=(0,r.useRef)(0),s=(0,r.useMemo)(()=>({uTime:{value:0}}),[]);return(0,a.useFrame)((e,o)=>{i.current&&(t.current+=o,i.current.uniforms.uTime.value=t.current)}),(0,o.jsxs)("mesh",{position:e,rotation:[0,Math.PI/4,0],children:[(0,o.jsx)("octahedronGeometry",{args:[.55,0]}),(0,o.jsx)("shaderMaterial",{ref:i,vertexShader:l,fragmentShader:d,uniforms:s})]})}let p=`
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec2 vUv;

uniform float uTime;

void main() {
  // Fresnel rim
  float fresnel = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
  fresnel = pow(fresnel, 2.0);
  
  // Hexagonal honeycomb pattern
  vec2 uv = vUv * 8.0;
  float hex = abs(fract(uv.x) - 0.5) + abs(fract(uv.y) - 0.5);
  float honeycomb = smoothstep(0.43, 0.45, hex);
  
  // Animated pulse rings
  float ring = sin(vWorldPosition.y * 12.0 - uTime * 4.0) * 0.5 + 0.5;
  float ring2 = sin(vWorldPosition.y * 8.0 + uTime * 3.0 + 2.0) * 0.5 + 0.5;
  float pulse = ring * ring2;
  
  // Energy veins
  float vein = abs(sin(vUv.x * 20.0 + vUv.y * 18.0 + uTime)) * 
               abs(sin(vUv.y * 15.0 - vUv.x * 12.0 - uTime * 1.5));
  float veins = smoothstep(0.15, 0.0, vein);
  
  vec3 color = vec3(0.2, 0.4, 1.0);       // blue core
  color += fresnel * vec3(0.3, 0.7, 1.0) * 0.6;  // rim glow
  color += pulse * vec3(0.5, 0.6, 1.0) * 0.3;    // pulse rings
  color += veins * vec3(0.7, 0.8, 1.0) * 0.2;    // energy veins
  color *= 0.5 + honeycomb * 0.5;                  // hex grid
  
  float alpha = 0.3 + fresnel * 0.5 + pulse * 0.15;
  alpha = clamp(alpha, 0.0, 1.0);
  
  gl_FragColor = vec4(color, alpha);
}
`;function g({position:e}){let i=(0,r.useRef)(null),t=(0,r.useRef)(0),s=(0,r.useMemo)(()=>({uTime:{value:0}}),[]);return(0,a.useFrame)((e,o)=>{i.current&&(t.current+=o,i.current.uniforms.uTime.value=t.current)}),(0,o.jsxs)("mesh",{position:e,children:[(0,o.jsx)("icosahedronGeometry",{args:[.55,2]}),(0,o.jsx)("shaderMaterial",{ref:i,vertexShader:l,fragmentShader:p,uniforms:s,transparent:!0,depthWrite:!1})]})}let x=`
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec2 vUv;

uniform float uTime;
uniform float uMelt;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
}

void main() {
  // Melt based on Y position + noise
  float meltThreshold = 0.2 + sin(uTime * 0.5) * 0.15;
  float localNoise = noise(vPosition.xy * 5.0) * 0.1;
  float melt = smoothstep(meltThreshold + localNoise, meltThreshold + localNoise - 0.05, vPosition.y);
  
  // Ice color: light blue with internal refraction-like variation
  vec3 iceColor = vec3(0.6, 0.8, 0.95);
  vec3 deepIce = vec3(0.1, 0.3, 0.6);
  vec3 color = mix(iceColor, deepIce, abs(vNormal.y) * 0.6);
  
  // Water/melt drips: blue-green tint
  vec3 waterColor = vec3(0.2, 0.6, 0.8);
  
  // Drip lines
  float drip = smoothstep(0.5, 0.0, fract(vUv.y * 20.0 + noise(vUv * 8.0 + uTime) * 0.8));
  color += drip * vec3(0.3, 0.5, 0.7) * 0.3;
  
  // Specular highlights (ice is shiny)
  float spec = pow(max(dot(vNormal, normalize(vec3(0.5, 0.8, 0.3))), 0.0), 40.0);
  color += vec3(0.8, 0.9, 1.0) * spec;
  
  // Mix ice → water based on melt
  float melted = smoothstep(0.0, 0.3, melt);
  color = mix(color, waterColor, melted);
  
  // Add transparency to melted parts
  float alpha = 1.0 - melt * 0.4;
  
  // Lighting
  float light = dot(vNormal, normalize(vec3(0.3, 1.0, 0.5)));
  light = 0.4 + light * 0.6;
  color *= light;
  
  gl_FragColor = vec4(color, alpha);
}
`;function b({position:e}){let i=(0,r.useRef)(null),t=(0,r.useRef)(0),s=(0,r.useMemo)(()=>({uTime:{value:0},uMelt:{value:.3}}),[]);return(0,a.useFrame)((e,o)=>{i.current&&(t.current+=o,i.current.uniforms.uTime.value=t.current,i.current.uniforms.uMelt.value=(Math.sin(.4*t.current)+1)*.35)}),(0,o.jsxs)("mesh",{position:e,rotation:[.2,Math.PI/6,0],children:[(0,o.jsx)("boxGeometry",{args:[.8,.9,.8]}),(0,o.jsx)("shaderMaterial",{ref:i,vertexShader:l,fragmentShader:x,uniforms:s,transparent:!0})]})}var y=e.i(22016);let j=`
varying vec2 vUv;
varying vec3 vNormal;
void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,M=`
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
}`,C=["#FF6B6B","#4ECDC4","#45B7D1","#96CEB4","#FFEAA7","#DDA0DD","#98D8C8","#F7DC6F","#BB8FCE","#85C1E9","#F8C471","#82E0AA"],T=["box","sphere","torus","cone","cylinder","octahedron","dodecahedron"];function D(e){let o=T[Math.floor(Math.random()*T.length)],r=Math.random()*Math.PI*2,i=Math.acos(2*Math.random()-1);return{id:e,type:o,position:[3*Math.sin(i)*Math.cos(r),3*Math.sin(i)*Math.sin(r),3*Math.cos(i)],scale:.4+.6*Math.random(),color:C[Math.floor(Math.random()*C.length)],dissolveSpeed:.3+.7*Math.random(),wireframe:Math.random()>.8}}function w({model:e}){let i=(0,r.useRef)(null),t=(0,r.useRef)(null),l=(0,r.useRef)(0),n=(0,r.useMemo)(()=>({uTime:{value:0},uDissolve:{value:.3},uColor:{value:new s.Color(e.color)},uWireframe:{value:+!!e.wireframe}}),[e.color,e.wireframe]),c=(0,r.useMemo)(()=>{switch(e.type){case"box":return(0,o.jsx)("boxGeometry",{});case"sphere":return(0,o.jsx)("sphereGeometry",{args:[.5,32,32]});case"torus":return(0,o.jsx)("torusGeometry",{args:[.4,.15,16,32]});case"cone":return(0,o.jsx)("coneGeometry",{args:[.5,.8,32]});case"cylinder":return(0,o.jsx)("cylinderGeometry",{args:[.4,.4,.8,32]});case"octahedron":return(0,o.jsx)("octahedronGeometry",{args:[.5]});case"dodecahedron":return(0,o.jsx)("dodecahedronGeometry",{args:[.5]})}},[e.type]);return(0,a.useFrame)((o,r)=>{i.current&&(i.current.rotation.y+=.3*r),t.current&&(l.current+=r,t.current.uniforms.uTime.value=l.current,t.current.uniforms.uDissolve.value=.9*Math.abs(Math.sin(l.current*e.dissolveSpeed)))}),(0,o.jsxs)("mesh",{ref:i,position:e.position,scale:e.scale,children:[c,(0,o.jsx)("shaderMaterial",{ref:t,vertexShader:j,fragmentShader:M,uniforms:n,transparent:!0})]})}let P=[{pos:[-2.5,1.2,0],label:"溶解"},{pos:[0,1.2,0],label:"全息"},{pos:[2.5,1.2,0],label:"熔岩"},{pos:[-2.5,-1.5,0],label:"水晶"},{pos:[0,-1.5,0],label:"力场"},{pos:[2.5,-1.5,0],label:"融冰"}];e.s(["default",0,function(){let[e,a]=(0,r.useState)("gallery"),[s,l]=(0,r.useState)(()=>Array.from({length:15},(e,o)=>D(o))),[n,v]=(0,r.useState)(15),f=(0,r.useCallback)(()=>{l(Array.from({length:n},(e,o)=>D(o)))},[n]),d=(0,r.useCallback)(()=>v(e=>e+5),[]);return(0,r.useEffect)(()=>{l(Array.from({length:n},(e,o)=>D(o)))},[n]),(0,o.jsxs)("div",{style:{width:"100%",height:"100%",position:"relative"},children:["gallery"===e&&(0,o.jsxs)(i.Canvas,{camera:{position:[0,0,8],fov:50},gl:{antialias:!0},style:{background:"#0a0a0f"},children:[(0,o.jsx)("ambientLight",{intensity:.3}),(0,o.jsx)("pointLight",{position:[5,5,5],intensity:1.5}),(0,o.jsx)("pointLight",{position:[-5,-3,3],intensity:.8,color:"#8888ff"}),(0,o.jsx)(t.OrbitControls,{enableDamping:!0,dampingFactor:.08,autoRotate:!0,autoRotateSpeed:.3,minDistance:4,maxDistance:15}),(0,o.jsx)(c,{position:P[0].pos}),(0,o.jsx)(u,{position:P[1].pos}),(0,o.jsx)(m,{position:P[2].pos}),(0,o.jsx)(h,{position:P[3].pos}),(0,o.jsx)(g,{position:P[4].pos}),(0,o.jsx)(b,{position:P[5].pos})]}),"dissolve"===e&&(0,o.jsxs)(i.Canvas,{camera:{position:[0,0,7],fov:50},style:{background:"#050510"},children:[(0,o.jsx)("ambientLight",{intensity:.6}),(0,o.jsx)("pointLight",{position:[8,6,8],intensity:2}),(0,o.jsx)("pointLight",{position:[-6,-4,-4],intensity:1,color:"#6688cc"}),s.map(e=>(0,o.jsx)(w,{model:e},e.id)),(0,o.jsx)(t.OrbitControls,{autoRotate:!0,autoRotateSpeed:.3,enableDamping:!0})]}),(0,o.jsxs)("div",{style:{position:"absolute",bottom:20,left:0,right:0,display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",zIndex:10,padding:"0 16px"},children:[(0,o.jsx)("button",{onClick:()=>a("gallery"),style:{padding:"8px 16px",borderRadius:20,cursor:"pointer",fontSize:14,fontWeight:500,background:"gallery"===e?"rgba(255,255,255,0.15)":"rgba(0,0,0,0.5)",color:"gallery"===e?"#fff":"rgba(255,255,255,0.5)",border:`2px solid ${"gallery"===e?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.2)"}`,backdropFilter:"blur(8px)",transition:"all 0.2s"},children:"🎨 效果画廊"}),(0,o.jsx)("button",{onClick:()=>a("dissolve"),style:{padding:"8px 16px",borderRadius:20,cursor:"pointer",fontSize:14,fontWeight:500,background:"dissolve"===e?"rgba(255,255,255,0.15)":"rgba(0,0,0,0.5)",color:"dissolve"===e?"#fff":"rgba(255,255,255,0.5)",border:`2px solid ${"dissolve"===e?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.2)"}`,backdropFilter:"blur(8px)",transition:"all 0.2s"},children:"🟡 溶解随机"}),(0,o.jsx)(y.default,{href:"/snake",style:{padding:"8px 16px",borderRadius:20,cursor:"pointer",fontSize:14,fontWeight:500,background:"rgba(0,0,0,0.5)",color:"rgba(255,255,255,0.7)",border:"2px solid rgba(255,255,255,0.3)",backdropFilter:"blur(8px)",transition:"all 0.2s",textDecoration:"none"},children:"🎮 贪吃蛇"}),"dissolve"===e&&(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("button",{onClick:f,style:{padding:"8px 14px",background:"rgba(255,255,255,0.1)",color:"#fff",border:"1px solid rgba(255,255,255,0.2)",borderRadius:20,cursor:"pointer",fontSize:14},children:"🔄 重新生成"}),(0,o.jsx)("button",{onClick:d,style:{padding:"8px 14px",background:"rgba(255,255,255,0.1)",color:"#fff",border:"1px solid rgba(255,255,255,0.2)",borderRadius:20,cursor:"pointer",fontSize:14},children:"➕ 加 5 个"})]})]}),(0,o.jsx)("div",{style:{position:"absolute",top:12,left:16,color:"rgba(255,255,255,0.5)",fontSize:12,fontFamily:"monospace",zIndex:10},children:"gallery"===e?"6 effects · drag to orbit":`${n} objects \xb7 dissolve shader \xb7 drag to orbit`})]})}],44117)}]);