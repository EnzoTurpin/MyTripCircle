import React, { useEffect } from "react";
import { View } from "react-native";
import * as Location from "expo-location";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/contexts/AuthContext";
import { TripsProvider } from "./src/contexts/TripsContext";
import { NotificationProvider } from "./src/contexts/NotificationContext";
import { FriendsProvider } from "./src/contexts/FriendsContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { initLanguage } from "./src/utils/i18n";
import { useFonts, Lora_400Regular, Lora_600SemiBold, Lora_700Bold, Lora_700Bold_Italic } from "@expo-google-fonts/lora";
import { Sora_300Light, Sora_400Regular, Sora_500Medium, Sora_600SemiBold, Sora_700Bold } from "@expo-google-fonts/sora";

export default function App() {
  useEffect(() => {
    initLanguage();
    // Demander la permission de localisation dès le lancement
    Location.requestForegroundPermissionsAsync().catch(() => {});
  }, []);

  const [fontsLoaded] = useFonts({
    Lora_400Regular,
    Lora_600SemiBold,
    Lora_700Bold,
    Lora_700Bold_Italic,
    Sora_300Light,
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: "#F5F0E8" }} />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <TripsProvider>
            <NotificationProvider>
              <FriendsProvider>
                <AppNavigator />
              </FriendsProvider>
            </NotificationProvider>
          </TripsProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
