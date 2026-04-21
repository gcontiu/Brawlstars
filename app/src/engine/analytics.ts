import posthog from 'posthog-js'

const enabled = () => !!import.meta.env.VITE_POSTHOG_KEY

export const analytics = {
  battleStarted(brawlerId: string, gameMode: string) {
    if (enabled()) posthog.capture('battle_started', { brawlerId, gameMode })
  },
  battleCompleted(brawlerId: string, gameMode: string, score: number, total: number) {
    if (enabled()) posthog.capture('battle_completed', { brawlerId, gameMode, score, total, accuracy: Math.round((score / total) * 100) })
  },
  battleAbandoned(brawlerId: string, wordsAnswered: number) {
    if (enabled()) posthog.capture('battle_abandoned', { brawlerId, wordsAnswered })
  },
  wordWrong(wordId: string, german: string, gameMode: string) {
    if (enabled()) posthog.capture('word_wrong', { wordId, german, gameMode })
  },
  screenView(screen: string) {
    if (enabled()) posthog.capture('$pageview', { screen })
  },
  upgradeClicked(brawlerId: string, fromLevel: number) {
    if (enabled()) posthog.capture('upgrade_clicked', { brawlerId, fromLevel })
  },
}
