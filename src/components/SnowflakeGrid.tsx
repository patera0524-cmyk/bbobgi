import React, { useState } from 'react';
import { RaffleCard } from '../types';

interface SnowflakeGridProps {
  cards: RaffleCard[];
  onSelectCard: (card: RaffleCard) => void;
  disabledAll?: boolean;
}

export const SnowflakeGrid: React.FC<SnowflakeGridProps> = ({
  cards,
  onSelectCard,
  disabledAll = false,
}) => {
  const [poppingCardId, setPoppingCardId] = useState<number | null>(null);

  const count = cards.length;
  let colsClass = 'grid-cols-14';
  if (count <= 28) {
    colsClass = 'grid-cols-7 sm:grid-cols-7';
  } else if (count <= 70) {
    colsClass = 'grid-cols-10';
  } else {
    colsClass = 'grid-cols-14';
  }

  const handleTileClick = (card: RaffleCard) => {
    if (card.opened || disabledAll || poppingCardId !== null) return;

    // Trigger the tactile '팡' pop animation on the clicked snowflake
    setPoppingCardId(card.id);

    // After the pop animation expands and fades (200ms), reveal the prize!
    window.setTimeout(() => {
      onSelectCard(card);
      setPoppingCardId(null);
    }, 200);
  };

  return (
    <div
      className={`grid ${colsClass} w-full h-full gap-1.5 sm:gap-2 p-1 sm:p-2 select-none flex-1`}
      style={{
        gridTemplateColumns: count === 140 ? 'repeat(14, minmax(0, 1fr))' : undefined,
        gridTemplateRows: count === 140 ? 'repeat(10, minmax(0, 1fr))' : undefined,
      }}
      role="grid"
      aria-label="겨울 뽑기 눈꽃 버튼 모음"
    >
      {cards.map((card) => {
        const isOpened = card.opened;
        const isPopping = poppingCardId === card.id;
        const formattedNum = String(card.id).padStart(3, '0');

        return (
          <button
            key={card.id}
            type="button"
            disabled={isOpened || disabledAll || isPopping}
            onClick={() => handleTileClick(card)}
            aria-label={`${card.id}번 눈꽃 ${isOpened ? '뽑기 완료' : '선택하기'}`}
            className={`group relative flex w-full h-full min-h-[38px] sm:min-h-[44px] md:min-h-[50px] flex-col items-center justify-center rounded-xl transition-all duration-150 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
              isPopping
                ? 'scale-110 z-20 border-2 border-cyan-200 bg-gradient-to-b from-white via-cyan-100 to-sky-300 shadow-[0_0_25px_rgba(56,189,248,0.85)] brightness-125'
                : isOpened
                ? 'cursor-not-allowed border border-cyan-800/40 bg-gradient-to-b from-[#132345] to-[#0a162e] text-slate-400/70 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] opacity-70'
                : 'cursor-pointer border-2 border-white/95 bg-gradient-to-b from-[#ffffff] via-[#e2f7ff] to-[#aee4ff] text-[#0284c7] shadow-[0_4px_0_#0284c7,0_8px_16px_rgba(2,132,199,0.32)] hover:-translate-y-1 hover:shadow-[0_6px_0_#0284c7,0_12px_22px_rgba(2,132,199,0.45)] hover:ring-2 hover:ring-cyan-200 hover:brightness-105 active:translate-y-0.5 active:shadow-[0_1px_0_#0284c7]'
            }`}
          >
            {/* Top glossy reflection strip for unopened tiles */}
            {!isOpened && !isPopping && (
              <span className="pointer-events-none absolute inset-x-1.5 top-0.5 h-[35%] rounded-t-lg bg-gradient-to-b from-white/80 via-white/40 to-transparent" />
            )}

            {/* Shockwave burst ring when clicked */}
            {isPopping && (
              <span className="pointer-events-none absolute inset-0 rounded-xl border-2 animate-tile-burst-ring" />
            )}

            {/* Main Symbol with Pop animation */}
            <span
              className={`leading-none transition-transform duration-150 ${
                isPopping
                  ? 'text-xl sm:text-2xl md:text-3xl animate-snowflake-pop text-cyan-500'
                  : isOpened
                  ? 'text-xs sm:text-sm md:text-base font-black text-cyan-400/60'
                  : 'text-base sm:text-xl md:text-2xl filter drop-shadow-[0_1px_2px_#ffffff] group-hover:scale-120'
              }`}
            >
              {isOpened ? '✓' : '❄'}
            </span>

            {/* Number with Cute Font */}
            <span
              className={`text-[9.5px] sm:text-[11px] md:text-[12.5px] font-jua tracking-wide leading-none mt-0.5 tabular-nums transition-opacity duration-150 ${
                isPopping
                  ? 'opacity-40 scale-90'
                  : isOpened
                  ? 'text-slate-400/80 font-normal'
                  : 'text-[#0369a1]'
              }`}
            >
              {formattedNum}
            </span>
          </button>
        );
      })}
    </div>
  );
};
