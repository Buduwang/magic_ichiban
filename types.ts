export enum Theme {
  CHRISTMAS = 'christmas',
  CNY = 'cny' // Chinese New Year
}

export enum PrizeTier {
  S = 'S', // Grand Prize
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  LAST_ONE = 'LastOne'
}

export interface Prize {
  id: string;
  name: string;
  nameCN: string;
  tier: PrizeTier;
  totalQuantity: number;
  remainingQuantity: number;
  image: string; // Emoji or URL placeholder
}

export interface DrawResult {
  prize: Prize;
  message: string;
  timestamp: number;
}

export interface DrawRecord {
  id: string;
  prizeName: string;
  prizeNameCN: string;
  timestamp: number;
}

export const THEME_COLORS = {
  [Theme.CHRISTMAS]: {
    bg: 'bg-slate-900',
    cardBg: 'bg-slate-800',
    text: 'text-white',
    accent: 'bg-green-600',
    accentHover: 'hover:bg-green-700',
    border: 'border-red-600',
    gradient: 'from-green-900 to-red-900',
    button: 'bg-green-700 hover:bg-green-600'
  },
  [Theme.CNY]: {
    bg: 'bg-red-950',
    cardBg: 'bg-red-900',
    text: 'text-yellow-100',
    accent: 'bg-yellow-600',
    accentHover: 'hover:bg-yellow-700',
    border: 'border-yellow-500',
    gradient: 'from-red-700 to-orange-600',
    button: 'bg-yellow-600 hover:bg-yellow-500 text-red-900'
  }
};