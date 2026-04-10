import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import { RootStackParamList } from "../../types";
import WelcomeScreen from "../../screens/WelcomeScreen";
import AuthScreen from "../../screens/AuthScreen";
// @ts-ignore - OtpScreen exists but TypeScript cache may not be updated
import OtpScreen from "../../screens/OtpScreen";
import ForgotPasswordScreen from "../../screens/ForgotPasswordScreen";
import InvitationScreen from "../../screens/InvitationScreen";
import FriendInvitationScreen from "../../screens/FriendInvitationScreen";

const Stack = createStackNavigator<RootStackParamList>();

const AuthStack: React.FC = () => (
  <>
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="Auth" component={AuthScreen} />
    <Stack.Screen name="Invitation" component={InvitationScreen} options={{ headerShown: false }} />
    <Stack.Screen name="FriendInvitation" component={FriendInvitationScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Otp" component={OtpScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
  </>
);

export default AuthStack;
