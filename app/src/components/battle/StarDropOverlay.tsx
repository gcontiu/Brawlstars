import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StarDrop } from '../../engine/starDropEngine';
import { getRarityConfig } from '../../engine/starDropEngine';
import { playStarDrop, playCoinDrop } from '../../engine/audioEngine';
import { useEconomyStore } from '../../stores/useEconomyStore';

interface Props {
  drop: StarDrop;
  onClose: () => void;
}

type Phase = 'shake' | 'crack' | 'reveal';

export function StarDropOverlay({ drop, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>('shake');
  const cfg = getRarityConfig(drop.rarity);
  const economy = useEconomyStore();

  useEffect(() => {
    playStarDrop();
    const t1 = setTimeout(() => setPhase('crack'), 700);
    const t2 = setTimeout(() => {
      setPhase('reveal');
      playCoinDrop();
      // Apply rewards
      if (drop.coins > 0) economy.addCoins(drop.coins);
      if (drop.powerPoints > 0) economy.addPowerPoints(drop.powerPoints);
      if (drop.gems > 0) economy.addGems(drop.gems);
      if (drop.bling > 0) economy.addBling(drop.bling);
      if (drop.credits > 0) economy.addCredits(drop.credits);
    }, 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={phase === 'reveal' ? onClose : undefined}
      >
        <p className="font-display text-lg text-gray-300 mb-6 tracking-widest uppercase">Star Drop</p>

        {/* Box */}
        <motion.div
          className="relative w-36 h-36 flex items-center justify-center"
          animate={
            phase === 'shake'
              ? { rotate: [0, -8, 8, -6, 6, 0], scale: [1, 1.05, 1.08, 1.05, 1.03, 1] }
              : phase === 'crack'
              ? { scale: [1, 1.2, 0.9, 1.3], rotate: [0, 0, 5, 0] }
              : { scale: 1 }
          }
          transition={{ duration: phase === 'shake' ? 0.7 : 0.5 }}
        >
          {phase !== 'reveal' ? (
            <div
              className="w-28 h-28 rounded-2xl flex items-center justify-center text-5xl border-4 shadow-2xl"
              style={{
                borderColor: cfg.color,
                boxShadow: `0 0 40px ${cfg.glow}`,
                background: `radial-gradient(circle, ${cfg.color}33 0%, #0f0f23 80%)`,
              }}
            >
              {phase === 'shake' ? '⭐' : '💥'}
            </div>
          ) : (
            <motion.div
              className="w-28 h-28 rounded-2xl flex items-center justify-center text-5xl border-4 shadow-2xl"
              style={{
                borderColor: cfg.color,
                boxShadow: `0 0 60px ${cfg.glow}`,
                background: `radial-gradient(circle, ${cfg.color}55 0%, #0f0f23 80%)`,
              }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              ⭐
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence>
          {phase === 'reveal' && (
            <motion.div
              className="mt-8 flex flex-col items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p
                className="font-display text-3xl tracking-wide"
                style={{ color: cfg.color, textShadow: `0 0 20px ${cfg.glow}` }}
              >
                {drop.rarity}
              </p>
              <p className="font-body text-white text-lg">{drop.label}</p>
              <div className="flex flex-wrap gap-3 mt-1 text-sm font-body text-gray-300 justify-center">
                {drop.coins > 0 && <span>🪙 +{drop.coins}</span>}
                {drop.powerPoints > 0 && <span>⚡ +{drop.powerPoints}</span>}
                {drop.gems > 0 && <span>💎 +{drop.gems}</span>}
                {drop.bling > 0 && <span>✨ +{drop.bling}</span>}
                {drop.credits > 0 && <span>🎫 +{drop.credits}</span>}
              </div>
              <p className="text-gray-500 text-xs mt-4 font-body">Apasă oriunde pentru a continua</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
