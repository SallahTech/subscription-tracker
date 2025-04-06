import React from "react";
import { Link, Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <ThemedText type="title">This screen doesn't exist.</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText style={styles.linkText}>Go to home screen!</ThemedText>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 10,
  },
  linkText: {
    fontSize: 14,
    color: "#2e78b7",
  },
});
