export const vertexShader = /* glsl */ `
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
`;
