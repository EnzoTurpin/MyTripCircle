import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useTranslation } from "react-i18next";
import { Trip, Collaborator } from "../../types";
import { useTheme } from "../../contexts/ThemeContext";
import { getAvatarColor } from "../../utils/avatarUtils";
import { F } from "../../theme/fonts";

interface CurrentUser {
  id?: string;
  name?: string;
  avatar?: string;
}

interface Props {
  trip: Trip;
  user: CurrentUser | null;
  isOwner: boolean;
  userCollaborator?: Collaborator;
  collaboratorUsers: Map<string, any>;
}

const MembersTab: React.FC<Props> = ({
  trip,
  user,
  isOwner,
  userCollaborator,
  collaboratorUsers,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  let roleLabel: string;
  if (isOwner) {
    roleLabel = t("tripDetails.roleOrganizer");
  } else if (userCollaborator?.role === "editor") {
    roleLabel = t("tripDetails.roleEditor");
  } else {
    roleLabel = t("tripDetails.roleViewer");
  }

  return (
    <View style={s.tabContent}>
      <View style={[s.memberRow, { borderBottomColor: colors.bgMid }]}>
        <View style={[s.memberAvatar, { backgroundColor: isOwner ? "#C4714A" : "#B0A090" }]}>
          {user?.avatar
            ? <Image source={{ uri: user.avatar }} style={s.memberAvatarPhoto} />
            : <Text style={s.memberAvatarText}>{(user?.name || "V")[0].toUpperCase()}</Text>
          }
        </View>
        <View style={s.memberInfo}>
          <Text style={[s.memberName, { color: colors.text }]}>{user?.name || t("tripDetails.you")}</Text>
          <Text style={[s.memberRole, { color: colors.textMid }]}>{roleLabel}</Text>
          {!isOwner && userCollaborator?.invitedBy && (
            <Text style={[s.memberInvited, { color: colors.textLight }]}>
              {t("tripDetails.invitedBy", {
                name: collaboratorUsers.get(userCollaborator.invitedBy)?.name || t("tripDetails.roleOrganizer"),
              })}
            </Text>
          )}
        </View>
        <View style={[s.memberTag, { backgroundColor: isOwner ? "#F5E5DC" : colors.bgMid }]}>
          <Text style={[s.memberTagText, { color: isOwner ? "#A35830" : colors.textMid }]}>
            {t("tripDetails.you")}
          </Text>
        </View>
      </View>

      {trip.collaborators
        .filter((c: Collaborator) => c.userId !== user?.id)
        .map((collaborator: Collaborator, index: number) => {
          const collaboratorUser = collaboratorUsers.get(collaborator.userId);
          const displayName = collaboratorUser?.name || collaborator.userId;
          const avatarBg = getAvatarColor(displayName);
          return (
            <View
              key={`collaborator-${collaborator.userId}-${index}`}
              style={[s.memberRow, { borderBottomColor: colors.bgMid }]}
            >
              <View style={[s.memberAvatar, { backgroundColor: avatarBg }]}>
                {collaboratorUser?.avatar
                  ? <Image source={{ uri: collaboratorUser.avatar }} style={s.memberAvatarPhoto} />
                  : <Text style={s.memberAvatarText}>{displayName[0]?.toUpperCase() || "?"}</Text>
                }
              </View>
              <View style={s.memberInfo}>
                <Text style={[s.memberName, { color: colors.text }]}>{displayName}</Text>
                <Text style={[s.memberRole, { color: colors.textMid }]}>
                  {collaborator.role === "editor" ? t("tripDetails.roleEditor") : t("tripDetails.roleViewer")}
                </Text>
                {collaborator.invitedBy && (
                  <Text style={[s.memberInvited, { color: colors.textLight }]}>
                    {t("tripDetails.invitedBy", {
                      name: collaboratorUsers.get(collaborator.invitedBy)?.name ||
                        (collaborator.invitedBy === trip.ownerId
                          ? t("tripDetails.roleOrganizer")
                          : t("common.unknown")),
                    })}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
    </View>
  );
};

const s = StyleSheet.create({
  tabContent: {
    paddingTop: 12,
    paddingBottom: 80,
    position: "relative",
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EDE5D8",
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    overflow: "hidden",
  },
  memberAvatarPhoto: { width: 48, height: 48, borderRadius: 24 },
  memberAvatarText: {
    fontSize: 20,
    fontFamily: F.sans700,
    color: "#FFFFFF",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontFamily: F.sans600,
    color: "#2A2318",
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 13,
    color: "#7A6A58",
    fontFamily: F.sans400,
  },
  memberInvited: {
    fontSize: 12,
    color: "#B0A090",
    fontFamily: F.sans400,
    fontStyle: "italic",
    marginTop: 2,
  },
  memberTag: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  memberTagText: {
    fontSize: 13,
    fontFamily: F.sans600,
  },
});

export default MembersTab;
