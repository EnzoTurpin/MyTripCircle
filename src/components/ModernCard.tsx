import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
} from "react-native";

interface ModernCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outlined";
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  elevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  outlined: {
    borderWidth: 1,
    borderColor: "#EEEEEE",
    shadowOpacity: 0,
    elevation: 0,
  },
});
