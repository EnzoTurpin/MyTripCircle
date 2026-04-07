import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
} from "react-native";

import { COLORS, RADIUS, SHADOW } from "../theme";

interface ModernCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outlined" | "filled";
  style?: StyleProp<ViewStyle>;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  variant = "default",
  style,
  ...props
}) => {
  const cardStyle = [
    styles.card,
    variant === "elevated" && styles.elevated,
    variant === "outlined" && styles.outlined,
    variant === "filled" && styles.filled,
    style,
  ];

  if (props.onPress) {
    return (
      <TouchableOpacity style={cardStyle} activeOpacity={0.7} {...props}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    padding: 20,
    ...SHADOW.light,
  },
  elevated: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.sandDark,
    ...SHADOW.medium,
  },
  outlined: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.sandDark,
    shadowOpacity: 0,
    elevation: 0,
  },
  filled: {
    backgroundColor: COLORS.sandMid,
    shadowOpacity: 0,
    elevation: 0,
  },
});
