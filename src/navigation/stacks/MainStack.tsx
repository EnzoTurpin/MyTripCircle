import React from "react";

import { RootStack } from "../rootStack";
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

const MainStack = () => (
  <>
    <RootStack.Screen name="Main" component={MainTabs} />
    <RootStack.Screen name="TripDetails" component={TripDetailsScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="BookingDetails" component={BookingDetailsScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="AddressDetails" component={AddressDetailsScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="FullMap" component={FullMapScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="AddressForm" component={AddressFormScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="InviteFriends" component={InviteFriendsScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="CreateTrip" component={CreateTripScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="EditTrip" component={EditTripScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="TripActions" component={TripActionsScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="Subscription" component={SubscriptionScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="Invitation" component={InvitationScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="Friends" component={FriendsScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="FriendProfile" component={FriendProfileScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="AddFriend" component={AddFriendScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="FriendRequestConfirmation" component={FriendRequestConfirmationScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="TripPublicView" component={TripPublicViewScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="TripMembers" component={TripMembersScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="FriendInvitation" component={FriendInvitationScreen} options={{ headerShown: false }} />
    <RootStack.Screen name="IdeaDetail" component={IdeaDetailScreen} options={{ headerShown: false }} />
  </>
);

export default MainStack;
