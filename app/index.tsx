import { StyleSheet, View } from "react-native";
import { Link } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "components/Button";

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Track your subscriptions with ease
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Stay on top of your recurring payments and manage your subscriptions
          effortlessly.
        </ThemedText>
      </View>
      <View style={styles.buttonContainer}>
        <Link href="/auth/signup" asChild>
          <Button>Get Started</Button>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.7,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
