# FDP — Fête du Port · fdp.bzh

Site web officiel de la Fête du Port, à Pors-Poulhan.
Statique, sans build, prêt à déployer sur **GitHub Pages**.

## 📁 Structure

```
Site Web fdp/
├── index.html          → Accueil (avec compte à rebours vers le 8/8/2026)
├── asso.html           → L'asso du Port
├── programme.html      → Concerts + championnats inutiles + horaires
├── infos.html          → Accès, parking, restauration, FAQ
├── jeu.html            → Le Moule Launcher (intégré en iframe)
├── boutique.html       → Boutique « bientôt disponible »
├── contact.html        → Email + Insta + bénévolat
├── 404.html            → Page non trouvée
├── assets/
│   ├── style.css       → Charte graphique (couleurs de l'affiche)
│   ├── script.js       → Menu mobile + countdown
│   ├── moule-launcher.html  → Le jeu (autonome)
│   └── affiche.jpg     → ⚠ À AJOUTER MANUELLEMENT (voir ci-dessous)
├── CNAME               → fdp.bzh (pour GitHub Pages)
├── .nojekyll           → Désactive Jekyll sur GitHub Pages
├── robots.txt          → SEO
└── sitemap.xml         → SEO
```

## 🖼️ Affiche

L'affiche `Affiche VFestival2.png` est utilisée telle quelle à la racine.
Si tu veux ranger les choses, tu peux :

- la déplacer dans `assets/affiche.png` (le code la trouvera automatiquement
  grâce au fallback `onerror`)
- supprimer ensuite la copie à la racine

Le PDF original (`Affiche VFestival2.pdf`) et le fichier `moule-launcher-v2.html`
qui sont à la racine peuvent aussi être supprimés — ils ne sont plus utilisés
par le site (le jeu est dans `assets/moule-launcher.html`). Mais ça ne casse
rien si tu les laisses.

## 👀 Prévisualiser localement

Double-clique simplement sur `index.html` — le site s'ouvre dans ton navigateur.

Pour tester le Moule Launcher (qui est en iframe), il vaut mieux servir le site
via un mini serveur local :

```bash
# Si tu as Python installé :
python3 -m http.server 8000

# Puis va sur http://localhost:8000
```

## 🚀 Déployer sur GitHub Pages

Voir le fichier **`DEPLOIEMENT.md`** pour la procédure pas-à-pas.

## ✏️ Modifier le contenu

Tout est en HTML pur — pas de framework, pas de build. Pour changer un texte :
ouvre le fichier `.html` correspondant dans n'importe quel éditeur (Notepad,
TextEdit, VS Code…) et modifie. Sauvegarde → push sur GitHub → le site se met
à jour en 1-2 minutes.

## 🎨 Couleurs

Définies dans `assets/style.css` (variables CSS au début du fichier) — facile
à changer en un endroit pour tout repeindre.

| Variable | Couleur | Usage |
|---|---|---|
| `--bg-deep` | `#14093C` | Fond principal (nuit) |
| `--yellow` | `#FFC93C` | FDP, titres, boutons primaires |
| `--orange` | `#FF8E3C` | Coucher de soleil, ombres titres |
| `--purple-bright` | `#B5A5F0` | Accents lavande |
| `--cream` | `#FFF5E1` | Texte clair |

---

Fait avec 💜 pour l'asso du Port — Pors-Poulhan, Bretagne.
