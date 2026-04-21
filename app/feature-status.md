
  ┌──────────────────────────────────────────────────────────┬────────┐
  │                         Feature                          │ Status │
  ├──────────────────────────────────────────────────────────┼────────┤
  │ Lobby Brawl Stars style                                  │ ✅     │
  ├──────────────────────────────────────────────────────────┼────────┤
  │ Battle cu timer, Der/Die/Das, feedback                   │ ✅     │
  ├──────────────────────────────────────────────────────────┼────────┤
  │ Game mode selection (DE→RO, RO→DE, Mix)                  │ ✅     │
  ├──────────────────────────────────────────────────────────┼────────┤
  │ Diacritice ignorate                                      │ ✅     │
  ├──────────────────────────────────────────────────────────┼────────┤
  │ Manual advance la greșeală                               │ ✅     │
  ├──────────────────────────────────────────────────────────┼────────┤
  │ Fără exit în battle                                      │ ✅     │
  ├──────────────────────────────────────────────────────────┼────────┤
  │ 293 cuvinte din Fit in Deutsch 1                         │ ✅     │
  ├──────────────────────────────────────────────────────────┼────────┤
  │ Deblocare cuvinte per brawler (25 start + 15/250 trofee) │ ✅     │
  ├──────────────────────────────────────────────────────────┼────────┤
  │ Trophy Road: 50🏆 ciclu coins/PP/gems/bling,             │ ✅     │
  │             500🏆 Legendary Star Drop                    │        │
  ├──────────────────────────────────────────────────────────┼────────┤
  │ Shop cu Gems                                             │ ✅     │
  ├──────────────────────────────────────────────────────────┼────────┤
  │ Brawler upgrade per-brawler (PP + Coins)                 │ ✅     │
  ├──────────────────────────────────────────────────────────┼────────┤
  │ Cuvinte vizibile în ecranul Brawlers (per brawler)       │ ✅     │
  ├──────────────────────────────────────────────────────────┼────────┤
  │ Quest system (3 active, claim, drop bonus)               │ ✅     │
  ├──────────────────────────────────────────────────────────┼────────┤
  │ Brawl Pass (30 nivele, rewards, claim)                   │ ✅     │
  ├──────────────────────────────────────────────────────────┼────────┤
  │ Unlock tests Plus/Premium                                │ ✅     │
  ├──────────────────────────────────────────────────────────┼────────┤
  │ 6 Brawleri cu categorii vocabular distincte              │ ✅     │
  ├──────────────────────────────────────────────────────────┼────────┤
  │ Star Drops post-battle (5 rarități, animație)            │ ✅     │
  ├──────────────────────────────────────────────────────────┼────────┤
  │ Audio & Haptics (Web Audio API, mute toggle)             │ ✅     │
  ├──────────────────────────────────────────────────────────┼────────┤
  │ Animații (idle, bounce-in, play breathe, transitions)    │ ✅     │
  ├──────────────────────────────────────────────────────────┼────────┤
  │ PWA (offline, installable)                               │ ✅     │
  └──────────────────────────────────────────────────────────┴────────┘


Notes:

2026.04.20 — v3.3
Secțiunea 9 completă: multiple brawlers (6, fiecare cu categorie vocabular proprie),
Star Drops cu 5 rarități și animație framer-motion, Audio via Web Audio API,
animații CSS + framer-motion (idle, bounce, glow pulsing, screen transitions).

Corecții din corectari.md aplicate:
- Trophy Road rescris: rewards la fiecare 50 trofee (ciclu coins/PP/gems/bling),
  Legendary Star Drop la fiecare 500 trofee.
- Deblocare cuvinte mutată la per-brawler (la fiecare 250 trofee ale brawlerului).
- Butonul "Cuvinte" eliminat din Lobby; cuvintele sunt acum în ecranul Brawlers,
  sub butonul de upgrade, filtrate per brawler și per trofee.

Următor: Deploy Vercel + secțiunea 10 (v4).
