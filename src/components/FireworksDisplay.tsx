import React, { useMemo } from 'react';

interface Particle {
  id: number;
  angle: number; // in radians
  distance: number; // px
  color: string;
  size: number;
  delay: number; // seconds
  duration: number; // seconds
}

interface FireworkBurst {
  id: number;
  top: string;
  left: string;
  delay: number; // seconds
  colorTheme: string[];
  ringColor: string;
  particles: Particle[];
}

const THEMES = [
  {
    name: 'gold',
    colors: ['#fbbf24', '#f59e0b', '#fde047', '#ffffff', '#fed7aa'],
    ring: 'rgba(251, 191, 36, 0.85)',
  },
  {
    name: 'cyan',
    colors: ['#38bdf8', '#06b6d4', '#7dd3fc', '#ffffff', '#bae6fd'],
    ring: 'rgba(56, 189, 248, 0.85)',
  },
  {
    name: 'rose',
    colors: ['#f43f5e', '#ec4899', '#fb7185', '#ffffff', '#fda4af'],
    ring: 'rgba(244, 63, 94, 0.85)',
  },
  {
    name: 'emerald',
    colors: ['#10b981', '#34d399', '#6ee7b7', '#ffffff', '#a7f3d0'],
    ring: 'rgba(16, 185, 129, 0.85)',
  },
  {
    name: 'purple',
    colors: ['#a855f7', '#c084fc', '#e879f9', '#ffffff', '#f5d0fe'],
    ring: 'rgba(168, 85, 247, 0.85)',
  },
];

export const FireworksDisplay: React.FC = () => {
  // Burst positions are strictly placed on the screen flanks and outer perimeter
  // so they NEVER overlap or obscure the central prize card and text!
  const bursts: FireworkBurst[] = useMemo(() => {
    const burstConfigs = [
      // Wave 1: Immediate instant burst (0s) on left and right sides
      { top: '18%', left: '14%', themeIdx: 0, delay: 0 },
      { top: '22%', left: '86%', themeIdx: 1, delay: 0 },

      // Wave 2: 0.18s later on upper and lower flanks
      { top: '48%', left: '10%', themeIdx: 2, delay: 0.18 },
      { top: '52%', left: '90%', themeIdx: 3, delay: 0.22 },

      // Wave 3: 0.45s later on diagonal corners
      { top: '78%', left: '16%', themeIdx: 4, delay: 0.45 },
      { top: '76%', left: '84%', themeIdx: 0, delay: 0.52 },

      // Wave 4: 0.8s subsequent wave
      { top: '28%', left: '18%', themeIdx: 1, delay: 0.8 },
      { top: '34%', left: '82%', themeIdx: 2, delay: 0.95 },

      // Wave 5: 1.25s recurring burst
      { top: '64%', left: '12%', themeIdx: 3, delay: 1.25 },
      { top: '62%', left: '88%', themeIdx: 4, delay: 1.4 },
    ];

    return burstConfigs.map((cfg, bIdx) => {
      const theme = THEMES[cfg.themeIdx % THEMES.length];
      const particleCount = 18;
      const particles: Particle[] = [];

      for (let i = 0; i < particleCount; i++) {
        const angle = (i * 2 * Math.PI) / particleCount + (Math.random() * 0.18 - 0.09);
        const distance = 50 + Math.random() * 55; // Compact 50px~105px spread to prevent bleeding into center
        const color = theme.colors[Math.floor(Math.random() * theme.colors.length)];
        const size = Math.random() * 2.5 + 3.5;
        const duration = 1.0 + Math.random() * 0.35;

        particles.push({
          id: i,
          angle,
          distance,
          color,
          size,
          delay: cfg.delay,
          duration,
        });
      }

      return {
        id: bIdx,
        top: cfg.top,
        left: cfg.left,
        delay: cfg.delay,
        colorTheme: theme.colors,
        ringColor: theme.ring,
        particles,
      };
    });
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {bursts.map((burst) => (
        <div
          key={burst.id}
          className="absolute"
          style={{
            top: burst.top,
            left: burst.left,
          }}
        >
          {/* Central expanding flash ring */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 opacity-0 animate-firework-ring"
            style={{
              borderColor: burst.ringColor,
              boxShadow: `0 0 18px ${burst.ringColor}`,
              width: '70px',
              height: '70px',
              animationDelay: `${burst.delay}s`,
            }}
          />

          {/* Center glow flash */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 animate-firework-flash"
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: burst.colorTheme[0],
              boxShadow: `0 0 28px 10px ${burst.colorTheme[0]}`,
              animationDelay: `${burst.delay}s`,
            }}
          />

          {/* Radiating firework spark particles */}
          {burst.particles.map((p) => {
            const tx = Math.cos(p.angle) * p.distance;
            const ty = Math.sin(p.angle) * p.distance;

            return (
              <div
                key={p.id}
                className="absolute top-0 left-0 rounded-full animate-firework-particle"
                style={
                  {
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    backgroundColor: p.color,
                    boxShadow: `0 0 7px 2px ${p.color}, 0 0 14px ${p.color}`,
                    '--tx': `${tx}px`,
                    '--ty': `${ty}px`,
                    animationDelay: `${p.delay}s`,
                    animationDuration: `${p.duration}s`,
                  } as React.CSSProperties
                }
              />
            );
          })}
        </div>
      ))}

      {/* Flank ambient celebratory sparkles (strictly placed outside center card) */}
      <div className="absolute inset-0">
        {[
          { top: '15%', left: '8%' },
          { top: '35%', left: '6%' },
          { top: '58%', left: '7%' },
          { top: '82%', left: '9%' },
          { top: '16%', left: '92%' },
          { top: '38%', left: '94%' },
          { top: '60%', left: '93%' },
          { top: '85%', left: '91%' },
        ].map((pos, i) => {
          const color = THEMES[i % THEMES.length].colors[0];
          return (
            <div
              key={i}
              className="absolute rounded-full animate-spark-twinkle opacity-0"
              style={{
                top: pos.top,
                left: pos.left,
                width: '6px',
                height: '6px',
                backgroundColor: color,
                boxShadow: `0 0 12px ${color}`,
                animationDelay: `${i * 0.25}s`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
