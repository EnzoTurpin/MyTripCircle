import { StyleSheet } from "react-native";
import { F } from "../../theme/fonts";
import { RADIUS, SHADOW } from "../../theme";

export const cardStyles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.card,
    overflow: "hidden",
    ...SHADOW.medium,
  },
  cardDefault: { borderWidth: 1, borderColor: "rgba(196,113,74,0.35)" },
  cardActive:  { borderWidth: 1.5, shadowOpacity: 0.14 },
  cardArchived:{ borderWidth: 1, borderColor: "#D8CCBA", opacity: 0.78 },

  banner:    { height: 130, position: "relative" },
  unreadDot: {
    position: "absolute", top: 12, left: 12,
    width: 10, height: 10, borderRadius: 5,
    borderWidth: 2, borderColor: "#FFFFFF", zIndex: 2,
  },
  bannerBadge: {
    position: "absolute", top: 10, right: 12,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  bannerBadgeText: { fontSize: 12, color: "#FFFFFF", fontFamily: F.sans500 },
  bannerBottom: {
    position: "absolute", bottom: 10, left: 14, right: 14,
    flexDirection: "row", alignItems: "flex-end",
  },
  bannerTitle: { fontSize: 18, fontFamily: F.sans700, color: "#FFFFFF" },
  bannerSub:   { fontSize: 12, color: "rgba(255,255,255,0.80)", fontFamily: F.sans400, marginTop: 3 },

  cardBody:    { padding: 14 },
  inviterRow:  { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  avatar:      { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarText:  { fontSize: 14, fontFamily: F.sans700, color: "#FFFFFF" },
  inviterName: { fontSize: 15, fontFamily: F.sans600 },
  inviterRole: { fontSize: 12, fontFamily: F.sans400 },
  inviterNameSmall: { fontSize: 14, fontFamily: F.sans400 },
  inviterDate: { fontSize: 12, fontFamily: F.sans400, marginTop: 2 },
  bold:        { fontFamily: F.sans600 },

  messageBox: {
    borderLeftWidth: 3,
    borderTopRightRadius: 10, borderBottomRightRadius: 10,
    padding: 10, marginBottom: 12,
  },
  messageText: { fontSize: 13, lineHeight: 20, fontStyle: "italic", fontFamily: F.sans400 },

  chips:     { flexDirection: "row", gap: 8, marginBottom: 12 },
  chip:      { flex: 1, borderRadius: 8, padding: 8, alignItems: "center" },
  chipLabel: { fontSize: 11, fontFamily: F.sans400 },
  chipValue: { fontSize: 15, fontFamily: F.sans600, marginTop: 2 },

  actions:         { flexDirection: "row", gap: 8 },
  actionsExpanded: { gap: 10 },
  btnAccept: {
    flex: 1, borderRadius: RADIUS.button,
    paddingVertical: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 3,
  },
  btnAcceptExpanded: { flex: 2, paddingVertical: 15 },
  btnAcceptText:     { fontSize: 15, fontFamily: F.sans600, color: "#FFFFFF" },
  btnDecline:        { flex: 1, borderRadius: RADIUS.button, paddingVertical: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  btnDeclineText:    { fontSize: 15, fontFamily: F.sans600 },
  btnMore:           { width: 46, borderRadius: RADIUS.button, alignItems: "center", justifyContent: "center" },
  btnMoreText:       { fontSize: 22, fontFamily: F.sans400 },

  viewTripLink: { alignSelf: "flex-end", paddingTop: 6 },
  viewTripText: { fontSize: 13, fontFamily: F.sans600, color: "#6B8C5A" },

  expiredRow:  { flexDirection: "row", alignItems: "center", gap: 6, paddingTop: 4 },
  expiredText: { fontSize: 13, fontFamily: F.sans400 },

  cancelInviteBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    borderRadius: RADIUS.button,
    paddingVertical: 13, marginTop: 4,
  },
  cancelInviteText: { fontSize: 15, fontFamily: F.sans600 },
});
