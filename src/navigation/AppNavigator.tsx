import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { RootStackParamList } from "../types";
import { useAuth } from "../contexts/AuthContext";
import TermsScreen from "../screens/TermsScreen";
import PrivacyScreen from "../screens/PrivacyScreen";
import AuthStack from "./stacks/AuthStack";
import MainStack from "./stacks/MainStack";

const Stack = createStackNavigator<RootStackParamList>();

const linking = {
  prefixes: ["mytripcircle://"],
  config: {
    screens: {
      Invitation: "invitation/:token",
      FriendInvitation: "friend-invite/:token",
      ForgotPassword: {
        path: "reset-password",
        parse: { code: (code: string) => code },
      },
    },
  },
};

const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? <MainStack /> : <AuthStack />}
        <Stack.Screen name="Terms" component={TermsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
