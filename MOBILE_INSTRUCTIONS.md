# 📱 Guide de Génération de l'Application Mobile (Ionic & Capacitor)

## ❓ Pourquoi l'erreur "gradlew est introuvable" apparaissait-elle ?
Dans un projet Web / React / Vite, le dossier Android et le fichier `gradlew` (Gradle Wrapper) ne sont pas présents par défaut dans la racine web.  
Ils sont **générés automatiquement** dès que vous initialisez la plateforme Android avec Capacitor / Ionic (`npx cap add android`).

---

## 🚀 Étapes pour générer et compiler l'application Mobile (Android & iOS)

### 1. Prérequis sur votre machine
- **Node.js** (v18 ou v20+)
- **Android Studio** (avec Android SDK et Java JDK 17 ou 21) pour Android
- **Xcode** (sur macOS uniquement) pour iOS

---

### 2. Initialisation des plateformes natives (À faire une seule fois)

Dans le terminal de votre projet :

```bash
# 1. Compiler les fichiers web vers le dossier /dist
npm run build

# 2. Créer le dossier natif Android (qui va créer 'android/' et le fameux 'gradlew')
npm run cap:add:android

# (Optionnel pour iOS sur Mac)
npm run cap:add:ios
```

---

### 3. Synchronisation & Lancement dans Android Studio

Chaque fois que vous modifiez le code du jeu :

```bash
# Compiler le web et synchroniser les assets vers Android
npm run cap:build

# Ouvrir directement le projet dans Android Studio :
npx cap open android
```

---

### 4. Compiler l'APK ou le Bundle avec Gradle (dans Android Studio ou Terminal)

Une fois le dossier `android/` généré :

```bash
# Se rendre dans le dossier Android
cd android

# Compiler l'APK de Debug (le fichier gradlew est maintenant présent !)
./gradlew assembleDebug

# Ou sous Windows PowerShell :
.\gradlew.bat assembleDebug

# Pour l'APK de Release :
./gradlew assembleRelease
```
L'APK généré se trouvera dans :  
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## ⚙️ Configuration du projet
- **ID de l'application** : `com.aletorex.app`
- **Nom de l'application** : `ALETOREX`
- **Dossier web cible** : `dist`
- **Support Encoche / Écrans bord à bord** : Activé (`viewport-fit=cover`, `safe-area-inset`)
- **Plugins intégrés** : `@capacitor/status-bar`, `@capacitor/splash-screen`, `@capacitor/haptics`
