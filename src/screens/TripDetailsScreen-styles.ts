import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2891FF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    fontSize: 16,
    color: '#616161',
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: '#FAFAFA',
  },
  errorText: {
    fontSize: 18,
    color: '#F44336',
  },
  header: {
    paddingTop: 64,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 24,
  },
  headerContent: {
    marginTop: 16,
  },
  tripTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  destinationRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  tripDestination: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.95)",
    marginLeft: 4,
  },
  datesRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  tripDates: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.85)",
    marginLeft: 4,
  },
  tripDescription: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 24,
    marginTop: 8,
  },
  content: {
    marginTop: -24,
    paddingHorizontal: 24,
    paddingBottom: 64,
  },
  actionsContainer: {
    flexDirection: "row" as const,
    gap: 16,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
  },
  validateContainer: {
    marginBottom: 24,
  },
  validateButton: {
    marginTop: 16,
  },
  draftBanner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: '#FF9800' + '15',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF9800' + '30',
  },
  draftBannerText: {
    fontSize: 14,
    color: '#212121',
    marginLeft: 8,
    fontWeight: '500',
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between",
    alignItems: "center" as const,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#616161',
    marginTop: 4,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F4FF',
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  emptySection: {
    alignItems: "center" as const,
    paddingVertical: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F4FF',
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#616161',
  },
  itemsList: {
    marginTop: 8,
  },
  bookingItem: {},
  bookingHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  bookingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F4FF',
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 16,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 14,
    color: '#616161',
  },
  confirmationContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  confirmationText: {
    fontSize: 12,
    color: '#616161',
    marginLeft: 4,
    fontWeight: '500',
  },
  addressItem: {},
  addressHeader: {
    flexDirection: "row" as const,
    alignItems: "flex-start",
  },
  addressIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B9D' + '15',
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 16,
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 4,
    lineHeight: 20,
  },
  addressLocation: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  collaboratorsSection: {
    marginBottom: 24,
  },
  collaboratorsList: {
    marginTop: 16,
  },
  collaboratorItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  collaboratorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
    overflow: "hidden",
  },
  avatarGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  avatarDefault: {
    width: "100%",
    height: "100%",
    backgroundColor: '#F5F5F5',
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  collaboratorInfo: {
    flex: 1,
  },
  collaboratorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  collaboratorRole: {
    fontSize: 14,
    color: '#616161',
  },
  ownerBadge: {
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  ownerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2891FF',
  },
});
