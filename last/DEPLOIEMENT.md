# Déployer LAST sur last.aemconseil.eu (GitHub Pages)

## 1. Créer le dépôt dédié
- github.com → New repository
- Nom : `last-aemconseil` · Visibilité : **Public** (obligatoire pour Pages + domaine perso sur compte gratuit)
- Create repository

## 2. Ajouter les fichiers
Déposer à la **racine** du dépôt :
- `index.html`  ← le fichier de l'app (contenu de `last/index.html`)
- `CNAME`       ← une seule ligne : `last.aemconseil.eu`

## 3. Activer GitHub Pages
Settings → Pages → Source : **Deploy from a branch** → Branch : `main` / dossier `/ (root)` → Save
Puis Custom domain : `last.aemconseil.eu` (lit le CNAME) → cocher **Enforce HTTPS**

## 4. DNS (chez le registrar de aemconseil.eu)
Un seul enregistrement :
```
Type   Nom   Valeur
CNAME  last  adileminyildiz-oss.github.io
```
(propagation : quelques minutes à ~1 h ; le certificat HTTPS s'active ensuite automatiquement)

## Mot de passe de connexion
Un mot de passe est demandé avant d'ouvrir l'outil. Seule son **empreinte SHA-256**
est stockée dans `index.html` (constante `LAST_PWD_HASH`) — le mot de passe n'apparaît
jamais en clair. Pour le changer : calculer l'empreinte du nouveau mot de passe
(`echo -n "MONMOTDEPASSE" | sha256sum`) et remplacer la valeur de `LAST_PWD_HASH`.
