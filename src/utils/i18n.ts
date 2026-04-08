import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { ApiService } from "../services/ApiService";
import { resources } from "./i18n/index";

const LANGUAGE_KEY = "@mytripcircle_language";

// Date formatting utilities
export const formatDate = (
  date: Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
) => {
  if (!date) return i18n.t("common.dateNotAvailable");

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Vérifier si la date est valide
    if (Number.isNaN(dateObj.getTime())) {
      return i18n.t("common.invalidDate");
    }

    const currentLanguage = i18n.language;
    const locale = currentLanguage === "fr" ? "fr-FR" : "en-US";

    const defaultOptions: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };

    return dateObj.toLocaleDateString(locale, {
      ...defaultOptions,
      ...options,
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return i18n.t("common.invalidDate");
  }
};

export const formatDateLong = (date: Date | string | null | undefined) => {
  return formatDate(date, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatTime = (time: string | null | undefined) => {
  if (!time) return "";

  try {
    const currentLanguage = i18n.language;
    const locale = currentLanguage === "fr" ? "fr-FR" : "en-US";

    // Parse time string (assuming HH:MM format)
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(Number.parseInt(hours), Number.parseInt(minutes));

    return date.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (error) {
    console.error("Error formatting time:", error);
    return time;
  }
};

// Function to change language programmatically, persist locally and sync to server
export const changeLanguage = async (language: "en" | "fr") => {
  i18n.changeLanguage(language);
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // ignore storage errors
  }
  // Sync to server so emails are sent in the user's preferred language
  try {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      await ApiService.updateLanguage(language);
    }
  } catch {
    // Ignore sync errors — local preference remains valid
  }
};

// Function to get current language
export const getCurrentLanguage = () => {
  return i18n.language;
};

// Initialize language from persisted preference (call on app startup)
export const initLanguage = async () => {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (saved === "en" || saved === "fr") {
      i18n.changeLanguage(saved);
      // Sync the stored preference to the server for existing users who haven't yet
      const token = await AsyncStorage.getItem("token");
      if (token) {
        ApiService.updateLanguage(saved).catch(() => {
          // Silent — offline or not logged in yet
        });
      }
    }
  } catch {
    // ignore storage errors
  }
};

// Helper function to get booking status translation
export const getBookingStatusTranslation = (status: string): string => {
  const statusKey = `bookings.status.${status}`;
  const translation = i18n.t(statusKey);
  // Si la traduction retourne la clé elle-même, c'est qu'elle n'existe pas
  if (translation === statusKey) {
    return status; // Retourner le statut tel quel en fallback
  }
  return translation;
};

/** Raw API / backend messages → i18n keys (FR legacy + EN canonical). */
const API_ERROR_KEY_BY_MESSAGE: Record<string, string> = {
  "Token manquant": "apiErrors.tokenMissing",
  "Token manquant.": "apiErrors.tokenMissing",
  "Missing token": "apiErrors.tokenMissing",
  "Lien invalide ou déjà utilisé": "apiErrors.invalidOrUsedLink",
  "Invalid or already used link": "apiErrors.invalidOrUsedLink",
  "Vous ne pouvez pas vous ajouter vous-même": "apiErrors.cannotAddSelfFriend",
  "You cannot add yourself": "apiErrors.cannotAddSelfFriend",
  "Vous êtes déjà amis": "apiErrors.alreadyFriends",
  "You are already friends": "apiErrors.alreadyFriends",
  "Lien d'invitation introuvable": "apiErrors.invitationLinkNotFound",
  "Invitation link not found": "apiErrors.invitationLinkNotFound",
  "Utilisateur introuvable": "apiErrors.userNotFound",
  "User not found": "apiErrors.userNotFound",
  "Phone number already in use": "common.phoneAlreadyInUse",
  "Ce numéro de téléphone est déjà utilisé par un autre compte.":
    "common.phoneAlreadyInUse",
  "Ce numéro de téléphone est déjà utilisé par un autre compte":
    "common.phoneAlreadyInUse",
  Unauthorized: "apiErrors.unauthorized",
  "Missing required fields": "apiErrors.missingRequiredFields",
  "Weak password": "common.invalidPassword", // NOSONAR — clé de traduction, pas un mot de passe
  "Invalid phone number": "apiErrors.invalidPhoneNumber",
  "Account not verified. A new code has been sent to your email.":
    "apiErrors.accountNotVerifiedNewCode",
  "Email already in use": "common.emailAlreadyInUse",
  "Invalid credentials": "common.invalidCredentials",
  "Please verify your account with the OTP sent to your email":
    "common.requiresOtp",
  "Your verification code expired. A new code has been sent to your email":
    "common.requiresOtpExpired",
  "Name and email are required": "apiErrors.nameAndEmailRequired",
  "Invalid language. Supported: en, fr": "apiErrors.invalidLanguage",
  "Current password is incorrect": "apiErrors.currentPasswordIncorrect", // NOSONAR — clé de traduction
  "Email is required": "apiErrors.emailRequired",
  "Token and new password are required": "apiErrors.tokenAndPasswordRequired", // NOSONAR — clé de traduction
  "Invalid or expired reset token": "apiErrors.invalidOrExpiredResetToken",
  "User ID and OTP are required": "apiErrors.userIdAndOtpRequired",
  "Invalid OTP": "apiErrors.invalidOtp",
  "OTP has expired": "apiErrors.otpExpired",
  "User ID is required": "apiErrors.userIdRequired",
  "User is already verified": "apiErrors.userAlreadyVerified",
  "Missing accessToken": "apiErrors.missingAccessToken",
  "Invalid Google token": "apiErrors.invalidGoogleToken",
  "No email returned from Google": "apiErrors.noEmailFromGoogle",
  "Google authentication failed": "apiErrors.googleAuthFailed",
  "Missing identityToken": "apiErrors.missingIdentityToken",
  "Invalid Apple token format": "apiErrors.invalidAppleTokenFormat",
  "Invalid Apple token": "apiErrors.invalidAppleToken",
  "Apple authentication failed": "apiErrors.appleAuthFailed",
  "Not found": "apiErrors.notFound",
  "Access denied": "apiErrors.accessDenied",
  "End date must be after start date": "createTrip.invalidDates",
  "Start date cannot be in the past": "createTrip.startDatePast",
  "Trip not found": "apiErrors.tripNotFound",
  "Not authorized to edit this trip": "apiErrors.notAuthorizedEditTrip",
  "Only the owner can delete this trip": "apiErrors.onlyOwnerCanDeleteTrip",
  "Only the owner can remove members": "apiErrors.onlyOwnerCanRemoveMembers",
  "Cannot remove yourself": "apiErrors.cannotRemoveYourself",
  "newOwnerId is required": "apiErrors.newOwnerIdRequired",
  "Only the owner can transfer ownership": "apiErrors.onlyOwnerCanTransfer",
  "New owner must already be a member": "apiErrors.newOwnerMustBeMember",
  "Invitation not found": "apiErrors.invitationNotFound",
  "Cannot cancel someone else's invitation":
    "apiErrors.cannotCancelOthersInvitation",
  "Booking not found": "apiErrors.bookingNotFound",
  "Address not found": "apiErrors.addressNotFound",
  "Email or phone number is required": "apiErrors.emailOrPhoneRequired",
  "Not authorized to invite": "apiErrors.notAuthorizedInvite",
  "User is already a collaborator": "apiErrors.alreadyCollaborator",
  "Invitation already pending": "apiErrors.invitationAlreadyPending",
  "Not authorized to create invitation link":
    "apiErrors.notAuthorizedCreateInviteLink",
  "Invalid action": "apiErrors.invalidAction",
  "userId is required to join via link": "apiErrors.userIdRequiredToJoinLink",
  "Invitation has expired": "apiErrors.invitationExpired",
  "Invitation already processed": "apiErrors.invitationAlreadyProcessed",
};

/** Message probablement en français (API ou legacy) alors que l'UI est en anglais. */
function messageLooksFrench(s: string): boolean {
  if (/[àâäéèêëïîôùûüçœÀÂÉÈÊËÎÏÔÙÛÜÇ]/.test(s)) return true;
  return /\b(veuillez|impossible|introuvable|utilisateur|brouillon|voyage|erreur|déjà|n'est |cette |vos |vous |êtes|s'il vous plaît)\b/i.test(
    s,
  );
}

/** Réponse d'erreur typique en anglais (backend) alors que l'UI est en français. */
function messageLooksLikeEnglishApiError(s: string): boolean {
  const t = s.trim();
  if (!t || t.length > 220) return false;
  if (/[àâäéèêëïîôùûüçœ]/.test(t)) return false;
  return (
    /^(Invalid |Missing |Not |Unauthorized|Weak password|Email already|Please verify|Your verification|Account not verified|Token |User |Google |Apple |End date|Start date|Only the|Cannot |Invitation |Booking |Address |Trip |Access denied|Something went |Failed to|Network request)/i.test(
      t,
    ) || /\b(not found|required|expired|denied|incorrect)\b/i.test(t)
  );
}

function resolveLocalizedMessage(raw: string): string {
  const lang = i18n.language || "en";
  if (raw && messageLooksFrench(raw) && lang.startsWith("en")) {
    return i18n.t("apiErrors.unmappedFallback");
  }
  if (raw && messageLooksLikeEnglishApiError(raw) && lang.startsWith("fr")) {
    return i18n.t("apiErrors.unmappedFallback");
  }
  return raw || i18n.t("common.unexpectedError");
}

// Helper function to parse API errors and return translated messages
export const parseApiError = (error: unknown): string => {
  try {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Try to parse as JSON
    let parsedError: any;
    try {
      parsedError = JSON.parse(errorMessage);
    } catch {
      // If not JSON, use the message as is
      parsedError = { error: errorMessage };
    }

    // Extract error message
    const apiError = parsedError.error || parsedError.message || errorMessage;
    const trimmed =
      typeof apiError === "string" ? apiError.trim() : String(apiError);

    const mappedKey = API_ERROR_KEY_BY_MESSAGE[trimmed];
    if (mappedKey) {
      return i18n.t(mappedKey);
    }

    if (
      /phone number already in use/i.test(trimmed) ||
      /numéro de téléphone est déjà utilisé/i.test(trimmed)
    ) {
      return i18n.t("common.phoneAlreadyInUse");
    }

    // Message non mappé mais cohérent avec la langue d'affichage
    return resolveLocalizedMessage(trimmed);
  } catch {
    const raw = error instanceof Error ? error.message : String(error ?? "");
    return resolveLocalizedMessage(raw);
  }
};

// Test function to demonstrate date formatting
export const testDateFormatting = () => {
  const testDate = new Date("2024-03-15");
  const currentLang = getCurrentLanguage();

  console.log(`Current language: ${currentLang}`);
  console.log(`Short date: ${formatDate(testDate)}`);
  console.log(`Long date: ${formatDateLong(testDate)}`);
  console.log(`Time: ${formatTime("14:30")}`);

  return {
    language: currentLang,
    shortDate: formatDate(testDate),
    longDate: formatDateLong(testDate),
    time: formatTime("14:30"),
  };
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
    const fromTag = first.languageTag
      ? first.languageTag.split("-")[0]
      : undefined;
    return fromCode || fromTag || "en";
  }
  return "en";
})();

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  keySeparator: ".", // Utiliser le point comme séparateur pour les clés imbriquées
  nsSeparator: false, // Pas de namespace separator
});

export default i18n;
