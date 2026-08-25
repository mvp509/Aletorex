# 🌐 Déploiement d'Aletorex sur GitHub Pages

Le fichier **`index.html`** est situé à la racine du projet, et la configuration Vite est configurée avec **`base: '/Aletorex/'`** pour correspondre à l'URL GitHub Pages (`https://<pseudo>.github.io/Aletorex/`).

---

## 🚀 Déploiement Automatique via GitHub Actions

Le workflow d'automatisation se trouve dans **`.github/workflows/deploy.yml`**.

### 📋 Étapes détaillées pour activer le déploiement :
1. Rendez-vous sur votre dépôt GitHub (`https://github.com/<votre-pseudo>/Aletorex`).
2. Cliquez sur l'onglet **Settings** (Paramètres) en haut du dépôt.
3. Dans la barre latérale gauche (section *Code and automation*), cliquez sur **Pages**.
4. Dans la section **Build and deployment** :
   - Sous le menu déroulant **Source**, sélectionnez **GitHub Actions** (au lieu de *Deploy from a branch*).
5. Sauvegardez si nécessaire.
6. Poussez votre code (`git push origin main` ou `master`) ou allez dans l'onglet **Actions** pour lancer le workflow **Deploy to GitHub Pages** manuellement via le bouton *Run workflow*.
7. Une fois l'Action terminée (icône verte ✔️), votre application sera disponible sur :
   `https://<votre-pseudo>.github.io/Aletorex/`
