import Scene from '@/components/Scene';

export default function Home() {
  return (
    <div className="w-full h-full">
      <Scene />
      {/* 信息叠层 */}
      <div className="absolute bottom-4 left-4 text-white/60 text-sm font-mono space-y-1">
        <div>Shader: Dissolve Effect</div>
        <div>vertex → position + normal pass-through</div>
        <div>fragment → noise(uUv, uTime) → discard if &lt; threshold → edge glow</div>
      </div>
    </div>
  );
}
