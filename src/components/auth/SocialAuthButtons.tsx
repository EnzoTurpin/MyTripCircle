import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { AppColors } from "../../contexts/ThemeContext";
import { F } from "../../theme/fonts";
import { RADIUS, DISABLED_OPACITY } from "../../theme";

interface SocialAuthButtonsProps {
  onGooglePress: () => void;
  onApplePress: () => void;
  googleDisabled: boolean;
  busy: boolean;
  colors: AppColors;
}

const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  onGooglePress,
  onApplePress,
  googleDisabled,
  busy,
  colors,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <View style={styles.divider}>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.dividerLabel, { color: colors.textLight }]}>{t("auth.orDivider")}</Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      </View>

      <TouchableOpacity
        style={[styles.googleBtn, { backgroundColor: colors.bgMid }, (googleDisabled || busy) && styles.disabled]}
        activeOpacity={0.85}
        onPress={onGooglePress}
        disabled={googleDisabled || busy}
      >
        <Text style={[styles.googleBtnText, { color: colors.textMid }]}>{t("auth.googleButton")}</Text>
      </TouchableOpacity>

      {Platform.OS === "ios" && (
        <TouchableOpacity
          style={[styles.appleBtn, { backgroundColor: colors.text }, busy && styles.disabled]}
          activeOpacity={0.85}
          onPress={onApplePress}
          disabled={busy}
        >
          <Ionicons name="logo-apple" size={18} color={colors.white} style={{ marginRight: 8 }} />
          <Text style={styles.appleBtnText}>{t("auth.appleButton")}</Text>
        </TouchableOpacity>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerLabel: {
    fontFamily: F.sans400,
    fontSize: 13,
    marginHorizontal: 12,
  },
  googleBtn: {
    borderRadius: RADIUS.button,
    marginHorizontal: 24,
    paddingVertical: 17,
    alignItems: "center",
  },
  googleBtnText: {
    fontFamily: F.sans600,
    fontSize: 16,
  },
  appleBtn: {
    borderRadius: RADIUS.button,
    marginHorizontal: 24,
    marginTop: 12,
    paddingVertical: 17,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  appleBtnText: {
    fontFamily: F.sans600,
    fontSize: 16,
    color: "#FFFFFF",
  },
  disabled: {
    opacity: DISABLED_OPACITY,
  },
});

export default SocialAuthButtons;
