(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,95057,(e,r,o)=>{"use strict";Object.defineProperty(o,"__esModule",{value:!0});var t={formatUrl:function(){return l},formatWithValidation:function(){return c},urlObjectKeys:function(){return s}};for(var i in t)Object.defineProperty(o,i,{enumerable:!0,get:t[i]});let a=e.r(90809)._(e.r(98183)),n=/https?|ftp|gopher|file/;function l(e){let{auth:r,hostname:o}=e,t=e.protocol||"",i=e.pathname||"",l=e.hash||"",s=e.query||"",c=!1;r=r?encodeURIComponent(r).replace(/%3A/i,":")+"@":"",e.host?c=r+e.host:o&&(c=r+(~o.indexOf(":")?`[${o}]`:o),e.port&&(c+=":"+e.port)),s&&"object"==typeof s&&(s=String(a.urlQueryToSearchParams(s)));let u=e.search||s&&`?${s}`||"";return t&&!t.endsWith(":")&&(t+=":"),e.slashes||(!t||n.test(t))&&!1!==c?(c="//"+(c||""),i&&"/"!==i[0]&&(i="/"+i)):c||(c=""),l&&"#"!==l[0]&&(l="#"+l),u&&"?"!==u[0]&&(u="?"+u),i=i.replace(/[?#]/g,encodeURIComponent),u=u.replace("#","%23"),`${t}${c}${i}${u}${l}`}let s=["auth","hash","host","hostname","href","path","pathname","port","protocol","query","search","slashes"];function c(e){return l(e)}},18581,(e,r,o)=>{"use strict";Object.defineProperty(o,"__esModule",{value:!0}),Object.defineProperty(o,"useMergedRef",{enumerable:!0,get:function(){return i}});let t=e.r(71645);function i(e,r){let o=(0,t.useRef)(null),i=(0,t.useRef)(null);return(0,t.useCallback)(t=>{if(null===t){let e=o.current;e&&(o.current=null,e());let r=i.current;r&&(i.current=null,r())}else e&&(o.current=a(e,t)),r&&(i.current=a(r,t))},[e,r])}function a(e,r){if("function"!=typeof e)return e.current=r,()=>{e.current=null};{let o=e(r);return"function"==typeof o?o:()=>e(null)}}("function"==typeof o.default||"object"==typeof o.default&&null!==o.default)&&void 0===o.default.__esModule&&(Object.defineProperty(o.default,"__esModule",{value:!0}),Object.assign(o.default,o),r.exports=o.default)},73668,(e,r,o)=>{"use strict";Object.defineProperty(o,"__esModule",{value:!0}),Object.defineProperty(o,"isLocalURL",{enumerable:!0,get:function(){return a}});let t=e.r(18967),i=e.r(52817);function a(e){if(!(0,t.isAbsoluteUrl)(e))return!0;try{let r=(0,t.getLocationOrigin)(),o=new URL(e,r);return o.origin===r&&(0,i.hasBasePath)(o.pathname)}catch(e){return!1}}},84508,(e,r,o)=>{"use strict";Object.defineProperty(o,"__esModule",{value:!0}),Object.defineProperty(o,"errorOnce",{enumerable:!0,get:function(){return t}});let t=e=>{}},22016,(e,r,o)=>{"use strict";Object.defineProperty(o,"__esModule",{value:!0});var t={default:function(){return g},useLinkStatus:function(){return y}};for(var i in t)Object.defineProperty(o,i,{enumerable:!0,get:t[i]});let a=e.r(90809),n=e.r(43476),l=a._(e.r(71645)),s=e.r(95057),c=e.r(8372),u=e.r(18581),v=e.r(18967),f=e.r(5550);e.r(33525);let d=e.r(88540),h=e.r(91949),p=e.r(73668),m=e.r(9396);function g(r){var o,t;let i,a,g,[y,b]=(0,l.useOptimistic)(h.IDLE_LINK_STATUS),j=(0,l.useRef)(null),{href:C,as:M,children:T,prefetch:P=null,passHref:S,replace:R,shallow:w,scroll:D,onClick:_,onMouseEnter:U,onTouchStart:F,legacyBehavior:k=!1,onNavigate:N,transitionTypes:O,ref:E,unstable_dynamicOnHover:W,...z}=r;i=T,k&&("string"==typeof i||"number"==typeof i)&&(i=(0,n.jsx)("a",{children:i}));let L=l.default.useContext(c.AppRouterContext),A=!1!==P,I=!1!==P?null===(t=P)||"auto"===t?m.FetchStrategy.PPR:m.FetchStrategy.Full:m.FetchStrategy.PPR,G="string"==typeof(o=M||C)?o:(0,s.formatUrl)(o);if(k){if(i?.$$typeof===Symbol.for("react.lazy"))throw Object.defineProperty(Error("`<Link legacyBehavior>` received a direct child that is either a Server Component, or JSX that was loaded with React.lazy(). This is not supported. Either remove legacyBehavior, or make the direct child a Client Component that renders the Link's `<a>` tag."),"__NEXT_ERROR_CODE",{value:"E863",enumerable:!1,configurable:!0});a=l.default.Children.only(i)}let B=k?a&&"object"==typeof a&&a.ref:E,$=l.default.useCallback(e=>(null!==L&&(j.current=(0,h.mountLinkInstance)(e,G,L,I,A,b)),()=>{j.current&&((0,h.unmountLinkForCurrentNavigation)(j.current),j.current=null),(0,h.unmountPrefetchableInstance)(e)}),[A,G,L,I,b]),K={ref:(0,u.useMergedRef)($,B),onClick(r){k||"function"!=typeof _||_(r),k&&a.props&&"function"==typeof a.props.onClick&&a.props.onClick(r),!L||r.defaultPrevented||function(r,o,t,i,a,n,s){if("u">typeof window){let c,{nodeName:u}=r.currentTarget;if("A"===u.toUpperCase()&&((c=r.currentTarget.getAttribute("target"))&&"_self"!==c||r.metaKey||r.ctrlKey||r.shiftKey||r.altKey||r.nativeEvent&&2===r.nativeEvent.which)||r.currentTarget.hasAttribute("download"))return;if(!(0,p.isLocalURL)(o)){i&&(r.preventDefault(),location.replace(o));return}if(r.preventDefault(),n){let e=!1;if(n({preventDefault:()=>{e=!0}}),e)return}let{dispatchNavigateAction:v}=e.r(99781);l.default.startTransition(()=>{v(o,i?"replace":"push",!1===a?d.ScrollBehavior.NoScroll:d.ScrollBehavior.Default,t.current,s)})}}(r,G,j,R,D,N,O)},onMouseEnter(e){k||"function"!=typeof U||U(e),k&&a.props&&"function"==typeof a.props.onMouseEnter&&a.props.onMouseEnter(e),L&&A&&(0,h.onNavigationIntent)(e.currentTarget,!0===W)},onTouchStart:function(e){k||"function"!=typeof F||F(e),k&&a.props&&"function"==typeof a.props.onTouchStart&&a.props.onTouchStart(e),L&&A&&(0,h.onNavigationIntent)(e.currentTarget,!0===W)}};return(0,v.isAbsoluteUrl)(G)?K.href=G:k&&!S&&("a"!==a.type||"href"in a.props)||(K.href=(0,f.addBasePath)(G)),g=k?l.default.cloneElement(a,K):(0,n.jsx)("a",{...z,...K,children:i}),(0,n.jsx)(x.Provider,{value:y,children:g})}e.r(84508);let x=(0,l.createContext)(h.IDLE_LINK_STATUS),y=()=>(0,l.useContext)(x);("function"==typeof o.default||"object"==typeof o.default&&null!==o.default)&&void 0===o.default.__esModule&&(Object.defineProperty(o.default,"__esModule",{value:!0}),Object.assign(o.default,o),r.exports=o.default)},44117,e=>{"use strict";var r=e.i(43476),o=e.i(71645),t=e.i(75056),i=e.i(25234),a=e.i(30297),n=e.i(90072);let l=`
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
`,s=`
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
`;function c({position:e}){let t=(0,o.useRef)(null),a=(0,o.useRef)(0),n=(0,o.useMemo)(()=>({uTime:{value:0},uDissolve:{value:.3}}),[]);return(0,i.useFrame)((e,r)=>{t.current&&(a.current+=r,t.current.uniforms.uTime.value=a.current,t.current.uniforms.uDissolve.value=(Math.sin(.6*a.current)+1)*.45)}),(0,r.jsxs)("mesh",{position:e,rotation:[.3,0,0],children:[(0,r.jsx)("torusGeometry",{args:[.5,.2,32,64]}),(0,r.jsx)("shaderMaterial",{ref:t,vertexShader:l,fragmentShader:s,uniforms:n,transparent:!0})]})}let u=`
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
`;function v({position:e}){let t=(0,o.useRef)(null),a=(0,o.useRef)(0),n=(0,o.useMemo)(()=>({uTime:{value:0}}),[]);return(0,i.useFrame)((e,r)=>{t.current&&(a.current+=r,t.current.uniforms.uTime.value=a.current)}),(0,r.jsxs)("mesh",{position:e,children:[(0,r.jsx)("sphereGeometry",{args:[.55,48,48]}),(0,r.jsx)("shaderMaterial",{ref:t,vertexShader:l,fragmentShader:u,uniforms:n,transparent:!0,depthWrite:!1})]})}let f=`
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
`;function d({position:e}){let t=(0,o.useRef)(null),a=(0,o.useRef)(0),n=(0,o.useMemo)(()=>({uTime:{value:0}}),[]);return(0,i.useFrame)((e,r)=>{t.current&&(a.current+=r,t.current.uniforms.uTime.value=a.current)}),(0,r.jsxs)("mesh",{position:e,children:[(0,r.jsx)("dodecahedronGeometry",{args:[.5,0]}),(0,r.jsx)("shaderMaterial",{ref:t,vertexShader:l,fragmentShader:f,uniforms:n})]})}let h=`
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
`;function p({position:e}){let t=(0,o.useRef)(null),a=(0,o.useRef)(0),n=(0,o.useMemo)(()=>({uTime:{value:0}}),[]);return(0,i.useFrame)((e,r)=>{t.current&&(a.current+=r,t.current.uniforms.uTime.value=a.current)}),(0,r.jsxs)("mesh",{position:e,rotation:[0,Math.PI/4,0],children:[(0,r.jsx)("octahedronGeometry",{args:[.55,0]}),(0,r.jsx)("shaderMaterial",{ref:t,vertexShader:l,fragmentShader:h,uniforms:n})]})}let m=`
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
`;function g({position:e}){let t=(0,o.useRef)(null),a=(0,o.useRef)(0),n=(0,o.useMemo)(()=>({uTime:{value:0}}),[]);return(0,i.useFrame)((e,r)=>{t.current&&(a.current+=r,t.current.uniforms.uTime.value=a.current)}),(0,r.jsxs)("mesh",{position:e,children:[(0,r.jsx)("icosahedronGeometry",{args:[.55,2]}),(0,r.jsx)("shaderMaterial",{ref:t,vertexShader:l,fragmentShader:m,uniforms:n,transparent:!0,depthWrite:!1})]})}let x=`
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
`;function y({position:e}){let t=(0,o.useRef)(null),a=(0,o.useRef)(0),n=(0,o.useMemo)(()=>({uTime:{value:0},uMelt:{value:.3}}),[]);return(0,i.useFrame)((e,r)=>{t.current&&(a.current+=r,t.current.uniforms.uTime.value=a.current,t.current.uniforms.uMelt.value=(Math.sin(.4*a.current)+1)*.35)}),(0,r.jsxs)("mesh",{position:e,rotation:[.2,Math.PI/6,0],children:[(0,r.jsx)("boxGeometry",{args:[.8,.9,.8]}),(0,r.jsx)("shaderMaterial",{ref:t,vertexShader:l,fragmentShader:x,uniforms:n,transparent:!0})]})}var b=e.i(22016);let j=`
varying vec2 vUv;
varying vec3 vNormal;
void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,C=`
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
}`,M=["#FF6B6B","#4ECDC4","#45B7D1","#96CEB4","#FFEAA7","#DDA0DD","#98D8C8","#F7DC6F","#BB8FCE","#85C1E9","#F8C471","#82E0AA"],T=["box","sphere","torus","cone","cylinder","octahedron","dodecahedron"];function P(e){let r=T[Math.floor(Math.random()*T.length)],o=Math.random()*Math.PI*2,t=Math.acos(2*Math.random()-1);return{id:e,type:r,position:[3*Math.sin(t)*Math.cos(o),3*Math.sin(t)*Math.sin(o),3*Math.cos(t)],scale:.4+.6*Math.random(),color:M[Math.floor(Math.random()*M.length)],dissolveSpeed:.3+.7*Math.random(),wireframe:Math.random()>.8}}function S({model:e}){let t=(0,o.useRef)(null),a=(0,o.useRef)(null),l=(0,o.useRef)(0),s=(0,o.useMemo)(()=>({uTime:{value:0},uDissolve:{value:.3},uColor:{value:new n.Color(e.color)},uWireframe:{value:+!!e.wireframe}}),[e.color,e.wireframe]),c=(0,o.useMemo)(()=>{switch(e.type){case"box":return(0,r.jsx)("boxGeometry",{});case"sphere":return(0,r.jsx)("sphereGeometry",{args:[.5,32,32]});case"torus":return(0,r.jsx)("torusGeometry",{args:[.4,.15,16,32]});case"cone":return(0,r.jsx)("coneGeometry",{args:[.5,.8,32]});case"cylinder":return(0,r.jsx)("cylinderGeometry",{args:[.4,.4,.8,32]});case"octahedron":return(0,r.jsx)("octahedronGeometry",{args:[.5]});case"dodecahedron":return(0,r.jsx)("dodecahedronGeometry",{args:[.5]})}},[e.type]);return(0,i.useFrame)((r,o)=>{t.current&&(t.current.rotation.y+=.3*o),a.current&&(l.current+=o,a.current.uniforms.uTime.value=l.current,a.current.uniforms.uDissolve.value=.9*Math.abs(Math.sin(l.current*e.dissolveSpeed)))}),(0,r.jsxs)("mesh",{ref:t,position:e.position,scale:e.scale,children:[c,(0,r.jsx)("shaderMaterial",{ref:a,vertexShader:j,fragmentShader:C,uniforms:s,transparent:!0})]})}let R=[{pos:[-2.5,1.2,0],label:"溶解"},{pos:[0,1.2,0],label:"全息"},{pos:[2.5,1.2,0],label:"熔岩"},{pos:[-2.5,-1.5,0],label:"水晶"},{pos:[0,-1.5,0],label:"力场"},{pos:[2.5,-1.5,0],label:"融冰"}];e.s(["default",0,function(){let[e,i]=(0,o.useState)("gallery"),[n,l]=(0,o.useState)(()=>Array.from({length:15},(e,r)=>P(r))),[s,u]=(0,o.useState)(15),f=(0,o.useCallback)(()=>{l(Array.from({length:s},(e,r)=>P(r)))},[s]),h=(0,o.useCallback)(()=>u(e=>e+5),[]);return(0,o.useEffect)(()=>{l(Array.from({length:s},(e,r)=>P(r)))},[s]),(0,r.jsxs)("div",{style:{width:"100%",height:"100%",position:"relative"},children:["gallery"===e&&(0,r.jsxs)(t.Canvas,{camera:{position:[0,0,8],fov:50},gl:{antialias:!0},style:{background:"#0a0a0f"},children:[(0,r.jsx)("ambientLight",{intensity:.3}),(0,r.jsx)("pointLight",{position:[5,5,5],intensity:1.5}),(0,r.jsx)("pointLight",{position:[-5,-3,3],intensity:.8,color:"#8888ff"}),(0,r.jsx)(a.OrbitControls,{enableDamping:!0,dampingFactor:.08,autoRotate:!0,autoRotateSpeed:.3,minDistance:4,maxDistance:15}),(0,r.jsx)(c,{position:R[0].pos}),(0,r.jsx)(v,{position:R[1].pos}),(0,r.jsx)(d,{position:R[2].pos}),(0,r.jsx)(p,{position:R[3].pos}),(0,r.jsx)(g,{position:R[4].pos}),(0,r.jsx)(y,{position:R[5].pos})]}),"dissolve"===e&&(0,r.jsxs)(t.Canvas,{camera:{position:[0,0,7],fov:50},style:{background:"#050510"},children:[(0,r.jsx)("ambientLight",{intensity:.6}),(0,r.jsx)("pointLight",{position:[8,6,8],intensity:2}),(0,r.jsx)("pointLight",{position:[-6,-4,-4],intensity:1,color:"#6688cc"}),n.map(e=>(0,r.jsx)(S,{model:e},e.id)),(0,r.jsx)(a.OrbitControls,{autoRotate:!0,autoRotateSpeed:.3,enableDamping:!0})]}),(0,r.jsxs)("div",{style:{position:"absolute",bottom:20,left:0,right:0,display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",zIndex:10,padding:"0 16px"},children:[(0,r.jsx)("button",{onClick:()=>i("gallery"),style:{padding:"8px 16px",borderRadius:20,cursor:"pointer",fontSize:14,fontWeight:500,background:"gallery"===e?"rgba(255,255,255,0.15)":"rgba(0,0,0,0.5)",color:"gallery"===e?"#fff":"rgba(255,255,255,0.5)",border:`2px solid ${"gallery"===e?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.2)"}`,backdropFilter:"blur(8px)",transition:"all 0.2s"},children:"🎨 效果画廊"}),(0,r.jsx)("button",{onClick:()=>i("dissolve"),style:{padding:"8px 16px",borderRadius:20,cursor:"pointer",fontSize:14,fontWeight:500,background:"dissolve"===e?"rgba(255,255,255,0.15)":"rgba(0,0,0,0.5)",color:"dissolve"===e?"#fff":"rgba(255,255,255,0.5)",border:`2px solid ${"dissolve"===e?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.2)"}`,backdropFilter:"blur(8px)",transition:"all 0.2s"},children:"🟡 溶解随机"}),(0,r.jsx)(b.default,{href:"/snake",style:{padding:"8px 16px",borderRadius:20,cursor:"pointer",fontSize:14,fontWeight:500,background:"rgba(0,0,0,0.5)",color:"rgba(255,255,255,0.7)",border:"2px solid rgba(255,255,255,0.3)",backdropFilter:"blur(8px)",transition:"all 0.2s",textDecoration:"none"},children:"🎮 贪吃蛇"}),"dissolve"===e&&(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{onClick:f,style:{padding:"8px 14px",background:"rgba(255,255,255,0.1)",color:"#fff",border:"1px solid rgba(255,255,255,0.2)",borderRadius:20,cursor:"pointer",fontSize:14},children:"🔄 重新生成"}),(0,r.jsx)("button",{onClick:h,style:{padding:"8px 14px",background:"rgba(255,255,255,0.1)",color:"#fff",border:"1px solid rgba(255,255,255,0.2)",borderRadius:20,cursor:"pointer",fontSize:14},children:"➕ 加 5 个"})]})]}),(0,r.jsx)("div",{style:{position:"absolute",top:12,left:16,color:"rgba(255,255,255,0.5)",fontSize:12,fontFamily:"monospace",zIndex:10},children:"gallery"===e?"6 effects · drag to orbit":`${s} objects \xb7 dissolve shader \xb7 drag to orbit`})]})}],44117)}]);