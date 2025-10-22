// Configuration API pour React Native/Expo
// Utilise les variables d'environnement du .env

const isDevelopment = __DEV__;

// IPs depuis .env (dans l'ordre de priorité)
const API_IP_PRIMARY = process.env.API_IP_PRIMARY || "172.20.10.4";
const API_IP_LOCALHOST = process.env.API_IP_LOCALHOST || "localhost";
const API_IP_127 = process.env.API_IP_127 || "127.0.0.1";
const API_IP_WIFI_ALT = process.env.API_IP_WIFI_ALT || "10.35.2.13";
const API_IP_ETHERNET = process.env.API_IP_ETHERNET || "192.168.56.1";
const API_IP_ANDROID = process.env.API_IP_ANDROID || "10.0.2.2";

// URLs à essayer dans l'ordre de priorité
const API_URLS = [
  `http://${API_IP_PRIMARY}:4000`, // IP primaire (Wi-Fi active)
  `http://${API_IP_LOCALHOST}:4000`, // localhost
  `http://${API_IP_127}:4000`, // 127.0.0.1
  `http://${API_IP_WIFI_ALT}:4000`, // IP Wi-Fi alternative
  `http://${API_IP_ETHERNET}:4000`, // IP Ethernet
  `http://${API_IP_ANDROID}:4000`, // IP pour simulateur Android
];

// URL de production (si configurée)
const API_BASE_URL = isDevelopment
  ? API_URLS[0] // Utilise la première URL en développement
  : process.env.API_BASE_URL || "https://your-production-api.com";

export { API_URLS, API_BASE_URL };
