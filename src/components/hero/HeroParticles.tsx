"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useMousePosition } from "@/hooks/useMousePosition";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type HeroParticlesProps = {
  className?: string;
};

function ParticleField({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const elapsed = useRef(0);
  const count = 420;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    const points = pointsRef.current;
    if (!points) return;

    elapsed.current += delta;
    const t = elapsed.current;
    points.rotation.y = t * 0.04 + (mouseX - 0.5) * 0.35;
    points.rotation.x = (mouseY - 0.5) * 0.18;
    points.position.x = (mouseX - 0.5) * 0.6;
    points.position.y = -(mouseY - 0.5) * 0.35;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#5ab4ff"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function HeroParticles({ className }: HeroParticlesProps) {
  const reducedMotion = useReducedMotion();
  const mouse = useMousePosition(!reducedMotion);

  if (reducedMotion) return null;

  return (
    <div className={className} aria-hidden>
      <Canvas
        className="h-full w-full"
        camera={{ position: [0, 0, 5], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
      >
        <ParticleField mouseX={mouse.x} mouseY={mouse.y} />
      </Canvas>
    </div>
  );
}
