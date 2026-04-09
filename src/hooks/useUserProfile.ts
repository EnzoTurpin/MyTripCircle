import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";
import ApiService from "../services/ApiService";

interface UseUserProfileOptions {
  onUserUpdated: (user: User) => void;
}

export function useUserProfile({ onUserUpdated }: UseUserProfileOptions) {
  const updateUser = async (userData: Partial<User>): Promise<void> => {
    const filteredData = Object.fromEntries(
      Object.entries(userData).filter(([, value]) => value !== undefined),
    ) as { name?: string; email?: string };

    const res = await ApiService.updateProfile(
      filteredData as { name: string; email: string },
    );

    if (res.success) {
      await AsyncStorage.setItem("user", JSON.stringify(res.user));
      onUserUpdated(res.user);
    }
  };

  const updateAvatar = async (avatar: string): Promise<void> => {
    const res = await ApiService.uploadAvatar(avatar);
    if (res.success) {
      await AsyncStorage.setItem("user", JSON.stringify(res.user));
      onUserUpdated(res.user);
    }
  };

  const updateSettings = async (data: { isPublicProfile: boolean }): Promise<void> => {
    const res = await ApiService.updateSettings(data);
    if (res.success) {
      await AsyncStorage.setItem("user", JSON.stringify(res.user));
      onUserUpdated(res.user);
    }
  };

  return { updateUser, updateAvatar, updateSettings };
}
