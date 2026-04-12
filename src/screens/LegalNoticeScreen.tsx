import React from "react";
import { useTranslation } from "react-i18next";
import LegalScreen from "../components/LegalScreen";

export default function LegalNoticeScreen() {
  const { t } = useTranslation();

  const sections = [
    { title: t("legalNotice.publisherTitle"),     body: t("legalNotice.publisherBody") },
    { title: t("legalNotice.hostingTitle"),       body: t("legalNotice.hostingBody") },
    { title: t("legalNotice.dataTitle"),          body: t("legalNotice.dataBody") },
    { title: t("legalNotice.intellectualTitle"),  body: t("legalNotice.intellectualBody") },
  ];

  return (
    <LegalScreen
      headerTitle={t("legalNotice.title")}
      lastUpdated=""
      sections={sections}
    />
  );
}
