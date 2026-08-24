# 📱 Guide de Génération de l'Application Mobile (Ionic & Capacitor / Appflow)

Le projet intègre désormais directement le dossier natif **`android/`** ainsi que l'exécutable **`gradlew`** à la racine et dans `android/`, prêt pour **Ionic Appflow**, **Android Studio** et les pipelines CI/CD.

---

## 🚀 Structure Android disponible dans le dépôt :
- **`/android`** : Projet Android complet natif Capacitor (avec `android/gradlew`, `app/build.gradle`, etc.)
- **`./gradlew`** & **`./gradlew.bat`** : Scripts relais à la racine permettant l'exécution directe depuis la racine du dépôt pour les runners Ionic Appflow.
- **`capacitor.config.ts`** & **`ionic.config.json`** : Configurations officielles prêtes pour la synchronisation.

---

## ⚙️ Commandes de Build

### Synchroniser et compiler avec Capacitor / Appflow :
```bash
# 1. Compiler le code web React/Vite
npm run build

# 2. Synchroniser les assets web dans le projet Android
npm run cap:sync

# 3. Compiler l'APK Android en Debug
./gradlew assembleDebug
# ou depuis le dossier android/ :
cd android && ./gradlew assembleDebug

# Pour l'APK Release :
./gradlew assembleRelease
```

---

## 📦 Emplacement de l'APK généré :
`android/app/build/outputs/apk/debug/app-debug.apk` ou `android/app/build/outputs/apk/release/app-release.apk`

