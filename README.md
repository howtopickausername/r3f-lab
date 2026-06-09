# R3F Shader Lab

React Three Fiber demo — exploring custom shaders in real-time 3D.

## Demo: Dissolve Effect

Custom ShaderMaterial with noise-based fragment discard + edge glow:

- **Vertex shader**: pass-through position + normal
- **Fragment shader**: 2D noise(uUv, uTime) → `discard` below threshold → orange edge glow on dissolve boundary

## Tech Stack

- [React Three Fiber](https://github.com/pmndrs/react-three-fiber) — React renderer for Three.js
- [Drei](https://github.com/pmndrs/drei) — R3F helpers
- [Three.js](https://threejs.org/) — WebGL library
- [Next.js](https://nextjs.org/) — React framework

## Run Locally

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static export
npm start       # production server on :3333
```
