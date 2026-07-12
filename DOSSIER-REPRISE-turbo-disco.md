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
5bis. **v11 portrait** (10 juillet, soir) : canvas **400×710 (9:16 portrait)**, pensé téléphone. Corvette et crabes tournés d'un quart de tour (rotation 90° horaire au pré-rendu, grille inchangée). Géométrie : `RX=90, RY=160, F_IN=0.72, F_OUT=1.26` — couloir élargi à ~49 px au plus étroit (difficulté 1b, mort instantanée conservée, propriété anti-visseuse préservée de justesse : 115.2 > 113.4). Boule disco recolorée **gris/blanc réaliste** (facettes, halo, cerclage — les faisceaux ambiants restent colorés). Départ déplacé au flanc droit (`SB_TH=-15°`, jeu au pouce). **Accueil minimal** : titre + DEMARRER + SCORES ; le pseudo est saisi à l'écran résultat (sauvegarde différée via `#saveBox`/`btnSaveScore`, prérempli depuis `localStorage['td_name']`, l'encart récompenses migre dans le Hall of Fame). Un run non enregistré est perdu — choix assumé. Propositions de refonte DA : `../proposition-DA-turbo-disco.html` (4 pistes, hors repo).
5ter. **v12 gameplay/accueil** : accueil « drapeau à damier » (bandeaux damier CSS, titre or, feu de départ animé rouge→jaune→vert, DEMARRER vert). **Hitbox voiture pixel-perfect** : `inCar(x,y)` teste la grille `CAR_ROWS` (mapping inverse de la rotation 90°) — l'ellipse `F_IN` ne sert plus à la mort, le couloir gagne ~25px sur les flancs et ~35px aux extrémités. **Interpolation anti-tunneling** : collisions et accumulation d'angle évaluées tous les ~6px le long du segment entre deux événements (on ne peut plus sauter par-dessus la voiture, et l'angle est exact même en geste rapide). **Zone franche** de 36px autour de la boule de départ (corrige les morts immédiates au clic sur le bord de la boule, cause des « parties perdues sans raison » à la souris) + détection du bouton souris relâché hors fenêtre. L'anti-visseuse stricte est abandonnée (un tracé circulaire R≈90-113px passe désormais) — choix assumé au profit d'une hitbox juste.
5quater. **v13 arcade** : **BGM remplacée** par le son n°5 — V8 au ralenti synthétisé (sub 28Hz + saw 42Hz lowpass + souffle brun + double LFO « lope ») + kick disco 124 BPM via le scheduler look-ahead ; les pistes BASS/ARP/LEAD/DRUMS sont supprimées, les sfx conservés. **Pseudo obligatoire** à l'accueil (DEMARRER grisé sinon, prérempli `td_name`), sauvegarde redevenue automatique. **Compteur « X TOURS BOUCLÉS »** de retour au menu. **Rampe F1** : 5 feux rouges séquentiels, extinction = départ (plus de vert/orange). **Vert → or partout** (trainée gagnante #ffec80, barre, flash, confettis, faisceaux, ✓ enregistré). **Flux arcade** : chaque tour bouclé est sauvé en base silencieusement ; écran résultat + insta réservés au top 10 (`isTop10()` compare au 10e temps) ; sinon message « PAS DE TOP 10, REJOUE ! » et retour direct en `ready` (2,2s) ; idem sur mort (1,2s, « ENCORE ! »). Bouton `≡ MENU` (bas-gauche, phase ready uniquement) pour changer de pseudo. Écoute des 5 moteurs : `../proposition-sons-turbo-disco.html`.
5quinquies. **v15 chronométrage de précision** : le tour se termine **au contact de la boule disco** (fini la condition angulaire ±20°). Portes de chrono : cercle `GATE = SBR×1.8 = 27px` autour de la boule — le chrono **démarre à la sortie** de la porte et **s'arrête à son franchissement retour** (pur temps de pilotage, pas de temps de réaction), avec garde `|acc| ≥ 1.9π` pour interdire l'arrivée sans tour complet. **L'instant exact de franchissement est interpolé** : résolution quadratique de l'intersection segment/cercle (`crossT`) puis interpolation linéaire entre les `event.timeStamp` des deux événements encadrants — même principe qu'une cellule de chronométrage physique. Affichage et stockage au **dixième de milliseconde** (`SS.mmmd`), colonne `time_ms` migrée `bigint → numeric` (migration `turbo_scores_time_ms_numeric`). Nota : la résolution des timers navigateur est bridée (~0,1 ms Chrome, parfois 1 ms ailleurs) — le 4e chiffre tire sa validité de l'interpolation géométrique, pas de l'horloge. Menu V14 : pseudo obligatoire avec shake rouge (plus de bouton grisé), tag de version `#verTag` pour diagnostiquer le cache GitHub Pages (~10 min). Validé par simulation à timestamps contrôlés : tour de 1920 ms de trajectoire → 1813,9472 ms porte-à-porte, t0 interpolé entre événements.
5sexies. **v17 anti-triche serveur** : l'écriture passe par l'Edge Function **`submit-score`** (projet fdp-scores). Le client enregistre la **trace complète du doigt** `[x,y,t]` (arrondie 0,1px/0,1ms, cap 6000 pts avec éclaircissage ×2) et l'envoie ; la fonction **rejoue le tour** (miroir exact : grille Corvette, ellipse foule, zone franche, portes, `crossT`) et **recalcule le temps elle-même** — `client_ms` ne sert que de contrôle de cohérence (±10ms). Rejets testés : téléportation, vitesse >8000px/s, traversée de voiture, temps client menteur, INSERT direct (401 — policy « ecriture publique » supprimée), PATCH de `time_ms` (401 — UPDATE restreint à la colonne `insta` par GRANT, la policy permettait de réécrire les temps !). Index unique sur `session_id` (une soumission par session). `verify_jwt` désactivé sur la fonction (clients anonymes ; le rejeu est le contrôle). Contrainte CHECK ≥100ms conservée en garde-fou. **Limite résiduelle assumée** : un attaquant capable de synthétiser une trajectoire physiquement plausible peut encore soumettre ~100-150ms — c'est de la contrefaçon de physique, plusieurs ordres de grandeur plus dur qu'un POST. ⚠ Dès le verrouillage base, les clients V16 ne peuvent plus enregistrer : **pousser V17 immédiatement**. Anti-triche client conservé en pré-filtre (échec rapide sans réseau).
5septies. **v18 correctif arrivée + compteur de parties** : bug v17 corrigé — l'angle du tour se comptait depuis le point de contact initial sur la boule ; en touchant un côté et sortant de l'autre, on partait avec ~0,3 rad de déficit → à l'arrivée `acc<1.9π`, contact ignoré, le doigt traversait la boule et mourait derrière. Correction : **`acc=0` à la sortie de porte** (le tour se compte depuis le départ du chrono) et seuil abaissé à **1.8π** (minimum géométrique ~1.87π). Appliqué **côté client ET dans l'Edge Function v2** (le rejeu doit rester un miroir exact, sinon il rejetterait des tours devenus légitimes). Nouvelle table **`turbo_plays`** (insert/select publics) : chaque tentative — morte ou bouclée — est comptée via `logPlay()`, le compteur du menu affiche « X PARTIES JOUÉES ». Testé : trace « départ décalé » (le scénario du bug) acceptée par la fonction v2.
5octies. **Edge Function v3** : le contrôle de vitesse par segment rejetait à tort les tours rapides — les navigateurs livrent des rafales d'événements tactiles coalescés (dt≈0,1ms) qui simulaient des vitesses de 20 000 px/s (un 203ms légitime perdu ainsi). Remplacé par une **vitesse soutenue sur fenêtre glissante ≥15ms** (bornée à 45ms), dt=0 toléré. Testé : tour 187ms avec rafales coalescées → accepté ; tour entier en 50ms → « vitesse surhumaine ». Aucun changement client requis.
5nonies. **v19 — le plancher devient physique** : calcul du meilleur temps théorique — plus court chemin légal = enveloppe convexe de la Corvette + détour porte = **440,3 px**, soit **55,0 ms** au plafond de vitesse soutenue (8 000 px/s ≈ 1,3 m/s de doigt). Le plancher réglementaire arbitraire de 100 ms a failli disqualifier de vrais records (Yo : 203 ms avec très peu d'entraînement, 800→203 en minutes — l'extrapolation humaine sous 100 ms n'est pas exclue). MIN_TIME abaissé à **60 ms** partout (client V19, Edge Function v4, contrainte CHECK) : c'est désormais le plafond de vitesse, fondé sur la physique, qui fait la loi. Records homologables : [60 ms – 180 s].
5decies. **Edge Function v5** : MAX_SPEED 8000→**20000px/s** — un vrai flick humain pointe à 2-3m/s (12-18000px/s) ; l'ancien plafond rejetait les « bourres finales » légitimes sur fenêtre 15ms (le 203ms de Yo, deux fois). La barrière anti-fabrication est le plancher 60ms + le rejeu physique complet, pas la vitesse. Les motifs de rejet sont désormais **loggés** (`console.log REJET: …` + valeurs mesurées dans le message d'erreur) — plus de diagnostic à l'aveugle. Testé : profil « tour posé + rafale finale 12000px/s » accepté ; bot 25000px/s soutenus rejeté (avec vitesse mesurée dans l'erreur). L'accueil v19 est aussi passé par un polish (logo déboxé, HUD masqué sous les écrans, damier animé, scanlines, hiérarchie).
5undecies. **Edge Function v6-v7** : v6 = MAX_SPEED 50000px/s (depuis le plancher 60ms, la vitesse ne protège plus le classement — elle n'écarte que les données aberrantes). v7 = **bug de l'overshoot corrigé** : le rejeu continuait de scanner le segment APRÈS la porte d'arrivée ; quand la bourre finale atterrissait derrière la boule hors couloir, le serveur déclarait « collision foule » sur un tour légitime (les 203/205 de Yo, rejetés trois fois). Un `break` à la détection d'arrivée rétablit le miroir exact avec le client (qui s'arrête à l'arrivée). Testé : tour 204,1ms dont le dernier événement traverse la porte et atterrit 85px derrière dans la foule → accepté. Leçon générale consignée : **le rejeu serveur doit s'arrêter exactement là où le client s'arrête** — toute divergence de parcours devient un faux rejet.
5duodecies. **v20 + boîte noire** : Edge Function v8 archive chaque rejet dans **`turbo_rejects`** (motif + client_ms + trace complète, RLS sans policy publique — service_role uniquement) : le diagnostic devient déterministe. Premier verdict de la boîte noire : elle était VIDE — les scores perdus « une fois sur deux » ne partaient jamais, jetés par le pré-filtre client `MIN_PLAY_MS=800` (preuve : les sauvegardes réussies avaient des play_time de 822/874/904/960/994ms, distribution en falaise juste au-dessus du seuil — les relances arcade rapides passaient dessous). Seuil supprimé en v20 (le serveur rejoue la trace, c'est lui le juge ; play_time reste envoyé pour audit). Leçon : chaque rejet silencieux côté client est un bug en puissance — préférer laisser le serveur décider et afficher le refus.
5terdecies. **v21-v22 — le jeu devient la Finale Mondiale 2025** : contexte réel — la finale des Championnats du Monde Inutiles 2025 (tour de la vraie Corvette) n'a jamais pu être courue pendant la fête (trop de monde, débordement) ; ce jeu en ligne couronne donc le **Champion du Monde 2025**, remise du titre le 8 août 2026. v21 : rang global affiché après CHAQUE tour bouclé (« 47e TEMPS », requête count sur time_ms<lt), y compris sur l'écran résultat top 10 ; audio adouci pour la durée (master 0.38, kick 0.44, charley en contretemps, coup de gaz aléatoire toutes les 18-30s) ; **crabes explosifs** : impact > 1500px/s → les crabes dans un rayon de 45px partent en gibs pixel (gravité+fondu, `sfxSplat`), résurrection au reset. v22 : Hall of Fame → **podium or/argent/bronze** (3 lignes médaille) + **LANTERNE ROUGE** (le temps le plus nul, affiché avec son rang total) ; textes reformulés autour du titre mondial (1er = titre + open bar, top 10 = boisson — la cérémonie/insta reste gated top 10). Compteur « X PARTIES JOUÉES » inchangé.
5quaterdecies. **v23 — la gloire, rien que la gloire** : plus aucun lot (« AUCUN LOT. JUSTE LA GLOIRE ÉTERNELLE. ») — seul le titre de Champion du Monde 2025 (et la Lanterne Rouge) sont en jeu. **Bandeau bas lisible** : #hudMsg a maintenant un fond sombre (.86) pleine largeur avec filet, police agrandie — fini le texte noyé dans les crabes. **Lanterne rouge célébrée** : au podium (cadre rouge lumineux + « TITRE HONORIFIQUE DU TOUR LE PLUS LENT ») et en jeu — boucler le PIRE temps du championnat déclenche « DERNIER MONDIAL · ★ LANTERNE ROUGE ! ★ » en or + confettis. **Tours marathon autorisés** : MAX_TIME 3min→**6h** (client + Edge Function v9 + contrainte CHECK), pauses de doigt jusqu'à 10min tolérées entre événements (MAX_DT=600000 — doigt immobile = pas d'événements tactiles). Un temps de plusieurs heures s'affiche en secondes brutes (ex. « 7200.0000 ») — jugé dans le ton. Nouveau commentaire au-delà de 2min : « LA LANTERNE ROUGE SE MÉRITE. RESPECT ÉTERNEL. »
5quindecies. **v24 — 30 jours de course** : MAX_TIME porté à **2 592 000 000 ms (30 jours)** partout (client V24, Edge Function v10, contrainte CHECK), MAX_DT aligné. La règle sacrée reste inchangée et déjà appliquée : **le doigt doit rester collé à l'écran** du départ à l'arrivée — `touchend`, `touchcancel` (verrouillage d'écran, appel entrant, notification qui vole le focus) = partie ratée, sans exception. Le tour doit être bouclé pour compter. Réalité matérielle non arbitrée par le code : batterie, écran toujours allumé, crampes — c'est entre le candidat à la Lanterne Rouge et son destin.
5sexdecies. **v25 — score persistant** : le bandeau bas est désormais rendu par `renderHud()` en deux lignes — **ligne or persistante** (`lastResult`, police clamp(9px,2.4vw,14px)) affichant le dernier tour bouclé + son rang, et la consigne courante en dessous (`setHud(instr,cls)`). La ligne or survit à `resetRun` et reste affichée pendant les parties suivantes ; elle n'est remplacée que par le PROCHAIN tour bouclé (les morts n'y touchent pas). Le rang arrive en asynchrone et se greffe à la ligne dès réception. Police du podium agrandie aussi (clamp(7px,2vw,11px)). Tous les anciens écrits directs `hudMsg.textContent/className` migrés vers `setHud` — zéro chemin d'effacement restant.
6. **v10 graphique installée** (même jour, plus tard) : la foule de spectateurs devient **~380 crabes** en sprites pré-rendus (`buildCrabSprites`), **nouvelle Corvette** en grille 80×40 à `GP=2` (160×80 px), **16:9 tranché** (bug #8 clos). La collision est réécrite : plus de `inCar`/`inSpec` O(150), mais un champ elliptique normalisé `ellipseF(x,y)` avec bande jouable `F_IN`/`F_OUT` en O(1) (bug #5 clos). Mute intégré différemment (`♪` transparent, coin bas-droit) + persistance `localStorage['td_mute']` ajoutée. Les §3 (cadre), §5 (Corvette 18×24), §6 (géométrie) et §7 (conditions d'échec) du dossier sont **obsolètes dans le détail** — la logique de l'accumulateur d'angle (§7) reste identique. Récompenses affichées au menu : top 10 = boisson, 1er = open bar.

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
