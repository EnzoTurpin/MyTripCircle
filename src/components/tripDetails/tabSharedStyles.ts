import { StyleSheet } from "react-native";
import { F } from "../../theme/fonts";
import { RADIUS } from "../../theme";

export const tabSharedStyles = StyleSheet.create({
  tabContent: {
    paddingTop: 12,
    paddingBottom: 80,
    position: "relative",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: F.sans400,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  addBtnTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  addBtnText: {
    fontSize: 14,
    fontFamily: F.sans600,
  },
  listItem: {
    marginHorizontal: 20,
    marginBottom: 9,
    borderWidth: 1,
    borderRadius: RADIUS.card,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingLeft: 12,
  },
  listStripe: {
    width: 5,
    height: 48,
    borderRadius: 3,
    marginRight: 4,
    flexShrink: 0,
  },
  listIconWrap: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.button,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginLeft: 12,
    marginRight: 12,
  },
  listInfo: {
    flex: 1,
    justifyContent: "center",
  },
  listTitle: {
    fontSize: 17,
    fontFamily: F.sans600,
    marginBottom: 4,
  },
  listSub: {
    fontSize: 14,
    fontFamily: F.sans400,
  },
});
