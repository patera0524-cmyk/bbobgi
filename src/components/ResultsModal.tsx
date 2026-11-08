import React, { useState } from 'react';
import { X, Trophy, Check, Copy, CheckCheck, Users, Gift, Clock } from 'lucide-react';
import { PrizeConfig, RaffleCard } from '../types';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  count: number;
  prizes: PrizeConfig[];
  cards: RaffleCard[];
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  isOpen,
  onClose,
  count,
  prizes,
  cards,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const openedCards = cards.filter((c) => c.opened);
  const remainingCount = count - openedCards.length;
  const progressPercent = Math.round((openedCards.length / (count || 1)) * 100);

  // Per-prize breakdown
  const prizeStats = prizes.map((p) => {
    const drawn = openedCards.filter((c) => c.prize === p.name).length;
    const left = p.qty - drawn;
    return {
      name: p.name,
      total: p.qty,
      drawn,
      left,
    };
  });

  const handleCopySummary = async () => {
    const summaryLines = [
      `[겨울 선물 페스티벌 뽑기 결과 현황]`,
      `총 학생: ${count}명 (참여: ${openedCards.length}명 / 남음: ${remainingCount}명 / 진행률: ${progressPercent}%)`,
      `---------------------------------`,
      `[상품별 당첨 현황]`,
      ...prizeStats.map(
        (ps) => `• ${ps.name}: ${ps.drawn}/${ps.total}명 (남음: ${ps.left}명)`
      ),
      `---------------------------------`,
      `[최근 당첨 기록 (상위 20개)]`,
      ...openedCards
        .slice(-20)
        .reverse()
        .map((c) => `제 ${String(c.id).padStart(3, '0')}번: ${c.prize}`),
    ];

    try {
      await navigator.clipboard.writeText(summaryLines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard write failure
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex flex-col w-full max-w-xl max-h-[90vh] overflow-hidden rounded-3xl border-2 border-white/20 bg-gradient-to-b from-[#0f2452] via-[#0b1c42] to-[#07132e] text-white shadow-[0_25px_80px_rgba(0,18,50,0.9)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/15 px-6 py-4.5 bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-jua tracking-wide text-white">
                뽑기 진행 및 당첨 현황 📊
              </h2>
              <p className="text-xs font-cute text-slate-300">
                실시간 선물 수령 내역과 남은 수량을 확인합니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-5 text-sm custom-scrollbar">
          {/* Top Progress Cards */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-3 shadow-inner">
              <div className="text-xs font-cute text-cyan-300 flex items-center justify-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>참여 완료</span>
              </div>
              <div className="text-2xl font-jua text-white mt-1 tabular-nums">
                {openedCards.length}
                <span className="text-xs font-cute text-slate-400 font-normal"> / {count}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-3 shadow-inner">
              <div className="text-xs font-cute text-amber-300 flex items-center justify-center gap-1">
                <Gift className="h-3.5 w-3.5" />
                <span>남은 선물</span>
              </div>
              <div className="text-2xl font-jua text-amber-300 mt-1 tabular-nums">
                {remainingCount}
                <span className="text-xs font-cute text-slate-400 font-normal">개</span>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3 shadow-inner">
              <div className="text-xs font-cute text-emerald-300 flex items-center justify-center gap-1">
                <Check className="h-3.5 w-3.5" />
                <span>진행률</span>
              </div>
              <div className="text-2xl font-black text-emerald-300 mt-1 tabular-nums">
                {progressPercent}%
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 rounded-full bg-slate-900/80 border border-white/10 p-0.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-amber-300 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Prize breakdown table */}
          <div>
            <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
              <span>상품별 상세 현황</span>
              <span className="text-[11px] text-slate-400">당첨 수량 / 전체 수량</span>
            </div>
            <div className="divide-y divide-white/10 rounded-2xl border border-white/15 bg-white/5 overflow-hidden">
              {prizeStats.map((ps, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-4 py-3 text-sm hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/10 text-xs font-bold text-cyan-200">
                      {idx + 1}
                    </span>
                    <span className="font-extrabold text-white">{ps.name}</span>
                  </div>
                  <div className="flex items-center gap-3 tabular-nums">
                    <span className="text-xs font-semibold text-slate-300">
                      당첨 <b className="text-cyan-300 text-sm">{ps.drawn}</b> / {ps.total}개
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        ps.left === 0
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      }`}
                    >
                      {ps.left === 0 ? '소진됨' : `${ps.left}개 남음`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Draw Log */}
          <div>
            <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-cyan-300" />
                <span>당첨 완료된 눈꽃 목록 ({openedCards.length}건)</span>
              </span>
            </div>

            {openedCards.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-xs text-slate-400">
                아직 뽑기를 진행한 학생이 없습니다. 첫 번째 눈꽃을 열어보세요! ❄️
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {openedCards
                  .slice()
                  .reverse()
                  .map((card) => (
                    <div
                      key={card.id}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                          #{String(card.id).padStart(3, '0')}
                        </span>
                        <span className="text-slate-200 font-semibold">
                          {card.prize}
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        수령 완료
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 bg-slate-950/40 px-6 py-4">
          <button
            type="button"
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-500/20 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <CheckCheck className="h-4 w-4 text-emerald-400" />
                <span>결과가 복사되었습니다!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>결과 텍스트 복사</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white/10 hover:bg-white/20 px-5 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
