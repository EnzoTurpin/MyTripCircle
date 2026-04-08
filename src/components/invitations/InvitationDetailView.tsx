import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import { formatDate } from "../../utils/i18n";
import {
  getBannerGradient,
  formatRelative,
  formatDateRange,
  tripDuration,
} from "../../utils/invitationUtils";
import { getInitials, getAvatarColor } from "../../utils/avatarUtils";
import { F } from "../../theme/fonts";
import { RADIUS } from "../../theme";

interface InvitationDetailViewProps {
  invitation: any;
  loading: boolean;
  currentToken: string;
  initialToken: string | undefined;
  responding: boolean;
  onBack: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onNavigateToTrip: (tripId: string) => void;
  onNavigateBack: () => void;
}

const InvitationDetailView: React.FC<InvitationDetailViewProps> = ({
  invitation,
  loading,
  currentToken,
  initialToken,
  responding,
  onBack,
  onAccept,
  onDecline,
  onNavigateToTrip,
  onNavigateBack,
}) => {
  const { t }      = useTranslation();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color="#C4714A" />
        <Text style={[styles.loadingText, { color: colors.textMid }]}>{t("invitation.loading")}</Text>
      </View>
    );
  }

  if (!invitation) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.bg }]}>
        <Ionicons name="alert-circle" size={64} color="#C04040" />
        <Text style={[styles.errorTitle, { color: colors.text }]}>{t("invitation.notFound")}</Text>
        <Text style={[styles.errorMessage, { color: colors.textMid }]}>{t("invitation.notFoundMessage")}</Text>
        <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
          <Text style={styles.backButtonText}>{t("common.back")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isLinkType  = invitation.type === "link";
  const isExpired   = !isLinkType && invitation.expiresAt && new Date() > new Date(invitation.expiresAt);
  const canRespond  = invitation.status === "pending" && !isExpired;
  const inviterName = invitation.inviter?.name ?? t("invitation.someone");
  const tripName    = invitation.trip?.title ?? t("invitation.trip");
  const destination = invitation.trip?.destination ?? "";
  const hasImage    = !!invitation.trip?.coverImage;
  const bannerGrad  = getBannerGradient(destination || tripName);
  const avatarColor = getAvatarColor(inviterName);
  const initials    = getInitials(inviterName);
  const dateRange   = invitation.trip?.startDate && invitation.trip?.endDate
    ? formatDateRange(invitation.trip.startDate, invitation.trip.endDate)
    : null;
  const duration    = invitation.trip?.startDate && invitation.trip?.endDate
    ? tripDuration(invitation.trip.startDate, invitation.trip.endDate)
    : null;

  let statusBannerEl: React.ReactNode = null;
  if (isExpired) {
    statusBannerEl = (
      <View style={[styles.detailStatusBanner, { backgroundColor: "#FDEAEA", borderColor: "rgba(192,64,64,0.2)" }]}>
        <Ionicons name="hourglass-outline" size={20} color="#C04040" />
        <Text style={[styles.detailStatusText, { color: "#C04040" }]}>{t("invitation.expired")}</Text>
      </View>
    );
  } else if (invitation.status === "accepted") {
    statusBannerEl = (
      <View style={[styles.detailStatusBanner, { backgroundColor: "#E2EDD9", borderColor: "rgba(107,140,90,0.25)" }]}>
        <Ionicons name="checkmark-circle" size={20} color="#6B8C5A" />
        <Text style={[styles.detailStatusText, { color: "#6B8C5A" }]}>{t("invitation.statusAccepted")}</Text>
      </View>
    );
  } else if (invitation.status === "declined") {
    statusBannerEl = (
      <View style={[styles.detailStatusBanner, { backgroundColor: "#FDEAEA", borderColor: "rgba(192,64,64,0.2)" }]}>
        <Ionicons name="close-circle" size={20} color="#C04040" />
        <Text style={[styles.detailStatusText, { color: "#C04040" }]}>{t("invitation.statusDeclined")}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: canRespond ? 120 : 40 }}
      >
        {/* ── Grande bannière ── */}
        <View style={styles.detailBanner}>
          {hasImage ? (
            <Image
              source={{ uri: invitation.trip.coverImage }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={bannerGrad}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          )}
          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.72)"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0.3 }}
            end={{ x: 0, y: 1 }}
          />
          <TouchableOpacity style={styles.detailBackBtn} onPress={onBack} activeOpacity={0.85}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.detailBannerContent}>
            {destination ? (
              <View style={styles.detailDestRow}>
                <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.80)" />
                <Text style={styles.detailDestText}>{destination}</Text>
              </View>
            ) : null}
            <Text style={styles.detailTripTitle}>{tripName}</Text>
            {dateRange ? (
              <Text style={styles.detailDateRange}>📅 {dateRange}</Text>
            ) : null}
          </View>
        </View>

        {/* ── Corps ── */}
        <View style={[styles.detailBody, { backgroundColor: colors.bg }]}>

          {/* Stats chips */}
          {(duration || destination) ? (
            <View style={styles.detailChips}>
              {duration ? (
                <View style={[styles.detailChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="time-outline" size={18} color="#C4714A" />
                  <Text style={[styles.detailChipValue, { color: colors.text }]}>{duration}</Text>
                  <Text style={[styles.detailChipLabel, { color: colors.textMid }]}>{t("invitation.days")}</Text>
                </View>
              ) : null}
              {destination ? (
                <View style={[styles.detailChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="airplane-outline" size={18} color="#5A8FAA" />
                  <Text style={[styles.detailChipValue, { fontSize: 13, color: colors.text }]} numberOfLines={1}>{destination}</Text>
                </View>
              ) : null}
              {invitation.expiresAt && !isExpired ? (
                <View style={[styles.detailChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="hourglass-outline" size={18} color="#FF9500" />
                  <Text style={[styles.detailChipLabel, { color: colors.textMid }]}>
                    {t("invitation.expiresOnDate", { date: formatDate(invitation.expiresAt) })}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Section inviteur */}
          <View style={[styles.detailSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.detailSectionTitle, { color: colors.textLight }]}>{t("invitation.invitationFrom")}</Text>
            <View style={styles.detailInviterRow}>
              <View style={[styles.detailAvatar, { backgroundColor: avatarColor }]}>
                <Text style={styles.detailAvatarText}>{initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.detailInviterName, { color: colors.text }]}>{inviterName}</Text>
                {invitation.inviter?.email ? (
                  <Text style={[styles.detailInviterEmail, { color: colors.textMid }]}>{invitation.inviter.email}</Text>
                ) : null}
              </View>
              <Text style={[styles.detailRelTime, { color: colors.textLight }]}>
                {invitation.createdAt ? formatRelative(invitation.createdAt) : ""}
              </Text>
            </View>
            {invitation.message ? (
              <View style={styles.detailMessage}>
                <Text style={[styles.detailMessageText, { color: colors.text }]}>"{invitation.message}"</Text>
              </View>
            ) : null}
          </View>

          {/* Statut si déjà traité */}
          {statusBannerEl}

          {/* Lien vers le voyage si déjà accepté */}
          {invitation.status === "accepted" && (invitation.tripId ?? invitation.trip?._id) ? (
            <TouchableOpacity
              style={styles.detailViewTripBtn}
              onPress={() => onNavigateToTrip(invitation.tripId ?? invitation.trip._id)}
              activeOpacity={0.85}
            >
              <Ionicons name="airplane" size={18} color="#FFFFFF" />
              <Text style={styles.detailViewTripText}>{t("invitation.viewTrip")}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>

      {/* ── CTA fixe en bas ── */}
      {canRespond ? (
        <View style={[styles.detailCta, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          {isLinkType ? null : (
            <TouchableOpacity
              style={[styles.detailCtaDecline, { backgroundColor: colors.bgMid }]}
              onPress={onDecline}
              disabled={responding}
              activeOpacity={0.85}
            >
              {responding ? (
                <ActivityIndicator size="small" color={colors.textMid} />
              ) : (
                <>
                  <Ionicons name="close" size={20} color={colors.textMid} />
                  <Text style={[styles.detailCtaDeclineText, { color: colors.textMid }]}>{t("invitation.decline")}</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.detailCtaAccept, !isLinkType && { flex: 2 }]}
            onPress={onAccept}
            disabled={responding}
            activeOpacity={0.85}
          >
            {responding ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name={isLinkType ? "airplane-outline" : "checkmark"} size={20} color="#FFFFFF" />
                <Text style={styles.detailCtaAcceptText}>
                  {isLinkType ? t("invitation.joinTrip") : t("invitation.accept")}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper:          { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText:      { fontSize: 16, fontFamily: F.sans400, color: "#7A6A58" },
  errorContainer:   { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  errorTitle:       { fontSize: 24, fontFamily: F.sans700, color: "#2A2318", marginTop: 24, marginBottom: 12 },
  errorMessage:     { fontSize: 15, fontFamily: F.sans400, color: "#7A6A58", textAlign: "center", marginBottom: 32, lineHeight: 24 },
  backButton:       { backgroundColor: "#C4714A", paddingHorizontal: 32, paddingVertical: 16, borderRadius: RADIUS.button },
  backButtonText:   { color: "#FFFFFF", fontSize: 16, fontFamily: F.sans600 },

  detailBanner: { height: 280, position: "relative" },
  detailBackBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 54 : 20,
    left: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.30)",
    alignItems: "center", justifyContent: "center",
    zIndex: 10,
  },
  detailBannerContent: { position: "absolute", bottom: 20, left: 20, right: 20 },
  detailDestRow:       { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 6 },
  detailDestText:      { fontSize: 13, fontFamily: F.sans400, color: "rgba(255,255,255,0.82)" },
  detailTripTitle:     { fontSize: 28, fontFamily: F.sans700, color: "#FFFFFF", lineHeight: 34, marginBottom: 6 },
  detailDateRange:     { fontSize: 14, fontFamily: F.sans400, color: "rgba(255,255,255,0.80)" },

  detailBody: { paddingHorizontal: 16, paddingTop: 20, gap: 16 },

  detailChips: { flexDirection: "row", gap: 10 },
  detailChip: {
    flex: 1, borderRadius: RADIUS.card, borderWidth: 1,
    padding: 14, alignItems: "center", gap: 4,
  },
  detailChipValue: { fontSize: 20, fontFamily: F.sans700, color: "#2A2318" },
  detailChipLabel: { fontSize: 12, fontFamily: F.sans400, color: "#7A6A58", textAlign: "center" },

  detailSection: {
    borderRadius: RADIUS.card, borderWidth: 1, padding: 16, gap: 12,
  },
  detailSectionTitle: {
    fontSize: 11, fontFamily: F.sans600,
    color: "#B0A090", textTransform: "uppercase", letterSpacing: 0.8,
  },
  detailInviterRow:  { flexDirection: "row", alignItems: "center", gap: 12 },
  detailAvatar:      { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  detailAvatarText:  { fontSize: 18, fontFamily: F.sans700, color: "#FFFFFF" },
  detailInviterName: { fontSize: 17, fontFamily: F.sans600, color: "#2A2318", marginBottom: 2 },
  detailInviterEmail:{ fontSize: 13, fontFamily: F.sans400, color: "#7A6A58" },
  detailRelTime:     { fontSize: 12, fontFamily: F.sans400, color: "#B0A090" },
  detailMessage: {
    backgroundColor: "#F5E5DC",
    borderLeftWidth: 3, borderLeftColor: "#C4714A",
    borderTopRightRadius: 10, borderBottomRightRadius: 10,
    padding: 12,
  },
  detailMessageText: { fontSize: 14, fontFamily: F.sans400, color: "#2A2318", fontStyle: "italic", lineHeight: 22 },

  detailStatusBanner: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, borderRadius: RADIUS.button, borderWidth: 1 },
  detailStatusText:   { fontSize: 15, fontFamily: F.sans600 },

  detailViewTripBtn: {
    backgroundColor: "#6B8C5A", borderRadius: RADIUS.button, paddingVertical: 15,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  detailViewTripText: { fontSize: 16, fontFamily: F.sans600, color: "#FFFFFF" },

  detailCta: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
    borderTopWidth: 1,
    gap: 10,
    shadowColor: "#2A2318",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 8,
  },
  detailCtaDecline: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderRadius: RADIUS.button, paddingVertical: 16, gap: 8,
  },
  detailCtaDeclineText: { fontSize: 16, fontFamily: F.sans600, color: "#7A6A58" },
  detailCtaAccept: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#C4714A", borderRadius: RADIUS.button, paddingVertical: 16, gap: 8,
    shadowColor: "#C4714A", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 4,
  },
  detailCtaAcceptText: { fontSize: 16, fontFamily: F.sans600, color: "#FFFFFF" },
});

export default InvitationDetailView;
