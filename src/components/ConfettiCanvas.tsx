"use client";

import React, { useEffect, useRef } from "react";

interface ConfettiCanvasProps {
  trigger: boolean;
}

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  shape: "rect" | "circle" | "star";
  opacity: number;
  life: number;
  maxLife: number;
};

const COLORS = [
  "#8b5cf6", "#a78bfa", "#c4b5fd",
  "#06b6d4", "#67e8f9",
  "#f59e0b", "#fbbf24",
  "#ec4899", "#f472b6",
  "#10b981", "#34d399",
  "#6366f1", "#818cf8",
];

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const spikes = 5;
  const inner = r * 0.4;
  let rot = (-Math.PI / 2);
  ctx.beginPath();
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * r, cy + Math.sin(rot) * r);
    rot += Math.PI / spikes;
    ctx.lineTo(cx + Math.cos(rot) * inner, cy + Math.sin(rot) * inner);
    rot += Math.PI / spikes;
  }
  ctx.closePath();
  ctx.fill();
}

export function ConfettiCanvas({ trigger }: ConfettiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const prevTrigger = useRef(false);

  useEffect(() => {
    if (trigger && !prevTrigger.current) {
      burst();
    }
    prevTrigger.current = trigger;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const burst = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = canvas.width;
    const H = canvas.height;

    // Create 160 particles from top-center
    const newParticles: Particle[] = Array.from({ length: 160 }, () => {
      const angle = (Math.random() * Math.PI * 2);
      const speed = Math.random() * 14 + 4;
      const maxLife = Math.random() * 80 + 80;
      return {
        x: W * (0.3 + Math.random() * 0.4),
        y: H * 0.25,
        vx: Math.cos(angle) * speed * 0.7,
        vy: Math.sin(angle) * speed - 8,
        r: Math.random() * 7 + 3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.25,
        shape: ["rect", "circle", "star"][Math.floor(Math.random() * 3)] as Particle["shape"],
        opacity: 1,
        life: 0,
        maxLife,
      };
    });

    particlesRef.current = [...particlesRef.current, ...newParticles];
    cancelAnimationFrame(rafRef.current);
    animateConfetti();
  };

  const animateConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const stillAlive = particlesRef.current.filter((p) => {
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3; // gravity
      p.vx *= 0.99; // air drag
      p.rotation += p.rotationSpeed;
      p.opacity = Math.max(0, 1 - p.life / p.maxLife);

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.shape === "rect") {
        ctx.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r);
      } else if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.r * 0.6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        drawStar(ctx, 0, 0, p.r);
      }
      ctx.restore();

      return p.life < p.maxLife;
    });

    particlesRef.current = stillAlive;

    if (stillAlive.length > 0) {
      rafRef.current = requestAnimationFrame(animateConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Resize canvas to fill viewport
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9998]"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
