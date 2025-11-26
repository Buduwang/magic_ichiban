import { Prize, PrizeTier } from './types';

export const INITIAL_PRIZES: Prize[] = [
  {
    id: '1',
    name: 'Giant Teddy Bear',
    nameCN: '巨型泰迪熊',
    tier: PrizeTier.S,
    totalQuantity: 1,
    remainingQuantity: 1,
    image: '🧸'
  },
  {
    id: '2',
    name: 'RC Car',
    nameCN: '遥控汽车',
    tier: PrizeTier.A,
    totalQuantity: 3,
    remainingQuantity: 3,
    image: '🏎️'
  },
  {
    id: '3',
    name: 'Lego Set',
    nameCN: '乐高套装',
    tier: PrizeTier.A,
    totalQuantity: 3,
    remainingQuantity: 3,
    image: '🧱'
  },
  {
    id: '4',
    name: 'Stationery Set',
    nameCN: '精美文具盒',
    tier: PrizeTier.B,
    totalQuantity: 10,
    remainingQuantity: 10,
    image: '✏️'
  },
  {
    id: '5',
    name: 'Snack Pack',
    nameCN: '零食大礼包',
    tier: PrizeTier.B,
    totalQuantity: 15,
    remainingQuantity: 15,
    image: '🍪'
  },
  {
    id: '6',
    name: 'Stickers',
    nameCN: '卡通贴纸',
    tier: PrizeTier.C,
    totalQuantity: 30,
    remainingQuantity: 30,
    image: '🌟'
  },
  {
    id: '7',
    name: 'Eraser',
    nameCN: '橡皮擦',
    tier: PrizeTier.D,
    totalQuantity: 50,
    remainingQuantity: 50,
    image: '🧼'
  }
];

export const CONFETTI_COLORS_CHRISTMAS = ['#ff0000', '#00ff00', '#ffffff', '#gold'];
export const CONFETTI_COLORS_CNY = ['#ff0000', '#ffd700', '#ff4d4d', '#ffff00'];
