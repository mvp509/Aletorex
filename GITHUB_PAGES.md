# 🌐 Déploiement sur GitHub Pages

Le fichier **`index.html`** est bien présent à la racine du dépôt, et la configuration Vite a été optimisée (`base: './'`) pour assurer un chargement sans erreur sur GitHub Pages (y compris avec les sous-chemins du type `https://<pseudo>.github.io/<nom-du-depot>/`).

---

## 🚀 Méthode 1 : Déploiement Automatique via GitHub Actions (Recommandé)

Un workflow d'automatisation a été ajouté dans **`.github/workflows/deploy.yml`**.

### Activer GitHub Pages sur votre dépôt :
1. Rendez-vous sur votre dépôt GitHub.
2. Allez dans **Settings** (Paramètres) > **Pages** (dans le menu de gauche).
3. Dans la section **Build and deployment** :
   - Sous **Source**, sélectionnez **GitHub Actions**.
4. Dès que vous poussez (`git push`) sur la branche `main` ou `master`, le site sera automatiquement compilé et mis en ligne.

---

## 🛠️ Méthode 2 : Déploiement Manuel (via branche `gh-pages`)

Si vous préférez compiler localement et publier le dossier `dist/` :

```bash
# 1. Compiler le projet
npm run build

# 2. Utiliser gh-pages (ou pousser le contenu de dist/ sur la branche gh-pages)
npx gh-pages -d dist
```

Dans GitHub **Settings** > **Pages**, choisissez alors la branche `gh-pages` et le dossier `/ (root)`.
