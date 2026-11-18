import React, { useState } from 'react';
import { X, Plus, Trash2, AlertCircle, RefreshCw, CheckCircle2, Sliders, Sparkles, Volume2, VolumeX, Music } from 'lucide-react';
import { PrizeConfig, PRESETS } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCount: number;
  currentPrizes: PrizeConfig[];
  hasOpenedCards: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  bgmEnabled: boolean;
  onToggleBgm: () => void;
  onSaveNewBoard: (count: number, prizes: PrizeConfig[]) => void;
  onResetProgressOnly: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentCount,
  currentPrizes,
  hasOpenedCards,
  soundEnabled,
  onToggleSound,
  bgmEnabled,
  onToggleBgm,
  onSaveNewBoard,
  onResetProgressOnly,
}) => {
  const [studentCount, setStudentCount] = useState<number>(currentCount);
  const [prizes, setPrizes] = useState<PrizeConfig[]>(
    currentPrizes.map((p) => ({ ...p }))
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalPrizeQty = prizes.reduce((sum, p) => sum + (Number(p.qty) || 0), 0);
  const diff = studentCount - totalPrizeQty;

  const handleAddPrize = () => {
    const newId = String(Date.now());
    const remainingToFill = Math.max(0, diff);
    setPrizes([
      ...prizes,
      {
        id: newId,
        name: `새 상품 ${prizes.length + 1}`,
        qty: remainingToFill > 0 ? remainingToFill : 10,
        badgeColor: '#38bdf8',
      },
    ]);
  };

  const handleRemovePrize = (index: number) => {
    if (prizes.length <= 1) {
      setErrorMsg('최소 1개 이상의 상품이 있어야 합니다.');
      return;
    }
    const updated = prizes.filter((_, i) => i !== index);
    setPrizes(updated);
  };

  const handlePrizeChange = (
    index: number,
    field: 'name' | 'qty',
    value: string | number
  ) => {
    const updated = [...prizes];
    if (field === 'name') {
      updated[index].name = String(value);
    } else {
      const num = Math.max(0, Math.min(1000, Number(value) || 0));
      updated[index].qty = num;
    }
    setPrizes(updated);
    setErrorMsg(null);
  };

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    setStudentCount(preset.count);
    setPrizes(preset.prizes.map((p) => ({ ...p })));
    setErrorMsg(null);
  };

  const handleSave = () => {
    if (studentCount < 1 || studentCount > 1000) {
      setErrorMsg('전체 학생 수는 1명에서 1,000명 사이여야 합니다.');
      return;
    }
    if (prizes.length === 0) {
      setErrorMsg('상품을 최소 1개 이상 등록해 주세요.');
      return;
    }
    for (const p of prizes) {
      if (!p.name.trim()) {
        setErrorMsg('모든 상품의 이름을 입력해 주세요.');
        return;
      }
      if (p.qty <= 0) {
        setErrorMsg(`'${p.name}' 상품의 수량을 1개 이상으로 입력해 주세요.`);
        return;
      }
    }
    if (totalPrizeQty !== studentCount) {
      setErrorMsg(
        `상품 수량 합계(${totalPrizeQty}개)가 전체 학생 수(${studentCount}명)와 일치해야 합니다.`
      );
      return;
    }

    if (hasOpenedCards) {
      const confirmed = window.confirm(
        '새 뽑기판을 만들면 지금까지의 뽑기 기록이 모두 초기화됩니다. 계속 진행하시겠습니까?'
      );
      if (!confirmed) return;
    }

    onSaveNewBoard(studentCount, prizes);
    onClose();
  };

  const handleResetProgress = () => {
    const confirmed = window.confirm(
      '현재 설정된 상품 배치는 유지하고, 모든 학생의 뽑기 완료 상태만 처음(미개봉)으로 되돌릴까요?'
    );
    if (confirmed) {
      onResetProgressOnly();
      onClose();
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
        className="relative flex flex-col w-full max-w-xl max-h-[92vh] overflow-hidden rounded-3xl border-2 border-white/20 bg-gradient-to-b from-[#0f2452] via-[#0b1c42] to-[#07132e] text-white shadow-[0_25px_80px_rgba(0,18,50,0.9)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/15 px-6 py-4.5 bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 shadow-sm">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-jua tracking-wide text-white flex items-center gap-2">
                선생님 뽑기 설정
                <span className="text-[11px] font-jua px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                  교사용 ⚙️
                </span>
              </h2>
              <p className="text-xs font-cute text-slate-300">
                인원수와 상품 구성을 수정하고 무작위 배정판을 생성합니다.
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
        <div className="overflow-y-auto px-6 py-4 space-y-5 text-sm custom-scrollbar">
          {/* Preset Templates */}
          <div>
            <label className="text-xs font-bold text-cyan-200 block mb-1.5">
              ⚡ 빠른 프리셋 불러오기
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="rounded-xl border border-white/15 bg-white/5 hover:bg-cyan-500/15 hover:border-cyan-400/40 p-2 text-left transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-white group-hover:text-cyan-200">
                    {p.label}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {p.count}명 · {p.prizes.length}종류
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Student Count Input */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-extrabold text-white block">
                  전체 참가 학생 수
                </label>
                <p className="text-xs text-slate-400">
                  기본 행사 규격: 140명 (14열 × 10행 한 화면)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={studentCount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setStudentCount(val);
                    setErrorMsg(null);
                  }}
                  className="w-24 rounded-xl border border-cyan-400/40 bg-slate-900/80 px-3 py-2 text-center text-lg font-black text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <span className="font-bold text-slate-300">명</span>
              </div>
            </div>
          </div>

          {/* Prizes List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-extrabold text-white">
                상품 목록 및 당첨 인원
              </label>
              <button
                type="button"
                onClick={handleAddPrize}
                className="flex items-center gap-1 text-xs font-bold text-cyan-300 hover:text-cyan-150 rounded-lg px-2.5 py-1 bg-cyan-500/20 border border-cyan-400/30 hover:bg-cyan-500/30 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>상품 추가</span>
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {prizes.map((prize, idx) => (
                <div
                  key={prize.id || idx}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 p-2.5 hover:border-white/20 transition-colors"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-cyan-200">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={prize.name}
                    placeholder="상품 이름을 입력하세요"
                    onChange={(e) =>
                      handlePrizeChange(idx, 'name', e.target.value)
                    }
                    className="flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={prize.qty}
                      onChange={(e) =>
                        handlePrizeChange(idx, 'qty', e.target.value)
                      }
                      className="w-16 rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-center text-sm font-bold text-cyan-300 focus:outline-none focus:border-cyan-400"
                    />
                    <span className="text-xs text-slate-400">명</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePrize(idx)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                    title="상품 삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Sum Validation Banner */}
            <div
              className={`mt-3 flex items-center justify-between rounded-xl p-3 border text-xs font-bold ${
                diff === 0
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
                  : 'border-amber-500/40 bg-amber-500/15 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {diff === 0 ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                )}
                <span>
                  설정 인원 합계: <b className="text-sm underline">{totalPrizeQty}명</b> / 전체 {studentCount}명
                </span>
              </div>
              <div>
                {diff === 0 ? (
                  <span className="text-emerald-300 font-extrabold">인원수 일치 ✓</span>
                ) : diff > 0 ? (
                  <span className="text-amber-300 font-extrabold">{diff}명 부족 (추가 필요)</span>
                ) : (
                  <span className="text-rose-300 font-extrabold">{Math.abs(diff)}명 초과 (감소 필요)</span>
                )}
              </div>
            </div>
          </div>

          {/* Sound & Auxiliary Settings */}
          <div className="space-y-2.5 pt-2 border-t border-white/10 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-cute">겨울 테마 배경음악 (BGM)</span>
              <button
                type="button"
                onClick={onToggleBgm}
                aria-pressed={bgmEnabled}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-jua transition-all cursor-pointer ${
                  bgmEnabled
                    ? 'border-cyan-400/40 bg-cyan-500/20 text-cyan-200 shadow-sm'
                    : 'border-white/15 bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {bgmEnabled ? (
                  <>
                    <Music className="h-4 w-4 text-cyan-300" />
                    <span>배경음악 켜짐</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-4 w-4" />
                    <span>배경음악 꺼짐</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-cute">효과음 (축하 팡파르 및 눈꽃 소리)</span>
              <button
                type="button"
                onClick={onToggleSound}
                aria-pressed={soundEnabled}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-jua transition-all cursor-pointer ${
                  soundEnabled
                    ? 'border-cyan-400/40 bg-cyan-500/20 text-cyan-200 shadow-sm'
                    : 'border-white/15 bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="h-4 w-4 text-cyan-300" />
                    <span>소리 켜짐</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-4 w-4" />
                    <span>소리 꺼짐</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/20 p-2.5 text-xs text-rose-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-2 border-t border-white/10 bg-slate-950/40 px-6 py-4">
          <div>
            {hasOpenedCards && (
              <button
                type="button"
                onClick={handleResetProgress}
                className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-3.5 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
                title="상품 설정은 그대로 두고 뽑기만 처음 상태로 리셋"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>진행만 초기화</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-jua text-slate-200 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 px-5 py-2.5 text-xs font-jua text-white shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>새 뽑기판 적용</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
