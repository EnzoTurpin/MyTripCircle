import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { RootStackParamList, MainTabParamList } from "../types";
import { useAuth } from "../contexts/AuthContext";

// Import screens
import AuthScreen from "../screens/AuthScreen";
import OtpScreen from "../screens/OtpScreen";
import TripsScreen from "../screens/TripsScreen";
import BookingsScreen from "../screens/BookingsScreen";
import AddressesScreen from "../screens/AddressesScreen";
import ProfileScreen from "../screens/ProfileScreen";
import TripDetailsScreen from "../screens/TripDetailsScreen";
import BookingDetailsScreen from "../screens/BookingDetailsScreen";
import AddressDetailsScreen from "../screens/AddressDetailsScreen";
import InviteFriendsScreen from "../screens/InviteFriendsScreen";
import InvitationScreen from "../screens/InvitationScreen";
import CreateTripScreen from "../screens/CreateTripScreen";
import EditTripScreen from "../screens/EditTripScreen";
import SettingsScreen from "../screens/SettingsScreen";
import HelpSupportScreen from "../screens/HelpSupportScreen";
import EditProfileScreen from "../screens/EditProfileScreen";

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Trips") {
            iconName = focused ? "airplane" : "airplane-outline";
          } else if (route.name === "Bookings") {
            iconName = focused ? "receipt" : "receipt-outline";
          } else if (route.name === "Addresses") {
            iconName = focused ? "location" : "location-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          } else {
            iconName = "help-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        headerStyle: {
          backgroundColor: "#007AFF",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      })}
    >
      <Tab.Screen
        name="Trips"
        component={TripsScreen}
        options={{ title: t("tabs.myTrips") }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{ title: t("tabs.bookings") }}
      />
      <Tab.Screen
        name="Addresses"
        component={AddressesScreen}
        options={{ title: t("tabs.addresses") }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t("tabs.profile") }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="TripDetails"
              component={TripDetailsScreen}
              options={{
                headerShown: true,
                title: t("stack.tripDetails"),
                headerStyle: { backgroundColor: "#007AFF" },
                headerTintColor: "#fff",
                headerTitleStyle: {
                  fontWeight: "bold",
                },
              }}
            />
            <Stack.Screen
              name="BookingDetails"
              component={BookingDetailsScreen}
              options={{
                headerShown: true,
                title: t("stack.bookingDetails"),
                headerStyle: { backgroundColor: "#007AFF" },
                headerTintColor: "#fff",
                headerTitleStyle: {
                  fontWeight: "bold",
                },
              }}
            />
            <Stack.Screen
              name="AddressDetails"
              component={AddressDetailsScreen}
              options={{
                headerShown: true,
                title: t("stack.addressDetails"),
                headerStyle: { backgroundColor: "#007AFF" },
                headerTintColor: "#fff",
                headerTitleStyle: {
                  fontWeight: "bold",
                },
              }}
            />
            <Stack.Screen
              name="InviteFriends"
              component={InviteFriendsScreen}
              options={{
                headerShown: true,
                title: t("stack.inviteFriends"),
                headerStyle: { backgroundColor: "#007AFF" },
                headerTintColor: "#fff",
                headerTitleStyle: {
                  fontWeight: "bold",
                },
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
              name="EditProfile"
              component={EditProfileScreen}
              options={{
                headerShown: true,
                title: "Edit Profile",
                headerStyle: { backgroundColor: "#007AFF" },
                headerTintColor: "#fff",
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                headerShown: true,
                title: "Settings",
                headerStyle: { backgroundColor: "#007AFF" },
                headerTintColor: "#fff",
              }}
            />
            <Stack.Screen
              name="HelpSupport"
              component={HelpSupportScreen}
              options={{
                headerShown: true,
                title: "Help & Support",
                headerStyle: { backgroundColor: "#007AFF" },
                headerTintColor: "#fff",
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
