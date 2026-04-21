import type { BrawlerDef } from '../types';

export const BRAWLER_DEFS: BrawlerDef[] = [
  {
    id: 'shelly',
    name: 'Shelly',
    emoji: '🎯',
    theme: 'Familie & Beruf',
    categories: ['Lektion 1.1'],
    colorClass: 'text-yellow-400',
    glowColor: 'rgba(247,208,32,0.5)',
    unlockTrophies: 0,
    image: '/shelly.webp',
  },
  {
    id: 'colt',
    name: 'Colt',
    emoji: '🔫',
    theme: 'Casă & Obiecte',
    categories: ['Lektion 1.2'],
    colorClass: 'text-blue-400',
    glowColor: 'rgba(96,165,250,0.5)',
    unlockTrophies: 100,
  },
  {
    id: 'nita',
    name: 'Nita',
    emoji: '🐻',
    theme: 'Oraș & Timp Liber',
    categories: ['Lektion 1.3'],
    colorClass: 'text-orange-400',
    glowColor: 'rgba(251,146,60,0.5)',
    unlockTrophies: 250,
  },
  {
    id: 'bull',
    name: 'Bull',
    emoji: '🐂',
    theme: 'Călătorii & Timp',
    categories: ['Lektion 2.1'],
    colorClass: 'text-red-400',
    glowColor: 'rgba(248,113,113,0.5)',
    unlockTrophies: 500,
  },
  {
    id: 'poco',
    name: 'Poco',
    emoji: '🎸',
    theme: 'Îmbrăcăminte & Shopping',
    categories: ['Lektion 2.2'],
    colorClass: 'text-purple-400',
    glowColor: 'rgba(196,181,253,0.5)',
    unlockTrophies: 750,
  },
  {
    id: 'rosa',
    name: 'Rosa',
    emoji: '🌹',
    theme: 'Natură & Animale',
    categories: ['Lektion 2.3'],
    colorClass: 'text-green-400',
    glowColor: 'rgba(74,222,128,0.5)',
    unlockTrophies: 1000,
  },
];

export function getBrawlerDef(id: string): BrawlerDef {
  return BRAWLER_DEFS.find((b) => b.id === id) ?? BRAWLER_DEFS[0];
}
