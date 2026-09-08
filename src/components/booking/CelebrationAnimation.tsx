"use client";

import { useEffect, useRef } from "react";

const FIREWORK_COUNT = 8;
const FADE_COLOR = "rgba(255, 253, 248, 0.16)";

type TrailPoint = { x: number; y: number };

type Particle = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  alpha: number;
  color: string;
  trail: TrailPoint[];
  maxTrailLength: number;
};

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
}

function getRgbFromHsl(hslColor: string): string {
  const match = hslColor.match(/hsl\((\d+\.?\d*),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return "255,255,255";
  const rgb = hslToRgb(parseFloat(match[1]), parseInt(match[2], 10), parseInt(match[3], 10));
  return rgb.join(",");
}

function randomFireworkColor(): string {
  const roll = Math.random();
  if (roll < 0.35) {
    return `hsl(${32 + Math.random() * 28}, 95%, ${52 + Math.random() * 10}%)`;
  }
  if (roll < 0.55) {
    return `hsl(${15 + Math.random() * 18}, 92%, ${50 + Math.random() * 12}%)`;
  }
  return `hsl(${Math.random() * 360}, 100%, 60%)`;
}

class Firework {
  private x = 0;
  private y = 0;
  private dx = 0;
  private dy = 0;
  private color = "";
  private exploded = false;
  private particles: Particle[] = [];
  private explosionY = 0;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private canvasWidth: number,
    private canvasHeight: number
  ) {
    this.reset();
  }

  reset() {
    this.x = Math.random() * this.canvasWidth;
    this.y = this.canvasHeight;
    this.color = randomFireworkColor();
    this.dx = (Math.random() - 0.5) * 3;
    this.dy = -(Math.random() * 10 + 10);
    this.exploded = false;
    this.particles = [];
    this.explosionY = this.canvasHeight * (0.22 + Math.random() * 0.28);
  }

  launch() {
    const prevX = this.x;
    const prevY = this.y;

    this.x += this.dx;
    this.y += this.dy;

    this.ctx.beginPath();
    this.ctx.moveTo(prevX, prevY);
    this.ctx.lineTo(this.x, this.y);
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    if (this.y <= this.explosionY) {
      this.explode();
    }
  }

  explode() {
    const particleCount = Math.floor(Math.random() * 50 + 50);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;

      this.particles.push({
        x: this.x,
        y: this.y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 1,
        alpha: 1,
        color: this.color,
        trail: [{ x: this.x, y: this.y }],
        maxTrailLength: 10,
      });
    }

    this.exploded = true;
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      particle.x += particle.dx;
      particle.y += particle.dy;
      particle.trail.push({ x: particle.x, y: particle.y });

      if (particle.trail.length > particle.maxTrailLength) {
        particle.trail.shift();
      }

      particle.dy += 0.15;
      particle.dx *= 0.99;

      if (particle.trail.length > 1) {
        this.ctx.beginPath();
        this.ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
        for (let j = 1; j < particle.trail.length; j++) {
          this.ctx.lineTo(particle.trail[j].x, particle.trail[j].y);
        }
        this.ctx.strokeStyle = `rgba(${getRgbFromHsl(particle.color)}, ${particle.alpha})`;
        this.ctx.lineWidth = particle.size / 2;
        this.ctx.stroke();
      }

      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${getRgbFromHsl(particle.color)}, ${particle.alpha})`;
      this.ctx.fill();

      particle.alpha -= 0.01;

      if (
        particle.alpha <= 0 ||
        particle.x < 0 ||
        particle.x > this.canvasWidth ||
        particle.y > this.canvasHeight
      ) {
        this.particles.splice(i, 1);
      }
    }
  }

  update() {
    if (!this.exploded) {
      this.launch();
      return;
    }

    this.updateParticles();

    if (this.particles.length === 0) {
      this.reset();
    }
  }

  setCanvasSize(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }
}

class FireworksDisplay {
  private ctx: CanvasRenderingContext2D;
  private fireworks: Firework[] = [];
  private canvasWidth = 0;
  private canvasHeight = 0;
  private animationId: number | null = null;
  private stopped = false;

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not get canvas context");
    }
    this.ctx = ctx;
    this.resize();
    this.fireworks = Array.from(
      { length: FIREWORK_COUNT },
      () => new Firework(this.ctx, this.canvasWidth, this.canvasHeight)
    );
    this.animate();
  }

  resize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.canvasWidth = width;
    this.canvasHeight = height;
    this.fireworks.forEach((firework) => firework.setCanvasSize(width, height));
  };

  animate = () => {
    if (this.stopped) return;

    this.ctx.fillStyle = FADE_COLOR;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.fireworks.forEach((firework) => firework.update());

    this.animationId = window.requestAnimationFrame(this.animate);
  };

  stop() {
    this.stopped = true;
    if (this.animationId !== null) {
      window.cancelAnimationFrame(this.animationId);
    }
  }
}

export default function CelebrationAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const displayRef = useRef<FireworksDisplay | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let display: FireworksDisplay;
    try {
      display = new FireworksDisplay(canvas);
      displayRef.current = display;
    } catch {
      return;
    }

    window.addEventListener("resize", display.resize);

    return () => {
      window.removeEventListener("resize", display.resize);
      display.stop();
      displayRef.current = null;
    };
  }, []);

  return (
    <div
      className="celebration-fireworks-overlay pointer-events-none fixed inset-0 z-[5] overflow-hidden"
      aria-hidden
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
      <div className="celebration-fireworks-vignette absolute inset-0" />
    </div>
  );
}
