import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";

interface ThemedTextProps extends TextProps {
  type?: "title" | "subtitle" | "default" | "defaultSemiBold";
}

export function ThemedText({
  type = "default",
  style,
  ...props
}: ThemedTextProps) {
  const { currentTheme } = useTheme();
  const colors =
    currentTheme === "dark" ? DarkTheme.colors : DefaultTheme.colors;

  return (
    <Text style={[styles[type], { color: colors.text }, style]} {...props} />
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  default: {
    fontSize: 16,
  },
  defaultSemiBold: {
    fontSize: 16,
    fontWeight: "600",
  },
});
