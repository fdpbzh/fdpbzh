# Turbo Disco — Dossier de reprise

**Projet :** FDP 2026 (Fête du Port, Pors Poulhan) — Championnats du Monde Inutiles
**Livrable :** `turbo-disco.html` — jeu web autonome, single-file, mobile-first
**État :** jouable de bout en bout, leaderboard câblé mais **non testé en conditions réelles**
**Dernière modif :** juillet 2026

---

## ⚡ Addendum — 10 juillet 2026 (reprise Cowork)

Ce qui a changé depuis la rédaction du dossier :

1. **Supabase repointé vers `fdp-scores`** (`nhsroymqvwrjflagzznz`). Le projet `turbo-disco` (`adhnboggometdbwitfdv`) est en pause et irrécupérable sans pauser un autre projet (limite plan gratuit). La table `turbo_scores` existait déjà dans `fdp-scores` avec le schéma exact du §9 et les 3 policies RLS. Nouveaux identifiants dans le HTML :
   - URL : `https://nhsroymqvwrjflagzznz.supabase.co/rest/v1`
   - Clé : `sb_publishable_UH528FgC5FVbxNFYi9Odlg_jcPZuK4J`
   - §9 est donc obsolète sur l'URL/clé, valide sur le reste. Bug #3 (table non confirmée) : **résolu**.
2. **Leaderboard testé de bout en bout** depuis un navigateur réel (origine fdp.bzh) : GET top10 → 200, POST → 201, PATCH insta → 204, compteur HEAD → 200. Ligne de test supprimée, base propre (0 ligne). Bug #2 : **résolu**.
3. **`stopBGM()` porté + bouton mute ajouté** (`#btnMute`, coin bas-droit, z-index 30, préférence persistée en `localStorage['td_mute']`, coupe BGM + SFX via `masterGain`). Bug #1 : **résolu**.
4. **Reste à faire** : déployer sur fdp.bzh (le repo `fdpbzh` est prêt, fichier à la racine), tester sur téléphones réels, révoquer la clé JSONBin (§9), trancher 16:9 vs carré. Le projet Supabase `turbo-disco` en pause peut être supprimé.

---

## 1. Contexte

FDP est un événement musical gratuit annuel à Pors Poulhan (Finistère), volontairement à échelle humaine (~500–1 000 personnes, ~45 bénévoles). L'après-midi propose les **Championnats du Monde Inutiles** — des épreuves absurdes et compétitives.

**L'épreuve d'origine (édition précédente) :** faire le tour d'une Chevrolet Corvette C2 rouge le plus vite possible, à pied, sans la toucher, avec ~150 spectateurs massés autour.

**Ce jeu est la transposition digitale de cette épreuve.** Le doigt remplace le corps, la vue est zénithale, le chrono se déclenche au départ et s'arrête quand la boucle est bouclée.

Il existe **en parallèle** un système de chronométrage physique (ESP32 + capteur reed + afficheur TM1637) pour l'épreuve réelle sur place. Les deux sont indépendants pour l'instant — une convergence des leaderboards est une piste ouverte (voir §11).

### Jeux frères déjà produits
| Jeu | Mécanique | Statut |
|---|---|---|
| Moule Shooter | Shoot'em up spatial, crabes en parachute | livré |
| **La Moule Volante** (`moule-launcher.html`) | Catapulte type Yeti Sports | **livré, en prod — c'est la référence de DA** |
| La Moule Métronome | Jeu de rythme (`performance.now()`) | livré |
| **Turbo Disco** | Tour de voiture au doigt | **ce dossier** |

`moule-launcher.html` est la **source de vérité graphique et architecturale**. Tout ce qui suit en est dérivé.

---

## 2. Fichiers

```
turbo-disco.html      # le jeu, 768 lignes, zéro dépendance (hors Google Fonts)
moule-launcher.html   # référence DA + archi (2662 lignes) — NE PAS MODIFIER
```

Aucun build, aucun bundler, aucun framework. On ouvre le `.html`, ça tourne.

---

## 3. Direction artistique

Reprise **stricte** de La Moule Volante. Toute déviation doit être un choix conscient.

### Palette
```
#0d0014  fond global (quasi-noir violacé)
#150022  bitume sombre        (COL.asphalt1)
#1e0030  bitume damier + inputs
#2a004a  bordure de ligne de tableau
#3a0a5c  pointillés de piste  (COL.dash)
#6b21a8  violet structurel — bordures, boutons
#7c3f9e  texte tertiaire, placeholders
#c026d3  magenta — accents, glow, barre de progression
#d8b4fe  texte secondaire (lavande)
#f0abfc  texte primaire (rose clair)
#ffd700  or — titres de valeur, chrono actif, récompenses
#7effa0  vert — succès
#ff4d6d  rouge — échec
```

### Typo
`Press Start 2P` (Google Fonts), **exclusivement**. Tailles en `clamp()` pour le responsive.

### Cadre
- Canvas **710×400** (16:9), `image-rendering: pixelated`
- Bordure `2px solid #6b21a8`, halo `box-shadow: 0 0 30px #c026d355`
- `#wrap` : `width:min(100vw, calc(100vh*16/9))`, plafonné à 710×400

> **Note :** Yo avait initialement demandé un format carré (le circuit circulaire y respire mieux). Le 16:9 a été retenu pour la cohérence avec la Moule. **C'est un arbitrage ouvert.** Repasser en carré = changer `#wrap`, `W`, `H`, et recalculer `OUTER` (§6).

### Écrans
Overlays `.screen` en `position:absolute; inset:0`, `z-index:20`, fond `rgba(13,0,20,0.93)`.
Flux : `sMenu` → (jeu) → `sResult` → `sLb`. Un seul visible à la fois via `show(id)` / `hideAll()`.

Le HUD in-game (`#hudTimer`, `#hudLap`, `#hudBar`, `#hudMsg`) est en `z-index:10` — il passe **sous** les écrans, ce qui le masque automatiquement.

---

## 4. Architecture du code

Un seul `<script>`, découpé en sections commentées `// ══════ TITRE ══════` :

| Section | Fonctions clés |
|---|---|
| SUPABASE | `sbHeaders` |
| SESSION (anti-triche) | `newSession`, `trackAction` |
| SCORES | `loadScores`, `loadTopScore`, `saveScore`, `updateInsta`, `checkTop10AndRevealInsta` |
| COMPTEUR | `loadCount` |
| AUDIO | `getAC`, `oscNote`, `noiseHit`, `scheduleBGM`, `startBGM`, `sfx*` |
| CANVAS | constantes `W H CX CY`, objet `COL` |
| CORVETTE | grille `CAR`, `TIRES` |
| FOULE | tableau `SPECS` (IIFE) |
| ÉTAT | `phase`, `resetRun`, `fmt` |
| DESSIN | `px`, `drawFloor`, `drawDiscoBeams`, `drawTrackRing`, `drawCar`, `drawDiscoBall`, `drawSpec`, `drawCrowd`, `drawTrail`, `drawConfetti`, `drawOverlayFX`, `drawGhostRecord` |
| COLLISION | `inCar`, `inSpec`, `nearBall`, `angOf`, `angDiff` |
| INPUT | `pos`, `onDown`, `onMoveEv`, `onUp` |
| FIN DE PARTIE | `die`, `finish`, `comment`, `showResult` |
| ÉCRANS | `show`, `hideAll`, `renderLb` + listeners |
| BOUCLE | `loop` |

### Machine à états (`phase`)
```
'menu'    → écran titre, boule disco tourne toute seule
'ready'   → jeu visible, attente du doigt sur la boule, "START" clignote
'running' → chrono actif, collisions actives
'dead'    → échec, flash rouge, → showResult() après 1100ms
'done'    → tour bouclé, confettis, → showResult() après 1500ms
```

Style ES5 volontaire (`var`, `function`) pour matcher la Moule et maximiser la compat navigateurs anciens sur place.

---

## 5. La Corvette

Grille pixel `CAR` : **18 colonnes × 24 lignes**, dessinée à `GP = 5` px → **90×120 px** à l'écran.

Codes couleur dans la grille :
```
0 = vide        4 = bande blanche centrale
1 = carrosserie 5 = vitre
6 = panneau noir (prises d'air toit, panneaux arrière)
7 = chrome (pare-chocs, joncs)
```

Les **pneus** ne sont pas dans la grille (ils débordent en `c:-2` et `c:18`) — tableau `TIRES` séparé, dessinés avant la carrosserie.

Rendu : chaque pixel `1` reçoit un liseré `#ff5555` en haut et à gauche → faux relief. Ombre portée décalée de +5px, `globalAlpha .3`.

La silhouette vise la **C2 Sting Ray 1963** : nez fuselé, double bande blanche, deux prises d'air sur le toit, lunette arrière fendue. Si un modèle veut la retravailler : c'est de l'édition de tableau, pas du dessin vectoriel. Garder 18 colonnes pour ne pas casser la géométrie.

---

## 6. Géométrie du terrain

Toutes les valeurs sont **dérivées**, jamais codées en dur. Si tu changes `GP` ou le canvas, tout suit.

```js
GP    = 5
CPW   = 18 * GP = 90      // largeur voiture
CPH   = 24 * GP = 120     // longueur voiture
IRX   = CPW/2 + 18 = 63   // demi-axe X de l'ellipse interdite
IRY   = CPH/2 + 18 = 78   // demi-axe Y
OUTER = (IRX+IRY)/2 + 52 = 122.5
```

**Boule disco (départ), côté conducteur = gauche :**
```js
SBX = CX - (IRX+OUTER)/2 - 4 = 258.25
SBY = CY = 200
SBR = 17
```
→ elle est à **96.75 px** du centre, donc entre l'ellipse (63) et la limite extérieure (122.5). Pile au milieu du couloir. ✅

**Foule :** 150 spectateurs, 4 anneaux concentriques elliptiques.
```
rayon X : 135.5 → 217.5
rayon Y : 132.5 → 194.5
extension verticale : y ∈ [5.5, 394.5]  → tient dans les 400px, mais c'est serré
```
Triés par `y` croissant pour un z-order correct (ceux du bas dessinés en dernier).

**Couloir jouable :** entre l'ellipse voiture et le premier anneau de foule, soit ~58 px de marge verticale et ~72 px horizontale. Confortable au doigt.

⚠️ **Si le canvas change de taille, recalculer `OUTER` en premier** — c'est lui qui pousse la foule hors cadre.

---

## 7. Détection du tour — le cœur du jeu

C'est la partie qu'il ne faut pas casser.

```js
acc += angDiff(angleCourant, angleprécédent);  // accumulateur signé
```

`angDiff` normalise dans `]-π, π]`, ce qui rend l'accumulateur **insensible au passage par ±π** (le point de discontinuité de `atan2`). On peut tourner dans les deux sens : `acc` devient négatif dans un sens, positif dans l'autre. D'où le `Math.abs()` partout.

**Condition de victoire (double, volontairement) :**
```js
Math.abs(acc) >= Math.PI * 1.95              // ~351° parcourus
&& Math.abs(angDiff(a, startAng)) < 0.35     // ET revenu à ±20° du départ
```

Le premier test seul autoriserait à s'arrêter n'importe où après un quasi-tour. Le second seul serait déclenché dès le premier frame. **Les deux sont nécessaires.** Le `1.95` (au lieu de `2.0`) absorbe le jitter du tracking tactile.

**Anti-triche géométrique implicite :** on ne peut pas « couper » par le centre, l'ellipse `inCar` tue. On ne peut pas contourner par l'extérieur, la foule tue.

### Conditions d'échec
1. `inCar(x,y)` — ellipse normalisée `(dx/IRX)² + (dy/IRY)² < 1`
2. `inSpec(x,y)` — boîte AABB `3.4·sc × 4.4·sc` autour de chaque spectateur, **boucle linéaire sur 150 éléments à chaque `mousemove`**
3. `onUp` pendant `running` — doigt levé

> `inSpec` est en **O(150) par événement de mouvement**. Ça passe sans problème sur mobile actuel, mais c'est le premier candidat à l'optimisation (grille spatiale / quadtree) si on monte le nombre de spectateurs.

---

## 8. Anti-triche

Repris de la Moule, **inversé** : ici le meilleur score est le plus *petit*.

```js
MIN_TIME_MS  = 600      // un humain ne boucle pas plus vite
MAX_TIME_MS  = 180000   // 3 min
MIN_PLAY_MS  = 1500     // durée de session (depuis "DEMARRER")
MIN_ACTIONS  = 25       // nb de mousemove/touchmove enregistrés
```

À chaque partie : `newSession()` génère un UUID v4. `trackAction()` incrémente à chaque mouvement. `saveScore()` **valide côté client avant d'envoyer**, puis met `sessionToken = null` → empêche la double soumission.

Les champs `session_id`, `play_time_ms`, `action_count` sont persistés en base pour audit *a posteriori*.

**Ce n'est pas de la sécurité.** La clé est dans le HTML, n'importe qui peut `POST` directement. C'est un ralentisseur pour joueur opportuniste, pas une barrière. Pour un vrai durcissement : Edge Function Supabase qui valide et signe, ou RLS avec contrainte `CHECK (time_ms >= 600)`.

---

## 9. Supabase

### Projet
```
URL  : https://adhnboggometdbwitfdv.supabase.co
REST : https://adhnboggometdbwitfdv.supabase.co/rest/v1
Clé  : sb_publishable_dTXY7AzZZjjx7P8eE7TSXQ_uFV4-yiN   (publishable, safe côté client)
Table: turbo_scores
```

### Schéma
```sql
create table turbo_scores (
  id            bigint generated always as identity primary key,
  name          text not null,
  time_ms       bigint not null,
  insta         text,
  session_id    text,
  play_time_ms  bigint,
  action_count  int,
  created_at    timestamptz default now()
);

alter table turbo_scores enable row level security;

create policy "lecture publique" on turbo_scores for select using (true);
create policy "ecriture publique" on turbo_scores for insert with check (true);
create policy "maj insta"        on turbo_scores for update using (true) with check (true);
```

⚠️ **À vérifier en premier lieu : cette table existe-t-elle vraiment ?** Elle a été spécifiée mais sa création n'a jamais été confirmée. Une table `scores` (schéma différent, `ms` au lieu de `time_ms`) traîne peut-être dans le même projet — vestige d'une itération précédente.

### Endpoints utilisés
| Usage | Requête |
|---|---|
| Top 10 | `GET /turbo_scores?select=name,time_ms&order=time_ms.asc&limit=10` |
| Record | `GET /turbo_scores?select=name,time_ms&order=time_ms.asc&limit=1` |
| Compteur | `HEAD /turbo_scores?select=*` + header `Prefer: count=exact`, lire `content-range` |
| Insertion | `POST /turbo_scores` + `Prefer: return=representation` (pour récupérer l'`id`) |
| Insta | `PATCH /turbo_scores?id=eq.{id}` |

Tri **ascendant** sur `time_ms` (contrairement à la Moule qui trie `score` descendant).

### 🔴 Dette de sécurité
Une **clé master JSONBin** a circulé pendant le développement d'une itération abandonnée :
`$2a$10$zQdfAPc9cFn8RUPBU1mPb...`
Elle donne un accès **lecture + écriture**. Elle n'est plus dans le code, mais **elle doit être révoquée** sur jsonbin.io. À faire.

---

## 10. Audio

Moteur WebAudio identique à la Moule : `oscNote()` (oscillateur + enveloppe exponentielle) et `noiseHit()` (buffer de bruit + bandpass) pour la batterie.

`scheduleBGM()` est un **scheduler look-ahead** : il remplit 250 ms d'avance, se rappelle via `setTimeout(…, 60)`. Chaque piste a son propre curseur temporel (`bassT`, `arpT`, `leadT`, `drumT`) et son index — les pistes peuvent donc avoir des longueurs différentes et se déphaser naturellement.

**Musique :** disco, 124 BPM, progression Am–F–C–G.
- `DRUMS` : four-on-the-floor (kick à chaque temps, open-hat en contretemps)
- `BASS` : walking bass avec octave
- `ARP` : arpèges de triangle
- `LEAD` : phrase courte, beaucoup de silence

**SFX :** `sfxStart` (arpège montant), `sfxCrash` (bruit + saw descendante), `sfxWin` (fanfare 5 notes), `sfxTick` (clic aux 25 % du tour).

`getAC()` est lazy — le contexte n'est créé qu'au premier son, et `startBGM()` fait `ac.resume()`. C'est ce qui satisfait la politique autoplay des navigateurs : **le premier son doit venir d'un clic**. Ici c'est le bouton DEMARRER. Ne pas déplacer cet appel.

---

## 11. Bugs connus, limites, dette

| # | Sujet | Détail |
|---|---|---|
| 1 | **`stopBGM()` n'existe pas** | La musique démarre au premier DEMARRER et ne s'arrête jamais. Pas de bouton mute. La Moule a `stopBGM()` — le porter. |
| 2 | **Leaderboard jamais testé en conditions réelles** | L'iframe d'artifact Claude bloque `fetch` sortant → `Failed to fetch`. Le container d'exécution a une allowlist réseau qui exclut Supabase. **Rien n'a jamais pu être vérifié de bout en bout.** Premier test à faire après hébergement. |
| 3 | Table `turbo_scores` non confirmée | Voir §9. |
| 4 | Clé JSONBin à révoquer | Voir §9. |
| 5 | `inSpec` en O(150) | Par événement de mouvement. OK aujourd'hui, à surveiller. |
| 6 | Souris desktop | `mousemove` se déclenche sans bouton enfoncé. Après `mousedown` sur la boule, le joueur peut relâcher et continuer à tracer. Seul `mouseup` tue — mais il est sur `window`, donc ça marche. Comportement légèrement laxiste vs tactile. |
| 7 | Foule serrée verticalement | `y ∈ [5.5, 394.5]` sur 400px. Un anneau de plus déborde. |
| 8 | Format 16:9 vs carré | Arbitrage non tranché. Voir §3. |
| 9 | Pas de mode plein écran / borne | Pour un usage sur borne tactile le jour J, prévoir un kiosk mode et un reset auto après inactivité. |
| 10 | Convergence avec le chrono physique | Le timer ESP32 de l'épreuve réelle et ce jeu ont deux leaderboards distincts. Piste : une table commune avec une colonne `source: 'web' | 'irl'`. |

---

## 12. Déploiement

L'iframe Claude ne peut pas atteindre Supabase. **Il faut héberger.** La Moule Volante tourne déjà quelque part — reprendre le même pipeline.

GitHub Pages, chemin le plus court :
1. Repo public, ex. `fdp2026-turbo-disco`
2. Renommer le fichier `index.html`
3. Settings → Pages → Source : branche `main`, dossier `/`
4. URL : `https://<user>.github.io/fdp2026-turbo-disco`

Supabase autorise le CORS par défaut sur toutes les origines pour l'API REST — rien à configurer.

**Checklist de première mise en ligne :**
- [ ] Table `turbo_scores` créée avec le bon schéma
- [ ] Les 3 policies RLS actives
- [ ] Ouvrir la page, jouer un tour, vérifier une ligne en base
- [ ] Vérifier que le compteur « X TOURS BOUCLÉS » s'incrémente
- [ ] Vérifier l'apparition de l'encart Insta si top 10
- [ ] Tester sur un vrai téléphone, pas seulement en émulation
- [ ] Révoquer la clé JSONBin

---

## 13. Ce qui reste à faire, par priorité

**Bloquant avant le 8 août**
1. Créer/vérifier la table, héberger, valider le leaderboard de bout en bout
2. Ajouter `stopBGM()` + un bouton mute (indispensable en extérieur bruyant)
3. Tester sur plusieurs téléphones réels — le tracking tactile est le point de friction

**Souhaitable**
4. Trancher 16:9 vs carré
5. Reset auto après 60 s d'inactivité (mode borne)
6. Message de « record battu » quand on passe devant `topScore`

**Confort**
7. Fantôme du meilleur tracé (rejouer le tracé du recordman en transparence)
8. Difficulté progressive : les spectateurs se resserrent à chaque partie
9. Convergence avec le chronométrage physique

---

## 14. Préférences de travail

Yo est photographe de mariage et vidéaste documentaire, autodidacte sur le code, avec une approche **empirique et test-first**. Il attend un interlocuteur qui **le contredit quand c'est justifié**, pas un exécutant.

- Sorties attendues : **fichiers directement utilisables**, pas du code à recopier
- Quand un rendu visuel est demandé (mockups, affiches), il veut des **images**, pas du code qui génère des images
- Ton : direct, français, pas de flatterie
- Il a déjà fait le tour de plusieurs impasses sur ce projet (`window.storage` des artifacts, JSONBin). **Ne pas les reproposer.** Le blocage n'a jamais été le code — c'est l'environnement d'exécution.

---

## 15. Résumé pour une reprise à froid

> `turbo-disco.html` est un jeu single-file complet et jouable. La DA vient de `moule-launcher.html` et doit être respectée à la lettre. Le cœur du jeu est l'accumulateur d'angle dans `onMoveEv()` — c'est robuste, ne pas y toucher. Le leaderboard Supabase est écrit correctement mais **n'a jamais fonctionné une seule fois**, uniquement parce que tous les environnements de test essayés bloquaient les requêtes sortantes. La toute première action utile est donc : créer la table, pousser sur GitHub Pages, ouvrir la page, jouer un tour, regarder la base. Tout le reste en découle.
