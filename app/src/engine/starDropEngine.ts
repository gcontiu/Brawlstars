export type StarDropRarity = 'Rare' | 'Super Rare' | 'Epic' | 'Mythic' | 'Legendary' | 'Giga';

export interface StarDrop {
  rarity: StarDropRarity;
  coins: number;
  powerPoints: number;
  gems: number;
  bling: number;
  credits: number;
  label: string;
}

const RARITY_CONFIG: Record<StarDropRarity, { weight: number; color: string; glow: string }> = {
  Rare:        { weight: 39, color: '#4a90d9', glow: 'rgba(74,144,217,0.6)' },
  'Super Rare': { weight: 30, color: '#7c3aed', glow: 'rgba(124,58,237,0.6)' },
  Epic:        { weight: 15, color: '#e040fb', glow: 'rgba(224,64,251,0.6)' },
  Mythic:      { weight: 10, color: '#ff6b35', glow: 'rgba(255,107,53,0.7)' },
  Legendary:   { weight: 5,  color: '#ffd700', glow: 'rgba(255,215,0,0.8)' },
  Giga:        { weight: 1,  color: '#00ffcc', glow: 'rgba(0,255,204,0.9)' },
};

export function getRarityConfig(rarity: StarDropRarity) {
  return RARITY_CONFIG[rarity];
}

function pickRarity(): StarDropRarity {
  const total = Object.values(RARITY_CONFIG).reduce((s, r) => s + r.weight, 0);
  let roll = Math.random() * total;
  for (const [rarity, cfg] of Object.entries(RARITY_CONFIG)) {
    roll -= cfg.weight;
    if (roll <= 0) return rarity as StarDropRarity;
  }
  return 'Rare';
}

export function rollStarDrop(): StarDrop {
  const rarity = pickRarity();
  switch (rarity) {
    case 'Rare':
      return { rarity, coins: 20 + Math.floor(Math.random() * 31), powerPoints: 0, gems: 0, bling: 0, credits: 0, label: 'Coins' };
    case 'Super Rare':
      return { rarity, coins: 0, powerPoints: 5 + Math.floor(Math.random() * 6), gems: 0, bling: 0, credits: 0, label: 'Power Points' };
    case 'Epic':
      return { rarity, coins: 0, powerPoints: 0, gems: 5, bling: 0, credits: 0, label: '5 Gems' };
    case 'Mythic':
      return { rarity, coins: 50, powerPoints: 20, gems: 2, bling: 50, credits: 0, label: 'Pachet Mythic' };
    case 'Legendary':
      return { rarity, coins: 100, powerPoints: 50, gems: 10, bling: 200, credits: 0, label: 'Pachet Legendary!' };
    case 'Giga':
      return { rarity, coins: 5000, powerPoints: 3000, gems: 25, bling: 1000, credits: 500, label: '💎 GIGA DROP!' };
  }
}
