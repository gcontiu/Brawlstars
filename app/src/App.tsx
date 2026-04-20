import { useState } from 'react';
import { LobbyScreen } from './components/lobby/LobbyScreen';
import { GameModeSelect } from './components/lobby/GameModeSelect';
import type { GameMode } from './components/lobby/GameModeSelect';
import { BattleScreen } from './components/battle/BattleScreen';
import { WordListScreen } from './components/lobby/WordListScreen';
import { ShopScreen } from './components/shop/ShopScreen';
import { BrawlersScreen } from './components/brawlers/BrawlersScreen';
import { TrophyRoadScreen } from './components/lobby/TrophyRoadScreen';
import { QuestPanel } from './components/lobby/QuestPanel';
import { BrawlPassScreen } from './components/lobby/BrawlPassScreen';
import { UnlockTestScreen } from './components/battle/UnlockTestScreen';

type Screen = 'lobby' | 'mode-select' | 'battle' | 'words' | 'shop' | 'brawlers' | 'trophy-road' | 'brawl-pass' | 'unlock-test';

function App() {
  const [screen, setScreen] = useState<Screen>('lobby');
  const [gameMode, setGameMode] = useState<GameMode>('mix');
  const [showQuestPanel, setShowQuestPanel] = useState(false);
  const [unlockTier, setUnlockTier] = useState<'plus' | 'premium'>('plus');

  return (
    <div className="mx-auto max-w-[430px] h-[100dvh] bg-brawl-bg relative overflow-hidden">
      {screen === 'lobby' && (
        <LobbyScreen
          onPlay={() => setScreen('mode-select')}
          onWords={() => setScreen('words')}
          onShop={() => setScreen('shop')}
          onBrawlers={() => setScreen('brawlers')}
          onTrophyRoad={() => setScreen('trophy-road')}
          onQuest={() => setShowQuestPanel(true)}
          onBrawlPass={() => setScreen('brawl-pass')}
        />
      )}
      {screen === 'lobby' && showQuestPanel && (
        <QuestPanel onClose={() => setShowQuestPanel(false)} />
      )}
      {screen === 'mode-select' && (
        <GameModeSelect
          onStart={(mode) => {
            setGameMode(mode);
            setScreen('battle');
          }}
          onBack={() => setScreen('lobby')}
        />
      )}
      {screen === 'battle' && (
        <BattleScreen
          gameMode={gameMode}
          onBack={() => setScreen('lobby')}
        />
      )}
      {screen === 'words' && (
        <WordListScreen onBack={() => setScreen('lobby')} />
      )}
      {screen === 'shop' && (
        <ShopScreen onBack={() => setScreen('lobby')} />
      )}
      {screen === 'brawlers' && (
        <BrawlersScreen onBack={() => setScreen('lobby')} />
      )}
      {screen === 'trophy-road' && (
        <TrophyRoadScreen onBack={() => setScreen('lobby')} />
      )}
      {screen === 'brawl-pass' && (
        <BrawlPassScreen
          onBack={() => setScreen('lobby')}
          onUnlockTest={(tier) => {
            setUnlockTier(tier);
            setScreen('unlock-test');
          }}
        />
      )}
      {screen === 'unlock-test' && (
        <UnlockTestScreen
          tier={unlockTier}
          onBack={() => setScreen('brawl-pass')}
          onSuccess={() => setScreen('brawl-pass')}
        />
      )}
    </div>
  );
}

export default App;
