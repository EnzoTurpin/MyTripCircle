import React from "react";

import { RootStack } from "../rootStack";
import WelcomeScreen from "../../screens/WelcomeScreen";
import AuthScreen from "../../screens/AuthScreen";
// @ts-ignore - OtpScreen exists but TypeScript cache may not be updated
import OtpScreen from "../../screens/OtpScreen";
import ForgotPasswordScreen from "../../screens/ForgotPasswordScreen";
import InvitationScreen from "../../screens/InvitationScreen";
import FriendInvitationScreen from "../../screens/FriendInvitationScreen";

const AuthStack = () => (
  <>
    <RootStack.Screen name="Welcome" component={WelcomeScreen} />
    <RootStack.Screen name="Auth" component={AuthScreen} />
    <RootStack.Screen name="Invitation" component={InvitationScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="FriendInvitation" component={FriendInvitationScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="Otp" component={OtpScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
  </>
);

export default AuthStack;
