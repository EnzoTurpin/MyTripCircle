import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Linking } from "react-native";

import { RootStackParamList, MainTabParamList } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { FloatingTabBar } from "../components/FloatingTabBar";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";

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
import CreateTripScreen from "../screens/CreateTripScreen";
import EditTripScreen from "../screens/EditTripScreen";
import SubscriptionScreen from "../screens/SubscriptionScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import HelpSupportScreen from "../screens/HelpSupportScreen";

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: "#FFFFFF",
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: "#212121",
        headerTitleStyle: {
          fontWeight: "700",
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
  const { t } = useTranslation();

  // Configuration des deep links
  const linking = {
    prefixes: ["mytripcircle://"],
    config: {
      screens: {
        Invitation: "invitation/:token",
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
              options={{
                headerShown: false,
              }}
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
          </>
        ) : (
          <>
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen
              name="Invitation"
              component={InvitationScreen}
              options={{
                headerShown: false,
              }}
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
              options={{
                headerShown: false,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
