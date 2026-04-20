# Specificații Proiect: German Brawl Simulator (v3.2)

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
- **Feedback greșit:** Când se greșește, aplicația arată varianta corectă și **utilizatorul apasă un buton** pentru a trece la următorul cuvânt (nu se avansează automat).
- **Feedback corect:** Se avansează automat după 1 secundă.
- **Sistem Revenge:** Cuvintele greșite sunt adăugate la finalul sesiunii pentru a fi repetate.
- **XP fix:** 25 XP per battle finalizat.
- **Ieșire:** Nu se poate ieși din battle în timpul jocului. Se poate ieși doar în timpul countdown-ului inițial.

### Calculul Trofeelor (Post-Battle)
Se calculează rata de succes (S):
- **Dacă S > 50%:** Trofee = floor(S / 10)
- **Dacă S < 50%:** Trofee = -ceil((100 - S) / 10)
- **Win Streak:** +1 trofeu per victorie consecutivă (adăugat la final, plafonat la **max +10**).

---

## 3. Sistem de Deblocare Cuvinte

- **Start:** Jocul începe cu **25 de cuvinte** deblocate.
- **Checkpoint:** Un checkpoint înseamnă obținerea a **250 de trofee**.
- **Deblocare:** La fiecare checkpoint se deblochează **15 cuvinte** noi din lista de vocabular.
- **Vizualizare:** Pe ecranul principal există un **buton în dreapta** care afișează un ecran cu cuvintele deblocate.

---

## 4. Progresie: Brawl Pass & Quest-uri

### Nivele Brawl Pass
- **Free Pass:** Deblocat implicit. Conține **Coins, Power Points, Credits și Gems**.
- **Pass Plus:**
  - *Deblocare:* Test "Hard" (20 cuvinte, acuratețe >= 95%).
  - *Premii:* Resurse extra + Blings.
- **Premium Pass:**
  - *Deblocare:* Test "Elite" (25 cuvinte, acuratețe 100%).
  - *Premii:* Resurse duble + Skin-uri exclusive.

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
- **Top Stânga:** Iconiță **Trophy Road**.
- **Top Dreapta:** Display resurse (Coins, PP, Bling, Gems).
- **Centru:** Brawlerul activ (imagine reală de brawler); deasupra lui sunt afișate trofeele și nivelul de putere.
- **Stânga:** Buton **Shop**, iar sub el butonul **Brawlers**.
- **Dreapta:** Buton **Cuvinte** — afișează ecranul cu cuvintele deblocate.
- **Jos Stânga:** **Brawl Pass** ca bară slider orizontală (arată nivelul curent) + buton **Quest** în dreapta barei.
- **Jos Dreapta:** Butonul **"Play"** — dreptunghiular, galben, mare.

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
