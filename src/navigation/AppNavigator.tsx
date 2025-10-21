import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { RootStackParamList, MainTabParamList } from "../types";
import { useAuth } from "../contexts/AuthContext";

// Import screens
import AuthScreen from "../screens/AuthScreen";
import TripsScreen from "../screens/TripsScreen";
import BookingsScreen from "../screens/BookingsScreen";
import AddressesScreen from "../screens/AddressesScreen";
import ProfileScreen from "../screens/ProfileScreen";
import TripDetailsScreen from "../screens/TripDetailsScreen";
import BookingDetailsScreen from "../screens/BookingDetailsScreen";
import AddressDetailsScreen from "../screens/AddressDetailsScreen";
import InviteFriendsScreen from "../screens/InviteFriendsScreen";

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
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
        options={{ title: "My Trips" }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{ title: "Bookings" }}
      />
      <Tab.Screen
        name="Addresses"
        component={AddressesScreen}
        options={{ title: "Addresses" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // You can add a loading screen here
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
                title: "Trip Details",
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
                title: "Booking Details",
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
                title: "Address Details",
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
                title: "Invite Friends",
                headerStyle: { backgroundColor: "#007AFF" },
                headerTintColor: "#fff",
                headerTitleStyle: {
                  fontWeight: "bold",
                },
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
