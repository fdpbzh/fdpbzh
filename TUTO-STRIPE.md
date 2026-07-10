# 🛒 Tuto Stripe — vendre les t-shirts FDP en précommande

Objectif : encaisser les précommandes du t-shirt (22 €) directement depuis la page **Boutique**, sans code, avec le choix **couleur + taille** et deux modes : **retrait sur place** ou **livraison**.

On va créer **deux « liens de paiement » Stripe** (un par mode) et les coller dans le site. Compte ~15–20 min.

---

## Étape 1 — Créer le compte

1. Va sur **[stripe.com](https://stripe.com)** → **Créer un compte** (« Sign up »).
2. Email + mot de passe, puis valide l'email.
3. Choisis le pays : **France**.

> 💡 Utilise l'adresse mail de l'asso (`lassoduport@gmail.com`) pour tout centraliser.

---

## Étape 2 — Activer le compte (pour recevoir l'argent)

Dans le tableau de bord, Stripe te demande d'**activer les paiements** :

1. Type de structure : **Association / à but non lucratif**.
2. Renseigne les infos demandées (nom de l'asso, adresse, représentant légal, SIRET si tu l'as).
3. Ajoute l'**IBAN de l'asso** → c'est là que Stripe versera l'argent des ventes (virements automatiques).

> ⚠️ Tu peux tout préparer et **tester** sans avoir fini l'activation, mais pour encaisser en **réel** il faut que le compte soit activé.

---

## Étape 3 — Créer le produit

1. Menu de gauche : **Catalogue de produits** (« Product catalog ») → **+ Ajouter un produit**.
2. Nom : **T-shirt FDP 2026**
3. Description (optionnel) : *Coton recyclé 180 g/m², sérigraphie, édition limitée — précommande.*
4. Image (optionnel) : tu peux uploader une photo du t-shirt.
5. Tarif : **22,00 € EUR**, type **Montant forfaitaire / paiement unique** (« One-off »).
6. **Enregistrer le produit**.

---

## Étape 4 — Lien de paiement n°1 : « RETRAIT SUR PLACE »

1. Menu **Liens de paiement** (« Payment links ») → **+ Nouveau lien**.
2. Sélectionne le produit **T-shirt FDP 2026** (22 €).
3. Coche **« Permettre aux clients d'ajuster la quantité »** (au cas où quelqu'un en prend 2).
4. Ouvre **« Options »** / **« Collecter des informations supplémentaires »** → **Champs personnalisés** (« Custom fields ») et ajoute **2 champs** :

   **Champ 1 — Couleur**
   - Type : **Menu déroulant** (« Dropdown »)
   - Libellé : `Couleur`
   - Options : `Noir`, `Anthracite`, `Lavande`, `Beige`, `Blanc crème`, `Jaune clair`, `Rose pâle`, `Vert pâle`
   - ☑ Obligatoire

   **Champ 2 — Taille**
   - Type : **Menu déroulant**
   - Libellé : `Taille`
   - Options : `XXS`, `XS`, `S`, `M`, `L`, `XL`, `XXL`
   - ☑ Obligatoire

5. **Adresse** : **ne rien collecter** (c'est du retrait sur place).
6. (Optionnel) **Après le paiement** → message de confirmation :
   > *Merci ! Ton t-shirt sera à récupérer le 8 août à la Fête du Port, à Pors-Poulhan. 🎉*
7. **Créer le lien**, puis **copier l'URL** (elle ressemble à `https://buy.stripe.com/xxxxxxxx`).

👉 C'est ton **lien « retrait »**.

---

## Étape 5 — Lien de paiement n°2 : « LIVRAISON »

Recommence un **nouveau lien**, identique, avec deux différences :

1. Même produit (22 €) + **mêmes 2 champs** Couleur et Taille.
2. Active **« Collecter l'adresse de livraison »** (« Collect shipping address ») → sélectionne **France** (et les autres pays si tu veux).
3. Ajoute des **frais de port** : dans les options de livraison, ajoute une **option d'expédition** avec un montant fixe, par ex. **5,00 €** (« Envoi France »).
   - Si Stripe te demande de créer un « tarif d'expédition » (« shipping rate ») : nom = `Envoi France`, montant = `5,00 €`, puis sélectionne-le.
4. (Optionnel) Message après paiement :
   > *Merci ! Ton t-shirt te sera envoyé après la fête. 📦*
5. **Créer le lien**, puis **copier l'URL**.

👉 C'est ton **lien « livraison »**.

---

## Étape 6 — Brancher les liens sur le site

Deux options :

- **Le plus simple :** colle-moi les deux liens ici (chat), je les mets en place dans `boutique.html`.
- **Toi-même :** ouvre `refonte-v2/boutique.html`, et remplace :
  - `https://buy.stripe.com/VOTRE_LIEN_RETRAIT` → ton **lien retrait**
  - `https://buy.stripe.com/VOTRE_LIEN_LIVRAISON` → ton **lien livraison**
  Puis **Commit → Push** dans GitHub Desktop.

---

## Étape 7 — Tester AVANT d'ouvrir les ventes

1. En haut du tableau de bord, il y a un interrupteur **« Mode test »**. En mode test, tu peux tout essayer sans vrai paiement.
2. Carte de test : **4242 4242 4242 4242**, date d'expiration future (ex. 12/34), CVC au hasard (ex. 123).
3. Fais une commande test et vérifie que **la couleur, la taille** (et l'adresse pour la livraison) apparaissent bien dans le paiement reçu.

> ⚠️ **Important :** les liens créés en **mode test** ne marchent **pas** en réel. Une fois les tests OK, repasse en **mode réel** (« Live »), **recrée les 2 liens** en mode réel, et colle **ces** liens-là dans le site.

---

## Étape 8 — Suivre les commandes

> ℹ️ **Important — la couleur et la taille sont choisies sur le site, pas sur Stripe.**
> Sur la page Boutique, le client sélectionne d'abord son coloris puis sa taille (seules les tailles encore en stock sont cliquables). Ce choix est transmis à Stripe dans le champ **« ID de référence client » (client_reference_id)**, sous la forme `Couleur-Taille` (ex. `Noir-M`, `Vert-XL`). Les menus déroulants Couleur/Taille ont été **retirés** des liens Stripe pour éviter qu'on puisse commander une taille épuisée.

- **Paiements** → ouvre une commande : tu y vois le client, le montant, l'**ID de référence client** (= `Couleur-Taille`) et l'**adresse** (si livraison).
- Pour l'afficher en colonne dans la liste : bouton **Colonnes** → coche **« ID de référence client »**. Idéal pour préparer les t-shirts d'un coup d'œil.
- Tu peux **exporter en CSV** (la colonne `client_reference_id` contient le `Couleur-Taille`) pour cocher tes commandes.
- Stripe envoie automatiquement un **reçu par email** au client.
- **Stock :** quand une taille/couleur est épuisée, dis-le-moi (ou modifie le tableau `STOCK` en bas de `boutique.html`) : elle devient barrée et non sélectionnable sur le site.

---

## Bon à savoir

- **Commission Stripe** : environ **1,5 % + 0,25 €** par paiement (carte européenne). Sur 22 € ≈ **0,58 €**. L'asso reçoit ~21,40 € par t-shirt (retrait).
- **Stock** : Stripe ne bloque pas les quantités par couleur/taille. Surveille tes ventes ; quand une taille/couleur est épuisée, dis-le-moi (je la barre sur la page) ou modifie le petit tableau `STOCK` en bas de `boutique.html`.
- **Remboursement** : possible en 1 clic depuis le paiement concerné.
- **Clôturer les précommandes** : quand tu veux arrêter, tu peux **désactiver** les liens de paiement dans Stripe (ils deviennent inaccessibles).

---

*Besoin d'aide sur une étape ? Envoie-moi une capture d'écran de l'endroit où tu bloques, je te guide.*
