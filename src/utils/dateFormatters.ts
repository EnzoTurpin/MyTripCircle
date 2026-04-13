import i18n from "i18next";

export const formatDate = (
  date: Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
) => {
  if (!date) return i18n.t("common.dateNotAvailable");

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (Number.isNaN(dateObj.getTime())) {
      return i18n.t("common.invalidDate");
    }

    const locale = i18n.language === "fr" ? "fr-FR" : "en-US";
    const defaultOptions: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };

    return dateObj.toLocaleDateString(locale, { ...defaultOptions, ...options });
  } catch (error) {
    console.error("Error formatting date:", error);
    return i18n.t("common.invalidDate");
  }
};

export const formatDateLong = (date: Date | string | null | undefined) =>
  formatDate(date, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const formatTime = (time: string | null | undefined) => {
  if (!time) return "";

  try {
    const locale = i18n.language === "fr" ? "fr-FR" : "en-US";
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

