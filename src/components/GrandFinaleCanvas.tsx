import React, { useEffect, useRef } from 'react';
import { Trophy, BarChart3, RotateCcw, X, Sparkles } from 'lucide-react';

interface GrandFinaleCanvasProps {
  totalCount: number;
  onOpenResults: () => void;
  onReset: () => void;
  onDismiss: () => void;
}

interface Rocket {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetY: number;
  color: string;
  trail: { x: number; y: number }[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  color: string;
  size: number;
  gravity: number;
  drag: number;
  twinkle: boolean;
  shape: 'circle' | 'star';
}

const PALETTE = [
  '#fbbf24', // Gold
  '#fde047', // Bright Yellow
  '#38bdf8', // Ice Cyan
  '#7dd3fc', // Sky Blue
  '#f472b6', // Festive Pink
  '#c084fc', // Aurora Violet
  '#34d399', // Mint Emerald
  '#ffffff', // Snow White
];

export const GrandFinaleCanvas: React.FC<GrandFinaleCanvasProps> = ({
  totalCount,
  onOpenResults,
  onReset,
  onDismiss,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

    let width = Math.max(1, window.innerWidth || 1280);
    let height = Math.max(1, window.innerHeight || 720);
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = Math.max(1, window.innerWidth || 1280);
      height = Math.max(1, window.innerHeight || 720);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const rockets: Rocket[] = [];
    const particles: Particle[] = [];

    const createFireworkBurst = (
      x: number,
      y: number,
      count: number = 64,
      speedMultiplier: number = 1,
      useStars: boolean = false
    ) => {
      const primary = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      const secondary = PALETTE[Math.floor(Math.random() * PALETTE.length)];

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.16 - 0.08);
        const speed = (2.2 + Math.random() * 5.2) * speedMultiplier;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          decay: 0.011 + Math.random() * 0.012,
          color: i % 3 === 0 ? '#ffffff' : i % 2 === 0 ? primary : secondary,
          size: 2 + Math.random() * 2.8,
          gravity: 0.055,
          drag: 0.965,
          twinkle: Math.random() > 0.35,
          shape: useStars && i % 4 === 0 ? 'star' : 'circle',
        });
      }
    };

    const createCenterBurst = (count: number = 36) => {
      const cx = width / 2;
      const cy = height / 2;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.8 + Math.random() * 6.4;
        const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        particles.push({
          x: cx + (Math.random() - 0.5) * 40,
          y: cy + (Math.random() - 0.5) * 40,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          decay: 0.009 + Math.random() * 0.01,
          color,
          size: 2.5 + Math.random() * 3.2,
          gravity: 0.025,
          drag: 0.975,
          twinkle: true,
          shape: i % 3 === 0 ? 'star' : 'circle',
        });
      }
    };

    const launchRocket = () => {
      const startX = width * (0.12 + Math.random() * 0.76);
      const targetY = height * (0.14 + Math.random() * 0.38);
      rockets.push({
        x: startX,
        y: height + 10,
        vx: (Math.random() - 0.5) * 2.4,
        vy: -(9.5 + Math.random() * 4.5),
        targetY,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        trail: [],
      });
    };

    // Initial grand opening bursts
    if (!prefersReducedMotion) {
      createCenterBurst(90);
      createFireworkBurst(width * 0.22, height * 0.28, 72, 1.15, true);
      createFireworkBurst(width * 0.78, height * 0.26, 72, 1.15, true);
      launchRocket();
      launchRocket();
    }

    let frameCount = 0;
    let animationFrameId: number;

    const drawStar = (cx: number, cy: number, r: number, color: string, alpha: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const outerX = cx + Math.cos(angle) * r * 1.9;
        const outerY = cy + Math.sin(angle) * r * 1.9;
        const innerAngle = angle + Math.PI / 4;
        const innerX = cx + Math.cos(innerAngle) * r * 0.55;
        const innerY = cy + Math.sin(innerAngle) * r * 0.55;
        if (i === 0) ctx.moveTo(outerX, outerY);
        else ctx.lineTo(outerX, outerY);
        ctx.lineTo(innerX, innerY);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      // Soft trail fade on canvas without painting solid black
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'lighter';

      if (!prefersReducedMotion) {
        frameCount++;

        // Periodic full-screen rockets
        if (frameCount % 26 === 0) {
          launchRocket();
        }
        // Periodic center particle fountain & ring glow
        if (frameCount % 32 === 0) {
          createCenterBurst(28);
        }
      }

      // Draw subtle pulsing center aura on canvas
      const cx = width / 2;
      const cy = height / 2;
      const pulseRadius = 170 + Math.sin(frameCount * 0.05) * 24;
      const radial = ctx.createRadialGradient(cx, cy, 10, cx, cy, pulseRadius);
      radial.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
      radial.addColorStop(0.5, 'rgba(251, 191, 36, 0.10)');
      radial.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = radial;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
      ctx.fill();

      // Update & draw rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.trail.push({ x: r.x, y: r.y });
        if (r.trail.length > 8) r.trail.shift();

        r.x += r.vx;
        r.y += r.vy;
        r.vy += 0.14; // gravity

        // Draw rocket trail
        for (let t = 0; t < r.trail.length; t++) {
          const pt = r.trail[t];
          ctx.globalAlpha = (t + 1) / r.trail.length * 0.7;
          ctx.fillStyle = r.color;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        if (r.y <= r.targetY || r.vy >= 0) {
          createFireworkBurst(r.x, r.y, 58, 1.05, true);
          rockets.splice(i, 1);
        }
      }

      // Update & draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0.02) {
          particles.splice(i, 1);
          continue;
        }

        const drawAlpha = p.twinkle && Math.random() > 0.7 ? p.alpha * 0.45 : p.alpha;

        if (p.shape === 'star') {
          drawStar(p.x, p.y, p.size, p.color, drawAlpha);
        } else {
          ctx.save();
          ctx.globalAlpha = drawAlpha;
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-label="모든 선물 뽑기 완료 축하 화면"
    >
      {/* Full-screen HTML5 Canvas Fireworks & Center Particle Effect */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 h-full w-full"
        aria-hidden="true"
      />

      {/* Central Grand Finale Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border-2 border-amber-300/60 bg-[#0b1f4d]/90 p-7 text-center shadow-[0_25px_90px_rgba(0,15,45,0.95)] backdrop-blur-xl">
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-3.5 right-3.5 flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
          aria-label="축하 창 닫기"
          title="닫고 뽑기판 보기"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-300/50 bg-amber-400/20 px-4 py-1 text-xs font-jua text-amber-200">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span>{totalCount}명 전원 참여 완료!</span>
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
        </div>

        <div className="mx-auto my-3 flex h-24 w-24 items-center justify-center rounded-3xl border-2 border-amber-300/60 bg-gradient-to-tr from-amber-400/35 via-pink-500/25 to-cyan-400/35 shadow-[0_0_40px_rgba(251,191,36,0.45)]">
          <Trophy className="h-14 w-14 text-amber-300 drop-shadow-[0_4px_14px_rgba(253,224,71,0.75)] animate-bounce" />
        </div>

        <h2 className="mt-2 text-2xl sm:text-3xl font-jua tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-cyan-200">
          모든 선물 뽑기 완료! 🎊
        </h2>
        <p className="mt-2 text-sm sm:text-base font-gaegu text-cyan-100/95">
          우리 반 친구들 모두 즐거운 겨울 축제 되었나요? ❄️🎁
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onOpenResults}
            className="flex items-center justify-center gap-1.5 rounded-2xl border border-cyan-300/40 bg-cyan-500/25 px-4 py-3 text-sm font-jua text-cyan-100 hover:bg-cyan-500/40 transition-all cursor-pointer"
          >
            <BarChart3 className="h-4 w-4" />
            <span>결과 전체보기</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 px-4 py-3 text-sm font-jua text-slate-950 shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>새로 시작하기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
