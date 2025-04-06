import React, { forwardRef } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
} from "react-native";

interface ButtonProps extends Omit<TouchableOpacityProps, "disabled"> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<View, ButtonProps>(
  (
    {
      onPress,
      children,
      variant = "primary",
      disabled = false,
      loading = false,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <View ref={ref} style={style}>
        <TouchableOpacity
          style={[
            styles.button,
            variant === "secondary" && styles.secondaryButton,
            disabled && styles.disabledButton,
          ]}
          onPress={onPress}
          disabled={disabled || loading}
          {...props}
        >
          {loading ? (
            <ActivityIndicator
              color={variant === "primary" ? "#FFFFFF" : "#2563EB"}
            />
          ) : (
            <Text
              style={[
                styles.text,
                variant === "secondary" && styles.secondaryText,
                disabled && styles.disabledText,
              ]}
            >
              {children}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }
);

Button.displayName = "Button";

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#2563EB",
  },
  disabledButton: {
    backgroundColor: "#E2E8F0",
    borderColor: "#E2E8F0",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryText: {
    color: "#2563EB",
  },
  disabledText: {
    color: "#94A3B8",
  },
});
