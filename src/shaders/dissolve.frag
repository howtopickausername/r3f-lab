uniform float uTime;
uniform float uDissolve;
uniform sampler2D uNoise;

varying vec2 vUv;
varying vec3 vNormal;

// 噪声贴图里没有就用程序化噪声
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
  // 用 UV 采样噪声
  float n = noise(vUv * 8.0 + uTime * 0.3);

  // 溶解阈值：n < uDissolve 的部分丢弃
  if (n < uDissolve) {
    discard;
  }

  // 边缘发光（在阈值附近发光）
  float edge = smoothstep(uDissolve, uDissolve + 0.1, n);

  // 基础颜色
  vec3 baseColor = vec3(0.2, 0.6, 1.0); // 蓝色
  vec3 edgeColor = vec3(1.0, 0.3, 0.1);  // 橙色（边缘）

  vec3 color = mix(edgeColor, baseColor, edge);

  // 简单的方向光
  float diffuse = max(0.0, dot(vNormal, normalize(vec3(1.0, 1.0, 1.0))));
  color *= 0.3 + 0.7 * diffuse;

  gl_FragColor = vec4(color, 1.0);
}
