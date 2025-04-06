import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "components/Button";
import { WelcomeAnimation } from "@/components/WelcomeAnimation";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <WelcomeAnimation />
        <ThemedText type="title" style={styles.title}>
          Track your subscriptions with ease
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Stay on top of your recurring payments and manage your subscriptions
          effortlessly.
        </ThemedText>
      </View>
      <View style={styles.buttonContainer}>
        <Button onPress={() => router.push("/(auth)/login")}>
          Get Started
        </Button>
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
