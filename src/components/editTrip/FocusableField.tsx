import React, { useRef } from "react";
import { Animated } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

interface Props {
  baseStyle: object;
  render: (handlers: { onFocus: () => void; onBlur: () => void }) => React.ReactNode;
}

/**
 * Enveloppe un champ de formulaire avec une animation de bordure au focus.
 * Utilise Animated pour éviter les re-renders React sur chaque frappe.
 */
const FocusableField: React.FC<Props> = ({ baseStyle, render }) => {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;
  const borderColor = anim.interpolate({ inputRange: [0, 1], outputRange: [colors.border, colors.terra] });
  const shadowOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.18] });

  const onFocus = useRef(
    () => Animated.timing(anim, { toValue: 1, duration: 150, useNativeDriver: false }).start()
  ).current;
  const onBlur = useRef(
    () => Animated.timing(anim, { toValue: 0, duration: 150, useNativeDriver: false }).start()
  ).current;

  return (
    <Animated.View
      style={[
        baseStyle,
        {
          borderColor,
          shadowColor: colors.terra,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity,
          shadowRadius: 5,
          elevation: 2,
        },
      ]}
    >
      {render({ onFocus, onBlur })}
    </Animated.View>
  );
};

export default FocusableField;
