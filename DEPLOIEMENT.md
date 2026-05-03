# 🚀 Déployer fdp.bzh sur GitHub Pages

Guide pas-à-pas pour mettre en ligne le site sur l'URL `https://fdp.bzh`.
Compte 30–45 minutes la première fois (compris la propagation DNS).

---

## Étape 1 — Créer un compte GitHub (si pas déjà fait)

1. Va sur [github.com](https://github.com)
2. Clique sur **Sign up** et crée un compte gratuit
3. Vérifie ton email

> 💡 Astuce : utilise un nom de compte qui colle à l'asso, par exemple
> `lassoduport` ou `fdp-bzh`. C'est purement esthétique, mais ça fait pro.

---

## Étape 2 — Créer le dépôt (repo)

1. Une fois connecté, clique sur le **+** en haut à droite → **New repository**
2. Remplis :
   - **Repository name** : `fdp-bzh` (ou ce que tu veux)
   - **Description** : "Site officiel de la Fête du Port"
   - **Public** ✅ (obligatoire pour GitHub Pages gratuit)
   - **NE COCHE PAS** « Add a README file » (on en a déjà un)
3. Clique sur **Create repository**

GitHub t'affiche maintenant une page avec des commandes — laisse-la ouverte.

---

## Étape 3 — Pousser tes fichiers sur GitHub

### Option A — Avec GitHub Desktop (le plus simple, sans terminal)

1. Télécharge [GitHub Desktop](https://desktop.github.com/) et installe-le
2. Connecte-toi avec ton compte GitHub
3. Menu **File → Add local repository** → sélectionne le dossier
   `Site Web fdp` (le dossier où sont tous les fichiers)
4. Si GitHub Desktop dit "this isn't a Git repository", clique sur
   **create a repository** (proposé dans le message)
5. Premier commit : remplis « Summary » avec `Mise en ligne initiale`,
   puis clique **Commit to main**
6. Clique **Publish repository** en haut à droite
7. Sélectionne le repo `fdp-bzh` que tu as créé à l'étape 2,
   décoche « Keep this code private », et **Publish**

### Option B — Avec le terminal (si tu as Git installé)

Ouvre un terminal dans le dossier `Site Web fdp` :

```bash
git init
git add .
git commit -m "Mise en ligne initiale"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/fdp-bzh.git
git push -u origin main
```

(remplace `TON_USERNAME` par ton pseudo GitHub)

---

## Étape 4 — Activer GitHub Pages

1. Sur la page de ton repo (`https://github.com/TON_USERNAME/fdp-bzh`),
   clique sur **Settings** (⚙️ en haut à droite)
2. Dans le menu de gauche, clique sur **Pages**
3. Sous **Build and deployment** :
   - **Source** : `Deploy from a branch`
   - **Branch** : `main` · `/ (root)`
   - Clique **Save**
4. Patiente ~1 minute. Recharge la page.
5. Sous « Custom domain », entre **`fdp.bzh`** et clique **Save**

GitHub vérifie le domaine et te montre les enregistrements DNS à configurer.

---

## Étape 5 — Configurer le DNS chez ton registrar

Va sur le site où tu as acheté **fdp.bzh** (OVH, Gandi, Infomaniak…) et
trouve la section **Zone DNS** ou **DNS Management**.

Tu dois créer **4 enregistrements de type A** et **1 enregistrement CNAME**.
Ce sont les adresses IP de GitHub Pages, identiques pour tout le monde.

### Enregistrements A (pour `fdp.bzh` sans www)

| Type | Nom / Sous-domaine | Valeur |
|------|---------------------|----------------|
| A | `@` (ou vide) | `185.199.108.153` |
| A | `@` (ou vide) | `185.199.109.153` |
| A | `@` (ou vide) | `185.199.110.153` |
| A | `@` (ou vide) | `185.199.111.153` |

### Enregistrement CNAME (pour `www.fdp.bzh`)

| Type | Nom / Sous-domaine | Valeur |
|------|---------------------|----------------------|
| CNAME | `www` | `TON_USERNAME.github.io.` |

(remplace `TON_USERNAME` par ton pseudo GitHub, et garde le **point final** si
ton registrar le demande)

> 💡 Si tu vois déjà des enregistrements existants pour `@` ou `www`,
> supprime-les avant d'ajouter les nouveaux — ils peuvent entrer en conflit.

### Spécificités selon registrar

- **OVH** : Espace client → Domaines → fdp.bzh → Zone DNS → "Ajouter une entrée"
- **Gandi** : Domaines → fdp.bzh → Enregistrements DNS → "Ajouter"
- **Infomaniak** : Manager → Mes domaines → fdp.bzh → Zone DNS

---

## Étape 6 — Patienter et activer HTTPS

1. La propagation DNS prend de **15 minutes à 24h** (souvent ~1h).
2. Reviens sur GitHub : **Settings → Pages**.
3. Une fois que GitHub a vérifié ton domaine, **coche la case
   « Enforce HTTPS »** (très important pour la sécurité).

🎉 **Ton site est en ligne sur https://fdp.bzh !**

---

## ✏️ Mettre à jour le site plus tard

Quand tu modifies un fichier :

### Avec GitHub Desktop
1. Ouvre l'app, vois les modifs en bas à gauche
2. Écris un petit message (ex. "Maj programme") puis **Commit to main**
3. Clique **Push origin** en haut

### Avec le terminal
```bash
git add .
git commit -m "Maj du programme"
git push
```

Le site se met à jour automatiquement en 1-2 minutes.

---

## 🆘 Problèmes courants

**« Domain not properly configured »** sur GitHub
→ Les DNS ne sont pas encore propagés. Patiente, ou vérifie tes enregistrements
A avec `dig fdp.bzh +short` (terminal Mac/Linux) ou
[whatsmydns.net](https://www.whatsmydns.net/?q=fdp.bzh&t=A).

**Le site s'affiche en HTTP mais pas en HTTPS**
→ La case « Enforce HTTPS » n'est pas encore disponible. GitHub a besoin de
~24h pour générer le certificat. Patiente puis reviens cocher la case.

**Le Moule Launcher ne se charge pas**
→ Vérifie que `assets/moule-launcher.html` est bien dans le dossier `assets/`
et que tu l'as poussé sur GitHub.

**L'affiche ne s'affiche pas**
→ Tu n'as pas encore ajouté `assets/affiche.jpg`. Voir le README.md.

**404 partout**
→ Vérifie qu'il n'y a pas de `/fdp-bzh/` dans les URL (c'est le nom du repo).
Avec le fichier CNAME présent, GitHub doit servir depuis la racine `fdp.bzh/`.

---

## 📞 Aide

Si tu te bloques, tu peux toujours me redemander en cours de session — je peux
te guider étape par étape, ou même te montrer chaque écran si besoin.
