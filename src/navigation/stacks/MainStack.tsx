import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import { RootStackParamList } from "../../types";
import MainTabs from "../tabs/MainTabs";
import TripDetailsScreen from "../../screens/TripDetailsScreen";
import BookingDetailsScreen from "../../screens/BookingDetailsScreen";
import AddressDetailsScreen from "../../screens/AddressDetailsScreen";
import FullMapScreen from "../../screens/FullMapScreen";
import AddressFormScreen from "../../screens/AddressFormScreen";
import InviteFriendsScreen from "../../screens/InviteFriendsScreen";
import CreateTripScreen from "../../screens/CreateTripScreen";
import EditTripScreen from "../../screens/EditTripScreen";
import TripActionsScreen from "../../screens/TripActionsScreen";
import SubscriptionScreen from "../../screens/SubscriptionScreen";
import EditProfileScreen from "../../screens/EditProfileScreen";
import SettingsScreen from "../../screens/SettingsScreen";
import ChangePasswordScreen from "../../screens/ChangePasswordScreen";
import HelpSupportScreen from "../../screens/HelpSupportScreen";
import InvitationScreen from "../../screens/InvitationScreen";
import FriendsScreen from "../../screens/FriendsScreen";
import FriendProfileScreen from "../../screens/FriendProfileScreen";
import AddFriendScreen from "../../screens/AddFriendScreen";
import FriendRequestConfirmationScreen from "../../screens/FriendRequestConfirmationScreen";
import TripPublicViewScreen from "../../screens/TripPublicViewScreen";
import TripMembersScreen from "../../screens/TripMembersScreen";
import NotificationsScreen from "../../screens/NotificationsScreen";
import ForgotPasswordScreen from "../../screens/ForgotPasswordScreen";
import FriendInvitationScreen from "../../screens/FriendInvitationScreen";
import IdeaDetailScreen from "../../screens/IdeaDetailScreen";

const Stack = createStackNavigator<RootStackParamList>();

const MainStack: React.FC = () => (
  <>
    <Stack.Screen name="Main" component={MainTabs} />
    <Stack.Screen name="TripDetails" component={TripDetailsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AddressDetails" component={AddressDetailsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="FullMap" component={FullMapScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AddressForm" component={AddressFormScreen} options={{ headerShown: false }} />
    <Stack.Screen name="InviteFriends" component={InviteFriendsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="CreateTrip" component={CreateTripScreen} options={{ headerShown: false }} />
    <Stack.Screen name="EditTrip" component={EditTripScreen} options={{ headerShown: false }} />
    <Stack.Screen name="TripActions" component={TripActionsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ headerShown: false }} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
    <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Invitation" component={InvitationScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Friends" component={FriendsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="FriendProfile" component={FriendProfileScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AddFriend" component={AddFriendScreen} options={{ headerShown: false }} />
    <Stack.Screen name="FriendRequestConfirmation" component={FriendRequestConfirmationScreen} options={{ headerShown: false }} />
    <Stack.Screen name="TripPublicView" component={TripPublicViewScreen} options={{ headerShown: false }} />
    <Stack.Screen name="TripMembers" component={TripMembersScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
    <Stack.Screen name="FriendInvitation" component={FriendInvitationScreen} options={{ headerShown: false }} />
    <Stack.Screen name="IdeaDetail" component={IdeaDetailScreen} options={{ headerShown: false }} />
  </>
);

export default MainStack;
