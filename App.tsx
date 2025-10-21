import React from "react";
import { AuthProvider } from "./src/contexts/AuthContext";
import { TripsProvider } from "./src/contexts/TripsContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <AuthProvider>
      <TripsProvider>
        <AppNavigator />
      </TripsProvider>
    </AuthProvider>
  );
}
