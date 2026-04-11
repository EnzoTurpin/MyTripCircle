import React from "react";
import { NavigationContainer } from "@react-navigation/native";

import { useAuth } from "../contexts/AuthContext";
import TermsScreen from "../screens/TermsScreen";
import PrivacyScreen from "../screens/PrivacyScreen";
import AuthStack from "./stacks/AuthStack";
import MainStack from "./stacks/MainStack";
import { RootStack } from "./rootStack";

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
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? MainStack() : AuthStack()}
        <RootStack.Screen name="Terms" component={TermsScreen} options={{ headerShown: false }} />
        <RootStack.Screen name="Privacy" component={PrivacyScreen} options={{ headerShown: false }} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
