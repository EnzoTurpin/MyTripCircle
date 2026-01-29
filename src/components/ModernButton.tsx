import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface ModernButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  loading?: boolean;
  fullWidth?: boolean;
  gradient?: boolean;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  title,
  variant = "primary",
  size = "medium",
  icon,
  iconPosition = "left",
  loading = false,
  fullWidth = false,
  gradient = false,
  style,
  disabled,
  ...props
}) => {
  const buttonStyle = [
    styles.button,
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ].filter(Boolean);

  // Needed to keep gradient buttons perfectly rounded on all platforms.
  const resolvedButtonStyle = StyleSheet.flatten(
    buttonStyle as any,
  ) as ViewStyle;
  const borderRadius =
    (resolvedButtonStyle?.borderRadius as number | undefined) ?? 12;

  const textStyle: TextStyle[] = [
    styles.text,
    styles[`${size}Text` as keyof typeof styles],
    styles[`${variant}Text` as keyof typeof styles],
  ];

  const iconSize = size === "small" ? 16 : size === "medium" ? 18 : 24;

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary" || variant === "secondary"
              ? "#FFFFFF"
              : "#2891FF"
          }
        />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={
                variant === "primary" || variant === "secondary"
                  ? "#FFFFFF"
                  : "#2891FF"
              }
              style={styles.iconLeft}
            />
          )}
          <Text style={textStyle} numberOfLines={1}>
            {title}
          </Text>
          {icon && iconPosition === "right" && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={
                variant === "primary" || variant === "secondary"
                  ? "#FFFFFF"
                  : "#2891FF"
              }
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </>
  );

  if (variant === "primary" && gradient) {
    return (
      <TouchableOpacity
        style={buttonStyle}
        activeOpacity={0.8}
        disabled={disabled || loading}
        {...props}
      >
        <LinearGradient
          colors={["#2891FF", "#8869FF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradient,
            styles[size],
            { borderRadius, overflow: "hidden" },
          ]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[buttonStyle, styles[variant]]}
      activeOpacity={0.8}
      disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  primary: {
    backgroundColor: "#2891FF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondary: {
    backgroundColor: "#8869FF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  outline: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#2891FF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  small: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: 28,
    paddingVertical: 18,
    minHeight: 60,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
  },
  smallText: {
    fontSize: 13,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 17,
  },
  primaryText: {
    color: "#FFFFFF",
  },
  secondaryText: {
    color: "#FFFFFF",
  },
  outlineText: {
    color: "#2891FF",
  },
  ghostText: {
    color: "#2891FF",
  },
  iconLeft: {
    marginRight: 6,
  },
  iconRight: {
    marginLeft: 6,
  },
});
