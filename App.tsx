import React from "react";
import { AuthProvider } from "./src/contexts/AuthContext";
import { TripsProvider } from "./src/contexts/TripsContext";
import { NotificationProvider } from "./src/contexts/NotificationContext";
import { FriendsProvider } from "./src/contexts/FriendsContext";
import AppNavigator from "./src/navigation/AppNavigator";
import "./src/utils/i18n";

export default function App() {
  return (
    <AuthProvider>
      <TripsProvider>
        <NotificationProvider>
          <FriendsProvider>
            <AppNavigator />
          </FriendsProvider>
        </NotificationProvider>
      </TripsProvider>
    </AuthProvider>
  );
}
