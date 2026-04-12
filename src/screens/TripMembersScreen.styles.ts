import { StyleSheet } from "react-native";
import { F } from "../theme/fonts";

export const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: "#FDFAF5" },
  content: { paddingHorizontal: 13, paddingBottom: 40, paddingTop: 6 },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingTop: 8, paddingBottom: 8,
    backgroundColor: "#FDFAF5",
  },
  headerSub:   { fontFamily: F.sans400, fontSize: 11, color: "#B0A090", textAlign: "center" },
  headerTitle: { fontFamily: F.sans700, fontSize: 20, textAlign: "center" },
  inviteBtn: {
    backgroundColor: "#C4714A", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
    shadowColor: "#C4714A", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 3,
  },
  inviteBtnTxt: { fontFamily: F.sans600, fontSize: 11, color: "#FFFFFF" },

  linkCard: { borderRadius: 11, borderWidth: 1, padding: 10, marginBottom: 10 },
  linkTitle: { fontFamily: F.sans600, fontSize: 10, marginBottom: 5 },
  linkRow:   { flexDirection: "row", alignItems: "center", gap: 6 },
  linkUrl: {
    flex: 1, fontFamily: F.sans400, fontSize: 10,
    borderRadius: 7, paddingHorizontal: 8, paddingVertical: 4,
  },
  copyBtn:    { backgroundColor: "#C4714A", borderRadius: 7, paddingHorizontal: 10, paddingVertical: 4 },
  copyBtnTxt: { fontFamily: F.sans600, fontSize: 10, color: "#FFFFFF" },
  expiryTxt:  { fontFamily: F.sans400, fontSize: 9.5 },

  sec: {
    fontFamily: F.sans600,
    fontSize: 10, color: "#B0A090",
    textTransform: "uppercase", letterSpacing: 0.8,
    paddingTop: 2, paddingBottom: 5,
  },

  mc: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 11, borderWidth: 1, borderColor: "#D8CCBA",
    paddingVertical: 8, paddingHorizontal: 10,
    marginBottom: 5,
  },
  avatar:    { borderRadius: 999, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarTxt: { fontFamily: F.sans600, color: "#FFFFFF" },
  mn: { fontFamily: F.sans600, fontSize: 13, color: "#2A2318" },
  ms: { fontFamily: F.sans400, fontSize: 11, color: "#B0A090", marginTop: 1 },

  meTag:    { backgroundColor: "#F5E5DC", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  meTagTxt: { fontFamily: F.sans600, fontSize: 10, color: "#C4714A" },

  mcSelected: {
    backgroundColor: "rgba(196,113,74,0.06)",
    borderColor: "rgba(196,113,74,0.35)",
    borderWidth: 1.5,
  },

  rowChevron: { fontSize: 18, color: "#D8CCBA", fontFamily: F.sans300, marginLeft: 2 },
  cancelTxt:  { fontFamily: F.sans600, fontSize: 11, color: "#C04040" },

  addBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7,
    borderWidth: 1.5, borderStyle: "dashed", borderColor: "#D8CCBA",
    borderRadius: 11, paddingVertical: 9, paddingHorizontal: 10,
    backgroundColor: "#F5F0E8", marginTop: 6,
  },
  addBtnIcon: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: "#F5E5DC", alignItems: "center", justifyContent: "center",
  },
  addBtnTxt: { fontFamily: F.sans400, fontSize: 12, color: "#B0A090" },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(253,250,245,0.65)",
    alignItems: "center", justifyContent: "center",
  },

  backdrop: { backgroundColor: "rgba(42,35,24,0.45)" },
  sheet: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "#FDFAF5",
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 14, paddingTop: 12, paddingBottom: 30,
    shadowColor: "#2A2318", shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18, shadowRadius: 28, elevation: 20,
  },
  sheetHandle: {
    width: 32, height: 3, borderRadius: 20,
    backgroundColor: "#D8CCBA", alignSelf: "center", marginBottom: 12,
  },
  sheetId: {
    flexDirection: "row", alignItems: "center", gap: 9,
    paddingBottom: 10, borderBottomWidth: 1, borderColor: "#D8CCBA", marginBottom: 10,
  },
  sheetName:  { fontFamily: F.sans600, fontSize: 13, color: "#2A2318" },
  sheetEmail: { fontFamily: F.sans400, fontSize: 10, color: "#7A6A58", marginTop: 1 },
  sheetRole:  { fontFamily: F.sans400, fontSize: 10, color: "#B0A090", marginTop: 1 },

  sheetRow: {
    flexDirection: "row", alignItems: "center", gap: 9,
    backgroundColor: "#EDE5D8", borderRadius: 11,
    paddingVertical: 9, paddingHorizontal: 11,
  },
  sheetRowDanger: {
    backgroundColor: "#FFF0F0",
    borderWidth: 1, borderColor: "rgba(192,64,64,0.15)",
  },
  sheetIcon:     { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  sheetRowLabel: { fontFamily: F.sans600, fontSize: 12, color: "#2A2318" },
  sheetRowSub:   { fontFamily: F.sans400, fontSize: 9.5, color: "#B0A090", marginTop: 1 },
});
