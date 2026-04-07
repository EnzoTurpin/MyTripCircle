import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { F } from "../theme/fonts";
import { useTheme } from "../contexts/ThemeContext";

const TERRA = '#C4714A';

export const FloatingTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const getTabLabel = (routeName: string): string => {
    const map: Record<string, string> = {
      Trips:     t('tabs.trips'),
      Bookings:  t('tabs.bookings'),
      Addresses: t('tabs.addresses'),
      Ideas:     t('tabs.ideas'),
      Profile:   t('tabs.profile'),
    };
    return map[routeName] ?? routeName;
  };

  // One animated value per tab to drive the pip opacity/scale
  const pipAnimations = React.useRef(
    state.routes.map((_, i) => new Animated.Value(i === state.index ? 1 : 0)),
  ).current;

  React.useEffect(() => {
    state.routes.forEach((_, i) => {
      Animated.spring(pipAnimations[i], {
        toValue: i === state.index ? 1 : 0,
        useNativeDriver: true,
        damping: 15,
        stiffness: 200,
      }).start();
    });
  }, [state.index]);

  const getIconName = (routeName: string, focused: boolean) => {
    const iconMap: Record<string, { focused: string; unfocused: string }> = {
      Trips:     { focused: 'airplane',     unfocused: 'airplane-outline' },
      Bookings:  { focused: 'calendar',     unfocused: 'calendar-outline' },
      Addresses: { focused: 'location',     unfocused: 'location-outline' },
      Ideas:     { focused: 'bulb',         unfocused: 'bulb-outline' },
      Profile:   { focused: 'person',       unfocused: 'person-outline' },
    };
    const icons = iconMap[routeName] ?? { focused: 'help', unfocused: 'help-outline' };
    return focused ? icons.focused : icons.unfocused;
  };

  const paddingBottom = Platform.OS === 'ios' ? insets.bottom : 8;

  return (
    <View style={[styles.container, { paddingBottom, backgroundColor: colors.bgLight, borderTopColor: colors.bgDark }]}>
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
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        const iconName = getIconName(
          route.name,
          isFocused,
        ) as keyof typeof Ionicons.glyphMap;

        const pipScale = pipAnimations[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        });

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={(options as any).tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            {/* Terra pip above icon */}
            <Animated.View
              style={[
                styles.pip,
                {
                  opacity: pipAnimations[index],
                  transform: [{ scaleX: pipScale }],
                },
              ]}
            />

            <Ionicons
              name={iconName}
              size={28}
              color={isFocused ? TERRA : colors.textLight}
            />

            <Text style={[styles.label, { color: colors.textLight }, isFocused && styles.labelActive]}>
              {getTabLabel(route.name)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 4,
    gap: 2,
  },
  pip: {
    position: 'absolute',
    top: -10,
    width: 16,
    height: 2.5,
    borderRadius: 999,
    backgroundColor: TERRA,
  },
  label: {
    fontSize: 12,
    fontFamily: F.sans500,
    marginTop: 2,
  },
  labelActive: {
    color: TERRA,
    fontFamily: F.sans600,
  },
});
