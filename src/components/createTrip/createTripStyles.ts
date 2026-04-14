import { StyleSheet } from "react-native";
import { F } from "../../theme/fonts";
import { RADIUS } from "../../theme";
import { COLORS as C } from "../../theme/colors";

const createTripStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.sand,
  },
  flex: {
    flex: 1,
  },

  // ── Header ────────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontFamily: F.sans700,
    color: C.ink,
  },

  // ── ScrollView ────────────────────────────────────────────────────────────────
  scrollContent: {
    paddingBottom: 32,
  },

  // ── Champ générique ───────────────────────────────────────────────────────────
  fieldBox: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.sandDark,
    borderRadius: RADIUS.card,
    padding: 14,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: F.sans400,
    color: C.inkLight,
    marginBottom: 4,
  },
  fieldInput: {
    fontSize: 16,
    fontFamily: F.sans400,
    color: C.ink,
    padding: 0,
  },

  // ── Destination ───────────────────────────────────────────────────────────────
  destRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  destPin: {
    fontSize: 16,
  },
  destInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: F.sans400,
    color: C.ink,
    padding: 0,
  },

  // ── Dates côte à côte ─────────────────────────────────────────────────────────
  dateRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 10,
  },
  dateBox: {
    flex: 1,
    marginHorizontal: 0,
    marginBottom: 0,
  },
  dateGap: {
    width: 12,
  },
  dateValue: {
    fontSize: 16,
    fontFamily: F.sans400,
    color: C.ink,
  },
  dateErrorText: {
    marginHorizontal: 20,
    marginTop: -4,
    marginBottom: 8,
    fontSize: 12,
    color: "#C04040",
    fontFamily: F.sans400,
  },

  // ── Description ───────────────────────────────────────────────────────────────
  descInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },

  // ── Visibilité ────────────────────────────────────────────────────────────────
  visibilityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  visibilityText: {
    fontSize: 16,
    fontFamily: F.sans400,
    color: C.ink,
  },

  // ── Bouton principal ──────────────────────────────────────────────────────────
  primaryButton: {
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 0,
    backgroundColor: C.terra,
    borderRadius: RADIUS.button,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: C.terra,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonDisabled: {
    backgroundColor: C.inkLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    fontSize: 17,
    fontFamily: F.sans600,
    color: C.white,
  },
});

export default createTripStyles;
