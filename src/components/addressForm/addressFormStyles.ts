import { StyleSheet, Platform } from "react-native";
import { RADIUS } from "../../theme";
import { F } from "../../theme/fonts";

const addressFormStyles = StyleSheet.create({
  root: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    fontFamily: F.sans400,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 56 : 36,
    paddingBottom: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  topBarTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: F.sans700,
    textAlign: "center",
    marginHorizontal: 8,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 24,
    paddingBottom: 28,
    gap: 4,
  },
  sectionWrap: { marginBottom: 24 },
  fieldLabel: {
    fontSize: 14,
    fontFamily: F.sans600,
    marginBottom: 9,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: RADIUS.input,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 14,
    fontFamily: F.sans400,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
  },
  star: { fontSize: 18 },
  ratingValue: {
    fontSize: 14,
    fontFamily: F.sans600,
    marginLeft: 2,
  },
  row: {
    flexDirection: "row",
    gap: 14,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    borderTopWidth: 1,
    gap: 14,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: RADIUS.button,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: F.sans600,
  },
  primaryButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: RADIUS.button,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#A35830",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: F.sans700,
  },
});

export default addressFormStyles;
