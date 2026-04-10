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

export const testDateFormatting = () => {
  const testDate = new Date("2024-03-15");
  const language = i18n.language;

  console.log(`Current language: ${language}`);
  console.log(`Short date: ${formatDate(testDate)}`);
  console.log(`Long date: ${formatDateLong(testDate)}`);
  console.log(`Time: ${formatTime("14:30")}`);

  return {
    language,
    shortDate: formatDate(testDate),
    longDate: formatDateLong(testDate),
    time: formatTime("14:30"),
  };
};
