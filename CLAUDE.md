# German Brawl — instrucțiuni pentru Claude Code

## Context proiect
Aplicație PWA React pentru învățat vocabular german (Fit in Deutsch 1), inspirată din Brawl Stars. Deploy live: https://german-brawl.vercel.app

Documentație completă a proiectului, istoricul sesiunilor anterioare, planuri de viitor, opțiuni de monetizare și briefing detaliat se află în **Notion**:

- **Pagină Notion**: https://www.notion.so/349982669d5681ee9775fda4d0eb4c7c
- **ID**: `34998266-9d56-81ee-9775-fda4d0eb4c7c`
- **Titlu**: "🎮 German Brawl — Proiect"

## La începutul fiecărei sesiuni
Citește pagina Notion de mai sus folosind `mcp__claude_ai_Notion__notion-fetch` pentru a recupera contextul complet (ultima sesiune, bug-uri rezolvate, planuri, pitfalls). Asta înlocuiește necesitatea unui rezumat manual din partea utilizatorului.

## La sfârșitul fiecărei sesiuni
**OBLIGATORIU**: Actualizează pagina Notion cu contextul sesiunii curente folosind `mcp__claude_ai_Notion__notion-update-page` cu `command: "replace_content"`.

Structura secțiunii "Ultima sesiune" trebuie să conțină:
- Data sesiunii (format YYYY-MM-DD)
- Ce s-a făcut (feature-uri, bug fix-uri, deploy-uri)
- Ce a rămas nefinalizat (blocker-e, task-uri pentru utilizator)
- Starea curentă de deployment (URL-uri, aliasuri)
- Pitfall-uri descoperite (pentru a evita repetarea lor)

Păstrează capitolele existente din Notion (Stack, Integrări, Env vars, Bug fixes, Opțiuni analizate, Planuri de viitor, Briefing) — doar actualizează secțiunea "Ultima sesiune" și adaugă în "Bug fixes" / "Pitfalls" dacă au apărut elemente noi.

Dacă utilizatorul nu cere explicit să închei sesiunea, întreabă-l înainte de a face update-ul final: "Actualizez Notion cu contextul sesiunii?"

## Convenții proiect
- Limbă conversație: **română**
- Stack: React 19 + TS + Vite 8 + Tailwind v4 + Zustand
- Install: `npm install --legacy-peer-deps` (conflict peer dep vite-plugin-pwa)
- Deploy: `npx vercel --prod` din directorul `app/`, apoi re-alias `german-brawl.vercel.app` manual
- Env vars pe Vercel: folosește `printf "%s" "value"` (NU `echo` — adaugă newline)
