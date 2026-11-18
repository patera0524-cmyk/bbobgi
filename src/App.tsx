/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Sparkles,
  Settings,
  BarChart3,
  Maximize2,
  Minimize2,
  VolumeX,
  Music,
  Gift,
  Users,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import {
  RaffleData,
  RaffleCard,
  PrizeConfig,
  STORAGE_KEY,
  DEFAULT_PRIZES,
} from './types';
import { SnowBackground } from './components/SnowBackground';
import { SnowflakeGrid } from './components/SnowflakeGrid';
import { PrizeRevealModal } from './components/PrizeRevealModal';
import { SettingsModal } from './components/SettingsModal';
import { ResultsModal } from './components/ResultsModal';
import { GrandFinaleCanvas } from './components/GrandFinaleCanvas';
import { playTileClick, playPrizeFanfare } from './utils/sound';
import { winterBgm } from './utils/bgm';

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateInitialCards(count: number, prizes: PrizeConfig[]): RaffleCard[] {
  const items: string[] = [];
  prizes.forEach((p) => {
    for (let i = 0; i < p.qty; i++) {
      items.push(p.name);
    }
  });

  // If there's any discrepancy, fill or trim
  while (items.length < count) {
    items.push('행운 선물');
  }
  const trimmed = items.slice(0, count);
  const shuffled = shuffleArray(trimmed);

  return shuffled.map((prize, idx) => ({
    id: idx + 1,
    prize,
    opened: false,
  }));
}

function getDefaultData(): RaffleData {
  const count = 140;
  const prizes = DEFAULT_PRIZES;
  const cards = generateInitialCards(count, prizes);
  return {
    count,
    prizes,
    cards,
    soundEnabled: true,
    bgmEnabled: true,
    themeTitle: '설레는 겨울 뽑기 대축제',
  };
}

export default function App() {
  const [data, setData] = useState<RaffleData>(() => {
    if (typeof window === 'undefined') return getDefaultData();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as RaffleData;
        if (
          parsed &&
          typeof parsed.count === 'number' &&
          Array.isArray(parsed.prizes) &&
          Array.isArray(parsed.cards) &&
          parsed.cards.length === parsed.count
        ) {
          return parsed;
        }
      }
    } catch {
      // Fallback on corrupt JSON
    }
    return getDefaultData();
  });

  const [selectedCard, setSelectedCard] = useState<RaffleCard | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [finaleDismissed, setFinaleDismissed] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage full or unavailable
    }
  }, [data]);

  // Track Fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  const bgmEnabled = data.bgmEnabled ?? true;

  // Manage background winter theme music
  useEffect(() => {
    if (!bgmEnabled) {
      winterBgm.stop();
      return;
    }

    winterBgm.start();

    // Unlock AudioContext on first user interaction if browser suspended autoplay
    const handleFirstGesture = async () => {
      const resumed = await winterBgm.resumeIfSuspended();
      if (resumed) {
        if (!winterBgm.isRunning()) {
          winterBgm.start();
        }
        window.removeEventListener('pointerdown', handleFirstGesture);
        window.removeEventListener('keydown', handleFirstGesture);
      }
    };

    window.addEventListener('pointerdown', handleFirstGesture);
    window.addEventListener('keydown', handleFirstGesture);

    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, [bgmEnabled]);

  useEffect(() => {
    return () => {
      winterBgm.stop();
    };
  }, []);

  const toggleSound = useCallback(() => {
    setData((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  }, []);

  const toggleBgm = useCallback(() => {
    setData((prev) => {
      const nextBgm = !(prev.bgmEnabled ?? true);
      if (nextBgm) {
        winterBgm.start();
      } else {
        winterBgm.stop();
      }
      return {
        ...prev,
        bgmEnabled: nextBgm,
      };
    });
  }, []);

  // Handle card click
  const handleSelectCard = useCallback(
    (clickedCard: RaffleCard) => {
      if (clickedCard.opened) return;

      playTileClick(data.soundEnabled);

      const updatedCard: RaffleCard = {
        ...clickedCard,
        opened: true,
        openedAt: Date.now(),
      };

      setData((prev) => ({
        ...prev,
        cards: prev.cards.map((c) => (c.id === clickedCard.id ? updatedCard : c)),
      }));

      // Play fanfare after a tiny instant
      setTimeout(() => {
        playPrizeFanfare(data.soundEnabled);
      }, 70);

      setSelectedCard(updatedCard);
    },
    [data.soundEnabled]
  );

  // Save new board from Settings
  const handleSaveNewBoard = useCallback(
    (newCount: number, newPrizes: PrizeConfig[]) => {
      const newCards = generateInitialCards(newCount, newPrizes);
      setFinaleDismissed(false);
      setData((prev) => ({
        ...prev,
        count: newCount,
        prizes: newPrizes,
        cards: newCards,
      }));
    },
    []
  );

  // Reset progress only (keep board prizes, just set cards unopened)
  const handleResetProgressOnly = useCallback(() => {
    setFinaleDismissed(false);
    setData((prev) => ({
      ...prev,
      cards: prev.cards.map((c) => ({
        ...c,
        opened: false,
        openedAt: undefined,
      })),
    }));
  }, []);

  // Open in-app reset confirmation modal (avoids iframe-blocked window.alert / window.confirm)
  const handleQuickReset = useCallback(() => {
    setIsResetConfirmOpen(true);
  }, []);

  const handleConfirmReset = useCallback(() => {
    setFinaleDismissed(false);
    setData((prev) => ({
      ...prev,
      cards: generateInitialCards(prev.count, prev.prizes),
    }));
    setIsResetConfirmOpen(false);
  }, []);

  const openedCount = useMemo(
    () => data.cards.filter((c) => c.opened).length,
    [data.cards]
  );
  const allOpened = data.cards.length > 0 && openedCount === data.cards.length;
  const remainingCount = data.count - openedCount;
  const progressPercent = Math.round((openedCount / (data.count || 1)) * 100);
  const showGrandFinale =
    allOpened &&
    !selectedCard &&
    !finaleDismissed &&
    !isSettingsOpen &&
    !isResultsOpen &&
    !isResetConfirmOpen;

  useEffect(() => {
    if (showGrandFinale) {
      playPrizeFanfare(data.soundEnabled);
    }
  }, [showGrandFinale, data.soundEnabled]);

  return (
    <div className="relative flex h-dvh w-screen flex-col overflow-hidden bg-gradient-to-br from-[#061433] via-[#0b2457] to-[#040e26] text-white">
      {/* Background Snow Canvas */}
      <SnowBackground />

      {/* Decorative Aurora Backdrops */}
      <div className="pointer-events-none fixed -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]" />
      <div className="pointer-events-none fixed top-1/4 -right-32 h-[32rem] w-[32rem] rounded-full bg-blue-600/15 blur-[140px]" />
      <div className="pointer-events-none fixed -bottom-32 left-1/3 h-96 w-96 rounded-full bg-indigo-500/15 blur-[120px]" />

      {/* Main Container - 16:9 Tablet Fit */}
      <div className="relative z-10 flex h-full w-full flex-col p-2 sm:p-3 max-w-[1720px] mx-auto">
        {/* Top Header Bar */}
        <header className="flex shrink-0 items-center justify-between gap-2 rounded-2xl sm:rounded-3xl border border-white/25 bg-gradient-to-r from-slate-900/70 via-[#0d2252]/60 to-slate-900/70 px-3 sm:px-5 py-2.5 backdrop-blur-xl shadow-[0_12px_40px_rgba(2,18,50,0.5)]">
          {/* Brand & Title with Cute Fonts */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-400 via-sky-400 to-indigo-500 text-white shadow-[0_4px_16px_rgba(56,189,248,0.45)] border border-white/40">
              <span className="text-xl animate-float-gentle">❄️</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg md:text-xl font-jua tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-sky-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  설레는 겨울 뽑기 대축제
                </h1>
              </div>
              <p className="hidden md:block text-xs font-cute text-cyan-200/85">
                마음에 드는 눈꽃을 톡 터치하면 오늘의 행운이 팡팡! ✨
              </p>
            </div>
          </div>

          {/* Central Stats Strip with Cute Counters */}
          <div className="flex items-center gap-2 sm:gap-4 rounded-2xl border border-white/20 bg-slate-950/40 px-3.5 py-1.5 backdrop-blur-md shadow-inner">
            {/* Remaining Gifts */}
            <div className="flex items-center gap-1.5 text-xs font-cute text-cyan-200">
              <Gift className="h-4 w-4 text-amber-300 shrink-0" />
              <span className="hidden sm:inline font-bold">남은 선물</span>
              <span className="text-base sm:text-lg font-jua text-amber-300 tabular-nums">
                {remainingCount}
              </span>
              <span className="text-[11px] text-slate-400">개</span>
            </div>

            <div className="h-4 w-px bg-white/20" />

            {/* Participation Count */}
            <div className="flex items-center gap-1.5 text-xs font-cute text-slate-200">
              <Users className="h-4 w-4 text-cyan-400 shrink-0" />
              <span className="hidden sm:inline font-bold">참여 현황</span>
              <span className="text-base sm:text-lg font-jua text-white tabular-nums">
                {openedCount}
              </span>
              <span className="text-[11px] text-slate-400">/ {data.count}</span>
            </div>

            {/* Mini Progress Bar */}
            <div className="hidden lg:flex items-center gap-1.5 w-24">
              <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-amber-300 transition-all duration-300 shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-jua text-cyan-300 tabular-nums">
                {progressPercent}%
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Background Music Toggle */}
            <button
              type="button"
              onClick={toggleBgm}
              className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border transition-all cursor-pointer ${
                bgmEnabled
                  ? 'border-cyan-400/40 bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30'
                  : 'border-white/15 bg-white/10 text-slate-400 hover:bg-white/20'
              }`}
              title={bgmEnabled ? '배경음악 끄기' : '배경음악 켜기'}
              aria-label="배경음악 토글"
              aria-pressed={bgmEnabled}
            >
              {bgmEnabled ? (
                <Music className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              ) : (
                <VolumeX className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              )}
            </button>

            {/* Quick Reset */}
            <button
              type="button"
              onClick={handleQuickReset}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white transition-all cursor-pointer"
              title="진행 상태 초기화"
              aria-label="초기화"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Results Button */}
            <button
              type="button"
              onClick={() => setIsResultsOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-500/20 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-jua text-cyan-200 hover:bg-cyan-500/30 transition-all cursor-pointer shadow-sm"
              title="결과 및 당첨 현황 보기"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">결과 보기</span>
            </button>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white transition-all cursor-pointer"
              title={isFullscreen ? '전체화면 종료' : '전체화면'}
              aria-label="전체화면"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>

            {/* Settings Button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-white/30 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-jua text-white hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-[0_4px_14px_rgba(37,99,235,0.45)]"
              title="선생님 설정"
            >
              <Settings className="h-4 w-4" />
              <span>설정</span>
            </button>
          </div>
        </header>

        {/* Central Stage: 14x10 Snow Grid */}
        <main className="relative flex-1 min-h-0 mt-2 sm:mt-2.5 flex flex-col rounded-2xl sm:rounded-3xl border border-cyan-300/35 bg-gradient-to-b from-white/15 via-white/5 to-white/10 p-1 sm:p-2 backdrop-blur-md shadow-[0_20px_60px_rgba(0,18,50,0.55),inset_0_1px_rgba(255,255,255,0.5)] overflow-hidden">
          {/* The 140 buttons grid */}
          <div className="w-full h-full flex-1 min-h-0 flex flex-col">
            <SnowflakeGrid
              cards={data.cards}
              onSelectCard={handleSelectCard}
            />
          </div>

          {/* Cute Mascot Characters & Speech Bubbles */}
          <div className="pointer-events-none absolute bottom-1.5 left-2.5 flex items-center gap-1.5 select-none">
            <span className="text-2xl sm:text-3xl filter drop-shadow animate-float-gentle">
              ☃️
            </span>
            <div className="hidden md:flex items-center rounded-2xl border border-cyan-300/40 bg-slate-900/75 px-3 py-1 shadow-md backdrop-blur-sm">
              <span className="font-gaegu text-sm sm:text-base font-bold text-cyan-200">
                눈꽃을 톡 터치해봐~ ❄️
              </span>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-1.5 right-2.5 flex items-center gap-1.5 select-none">
            <div className="hidden md:flex items-center rounded-2xl border border-pink-300/40 bg-slate-900/75 px-3 py-1 shadow-md backdrop-blur-sm">
              <span className="font-gaegu text-sm sm:text-base font-bold text-pink-200">
                두근두근! 오늘의 선물은? 🎁
              </span>
            </div>
            <span className="text-2xl sm:text-3xl filter drop-shadow animate-float-gentle" style={{ animationDelay: '1.5s' }}>
              🐧
            </span>
          </div>
        </main>
      </div>

      {/* Grand Finale Full-Screen Canvas Fireworks & Center Particle Effect */}
      {showGrandFinale && (
        <GrandFinaleCanvas
          totalCount={data.count}
          onOpenResults={() => setIsResultsOpen(true)}
          onReset={handleQuickReset}
          onDismiss={() => setFinaleDismissed(true)}
        />
      )}

      {/* Prize Reveal Modal */}
      {selectedCard && (
        <PrizeRevealModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          soundEnabled={data.soundEnabled}
        />
      )}

      {/* Settings Modal (Teacher Only) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentCount={data.count}
        currentPrizes={data.prizes}
        hasOpenedCards={openedCount > 0}
        soundEnabled={data.soundEnabled}
        onToggleSound={toggleSound}
        bgmEnabled={bgmEnabled}
        onToggleBgm={toggleBgm}
        onSaveNewBoard={handleSaveNewBoard}
        onResetProgressOnly={handleResetProgressOnly}
      />

      {/* Results & Statistics Modal */}
      <ResultsModal
        isOpen={isResultsOpen}
        onClose={() => setIsResultsOpen(false)}
        count={data.count}
        prizes={data.prizes}
        cards={data.cards}
      />

      {/* In-App Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
          onClick={() => setIsResetConfirmOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="뽑기판 초기화 확인"
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border-2 border-white/30 bg-gradient-to-b from-[#132d6e] via-[#0e245c] to-[#07153b] p-6 text-center text-white shadow-[0_25px_80px_rgba(0,18,50,0.95)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/40 bg-amber-400/20 text-amber-300 shadow-md">
              <RotateCcw className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-jua text-white">
              뽑기판을 초기화할까요?
            </h2>
            <p className="mt-2 text-sm font-cute text-cyan-100/90 leading-relaxed">
              {openedCount > 0 ? (
                <>
                  현재까지 <b className="text-amber-300 font-jua">{openedCount}명</b>이 뽑기를 완료했습니다.
                  <br />
                  모든 눈꽃을 초기화하고 상품을 다시 무작위로 섞습니다.
                </>
              ) : (
                <>
                  아직 뽑기를 진행한 학생이 없습니다.
                  <br />
                  모든 눈꽃 속 상품 위치를 새로 무작위로 섞을까요?
                </>
              )}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-jua text-slate-200 hover:bg-white/20 transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 px-4 py-2.5 text-sm font-jua text-slate-950 shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                {openedCount > 0 ? '초기화하기' : '새로 섞기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
