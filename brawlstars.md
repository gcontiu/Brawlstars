# Specificații Proiect: German Brawl Simulator (v3.3)

## 1. Concept General
O aplicație mobilă de tip simulator (Web-App PWA) bazată pe mecanicile jocului **Brawl Stars**, concepută pentru a învăța vocabularul de limba germană din manualul "Fit in Deutsch 1". Utilizatorul progresează prin acumularea de XP, trofee și resurse pentru upgrade.

---

## 2. Gameloop & Mecanici de Luptă (The Battle)

### Tipuri de Meciuri
1. **Meci Tip A (DE -> RO):**
   - **Cerință:** Apare un cuvânt în germană (ex: *Abfahrt*).
   - **Interacțiune:** Selectarea articolului corect (**Der/Die/Das**) + scrierea traducerii în română.
   - **Condiție Win:** Ambele elemente corecte.
2. **Meci Tip B (RO -> DE):**
   - **Cerință:** Apare un cuvânt în română (ex: *decolare*).
   - **Interacțiune:** Scrierea cuvântului în germană **incluzând articolul** (ex: *der Abflug*).
   - **Condiție Win:** Ortografie și articol 100% corecte.

### Selectare Game Mode
Înainte de battle, utilizatorul alege modul:
- **DE → RO** — toate cuvintele sunt din germană în română
- **RO → DE** — toate cuvintele sunt din română în germană
- **Mix** — amestec aleatoriu (comportament implicit)

### Reguli de Battle
- **Timer:** Maximum **20 secunde** per cuvânt.
- **Diacritice:** Nu se ține cont de diacritice la verificarea răspunsurilor (ă=a, ș=s, ț=t, î=i, â=a, ü=u, ö=o, ä=a, ß=ss).
- **Verificare răspunsuri — 3 niveluri:**
  - ✅ **CORECT** — potrivire exactă (după normalizare diacritice) sau sinonim acceptat din lista `acceptedAnswers`.
  - 🟡 **APROAPE CORECT** — greșeală de tipar în limita toleranței Levenshtein (se acceptă, dar se afișează forma corectă). Contează ca răspuns corect la scor.
  - ❌ **GREȘIT** — nu trece niciun filtru.
- **Toleranță Levenshtein (tiered pe lungimea cuvântului):**
  | Lungime | Greșeli tolerate |
  | :--- | :--- |
  | ≤ 3 litere | 0 (trebuie exact) |
  | 4–6 litere | 1 |
  | 7–10 litere | 2 |
  | > 10 litere | 3 |
- **Articolele der/die/das:** ÎNTOTDEAUNA exacte — nu intră în toleranța Levenshtein.
- **Sinonime (`acceptedAnswers`):** câmp opțional per cuvânt; se completează incremental pe măsură ce utilizatorul întâlnește cazuri reclamabile (ex: *lucru ↔ muncă*, *maşină ↔ automobil*).
- **Diferențiere pe mod:**
  | Mod | Typo tolerance | Sinonime |
  | :--- | :--- | :--- |
  | DE→RO (scrie în română) | per-token, Levenshtein | ✅ din `acceptedAnswers` |
  | RO→DE (scrie în germană) | pe cuvântul german, articolul strict | ❌ (forma germană e exactă) |
- **Feedback greșit:** Când se greșește complet, aplicația arată varianta corectă și **utilizatorul apasă un buton** pentru a trece la următorul cuvânt (nu se avansează automat).
- **Feedback aproape corect:** Se avansează automat după 1.8 secunde, afișând forma corectă.
- **Feedback corect:** Se avansează automat după 1 secundă.
- **Sistem Revenge:** Cuvintele greșite (❌) sunt adăugate la finalul sesiunii pentru a fi repetate. Cele "aproape corecte" (🟡) nu intră în revenge.
- **XP fix:** 25 XP per battle finalizat.
- **Ieșire:** Nu se poate ieși din battle în timpul jocului. Se poate ieși doar în timpul countdown-ului inițial.

### Calculul Trofeelor (Post-Battle)
Se calculează rata de succes (S):
- **Dacă S > 50%:** Trofee = floor(S / 10)
- **Dacă S < 50%:** Trofee = -ceil((100 - S) / 10)
- **Win Streak:** +1 trofeu per victorie consecutivă (adăugat la final, plafonat la **max +10**).
- Trofeele se țin **per brawler**; totalul global = suma tuturor.

---

## 3. Sistem de Deblocare Cuvinte

- **Start:** Fiecare brawler începe cu **25 de cuvinte** deblocate din categoria sa.
- **Checkpoint:** Un checkpoint = **250 de trofee ale brawlerului** respectiv.
- **Deblocare:** La fiecare checkpoint se deblochează **15 cuvinte** noi din categoria brawlerului.
- **Vizualizare:** Cuvintele se văd în ecranul **Brawlers**, selectând un brawler — lista apare sub butonul de upgrade.

---

## 3.5 Trophy Road — Recompense

Recompensele din Trophy Road se bazează pe **trofee globale** (suma tuturor brawlerilor):

| Milestone | Recompensă |
| :--- | :--- |
| La fiecare **50 trofee** | Ciclu rotativ: 🪙 200 Coins → ⚡ 200 PP → 💎 10 Gems → ✨ 500 Skin Shards |
| La fiecare **500 trofee** | ⭐ **Legendary Star Drop** (override față de ciclul normal) |

> Deblocarea cuvintelor se face separat, pe baza **trofeelor per brawler** (see §3).

---

## 4. Progresie: Brawl Pass & Quest-uri

### Nivele Brawl Pass

Brawl Pass are 30 de nivele. Recompensele per nivel depind de tier-ul activ.

- **Free Pass:** Deblocat implicit.
  - 🪙 10 Coins/nivel
  - ⚡ Power Points la fiecare nivel multiplu de 3
  - 💎 2 Gems la fiecare nivel multiplu de 5
  - 💎 +5 Gems bonus la nivelele 10, 20, 30 (Milestone)

- **Pass Plus:**
  - *Deblocare:* Test "Hard" — 20 cuvinte, acuratețe **exactă** >= 95% (doar `correct`, nu `almost`).
  - *Visual activ:* Banner albastru „⭐ PASS PLUS ACTIV — Recompense duble"; rândurile listei devin albastre.
  - 🪙 20 Coins/nivel (×2)
  - ⚡ PP ×2 + 5 bonus per nivel
  - ✨ 10 Bling/nivel + 10 Bling extra la multipli de 3
  - 💎 Gems de bază + 1 Gem extra la fiecare nivel multiplu de 5

- **Premium Pass:**
  - *Deblocare:* Test "Elite" — 25 cuvinte, acuratețe **exactă** 100%.
  - *Visual activ:* Banner violet „💎 PREMIUM PASS ACTIV — Recompense triple"; rândurile listei devin violet.
  - 🪙 30 Coins/nivel (×3)
  - ⚡ PP ×3 + 10 bonus per nivel
  - ✨ 25 Bling/nivel + 25 Bling extra la multipli de 3
  - 💎 Gems de bază ×2 + 2 Gems extra la fiecare nivel multiplu de 3

**Notă implementare:** Testul de deblocare acceptă doar răspunsuri `correct` (potrivire exactă sau sinonim din `acceptedAnswers`). Răspunsurile `almost` (toleranță Levenshtein) NU sunt considerate corecte în test.

### Quest-uri
- **Buton Quest:** Afișează progresul și task-urile active.
- **Recompensă:** **500 XP** per quest finalizat.
- **Drop Rate:** 1 la 20 șanse de a primi un Collectible (Pin/Skin) la finalizarea unui quest.

---

## 5. Economie și Upgrade Brawlers

### Costuri Upgrade (Sincronizate cu jocul real)
| Level | Power Points | Coins |
| :--- | :--- | :--- |
| 2 | 20 | 50 |
| 3 | 30 | 100 |
| 4 | 50 | 150 |
| 5 | 80 | 290 |
| 6 | 130 | 480 |
| 7 | 210 | 800 |
| 8 | 340 | 1250 |
| 9 | 550 | 1875 |
| 10 | 890 | 2800 |
| 11 | 1440 | 5000 |

### Valute
- **Gems:** Cumpărare resurse/skin-uri în Shop.
- **Bling:** Cumpărare Skin-uri și Pins.
- **Credits:** Resursă suplimentară din Free Pass.
- **Power Points & Coins:** Exclusiv pentru upgrade de nivel.

---

## 6. Interfața Utilizator (UI Architecture)

### Lobby (Ecran Principal) — inspirat fidel din Brawl Stars
- **Top Stânga:** Iconiță **Trophy Road** (trofee globale).
- **Top Dreapta:** Display resurse (Coins 🪙, Gems 💎, Bling ✨, PP ⚡, Credits 🎫).
- **Centru:** Brawlerul activ (imagine reală); animație idle bounce. Deasupra: trofee + nivel. Sub imagine: numele brawlerului și tema vocabular.
- **Stânga:** Buton **Shop** + buton **Brawlers**.
- **Dreapta:** Buton **💬 Feedback** — vizibil doar dacă `VITE_FEEDBACK_URL` e setat; deschide Google Form într-un tab nou.
- **Jos Stânga:** **Brawl Pass** ca bară slider orizontală (nivel curent/30) — click deschide ecranul Brawl Pass.
- **Jos Centru-Stânga:** Buton **Quest** 📋.
- **Jos Centru:** Buton **🎮 GAMEMODES** — selectare mod înainte de battle.
- **Jos Dreapta:** Butonul **▶ PLAY** — galben, animație breathing, mare.

### Battle UI
- Design minimalist, timer vizibil.
- Input text pentru traduceri și butoane Der/Die/Das pentru Tipul A.

---

## 7. Date Tehnice
- **Sursă Vocabular:** Toate cuvintele din fișierul `cuvinte.md` (A-Z), parsate și structurate.
- **Persistență:** Salvare automată în `localStorage` (progresul rămâne salvat în browser-ul telefonului).
- **Referință:** Pentru orice ambiguitate în specificații, se folosește rețeta din Brawl Stars original (vezi [Brawl Stars Wiki](https://brawlstars.fandom.com/wiki/Brawl_Stars_Wiki)).

---

## 8. Strategie Demo (Checkpoints Vizuale)

| Demo | Ce se vede | Când |
| :--- | :--- | :--- |
| **Demo 1** | Ecran mobil cu lobby-ul complet (layout, butoane, resurse) | După UI Lobby |
| **Demo 2** | Un battle complet: timer, input, articole, feedback corect/greșit | După Battle Engine + UI |
| **Demo 3** | Rezultate post-battle: trofee, XP, revenge rounds, cuvinte deblocate | După Progression |
| **Demo 4** | Economie: shop, upgrade brawler, brawl pass | După Economy |
| **Demo 5** | PWA instalabil pe telefon, offline-ready | Final |

---

## 9. Extensii v3.3 (Planificate)

Feature-uri care apropie aplicația de feel-ul Brawl Stars original, prioritizate pentru următoarea iterație.

### 9.1 Multiple Brawlers = Categorii Vocabular
Fiecare brawler acoperă o **temă de vocabular** din manualul Fit in Deutsch 1:
- *Shelly* 🎯 — Familie & Beruf (Lektion 1.1, 65 cuvinte)
- *Colt* 🔫 — Casă & Obiecte (Lektion 1.2, 38 cuvinte)
- *Nita* 🐻 — Oraș & Timp Liber (Lektion 1.3, 30 cuvinte)
- *Bull* 🐂 — Călătorii & Timp (Lektion 2.1, 63 cuvinte)
- *Poco* 🎸 — Îmbrăcăminte & Shopping (Lektion 2.2, 48 cuvinte)
- *Rosa* 🌹 — Natură & Animale (Lektion 2.3, 49 cuvinte)
- Unlock brawleri: Shelly gratuit, restul la 100/250/500/750/1000 trofee globale.
- Upgrade-ul (PP + Coins) și trofeele sunt **per-brawler**.
- Cuvintele se deblochează per brawler la fiecare 250 trofee ale brawlerului.
- Cuvintele se vizualizează în ecranul Brawlers, sub butonul de upgrade.

### 9.2 Star Drops Post-Battle
După fiecare **victorie**, drop aleatoriu cu 6 rarități:

| Rarity | Șansă | Conținut |
| :--- | :--- | :--- |
| Rare | 39% | 20–50 Coins |
| Super Rare | 30% | 5–10 Power Points |
| Epic | 15% | 5 Gems |
| Mythic | 10% | 50 Coins + 20 PP + 2 Gems + 50 Bling |
| Legendary | 5% | 100 Coins + 50 PP + 10 Gems + 200 Bling |
| **Giga** | **1%** | **5000 Coins + 3000 PP + 25 Gems + 1000 Bling + 500 Credits** |

- Animație de deschidere: **shake → crack → reveal** cu glow specific rarității.
- Dopamină + retention fără să afecteze balance-ul progresiei deterministe existente.

### 9.3 Audio & Haptics
Spec-ul anterior nu menționa deloc sunet. BS se bazează masiv pe SFX.
- **SFX obligatorii:**
  - Button tap (click subtil)
  - Countdown "3-2-1-GO!" (vocal sau beep)
  - Correct chime (~1s, ascendent)
  - Wrong buzzer (~0.5s, descendent)
  - Victory stinger (fanfare scurtă)
  - Defeat stinger
  - Coin drop la reward screen
  - Level-up explosion
- **Haptic feedback** (`navigator.vibrate`): tap scurt (20ms) pe butoane, pattern mai lung la level up / star drop / perfect battle.
- Toggle **mute** + toggle **haptics** în settings.

### 9.4 Animații & Tranziții
- **Brawler idle animation** (bounce subtil, loop 2s).
- **PLAY button**: pulse lent (breathing), bounce la tap.
- **Particle burst** la level up și la trophy gain.
- **Counter rolling**: trofee, XP, coins cresc animat de la valoare veche la cea nouă.
- **Tranziții între ecrane** (slide/fade, 200–300ms).
- **Star Drop opening**: shake (0.5s) → crack (0.3s) → reveal cu glow color-coded pe rarity.

---

## 10. Roadmap v4 (Future Scope)

Feature-uri mai scumpe care extind semnificativ scope-ul; amânate intenționat pentru după v3.3.

### 10.1 Game Modes alternative
Fiecare cu battle engine distinct față de cel curent:
- **Gem Grab**: colectează 10 răspunsuri corecte înainte să expire timerul global (120s).
- **Showdown**: o greșeală = eliminat; câte cuvinte rezistă = poziția finală (#1–#10).
- **Heist**: spargi un seif cu HP — fiecare corect = damage, greșit = +timp adversar.
- **Boss Fight**: boss cu 200 HP, damage scalat după dificultatea cuvântului.
- **Knockout**: best-of-3 runde scurte de câte 5 cuvinte.

### 10.2 Star Power + Gadget per Brawler
- **Gadget** (unlock la brawler level 7): **"Hint"** — dezvăluie prima literă a răspunsului. 3 utilizări per battle.
- **Star Power** (unlock la brawler level 9): bonus pasiv la alegere:
  - *"+1 trofeu per win streak"* (boost progresie)
  - *"Dublu XP la 100% accuracy"* (boost learning)

### 10.3 Daily Reward + Login Streak
Recompensă zilnică crescătoare pe 7 zile, cu reset săptămânal:
- Ziua 1: 20 Coins
- Ziua 3: 5 Power Points
- Ziua 5: 1 Gem
- Ziua 7: **Star Drop garantat** (minim Mythic)
- Notificare vizuală în lobby dacă există recompensă neclaimuită.
- Streak-ul se rupe dacă se sare o zi calendaristică.
- Esențial pentru retention — critic pentru un app de învățare zilnică.

### 10.4 Trophy League + Rank Badges
- Leagues: **Bronze** (0–500), **Silver** (500–1000), **Gold** (1000–1800), **Diamond** (1800–3000), **Master** (3000+), **Legendary** (top 1%).
- Badge vizibil în lobby lângă contorul de trofee.
- **Season reset**: la finalul sezonului (30 zile), trofeele peste 500 se reduc cu 50% (fidel BS).

### 10.5 Events / Sezoane Tematice
- Sezoane de 30 zile cu temă: *Weihnachten*, *Oktoberfest*, *Schule*, etc.
- Cuvinte tematice bonus injectate în pool pe durata sezonului.
- Skin-uri exclusive și pin-uri sezoniere drop-abile doar în perioada activă.

---

## 11. Out of Scope (Nu se implementează)

Feature-uri din BS original care **nu se potrivesc** cu misiunea aplicației:

- **Club / Social features** — aplicația rămâne single-player focused pe învățare individuală.
- **Power League / Ranked matchmaking** — over-engineering pentru un app solo de vocabular.
