import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { ApiService } from "../services/ApiService";
import * as secureStorage from "./secureStorage";
import { resources } from "./i18n/index";

export { formatDate, formatDateLong, formatTime } from "./dateFormatters";
export { parseApiError, getBookingStatusTranslation } from "./errorHandlers";

const LANGUAGE_KEY = "@mytripcircle_language";

export const changeLanguage = async (language: "en" | "fr") => {
  i18n.changeLanguage(language);
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } catch (e) {
    // Erreur de stockage non bloquante — la langue reste changée en mémoire
    if (__DEV__) console.warn("[i18n] Impossible de persister la langue :", e);
  }
  // Sync to server so emails are sent in the user's preferred language
  try {
    const token = await secureStorage.getItem("token");
    if (token) {
      await ApiService.updateLanguage(language);
    }
  } catch (e) {
    // Erreur de sync non bloquante — la préférence locale reste valide
    if (__DEV__) console.warn("[i18n] Impossible de synchroniser la langue :", e);
  }
};

export const getCurrentLanguage = () => i18n.language;

// Initialize language from persisted preference (call on app startup)
export const initLanguage = async () => {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (saved === "en" || saved === "fr") {
      i18n.changeLanguage(saved);
      // Sync the stored preference to the server for existing users who haven't yet
      const token = await secureStorage.getItem("token");
      if (token) {
        ApiService.updateLanguage(saved).catch(() => {
          // Silent — offline or not logged in yet
        });
      }
    }
  } catch (e) {
    // Erreur de stockage non bloquante — la langue reste celle sauvegardée en mémoire
    if (__DEV__) console.warn("[i18n] Impossible de lire la langue sauvegardée :", e);
  }
};

// Determine device language, fallback to 'en'
const deviceLocales = Localization.getLocales?.();
const deviceLanguage = (() => {
  if (Array.isArray(deviceLocales) && deviceLocales.length > 0) {
    const first = deviceLocales[0] as {
      languageCode?: string | null;
      languageTag?: string | null;
    };
    const fromCode = first.languageCode ?? undefined;
    const fromTag = first.languageTag ? first.languageTag.split("-")[0] : undefined;
    return fromCode || fromTag || "en";
  }
  return "en";
})();

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  keySeparator: ".",
  nsSeparator: false,
});

export default i18n;
