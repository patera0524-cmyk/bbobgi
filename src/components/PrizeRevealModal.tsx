import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Gift, Check, ArrowRight } from 'lucide-react';
import { RaffleCard } from '../types';
import { FireworksDisplay } from './FireworksDisplay';

interface PrizeRevealModalProps {
  card: RaffleCard | null;
  onClose: () => void;
  soundEnabled: boolean;
}

export const PrizeRevealModal: React.FC<PrizeRevealModalProps> = ({
  card,
  onClose,
}) => {
  useEffect(() => {
    if (!card) return;

    try {
      // Trigger festive flank confetti blasts that fountain up along the sides
      // so the center prize text remains 100% clear and legible
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: 0.12, y: 0.75 },
        colors: ['#7dd3fc', '#38bdf8', '#fbbf24', '#f43f5e', '#a855f7', '#ffffff'],
        disableForReducedMotion: true,
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: 0.88, y: 0.75 },
        colors: ['#7dd3fc', '#38bdf8', '#fbbf24', '#f43f5e', '#a855f7', '#ffffff'],
        disableForReducedMotion: true,
      });

      const timer = setTimeout(() => {
        try {
          confetti({
            particleCount: 40,
            spread: 75,
            origin: { x: 0.18, y: 0.65 },
            colors: ['#38bdf8', '#fbbf24', '#ffffff'],
            disableForReducedMotion: true,
          });
          confetti({
            particleCount: 40,
            spread: 75,
            origin: { x: 0.82, y: 0.65 },
            colors: ['#38bdf8', '#fbbf24', '#ffffff'],
            disableForReducedMotion: true,
          });
        } catch {
          // Ignore
        }
      }, 200);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    } catch {
      // Fallback without breaking modal
    }
  }, [card, onClose]);

  if (!card) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Background CSS Fireworks Display - strictly on screen flanks so text is never covered */}
      <FireworksDisplay />

      {/* Foreground Modal Dialog Box with solid backdrop for crystal-clear readability */}
      <div
        className="relative z-20 w-full max-w-lg overflow-hidden rounded-3xl border-2 border-white/60 bg-[#0d2254]/95 p-7 text-center shadow-[0_30px_90px_rgba(0,18,50,0.95)] backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Aurora Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-cyan-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-pink-500/25 blur-3xl" />

        {/* Top celebratory banner */}
        <div className="relative mb-3 inline-flex items-center gap-1.5 rounded-full border border-cyan-300/50 bg-cyan-400/20 px-4 py-1.5 text-xs font-jua tracking-wider text-cyan-200 shadow-sm">
          <Sparkles className="h-4 w-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
          <span>축하합니다! 오늘의 행운 당첨 🎉</span>
          <Sparkles className="h-4 w-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
        </div>

        {/* Gift Box Icon with animated bounce & shimmer */}
        <div className="relative mx-auto my-3 flex h-28 w-28 items-center justify-center rounded-3xl border-2 border-white/40 bg-gradient-to-tr from-cyan-400/40 via-indigo-500/30 to-amber-300/40 shadow-[0_12px_40px_rgba(56,189,248,0.45)] backdrop-blur-md">
          <Gift className="h-16 w-16 text-amber-300 drop-shadow-[0_4px_16px_rgba(253,224,71,0.7)] animate-bounce" />
          <div className="absolute -top-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg border-2 border-white">
            <Check className="h-5 w-5 stroke-[3]" />
          </div>
        </div>

        {/* Card Number */}
        <div className="mb-2 text-sm sm:text-base font-jua tracking-wide text-cyan-200">
          ❄️ <span className="underline decoration-cyan-400/70 underline-offset-4 text-white">제 {String(card.id).padStart(3, '0')}번</span> 눈꽃 속 선물 ❄️
        </div>

        {/* Big Prize Name */}
        <div className="my-3 rounded-2xl border-2 border-white/30 bg-gradient-to-r from-white/15 via-white/20 to-white/15 px-6 py-5 shadow-inner">
          <p className="text-xs font-cute text-cyan-200 mb-1">🎁 당첨 상품 🎁</p>
          <h2 className="text-2xl sm:text-3.5xl font-jua tracking-wide text-amber-200 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
            {card.prize}
          </h2>
        </div>

        {/* Guidance tip for students/teachers */}
        <p className="text-xs sm:text-sm font-gaegu text-cyan-100 mt-2 mb-6 tracking-wide">
          학생 자치회에게 선물을 받아가세요! 🎈
        </p>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 px-7 py-3.5 text-base sm:text-lg font-jua text-white shadow-[0_10px_25px_rgba(14,165,233,0.5)] transition-all hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] cursor-pointer"
          >
            <span>다음 친구 뽑기</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
