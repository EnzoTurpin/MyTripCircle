import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useAuth } from "../contexts/AuthContext";
import TermsScreen from "../screens/TermsScreen";
import PrivacyScreen from "../screens/PrivacyScreen";
import LegalNoticeScreen from "../screens/LegalNoticeScreen";
import ConsentScreen, { CONSENT_KEY } from "../screens/ConsentScreen";
import NotFoundScreen from "../screens/NotFoundScreen";
import ErrorScreen from "../screens/ErrorScreen";
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
        path: "reset-password", // NOSONAR — chemin de deep link, pas un secret
        parse: { code: (code: string) => code },
      },
    },
  },
};

const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CONSENT_KEY).then((value) => {
      setConsentGiven(value !== null);
      setConsentChecked(true);
    });
  }, []);

  if (loading || !consentChecked) return null;

  return (
    <NavigationContainer linking={linking}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {consentGiven ? (
          <>
            {user ? MainStack() : AuthStack()}
          </>
        ) : (
          <RootStack.Screen
            name="Consent"
            options={{ headerShown: false }}
          >
            {() => <ConsentScreen onConsentGiven={() => setConsentGiven(true)} />}
          </RootStack.Screen>
        )}
        <RootStack.Screen name="Terms" component={TermsScreen} options={{ headerShown: false }} />
        <RootStack.Screen name="Privacy" component={PrivacyScreen} options={{ headerShown: false }} />
        <RootStack.Screen name="LegalNotice" component={LegalNoticeScreen} options={{ headerShown: false }} />
        <RootStack.Screen name="NotFound" component={NotFoundScreen} options={{ headerShown: false }} />
        <RootStack.Screen name="Error" component={ErrorScreen} options={{ headerShown: false }} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
