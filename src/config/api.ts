// Configuration API pour React Native/Expo
// Utilise les variables d'environnement du .env

const isDevelopment = __DEV__;

// IPs depuis .env (dans l'ordre de priorité)
// En Expo, process.env n'est pas disponible directement, on utilise une valeur par défaut
const API_IP_PRIMARY = process.env.API_IP_PRIMARY || "172.20.10.2";

// URLs à essayer dans l'ordre de priorité
const API_URLS = [
  `http://${API_IP_PRIMARY}:4000`, // IP primaire (Wi-Fi active)
];

// URL de production (si configurée)
const API_BASE_URL = isDevelopment
  ? API_URLS[0] // Utilise la première URL en développement
  : process.env.API_BASE_URL || "https://your-production-api.com";

export { API_URLS, API_BASE_URL };
