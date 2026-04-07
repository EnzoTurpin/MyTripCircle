# TODO — MyTripCircle

## 🔴 Blocages App Store (rejet garanti si non corrigés)

- [ ] **Désactiver `NSAllowsArbitraryLoads`** dans `app.json` (section `ios.infoPlist`) et `ios/MyTripCircle/Info.plist` — l'API est déjà en HTTPS, cette option n'est pas nécessaire et sera rejetée par Apple
- [ ] **Implémenter la validation server-side des reçus IAP** — le TODO dans `src/screens/SubscriptionScreen.tsx` doit être résolu avant soumission, Apple exige que les reçus soient validés côté serveur via leur API
- [ ] **Compléter `ios/MyTripCircle/PrivacyInfo.xcprivacy`** — déclarer les données personnelles collectées (email, localisation, données de voyage) dans `NSPrivacyCollectedDataTypes`, obligatoire depuis iOS 17
- [ ] **Configurer `eas.json`** avec les credentials Apple (Apple ID, `ascAppId` depuis App Store Connect, Team ID `9CV49WRKBK`) pour pouvoir soumettre via EAS

## 🟠 Problèmes importants (risque de rejet)

- [ ] **Ajouter `buildNumber`** dans `app.json` sous la clé `ios` (ex: `"buildNumber": "1"`) — requis pour chaque build iOS
- [ ] **Remplacer les icônes** par des versions 1024x1024px minimum — les assets actuels sont en 500x500, la qualité sera dégradée sur l'App Store et dans le back-office App Store Connect
- [ ] **Résoudre le TODO des Client IDs** dans `src/screens/AuthScreen.tsx` — remplacer les IDs hardcodés par des variables d'environnement correctement configurées
- [ ] **Aligner `MARKETING_VERSION`** dans Xcode avec la version dans `app.json` (`1.0.0` vs `1.0`)

## 🟡 Améliorations recommandées

- [ ] **Mettre en place le skeleton loading** sur les écrans qui chargent des données distantes :
  - `src/screens/TripsScreen.tsx` — liste des voyages
  - `src/screens/TripDetailsScreen.tsx` — détail d'un voyage
  - `src/screens/BookingsScreen.tsx` — liste des réservations
  - `src/screens/FriendsScreen.tsx` — liste des amis
  - `src/screens/NotificationsScreen.tsx` — notifications
  - Créer un composant générique `src/components/SkeletonLoader.tsx` réutilisable
- [ ] **Rendre les descriptions de permissions plus précises** dans `Info.plist` — remplacer les descriptions génériques `$(PRODUCT_NAME)` par des phrases explicites (ex: "MyTripCircle utilise la caméra pour scanner vos billets")
- [ ] **Nettoyer les `console.log`** — 137 occurrences trouvées dans le code source, à remplacer par un logger centralisé ou supprimer avant la release
- [ ] **Vérifier l'accessibilité de la politique de confidentialité** — s'assurer que l'URL `privacy@mytripcircle.com` et les pages légales sont accessibles depuis l'extérieur de l'app (Apple vérifie manuellement)
