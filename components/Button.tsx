import { StyleSheet, TouchableOpacity, Text, ViewStyle } from "react-native";

type ButtonProps = {
  onPress: () => void;
  children: React.ReactNode;
  variant?: "primary" | "outline" | "disabled";
  style?: ViewStyle;
};

export function Button({
  onPress,
  children,
  variant = "primary",
  style,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        variant === "primary" && styles.primaryButton,
        variant === "outline" && styles.outlineButton,
        variant === "disabled" && styles.disabledButton,
        style,
      ]}
      disabled={variant === "disabled"}
    >
      <Text
        style={[
          styles.text,
          variant === "primary" && styles.primaryText,
          variant === "outline" && styles.outlineText,
          variant === "disabled" && styles.disabledText,
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  primaryButton: {
    backgroundColor: "#FF6B6B",
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  disabledButton: {
    backgroundColor: "#E2E8F0",
    borderColor: "#E2E8F0",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryText: {
    color: "#FFFFFF",
  },
  outlineText: {
    color: "#FF6B6B",
  },
  disabledText: {
    color: "#94A3B8",
  },
});
