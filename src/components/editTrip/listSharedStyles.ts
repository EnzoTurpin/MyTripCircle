import { StyleSheet } from "react-native";
import { F } from "../../theme/fonts";

export const listSharedStyles = StyleSheet.create({
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 10,
  },
  sectionLbl: {
    fontSize: 13,
    fontFamily: F.sans700,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addBtnText: { fontSize: 14, fontFamily: F.sans600 },
  empty: { alignItems: "center", paddingVertical: 32, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: F.sans400 },
  list: { gap: 10, marginBottom: 10 },
  item: {
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
  },
  stripe: { width: 5 },
  content: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  info: { flex: 1 },
  title: { fontSize: 16, fontFamily: F.sans600 },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
