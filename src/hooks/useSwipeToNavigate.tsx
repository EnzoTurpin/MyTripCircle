import { View } from "react-native";
import { GestureHandlerRootView, PanGestureHandler, State } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";

interface SwipeToNavigateProps {
  children: React.ReactNode;
  currentIndex: number;
  totalTabs: number;
}

export const SwipeToNavigate: React.FC<SwipeToNavigateProps> = ({
  children,
  currentIndex,
  totalTabs,
}) => {
  const navigation = useNavigation();

  // Ordre des onglets
  const tabs = ["Trips", "Bookings", "Addresses", "Profile"];

  const handleSwipe = (translationX: number) => {
    const threshold = 50; // Distance minimale pour un swipe

    if (Math.abs(translationX) > threshold) {
      if (translationX > 0 && currentIndex > 0) {
        // Swipe vers la droite = onglet précédent
        navigation.navigate(tabs[currentIndex - 1] as never);
      } else if (translationX < 0 && currentIndex < totalTabs - 1) {
        // Swipe vers la gauche = onglet suivant
        navigation.navigate(tabs[currentIndex + 1] as never);
      }
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PanGestureHandler
        onHandlerStateChange={(event) => {
          if (event.nativeEvent.state === State.END) {
            handleSwipe(event.nativeEvent.translationX);
          }
        }}
        activeOffsetX={[-15, 15]}
        failOffsetY={[-15, 15]}
      >
        <View style={{ flex: 1 }}>
          {children}
        </View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};
