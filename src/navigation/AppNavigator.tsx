import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTranslation } from "react-i18next";

import { RootStackParamList, MainTabParamList } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { FloatingTabBar } from "../components/FloatingTabBar";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import TermsScreen from "../screens/TermsScreen";
import PrivacyScreen from "../screens/PrivacyScreen";

// Import screens
import AuthScreen from "../screens/AuthScreen";
// @ts-ignore - OtpScreen exists but TypeScript cache may not be updated
import OtpScreen from "../screens/OtpScreen";
import TripsScreen from "../screens/TripsScreen";
import BookingsScreen from "../screens/BookingsScreen";
import AddressesScreen from "../screens/AddressesScreen";
import AddressFormScreen from "../screens/AddressFormScreen";
import ProfileScreen from "../screens/ProfileScreen";
import TripDetailsScreen from "../screens/TripDetailsScreen";
import BookingDetailsScreen from "../screens/BookingDetailsScreen";
import AddressDetailsScreen from "../screens/AddressDetailsScreen";
import InviteFriendsScreen from "../screens/InviteFriendsScreen";
import InvitationScreen from "../screens/InvitationScreen";
import FriendsScreen from "../screens/FriendsScreen";
import FriendProfileScreen from "../screens/FriendProfileScreen";
import TripPublicViewScreen from "../screens/TripPublicViewScreen";
import TripMembersScreen from "../screens/TripMembersScreen";
import AddFriendScreen from "../screens/AddFriendScreen";
import FriendRequestConfirmationScreen from "../screens/FriendRequestConfirmationScreen";
import CreateTripScreen from "../screens/CreateTripScreen";
import EditTripScreen from "../screens/EditTripScreen";
import TripActionsScreen from "../screens/TripActionsScreen";
import IdeasScreen from "../screens/IdeasScreen";
import SubscriptionScreen from "../screens/SubscriptionScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import HelpSupportScreen from "../screens/HelpSupportScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import FriendInvitationScreen from "../screens/FriendInvitationScreen";
import FullMapScreen from "../screens/FullMapScreen";
import IdeaDetailScreen from "../screens/IdeaDetailScreen";
import { F } from "../theme/fonts";

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      tabBar={FloatingTabBar}
      screenOptions={{
        headerStyle: {
          backgroundColor: "#FFFFFF",
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: "#212121",
        headerTitleStyle: {
          fontFamily: F.sans700,
          fontSize: 20,
        },
      }}
    >
      <Tab.Screen
        name="Trips"
        component={TripsScreen}
        options={{
          title: t("tabs.myTrips"),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          title: t("tabs.bookings"),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Ideas"
        component={IdeasScreen}
        options={{
          title: t("tabs.ideas"),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Addresses"
        component={AddressesScreen}
        options={{
          title: t("tabs.addresses"),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t("tabs.profile"),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();

  // Configuration des deep links
  const linking = {
    prefixes: ["mytripcircle://"],
    config: {
      screens: {
        Invitation: "invitation/:token",
        FriendInvitation: "friend-invite/:token",
        ForgotPassword: {
          path: "reset-password",
          parse: {
            code: (code: string) => code,
          },
        },
      },
    },
  };

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="TripDetails"
              component={TripDetailsScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="BookingDetails"
              component={BookingDetailsScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="AddressDetails"
              component={AddressDetailsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="FullMap"
              component={FullMapScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AddressForm"
              component={AddressFormScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="InviteFriends"
              component={InviteFriendsScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="CreateTrip"
              component={CreateTripScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="EditTrip"
              component={EditTripScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="TripActions"
              component={TripActionsScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Subscription"
              component={SubscriptionScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
              options={{
                // We use a custom header inside the screen (gradient + back button),
                // so we disable the native Stack header to avoid duplicates.
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="HelpSupport"
              component={HelpSupportScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Invitation"
              component={InvitationScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Friends"
              component={FriendsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="FriendProfile"
              component={FriendProfileScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AddFriend"
              component={AddFriendScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="FriendRequestConfirmation"
              component={FriendRequestConfirmationScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="TripPublicView"
              component={TripPublicViewScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="TripMembers"
              component={TripMembersScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="FriendInvitation"
              component={FriendInvitationScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="IdeaDetail"
              component={IdeaDetailScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen
              name="Invitation"
              component={InvitationScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="FriendInvitation"
              component={FriendInvitationScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Otp"
              component={OtpScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
        <Stack.Screen name="Terms" component={TermsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
