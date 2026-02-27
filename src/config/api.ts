// Configuration API pour React Native/Expo
// Utilise les variables d'environnement du .env

const isDevelopment = __DEV__;

// Pour le simulateur iOS/Android : utiliser EXPO_PUBLIC_API_BASE_URL=http://localhost:4000 dans .env
// (localhost depuis le simulateur = votre Mac)
const EXPLICIT_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// IP depuis .env (pour appareil physique sur le réseau)
const API_IP_PRIMARY = process.env.API_IP_PRIMARY || "192.168.61.97";

// URLs à essayer dans l'ordre de priorité
const API_URLS = [
  ...(EXPLICIT_BASE_URL ? [EXPLICIT_BASE_URL] : []),
  `http://${API_IP_PRIMARY}:4000`,
].filter(Boolean) as string[];

const DEFAULT_DEV_URL = EXPLICIT_BASE_URL || `http://${API_IP_PRIMARY}:4000`;

// URL de base utilisée par l'app
const API_BASE_URL = isDevelopment
  ? DEFAULT_DEV_URL
  : (process.env.EXPO_PUBLIC_API_BASE_URL ||
      process.env.API_BASE_URL ||
      "https://your-production-api.com");

export { API_URLS, API_BASE_URL };
