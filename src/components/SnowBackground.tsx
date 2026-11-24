import React, { useEffect, useRef } from 'react';

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wind: number;
  opacity: number;
  swing: number;
  swingSpeed: number;
}

export const SnowBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = Math.max(1, window.innerWidth || 1280));
    let height = (canvas.height = Math.max(1, window.innerHeight || 720));

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = Math.max(1, window.innerWidth || 1280);
      height = canvas.height = Math.max(1, window.innerHeight || 720);
    };

    window.addEventListener('resize', handleResize);

    // Create 45 subtle, performant snowflakes
    const flakes: Snowflake[] = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.5 + 1.2,
      speed: Math.random() * 0.7 + 0.4,
      wind: Math.random() * 0.4 - 0.2,
      opacity: Math.random() * 0.6 + 0.25,
      swing: Math.random() * Math.PI * 2,
      swingSpeed: Math.random() * 0.02 + 0.01,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < flakes.length; i++) {
        const flake = flakes[i];
        flake.swing += flake.swingSpeed;
        flake.x += Math.sin(flake.swing) * 0.4 + flake.wind;
        flake.y += flake.speed;

        if (flake.y > height + 10) {
          flake.y = -10;
          flake.x = Math.random() * width;
        }
        if (flake.x > width + 10) {
          flake.x = -10;
        } else if (flake.x < -10) {
          flake.x = width + 10;
        }

        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(225, 245, 255, ${flake.opacity})`;
        ctx.shadowColor = 'rgba(180, 230, 255, 0.8)';
        ctx.shadowBlur = 6;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      aria-hidden="true"
    />
  );
};
