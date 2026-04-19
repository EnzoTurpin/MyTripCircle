import React, { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/contexts/AuthContext";
import { TripsProvider } from "./src/contexts/TripsContext";
import { NotificationProvider } from "./src/contexts/NotificationContext";
import { FriendsProvider } from "./src/contexts/FriendsContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { SubscriptionProvider } from "./src/contexts/SubscriptionContext";
import { NetworkProvider } from "./src/contexts/NetworkContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { initLanguage } from "./src/utils/i18n";
import { useFonts, Sora_300Light, Sora_400Regular, Sora_500Medium, Sora_600SemiBold, Sora_700Bold } from "@expo-google-fonts/sora";

export default function App() {
  useEffect(() => {
    initLanguage();
  }, []);

  const [fontsLoaded] = useFonts({
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
      <NetworkProvider>
      <ThemeProvider>
        <AuthProvider>
          <TripsProvider>
            <NotificationProvider>
              <FriendsProvider>
                <SubscriptionProvider>
                  <AppNavigator />
                </SubscriptionProvider>
              </FriendsProvider>
            </NotificationProvider>
          </TripsProvider>
        </AuthProvider>
      </ThemeProvider>
      </NetworkProvider>
    </SafeAreaProvider>
  );
}
