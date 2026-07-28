# Turbo Disco — Mémo de reprise (état au 27/07/2026)

Résumé compact et autonome. Pour l'historique détaillé, voir `../DOSSIER-REPRISE-turbo-disco.md`.

## Le projet
Jeu web mobile pour la **Fête du Port** (Pors-Poulhan, 8 août 2026). Épreuve officielle du
« Championnat du Monde Inutile » : **tracer au doigt le tour d'une Corvette C2 rouge le plus vite possible**.
Le meilleur temps avant le 8 août est sacré Champion du Monde 2025. Portrait, pixel-art, palette violette.

**Utilisateur : Yo** — photographe/vidéaste, code en autodidacte. Veut des retours **directs en français**
et des **fichiers prêts à l'emploi**. Il pousse lui-même via **GitHub Desktop** (l'assistant ne peut pas
faire de git, ni rendre le canvas → tester sur mobile).

## Fichiers & URL
Dossier : `Site Web fdp/fdpbzh/turbo-disco/` → **URL publique `fdp.bzh/turbo-disco/`**
- `index.html` — accueil immersif (titre DK, crabes avec profondeur, easter egg sponsor Le Corre, lien « ‹ fdp.bzh »)
- `pseudo.html` — saisie du pseudo (localStorage `td_name`)
- `jeu.html` — LE jeu (mécanique ligne d'arrivée). Flux : index → pseudo → `jeu.html?go=1`
- `jeu-v2.html` — ancien fork de test (peut être supprimé) · `stats.html` — page stats
- `og.png` (image de partage) · `manifest.webmanifest` (PWA plein écran)

Ancien `fdpbzh/turbo-disco.html` = **redirection** vers `/turbo-disco/` (préserve QR/liens partagés).
Liens depuis le site : carte sur `jeux.html`, encart sur `championnats.html`, `sitemap.xml` à jour.

## Supabase (projet `nhsroymqvwrjflagzznz`, « fdp-scores »)
- Publishable key : `sb_publishable_UH528FgC5FVbxNFYi9Odlg_jcPZuK4J`
- Tables : `turbo_scores` (officiel : time_ms numeric, insta, session_id), `turbo_plays` (compteur),
  `turbo_rejects` (boîte noire des rejets), `turbo_scores_v2` (test).
- Edge Functions : **`submit-score` v16** = mécanique LIGNE, `TH=0.7`, rejeu anti-triche, écrit `turbo_scores`.
  `submit-score-v2` = version test (TH=0 → `turbo_scores_v2`).
- **Compteur + scores ont été remis à zéro.**

## Mécanique & anti-triche
Départ : doigt posé **sur la piste** (`inCouloir`). Franchir la **ligne d'arrivée** (intersection segment `segX`)
lance le chrono ; un **tour complet** (`|acc|>=1.9π`) ; re-franchir la ligne = fin. Chrono interpolé au **1/10 ms**.
Anti-triche : le serveur **rejoue** la trace `[x,y,t]` avec un code **identique au client** (collisions voiture/crabes,
angle, franchissements, vitesse glissante `MAX_SPEED=10000`). Client/serveur DOIVENT rester synchrones.

Constantes : `W400 H710 CX200 CY355 RX90 RY160`, `F_IN0.72 F_OUT1.26`, ligne `SB_TH=0.7`.
Polices : **DK Longreach** (base64 inline) n'a **pas les chiffres 4 et 5** → **Bungee** pour TOUS les nombres.
Sécurité base : RLS select + update(insta) seulement ; INSERT via service_role ; anon delete/etc. révoqués.

## Fait récemment (cette session)
- HUD : boutons son retirés (musique conservée), jauge « TOUR % » retirée, **barre haute** (chrono + record)
  lisible sur fond de crabes, consigne « POSE TON DOIGT SUR LA PISTE », bouton Partager → écran-titre `/turbo-disco/`.
- Accueil : **15 crabes** avec **profondeur** (taille selon y), passage **devant/derrière** la voiture calculé par
  les pieds, **rebond (demi-tour)** au contact de la voiture et du panneau bois. Sponsor : « a bâti **et offert** la scène ».
- Scores : titre « Finale Championnat du Monde 2025 », « Lanterne Rouge » centrée.
- Intégration site : `og.png` + balises OG/Twitter, manifest PWA, meta/`viewport-fit=cover`, zones sûres iPhone,
  anti pull-to-refresh, lien retour, sitemap.
- **Écran « Lanterne Rouge »** (`#sLantern`) : célèbre le tour le plus lent du championnat
  (`rank===total && total>3`, donc à partir de >10 scores) et **collecte l'insta** (lot de consolation éventuel).

## À tester / pistes ouvertes
- Tester **sur mobile** après chaque push (canvas non rendu ici ; sandbox sans accès réseau Supabase → rejeu testé en local).
- Réglages possibles en 1 ligne : `CAR_BASE_Y` (538) et bandes de rebond des crabes ; `SB_TH` (doit rester = serveur).
- Option : remplacer l'aperçu iframe de `jeux.html` par une image fixe ; vraie capture d'écran pour `og.png` ;
  supprimer `jeu-v2.html`.

## Déploiement
GitHub Desktop → tout cocher → Commit to main → Push origin → attendre ~1 min (GitHub Pages) → tester `fdp.bzh/turbo-disco/`.
