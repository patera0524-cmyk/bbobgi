export interface PrizeConfig {
  id: string;
  name: string;
  qty: number;
  badgeColor?: string;
}

export interface RaffleCard {
  id: number; // 1-based index (1 to count)
  prize: string;
  opened: boolean;
  openedAt?: number;
}

export interface RaffleData {
  count: number;
  prizes: PrizeConfig[];
  cards: RaffleCard[];
  soundEnabled: boolean;
  bgmEnabled?: boolean;
  themeTitle?: string;
}

export const STORAGE_KEY = 'winter-raffle-elementary-v2';

export const DEFAULT_PRIZES: PrizeConfig[] = [
  { id: '1', name: '🎁 특별 대형 선물', qty: 10, badgeColor: '#f59e0b' },
  { id: '2', name: '🍫 달콤 간식 세트', qty: 30, badgeColor: '#ec4899' },
  { id: '3', name: '✏️ 캐릭터 문구 세트', qty: 40, badgeColor: '#3b82f6' },
  { id: '4', name: '❄️ 행운 겨울 선물', qty: 60, badgeColor: '#06b6d4' },
];

export const PRESETS: { label: string; count: number; prizes: PrizeConfig[] }[] = [
  {
    label: '기본 140인 세트 (14×10)',
    count: 140,
    prizes: [
      { id: '1', name: '🎁 1등: 대형 특별 선물', qty: 5, badgeColor: '#f59e0b' },
      { id: '2', name: '⭐ 2등: 보드게임 & 문구', qty: 15, badgeColor: '#8b5cf6' },
      { id: '3', name: '🍫 3등: 간식 파우치 세트', qty: 40, badgeColor: '#ec4899' },
      { id: '4', name: '❄️ 4등: 겨울 핫팩 & 스티커', qty: 80, badgeColor: '#06b6d4' },
    ],
  },
  {
    label: '원작 140인 세트',
    count: 140,
    prizes: [
      { id: '1', name: '특별 선물', qty: 10, badgeColor: '#f59e0b' },
      { id: '2', name: '간식 선물', qty: 30, badgeColor: '#ec4899' },
      { id: '3', name: '문구 선물', qty: 40, badgeColor: '#3b82f6' },
      { id: '4', name: '행운 선물', qty: 60, badgeColor: '#06b6d4' },
    ],
  },
  {
    label: '학급용 28인 세트',
    count: 28,
    prizes: [
      { id: '1', name: '🥇 1등 선물', qty: 3, badgeColor: '#f59e0b' },
      { id: '2', name: '🥈 2등 선물', qty: 5, badgeColor: '#3b82f6' },
      { id: '3', name: '🥉 3등 간식', qty: 10, badgeColor: '#ec4899' },
      { id: '4', name: '🎉 행운상', qty: 10, badgeColor: '#10b981' },
    ],
  },
];
