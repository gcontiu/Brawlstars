import { useState, useEffect, useCallback, useRef } from 'react';
import { useBattleStore } from '../../stores/useBattleStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useEconomyStore } from '../../stores/useEconomyStore';
import { useQuestStore } from '../../stores/useQuestStore';
import { useBrawlPassStore } from '../../stores/useBrawlPassStore';
import { useBrawlerStore } from '../../stores/useBrawlerStore';
import { vocabulary } from '../../data/vocabulary';
import { getBrawlerDef } from '../../data/brawlerDefs';
import { evaluateRound, XP_PER_BATTLE } from '../../engine/battleEngine';
import type { EvalResult } from '../../engine/battleEngine';
import { calculateTrophies, getUnlockedWordCount } from '../../engine/trophyCalculator';
import { rollStarDrop } from '../../engine/starDropEngine';
import type { StarDrop } from '../../engine/starDropEngine';
import { playTap, playWrong, playVictory, playDefeat, playCountdown, playCoinDrop, playCorrectJuice, playAlmostJuice } from '../../engine/audioEngine';
import { StarDropOverlay } from './StarDropOverlay';
import { analytics } from '../../engine/analytics';
import type { MatchType } from '../../types';
import type { GameMode } from '../lobby/GameModeSelect';

interface Props {
  onBack: () => void;
  gameMode: GameMode;
}

export function BattleScreen({ onBack, gameMode }: Props) {
  const battle = useBattleStore();
  const player = usePlayerStore();
  const economy = useEconomyStore();
  const brawlerStore = useBrawlerStore();

  const [timeLeft, setTimeLeft] = useState(20);
  const [answer, setAnswer] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<'der' | 'die' | 'das' | null>(null);
  const [showFeedback, setShowFeedback] = useState<{ result: EvalResult; correctAnswer: string } | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [rewardsApplied, setRewardsApplied] = useState(false);
  const [waitingForContinue, setWaitingForContinue] = useState(false);
  const [starDrop, setStarDrop] = useState<StarDrop | null>(null);
  const [combo, setCombo] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [comboKey, setComboKey] = useState(0);

  const inputRef = useRef<HTMLInputElement | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const currentWord = battle.words[battle.currentIndex];
  const currentMatchType = battle.matchTypes[battle.currentIndex];

  function pickMatchType(): MatchType {
    if (gameMode === 'DE_TO_RO') return 'DE_TO_RO';
    if (gameMode === 'RO_TO_DE') return 'RO_TO_DE';
    return Math.random() > 0.5 ? 'DE_TO_RO' : 'RO_TO_DE';
  }

  // Build battle pool filtered by active brawler
  useEffect(() => {
    const activeBrawlerId = brawlerStore.activeBrawlerId;
    const activeDef = getBrawlerDef(activeBrawlerId);
    const brawlerTrophies = brawlerStore.getProgress(activeBrawlerId).trophies;
    const unlocked = getUnlockedWordCount(brawlerTrophies);
    const filteredVocab = vocabulary.filter((w) => activeDef.categories.includes(w.category));
    const pool = filteredVocab.slice(0, Math.min(unlocked, filteredVocab.length));
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
    const matchTypes: MatchType[] = shuffled.map(() => pickMatchType());
    battle.startBattle(shuffled);
    useBattleStore.setState({ matchTypes });
    analytics.battleStarted(brawlerStore.activeBrawlerId, gameMode);
  }, []);

  // Countdown
  useEffect(() => {
    if (battle.phase !== 'countdown') return;
    if (countdown <= 0) { battle.setPhase('playing'); return; }
    playCountdown(countdown);
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [battle.phase, countdown]);

  // Timer
  useEffect(() => {
    if (battle.phase !== 'playing') return;
    setTimeLeft(20);
    setAnswer('');
    setSelectedArticle(null);
    setWaitingForContinue(false);
    setTimeout(() => inputRef.current?.focus(), 100);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { submitAnswer(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [battle.phase, battle.currentIndex]);

  // Apply rewards on results
  useEffect(() => {
    if (battle.phase !== 'results' || rewardsApplied) return;

    const results = battle.results;
    const correct = results.filter((r) => r.isCorrect && !r.isRevenge).length;
    const total = results.filter((r) => !r.isRevenge).length;
    const successRate = total > 0 ? (correct / total) * 100 : 0;
    const trophyDelta = calculateTrophies(successRate, player.winStreak);
    const isWin = successRate > 50;

    player.addXP(XP_PER_BATTLE);
    player.updateTrophies(trophyDelta);
    player.incrementBattles();
    brawlerStore.addTrophies(brawlerStore.activeBrawlerId, trophyDelta);

    const ppEarned = Math.floor(successRate / 20);
    let gemsEarned = 0;

    if (isWin) {
      player.incrementWinStreak();
      economy.addCoins(10 + Math.floor(successRate / 10));
      playCoinDrop();
      // Roll star drop on win
      setStarDrop(rollStarDrop());
    } else {
      player.resetWinStreak();
      playDefeat();
    }

    if (ppEarned > 0) economy.addPowerPoints(ppEarned);
    if (successRate >= 80) { gemsEarned += 1; }
    if (successRate === 100) { gemsEarned += 2; economy.addCredits(5); }
    if (gemsEarned > 0) economy.addGems(gemsEarned);

    if (isWin) setTimeout(playVictory, 200);

    useBrawlPassStore.getState().addXP(XP_PER_BATTLE);
    const quests = useQuestStore.getState();
    if (isWin) quests.updateProgress('win_battles', 1);
    quests.updateProgress('correct_words', correct);
    if (trophyDelta > 0) quests.updateProgress('trophies_single', trophyDelta);
    const revengeCorrect = results.filter((r) => r.isRevenge && r.isCorrect).length;
    if (revengeCorrect > 0) quests.updateProgress('revenge_rounds', revengeCorrect);
    quests.updateProgress('consecutive_battles', 1);

    analytics.battleCompleted(brawlerStore.activeBrawlerId, gameMode, correct, total);
    setRewardsApplied(true);
  }, [battle.phase, rewardsApplied]);

  function triggerJuice() {
    setIsShaking(true);
    setShowParticles(true);
    setShowFlash(true);
    setTimeout(() => setIsShaking(false), 300);
    setTimeout(() => setShowParticles(false), 520);
    setTimeout(() => setShowFlash(false), 420);
  }

  const advanceRound = useCallback(() => {
    setShowFeedback(null);
    setWaitingForContinue(false);
    const s = useBattleStore.getState();
    const hasNext = s.nextRound();
    if (!hasNext) {
      const revengeQueue = s.revengeQueue;
      if (revengeQueue.length > 0) {
        const revengeTypes: MatchType[] = revengeQueue.map(() => pickMatchType());
        const hasRevenge = s.startRevenge();
        if (hasRevenge) {
          useBattleStore.setState({ matchTypes: revengeTypes });
        } else {
          s.setPhase('results');
        }
      } else {
        s.setPhase('results');
      }
    }
  }, [gameMode]);

  const submitAnswer = useCallback((timeout?: boolean) => {
    clearInterval(timerRef.current);
    const store = useBattleStore.getState();
    const word = store.words[store.currentIndex];
    const matchType = store.matchTypes[store.currentIndex];
    if (!word) return;

    const evalResult = timeout
      ? 'wrong' as EvalResult
      : evaluateRound(word, matchType, answer, selectedArticle ?? undefined);

    const isCorrect = evalResult !== 'wrong';
    store.recordResult(isCorrect);

    const correctAnswer = matchType === 'DE_TO_RO'
      ? `${word.article} → ${word.romanian}`
      : `${word.article} ${word.german}`;

    setShowFeedback({ result: evalResult, correctAnswer });
    store.setPhase('feedback');

    if (evalResult === 'correct') {
      const newCombo = combo + 1;
      setCombo(newCombo);
      setComboKey((k) => k + 1);
      playCorrectJuice(newCombo - 1);
      triggerJuice();
      setTimeout(advanceRound, 1000);
    } else if (evalResult === 'almost') {
      setCombo(0);
      playAlmostJuice();
      setTimeout(advanceRound, 1800);
    } else {
      setCombo(0);
      playWrong();
      setWaitingForContinue(true);
      analytics.wordWrong(word.id, word.german, matchType);
    }
  }, [answer, selectedArticle, advanceRound]);

  // COUNTDOWN
  if (battle.phase === 'countdown') {
    return (
      <div className="h-full flex flex-col bg-gradient-to-b from-[#1a1a4e] to-[#0a0a1a]">
        <div className="flex items-center px-4 pt-4">
          <button
            onClick={() => { analytics.battleAbandoned(brawlerStore.activeBrawlerId, battle.currentIndex); battle.reset(); onBack(); }}
            className="flex items-center gap-1.5 text-gray-400 active:text-white transition-colors"
          >
            <span className="text-xl">‹</span>
            <span className="font-body text-sm">Ieși</span>
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="font-display text-7xl text-brawl-yellow animate-pulse">
              {countdown > 0 ? countdown : 'GO!'}
            </p>
            <p className="text-gray-400 mt-4 font-body">Pregătește-te!</p>
            <p className="text-xs text-gray-600 mt-2 font-body">
              {gameMode === 'DE_TO_RO' ? '🇩🇪 → 🇷🇴' : gameMode === 'RO_TO_DE' ? '🇷🇴 → 🇩🇪' : '🔀 Mix'}
            </p>
            {(() => {
              const def = getBrawlerDef(brawlerStore.activeBrawlerId);
              return (
                <p className="text-xs mt-2 font-body" style={{ color: def.glowColor }}>
                  {def.name} · {def.theme}
                </p>
              );
            })()}
          </div>
        </div>
      </div>
    );
  }

  // RESULTS
  if (battle.phase === 'results') {
    const results = battle.results;
    const correct = results.filter((r) => r.isCorrect && !r.isRevenge).length;
    const total = results.filter((r) => !r.isRevenge).length;
    const successRate = total > 0 ? (correct / total) * 100 : 0;
    const trophyDelta = calculateTrophies(successRate, player.winStreak);
    const isWin = successRate > 50;

    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#1a1a4e] to-[#0a0a1a] px-6 relative">
        {/* Star Drop overlay */}
        {starDrop && (
          <StarDropOverlay drop={starDrop} onClose={() => setStarDrop(null)} />
        )}

        <p className="font-display text-4xl mb-2 text-white animate-bounce-in">
          {isWin ? 'VICTORIE!' : 'DEFEAT'}
        </p>
        <p className={`font-display text-6xl ${isWin ? 'text-brawl-yellow' : 'text-brawl-red'}`}>
          {Math.round(successRate)}%
        </p>

        <div className="mt-8 w-full max-w-xs space-y-3">
          <ResultRow label="Corecte" value={`${correct} / ${total}`} />
          <ResultRow label="XP câștigat" value={`+${XP_PER_BATTLE}`} color="text-cyan-400" />
          <ResultRow
            label="Trofee"
            value={`${trophyDelta >= 0 ? '+' : ''}${trophyDelta}`}
            color={trophyDelta >= 0 ? 'text-brawl-yellow' : 'text-brawl-red'}
          />
          <ResultRow label="Win Streak" value={`${player.winStreak}`} color="text-orange-400" />
          {Math.floor(successRate / 20) > 0 && (
            <ResultRow label="Power Points" value={`+${Math.floor(successRate / 20)}`} color="text-orange-300" />
          )}
          {successRate >= 80 && (
            <ResultRow label="Gems" value={`+${successRate === 100 ? 3 : 1}`} color="text-purple-400" />
          )}
          {isWin && (
            <ResultRow label="Star Drop" value="⭐ Disponibil!" color="text-brawl-yellow" />
          )}
        </div>

        {results.filter((r) => !r.isCorrect && !r.isRevenge).length > 0 && (
          <div className="mt-6 w-full max-w-xs">
            <p className="text-sm text-gray-400 mb-2 font-body">De repetat:</p>
            {results
              .filter((r) => !r.isCorrect && !r.isRevenge)
              .map((r, i) => (
                <div key={i} className="text-sm text-red-300 mb-1 font-body">
                  {r.word.article} {r.word.german} = {r.word.romanian}
                </div>
              ))}
          </div>
        )}

        <button
          onClick={() => { playTap(); battle.reset(); onBack(); }}
          className="mt-8 px-8 py-3 rounded-2xl bg-gradient-to-b from-brawl-yellow to-brawl-orange
            font-display text-xl text-black active:scale-95 transition-transform
            border-2 border-yellow-300/80 shadow-lg shadow-brawl-orange/40"
        >
          LOBBY
        </button>
      </div>
    );
  }

  // PLAYING / FEEDBACK
  if (!currentWord) return null;

  const isTypeA = currentMatchType === 'DE_TO_RO';
  const progress = (battle.currentIndex / battle.words.length) * 100;
  const comboColor = combo >= 8 ? 'text-purple-400' : combo >= 5 ? 'text-brawl-red' : 'text-brawl-orange';

  return (
    <div
      className={`h-full flex flex-col bg-gradient-to-b from-[#1a1a4e] to-[#0a0a1a] relative overflow-hidden ${isShaking ? 'animate-screen-shake' : ''}`}
    >
      {/* Green flash overlay on correct */}
      {showFlash && (
        <div className="absolute inset-0 z-20 pointer-events-none bg-green-400 animate-correct-flash" />
      )}

      {/* Progress bar */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-3">
        <div className="flex-1 h-2 bg-brawl-card rounded-full overflow-hidden">
          <div
            className="h-full bg-brawl-green rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm text-gray-400 font-body">{battle.currentIndex + 1}/{battle.words.length}</span>
      </div>

      {/* Timer */}
      <div className="flex justify-center my-4">
        <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-display text-2xl
          ${timeLeft <= 5 ? 'border-brawl-red text-brawl-red animate-pulse' : 'border-brawl-yellow text-brawl-yellow'}`}>
          {timeLeft}
        </div>
      </div>

      {/* Match type indicator */}
      <div className="text-center mb-2">
        <span className="text-xs bg-brawl-card px-3 py-1 rounded-full text-gray-400 border border-brawl-border font-body">
          {isTypeA ? '🇩🇪 → 🇷🇴' : '🇷🇴 → 🇩🇪'}
          {battle.isRevengePart && ' (REVENGE)'}
        </span>
      </div>

      {/* Word display */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative">

        {/* Combo counter */}
        {combo >= 3 && (
          <div
            key={comboKey}
            className={`absolute top-0 font-display text-2xl tracking-wider animate-combo-pop ${comboColor}`}
            style={{ textShadow: combo >= 5 ? '0 0 16px currentColor' : 'none' }}
          >
            {combo >= 8 ? '🔥' : combo >= 5 ? '⚡' : '✨'} COMBO ×{combo}
          </div>
        )}

        {/* Particle burst origin */}
        <div className="relative">
          {showParticles && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              {(['n','ne','e','se','s','sw','w','nw'] as const).map((dir, i) => (
                <div
                  key={dir}
                  className={`particle particle-${dir}`}
                  style={{
                    background: i % 3 === 0 ? '#F7D020' : i % 3 === 1 ? '#4CAF50' : '#00ffcc',
                    width: combo >= 5 ? '14px' : '10px',
                    height: combo >= 5 ? '14px' : '10px',
                  }}
                />
              ))}
            </div>
          )}
          <p className="font-display text-3xl text-white text-center mb-8 relative z-0">
            {isTypeA ? currentWord.german : currentWord.romanian}
          </p>
        </div>

        {/* Article buttons (Type A) */}
        {isTypeA && (
          <div className="flex gap-3 mb-6">
            {(['der', 'die', 'das'] as const).map((art) => (
              <button
                key={art}
                onClick={() => { playTap(); setSelectedArticle(art); }}
                disabled={!!showFeedback}
                className={`px-6 py-3 rounded-xl font-display text-lg transition-all
                  ${selectedArticle === art
                    ? art === 'der' ? 'bg-blue-500 text-white scale-105'
                    : art === 'die' ? 'bg-red-500 text-white scale-105'
                    : 'bg-green-500 text-white scale-105'
                    : 'bg-brawl-card text-gray-300 border border-brawl-border'
                  }`}
              >
                {art}
              </button>
            ))}
          </div>
        )}

        {/* Answer input */}
        <div className="w-full max-w-xs">
          <input
            ref={(el) => { inputRef.current = el ?? undefined; }}
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !showFeedback && (!isTypeA || selectedArticle) && submitAnswer()}
            disabled={!!showFeedback}
            placeholder={isTypeA ? 'Traducere în română...' : 'Scrie în germană cu articol...'}
            className="w-full px-4 py-3 rounded-xl bg-brawl-card border border-brawl-border text-white
              text-center text-lg placeholder-gray-500 outline-none focus:border-brawl-yellow font-body"
            autoComplete="off"
            autoCapitalize="off"
          />
        </div>

        {/* Submit */}
        {!showFeedback && (
          <button
            onClick={() => submitAnswer()}
            disabled={!answer.trim() || (isTypeA && !selectedArticle)}
            className="mt-4 px-8 py-3 rounded-full bg-gradient-to-b from-brawl-green to-green-700
              font-display text-lg text-white active:scale-95 transition-transform
              disabled:opacity-40 disabled:active:scale-100"
          >
            SUBMIT
          </button>
        )}

        {/* Feedback */}
        {showFeedback && (
          <div className={`mt-4 px-6 py-4 rounded-xl text-center w-full max-w-xs animate-bounce-in ${
            showFeedback.result === 'correct'
              ? 'bg-green-500/20 border border-green-500/50'
              : showFeedback.result === 'almost'
              ? 'bg-yellow-500/20 border border-yellow-500/50'
              : 'bg-red-500/20 border border-red-500/50'
          }`}>
            <p className={`font-display text-2xl ${
              showFeedback.result === 'correct' ? 'text-green-400'
              : showFeedback.result === 'almost' ? 'text-yellow-400'
              : 'text-red-400'
            }`}>
              {showFeedback.result === 'correct' ? 'CORECT!'
               : showFeedback.result === 'almost' ? '🟡 APROAPE!'
               : 'GREȘIT!'}
            </p>
            {showFeedback.result !== 'correct' && (
              <p className="text-gray-300 mt-2 text-sm font-body">
                {showFeedback.result === 'almost' ? 'Corect era: ' : 'Răspuns corect: '}
                <span className="text-white font-bold">{showFeedback.correctAnswer}</span>
              </p>
            )}
            {waitingForContinue && showFeedback.result === 'wrong' && (
              <button
                onClick={() => { playTap(); advanceRound(); }}
                className="mt-4 w-full px-6 py-2.5 rounded-xl bg-gradient-to-r from-brawl-orange to-brawl-red
                  font-display text-lg text-white active:scale-95 transition-transform
                  border border-orange-400/50 shadow-md"
              >
                CONTINUĂ →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultRow({ label, value, color = 'text-white' }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between items-center bg-brawl-card/60 rounded-lg px-4 py-2 border border-brawl-border/50">
      <span className="text-gray-400 text-sm font-body">{label}</span>
      <span className={`font-display text-lg ${color}`}>{value}</span>
    </div>
  );
}
