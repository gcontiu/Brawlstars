import { useState, useEffect, useCallback, useRef } from 'react';
import { vocabulary } from '../../data/vocabulary';
import { evaluateRound } from '../../engine/battleEngine';
import { useBrawlPassStore } from '../../stores/useBrawlPassStore';
import { getUnlockedWordCount } from '../../engine/trophyCalculator';
import { usePlayerStore } from '../../stores/usePlayerStore';

interface Props {
  tier: 'plus' | 'premium';
  onBack: () => void;
  onSuccess: () => void;
}

const TIER_CONFIG = {
  plus: { wordCount: 20, requiredAccuracy: 95, label: 'PASS PLUS', color: 'text-blue-400' },
  premium: { wordCount: 25, requiredAccuracy: 100, label: 'PREMIUM PASS', color: 'text-purple-400' },
};

export function UnlockTestScreen({ tier, onBack, onSuccess }: Props) {
  const config = TIER_CONFIG[tier];
  const trophies = usePlayerStore((s) => s.trophies);

  const [phase, setPhase] = useState<'intro' | 'playing' | 'result'>('intro');
  const [words, setWords] = useState(vocabulary.slice(0, 1));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answer, setAnswer] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<'der' | 'die' | 'das' | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; correctAnswer: string } | null>(null);
  const [waitingContinue, setWaitingContinue] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const inputRef = useRef<HTMLInputElement | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    const unlocked = getUnlockedWordCount(trophies);
    const pool = vocabulary.slice(0, unlocked);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, config.wordCount);
    setWords(shuffled);
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return;
    setTimeLeft(20);
    setAnswer('');
    setSelectedArticle(null);
    setFeedback(null);
    setWaitingContinue(false);
    setTimeout(() => inputRef.current?.focus(), 100);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase, currentIndex]);

  const advance = useCallback(() => {
    setFeedback(null);
    setWaitingContinue(false);
    if (currentIndex + 1 < words.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setPhase('result');
    }
  }, [currentIndex, words.length]);

  const handleSubmit = useCallback((timeout = false) => {
    clearInterval(timerRef.current);
    const word = words[currentIndex];
    if (!word) return;

    const isCorrect = timeout
      ? false
      : evaluateRound(word, 'DE_TO_RO', answer, selectedArticle ?? undefined);

    if (isCorrect) setCorrectCount((c) => c + 1);

    const correctAnswer = `${word.article} → ${word.romanian}`;
    setFeedback({ correct: isCorrect, correctAnswer });

    if (isCorrect) {
      setTimeout(advance, 1000);
    } else {
      setWaitingContinue(true);
    }
  }, [words, currentIndex, answer, selectedArticle, advance]);

  // INTRO
  if (phase === 'intro') {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#12123a] to-[#080818] px-6">
        <p className={`font-display text-3xl ${config.color}`}>{config.label}</p>
        <p className="font-display text-xl text-white mt-2">Test de Deblocare</p>

        <div className="mt-8 bg-brawl-card/60 rounded-xl border border-brawl-border p-5 w-full max-w-xs">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Cuvinte</span>
            <span className="text-white font-bold">{config.wordCount}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Acuratețe necesară</span>
            <span className="text-brawl-yellow font-bold">{config.requiredAccuracy}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Tip</span>
            <span className="text-white">DE → RO (articol + traducere)</span>
          </div>
        </div>

        <button
          onClick={() => setPhase('playing')}
          className="mt-8 px-10 py-3 rounded-2xl bg-gradient-to-b from-brawl-yellow to-brawl-orange
            font-display text-xl text-black active:scale-95 transition-transform"
        >
          START TEST
        </button>

        <button
          onClick={onBack}
          className="mt-4 text-gray-500 text-sm"
        >
          Înapoi
        </button>
      </div>
    );
  }

  // RESULT
  if (phase === 'result') {
    const accuracy = Math.round((correctCount / words.length) * 100);
    const passed = accuracy >= config.requiredAccuracy;

    if (passed) {
      useBrawlPassStore.getState().unlockTier(tier);
    }

    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#12123a] to-[#080818] px-6">
        <p className={`font-display text-4xl ${passed ? 'text-brawl-green' : 'text-brawl-red'}`}>
          {passed ? 'TRECUT!' : 'EȘUAT'}
        </p>
        <p className="font-display text-6xl text-white mt-2">{accuracy}%</p>
        <p className="text-gray-400 mt-2 text-sm">
          {correctCount}/{words.length} corecte — necesar {config.requiredAccuracy}%
        </p>

        {passed && (
          <div className="mt-6 bg-brawl-yellow/10 border border-brawl-yellow/40 rounded-xl px-5 py-3 text-center">
            <p className={`font-display text-lg ${config.color}`}>{config.label}</p>
            <p className="text-sm text-brawl-yellow">Deblocat!</p>
          </div>
        )}

        <button
          onClick={passed ? onSuccess : onBack}
          className="mt-8 px-8 py-3 rounded-full bg-gradient-to-b from-brawl-yellow to-brawl-orange
            font-display text-xl text-black active:scale-95 transition-transform"
        >
          {passed ? 'CONTINUĂ' : 'ÎNAPOI'}
        </button>
      </div>
    );
  }

  // PLAYING
  const word = words[currentIndex];
  if (!word) return null;
  const progress = (currentIndex / words.length) * 100;

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#12123a] to-[#080818]">
      {/* Progress bar */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-3">
        <div className="flex-1 h-2 bg-brawl-card rounded-full overflow-hidden">
          <div
            className="h-full bg-brawl-green rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm text-gray-400">{currentIndex + 1}/{words.length}</span>
      </div>

      {/* Timer */}
      <div className="flex justify-center my-3">
        <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-display text-xl
          ${timeLeft <= 5 ? 'border-brawl-red text-brawl-red animate-pulse' : 'border-brawl-yellow text-brawl-yellow'}`}
        >
          {timeLeft}
        </div>
      </div>

      {/* Test badge */}
      <div className="text-center mb-2">
        <span className={`text-xs px-3 py-1 rounded-full border ${
          tier === 'plus' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
        }`}>
          {config.label} TEST — 🇩🇪 → 🇷🇴
        </span>
      </div>

      {/* Word + input */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <p className="font-display text-3xl text-white text-center mb-8">{word.german}</p>

        <div className="flex gap-3 mb-6">
          {(['der', 'die', 'das'] as const).map((art) => (
            <button
              key={art}
              onClick={() => setSelectedArticle(art)}
              disabled={!!feedback}
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

        <div className="w-full max-w-xs">
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !feedback && handleSubmit()}
            disabled={!!feedback}
            placeholder="Traducere în română..."
            className="w-full px-4 py-3 rounded-xl bg-brawl-card border border-brawl-border text-white
              text-center text-lg placeholder-gray-500 outline-none focus:border-brawl-yellow"
            autoComplete="off"
            autoCapitalize="off"
          />
        </div>

        {!feedback && (
          <button
            onClick={() => handleSubmit()}
            disabled={!answer.trim() || !selectedArticle}
            className="mt-4 px-8 py-3 rounded-full bg-gradient-to-b from-brawl-green to-green-700
              font-display text-lg text-white active:scale-95 transition-transform
              disabled:opacity-40 disabled:active:scale-100"
          >
            SUBMIT
          </button>
        )}

        {feedback && (
          <div className={`mt-4 px-6 py-4 rounded-xl text-center ${
            feedback.correct ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'
          }`}>
            <p className={`font-display text-2xl ${feedback.correct ? 'text-green-400' : 'text-red-400'}`}>
              {feedback.correct ? 'CORECT!' : 'GREȘIT!'}
            </p>
            {!feedback.correct && (
              <>
                <p className="text-gray-300 mt-2 text-sm">
                  Răspuns corect: <span className="text-white font-bold">{feedback.correctAnswer}</span>
                </p>
                {waitingContinue && (
                  <button
                    onClick={advance}
                    className="mt-3 px-6 py-2 rounded-full bg-brawl-card border border-brawl-border
                      text-white font-display active:scale-95 transition-transform"
                  >
                    CONTINUĂ →
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
