import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const { width } = Dimensions.get('window');
const TAB_BAR_WIDTH = width - 32; // Marges de 16px de chaque côté
const TAB_WIDTH = TAB_BAR_WIDTH / 4;

export const FloatingTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: state.index,
      useNativeDriver: true,
      damping: 15,
      stiffness: 150,
    }).start();
  }, [state.index]);

  const getIconName = (routeName: string, focused: boolean) => {
    const iconMap: { [key: string]: { focused: string; unfocused: string } } = {
      Trips: { focused: 'airplane', unfocused: 'airplane-outline' },
      Bookings: { focused: 'calendar', unfocused: 'calendar-outline' },
      Addresses: { focused: 'location', unfocused: 'location-outline' },
      Profile: { focused: 'person', unfocused: 'person-outline' },
    };

    const icons = iconMap[routeName] || {
      focused: 'help',
      unfocused: 'help-outline',
    };
    return focused ? icons.focused : icons.unfocused;
  };

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [8, TAB_WIDTH + 8, TAB_WIDTH * 2 + 8, TAB_WIDTH * 3 + 8],
  });

  return (
    <View style={styles.container}>
      <View style={styles.tabBarContainer}>
        {/* Indicateur de sélection animé */}
        <Animated.View
          style={[
            styles.activeIndicator,
            {
              transform: [{ translateX }],
            },
          ]}
        />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const iconName = getIconName(
            route.name,
            isFocused
          ) as keyof typeof Ionicons.glyphMap;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconContainer,
                  isFocused && styles.iconContainerActive,
                ]}
              >
                <Ionicons
                  name={iconName}
                  size={isFocused ? 26 : 24}
                  color={isFocused ? '#2891FF' : '#9E9E9E'}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: TAB_BAR_WIDTH,
    height: 64,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
    // Effet glassmorphism
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
  },
  activeIndicator: {
    position: 'absolute',
    top: 8,
    left: 0,
    width: TAB_WIDTH - 16,
    height: 48,
    backgroundColor: '#E8F4FF',
    borderRadius: 16,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  iconContainerActive: {
    transform: [{ scale: 1.1 }],
  },
});
