import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import { cardStyles } from "./cardStyles";
import { getBannerGradient, formatRelative, formatDateRange, tripDuration } from "../../utils/invitationUtils";
import { getInitials, getAvatarColor } from "../../utils/avatarUtils";

interface CardProps {
  invitation: any;
  expanded: boolean;
  accepting: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onDetail: () => void;
  onViewTrip: () => void;
}

const InvitationCard: React.FC<CardProps> = ({
  invitation: inv, expanded, accepting, onAccept, onDecline, onDetail, onViewTrip,
}) => {
  const { t }      = useTranslation();
  const { colors } = useTheme();

  const status      = inv.status ?? "pending";
  const tripName    = inv.tripName   ?? inv.trip?.title       ?? t("invitation.thisTripRef");
  const destination = inv.trip?.destination ?? "";
  const inviterName = inv.inviterName ?? inv.inviter?.name    ?? t("invitation.someoneRef");
  const isUnread    = inv.read === false;
  const isExpired   = status === "pending" && inv.expiresAt && new Date() > new Date(inv.expiresAt);
  const canAct      = status === "pending" && !isExpired;
  const hasImage    = !!inv.trip?.coverImage;
  const gradient    = getBannerGradient(destination || tripName);
  const avatarColor = getAvatarColor(inviterName);
  const initials    = getInitials(inviterName);
  const relTime     = inv.createdAt ? formatRelative(inv.createdAt) : "";
  const dateRange   = inv.trip?.startDate && inv.trip?.endDate
    ? formatDateRange(inv.trip.startDate, inv.trip.endDate)
    : null;
  const duration    = inv.trip?.startDate && inv.trip?.endDate
    ? tripDuration(inv.trip.startDate, inv.trip.endDate)
    : null;

  return (
    <TouchableOpacity
      style={[cardStyles.card, isUnread && status === "pending" ? cardStyles.cardActive : cardStyles.cardDefault, { backgroundColor: colors.surface }]}
      onPress={onDetail}
      activeOpacity={0.92}
    >
      {/* ── Banner ── */}
      <View style={cardStyles.banner}>
        {hasImage ? (
          <Image source={{ uri: inv.trip.coverImage }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <LinearGradient colors={gradient} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
        )}
        <LinearGradient
          colors={["rgba(0,0,0,0.04)", "rgba(0,0,0,0.70)"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        {isUnread && <View style={cardStyles.unreadDot} />}
        {expanded ? (
          <View style={cardStyles.bannerBadge}>
            <Text style={cardStyles.bannerBadgeText}>{t("invitation.badgePending")}</Text>
          </View>
        ) : isUnread ? (
          <View style={cardStyles.bannerBadge}>
            <Text style={cardStyles.bannerBadgeText}>{t("invitation.badgeNew")}</Text>
          </View>
        ) : null}
        <View style={cardStyles.bannerBottom}>
          <View style={{ flex: 1 }}>
            <Text style={cardStyles.bannerTitle} numberOfLines={1}>{tripName}</Text>
            {destination ? (
              <Text style={cardStyles.bannerSub}>
                📍 {destination}{dateRange ? ` · ${dateRange}` : ""}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      {/* ── Body ── */}
      <View style={cardStyles.cardBody}>
        <View style={cardStyles.inviterRow}>
          <View style={[cardStyles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={cardStyles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            {expanded ? (
              <>
                <Text style={[cardStyles.inviterName, { color: colors.text }]}>{inviterName}</Text>
                <Text style={[cardStyles.inviterRole, { color: colors.textLight }]}>{t("invitation.roleOrganizer")} · {relTime}</Text>
              </>
            ) : (
              <>
                <Text style={[cardStyles.inviterNameSmall, { color: colors.text }]}>
                  {t("invitation.invitedBy")} <Text style={cardStyles.bold}>{inviterName}</Text>
                </Text>
                <Text style={[cardStyles.inviterDate, { color: colors.textLight }]}>
                  {dateRange ? `📅 ${dateRange}` : ""}
                  {relTime ? ` · ${relTime}` : ""}
                </Text>
              </>
            )}
          </View>
        </View>

        {expanded && inv.message ? (
          <View style={cardStyles.messageBox}>
            <Text style={cardStyles.messageText}>"{inv.message}"</Text>
          </View>
        ) : null}

        {expanded && duration ? (
          <View style={cardStyles.chips}>
            <View style={[cardStyles.chip, { backgroundColor: colors.bgMid }]}>
              <Text style={[cardStyles.chipLabel, { color: colors.textLight }]}>{t("invitation.duration")}</Text>
              <Text style={[cardStyles.chipValue, { color: colors.text }]}>{t("invitation.durationDays", { count: duration })}</Text>
            </View>
          </View>
        ) : null}

        {canAct ? (
          <View style={[cardStyles.actions, expanded && cardStyles.actionsExpanded]}>
            <TouchableOpacity
              style={[cardStyles.btnAccept, expanded && cardStyles.btnAcceptExpanded]}
              onPress={onAccept}
              disabled={accepting}
              activeOpacity={0.85}
            >
              {accepting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  <Text style={cardStyles.btnAcceptText}>{t("invitation.acceptBtn")}</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[cardStyles.btnDecline, { backgroundColor: colors.bgMid }]}
              onPress={onDecline}
              disabled={accepting}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={16} color={colors.textMid} />
              <Text style={[cardStyles.btnDeclineText, { color: colors.textMid }]}>{t("invitation.declineBtn")}</Text>
            </TouchableOpacity>
            {!expanded && (
              <TouchableOpacity style={[cardStyles.btnMore, { backgroundColor: colors.bgMid }]} onPress={onDetail} activeOpacity={0.8}>
                <Text style={[cardStyles.btnMoreText, { color: colors.textMid }]}>›</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : status === "accepted" ? (
          <TouchableOpacity style={cardStyles.viewTripLink} onPress={onViewTrip} activeOpacity={0.8}>
            <Text style={cardStyles.viewTripText}>{t("invitation.viewTripLink")}</Text>
          </TouchableOpacity>
        ) : isExpired ? (
          <View style={cardStyles.expiredRow}>
            <Ionicons name="hourglass-outline" size={16} color={colors.textLight} />
            <Text style={[cardStyles.expiredText, { color: colors.textLight }]}>{t("invitation.expiredLabel")}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default InvitationCard;
