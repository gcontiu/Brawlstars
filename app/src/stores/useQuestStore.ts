import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Quest {
  id: string;
  templateId: string;
  description: string;
  target: number;
  progress: number;
  rewardXP: number;
  completed: boolean;
}

interface QuestTemplate {
  id: string;
  type: string;
  descriptionTemplate: string;
  targets: number[];
}

const QUEST_TEMPLATES: QuestTemplate[] = [
  {
    id: 'win_battles',
    type: 'win_battles',
    descriptionTemplate: 'Câștigă {n} battle-uri',
    targets: [3, 5],
  },
  {
    id: 'correct_words',
    type: 'correct_words',
    descriptionTemplate: 'Răspunde corect la {n} cuvinte',
    targets: [15, 25],
  },
  {
    id: 'trophies_single',
    type: 'trophies_single',
    descriptionTemplate: 'Obține {n} trofee într-un singur battle',
    targets: [5, 8],
  },
  {
    id: 'revenge_rounds',
    type: 'revenge_rounds',
    descriptionTemplate: 'Completează {n} revenge rounds',
    targets: [3, 5],
  },
  {
    id: 'consecutive_battles',
    type: 'consecutive_battles',
    descriptionTemplate: 'Joacă {n} battle-uri consecutive',
    targets: [2, 4],
  },
];

function buildAllQuests(): Quest[] {
  const all: Quest[] = [];
  for (const template of QUEST_TEMPLATES) {
    for (const target of template.targets) {
      const id = `${template.id}_${target}`;
      all.push({
        id,
        templateId: template.id,
        description: template.descriptionTemplate.replace('{n}', String(target)),
        target,
        progress: 0,
        rewardXP: 500,
        completed: false,
      });
    }
  }
  return all;
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

interface QuestStore {
  activeQuests: Quest[];
  completedQuestIds: string[];
  generateQuests: () => void;
  updateProgress: (type: string, amount: number) => void;
  claimQuest: (id: string) => boolean;
  hasCompletedQuests: () => boolean;
}

export const useQuestStore = create<QuestStore>()(
  persist(
    (set, get) => ({
      activeQuests: [],
      completedQuestIds: [],

      generateQuests: () => {
        const { completedQuestIds } = get();
        const allQuests = buildAllQuests();
        const available = allQuests.filter((q) => !completedQuestIds.includes(q.id));
        const selected = pickRandom(available.length >= 3 ? available : allQuests, 3);
        const fresh = selected.map((q) => ({ ...q, progress: 0, completed: false }));
        set({ activeQuests: fresh });
      },

      updateProgress: (type: string, amount: number) => {
        set((state) => ({
          activeQuests: state.activeQuests.map((q) => {
            if (q.completed) return q;
            if (q.templateId !== type) return q;
            const newProgress = Math.min(q.progress + amount, q.target);
            return {
              ...q,
              progress: newProgress,
              completed: newProgress >= q.target,
            };
          }),
        }));
      },

      claimQuest: (id: string) => {
        const { activeQuests, completedQuestIds } = get();
        const quest = activeQuests.find((q) => q.id === id);
        if (!quest || !quest.completed) return false;

        set({
          activeQuests: activeQuests.filter((q) => q.id !== id),
          completedQuestIds: [...completedQuestIds, id],
        });
        return true;
      },

      hasCompletedQuests: () => {
        return get().activeQuests.some((q) => q.completed);
      },
    }),
    {
      name: 'german-brawl-quests',
      onRehydrateStorage: () => (state) => {
        if (state && state.activeQuests.length === 0) {
          state.generateQuests();
        }
      },
    }
  )
);
