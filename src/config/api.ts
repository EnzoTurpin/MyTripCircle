// Configuration API pour React Native/Expo
const PRODUCTION_API_URL = "https://mytripcircle-api.enzo-turpin.fr";

const API_BASE_URL = __DEV__
  ? `http://${process.env.API_IP_PRIMARY || "172.20.10.3"}:4000`
  : PRODUCTION_API_URL;

const API_URLS = [API_BASE_URL];

export { API_URLS, API_BASE_URL };
