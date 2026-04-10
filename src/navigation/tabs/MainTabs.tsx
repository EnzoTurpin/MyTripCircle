import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTranslation } from "react-i18next";

import { MainTabParamList } from "../../types";
import { FloatingTabBar } from "../../components/FloatingTabBar";
import TripsScreen from "../../screens/TripsScreen";
import BookingsScreen from "../../screens/BookingsScreen";
import AddressesScreen from "../../screens/AddressesScreen";
import ProfileScreen from "../../screens/ProfileScreen";
import IdeasScreen from "../../screens/IdeasScreen";
import { F } from "../../theme/fonts";

const Tab = createBottomTabNavigator<MainTabParamList>();

// Défini en dehors du composant pour éviter une nouvelle référence à chaque rendu.
// Ne pas passer FloatingTabBar directement : React Navigation v7 l'appelle comme
// une fonction ordinaire (tabBar(props)), ce qui viole les Rules of Hooks.
const renderTabBar: React.ComponentProps<typeof Tab.Navigator>["tabBar"] = (props) => (
  <FloatingTabBar {...props} />
);

const MainTabs: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      tabBar={renderTabBar}
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
      <Tab.Screen name="Trips" component={TripsScreen} options={{ title: t("tabs.myTrips"), headerShown: false }} />
      <Tab.Screen name="Bookings" component={BookingsScreen} options={{ title: t("tabs.bookings"), headerShown: false }} />
      <Tab.Screen name="Ideas" component={IdeasScreen} options={{ title: t("tabs.ideas"), headerShown: false }} />
      <Tab.Screen name="Addresses" component={AddressesScreen} options={{ title: t("tabs.addresses"), headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t("tabs.profile"), headerShown: false }} />
    </Tab.Navigator>
  );
};

export default MainTabs;
