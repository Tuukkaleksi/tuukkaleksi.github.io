"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useMousePosition } from "@/hooks/useMousePosition";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { heroScrollProgress } from "@/lib/hero/scrollProgress";

type HeroParticlesProps = {
  className?: string;
};

function readPrimaryColor() {
  if (typeof window === "undefined") return "#0563bb";
  return (
    getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() || "#0563bb"
  );
}

function ParticleField({ mouseX, mouseY, color }: { mouseX: number; mouseY: number; color: string }) {
  const pointsRef = useRef<THREE.Points>(null);
  const elapsed = useRef(0);
  const count = 120;

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
    points.rotation.y = t * 0.04 + heroScrollProgress.current * 1.2 + (mouseX - 0.5) * 0.25;
    points.rotation.x = (mouseY - 0.5) * 0.12;
    points.position.x = (mouseX - 0.5) * 0.4;
    points.position.y = -(mouseY - 0.5) * 0.22;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color={color}
        transparent
        opacity={0.25}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function HeroParticles({ className }: HeroParticlesProps) {
  const reducedMotion = useReducedMotion();
  const mouse = useMousePosition();
  const [color, setColor] = useState("#0563bb");

  useEffect(() => {
    setColor(readPrimaryColor());
  }, []);

  if (reducedMotion) return null;

  return (
    <div className={className} aria-hidden>
      <Canvas
        className="h-full w-full"
        camera={{ position: [0, 0, 5], fov: 55 }}
        dpr={[1, 1.25]}
        gl={{ alpha: true, antialias: true }}
      >
        <ParticleField mouseX={mouse.x} mouseY={mouse.y} color={color} />
      </Canvas>
    </div>
  );
}
