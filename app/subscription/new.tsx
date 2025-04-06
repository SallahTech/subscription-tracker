import { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  Pressable,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/contexts/ThemeContext";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const CATEGORIES = [
  "Entertainment",
  "Music",
  "Productivity",
  "Health & Fitness",
  "Education",
  "Gaming",
  "News",
  "Other",
];

export default function AddSubscriptionScreen() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const colors =
    currentTheme === "dark" ? DarkTheme.colors : DefaultTheme.colors;
  const [subscription, setSubscription] = useState({
    name: "",
    amount: "",
    category: "",
    description: "",
    nextRenewal: new Date().toISOString().split("T")[0],
  });

  const handleSave = () => {
    // TODO: Save new subscription to the database
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Add Subscription",
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.content}>
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Name</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={subscription.name}
                onChangeText={(text) =>
                  setSubscription({ ...subscription, name: text })
                }
                placeholder="Enter subscription name"
                placeholderTextColor={colors.text + "80"}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Amount</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={subscription.amount}
                onChangeText={(text) =>
                  setSubscription({ ...subscription, amount: text })
                }
                placeholder="0.00"
                placeholderTextColor={colors.text + "80"}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Category</ThemedText>
              <View style={styles.categories}>
                {CATEGORIES.map((category) => (
                  <Pressable
                    key={category}
                    onPress={() =>
                      setSubscription({ ...subscription, category })
                    }
                    style={[
                      styles.categoryButton,
                      {
                        backgroundColor:
                          subscription.category === category
                            ? "#FF6B6B"
                            : colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.categoryText,
                        {
                          color:
                            subscription.category === category
                              ? "#FFFFFF"
                              : colors.text,
                        },
                      ]}
                    >
                      {category}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Next Renewal Date</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={subscription.nextRenewal}
                onChangeText={(text) =>
                  setSubscription({ ...subscription, nextRenewal: text })
                }
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.text + "80"}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Description</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={subscription.description}
                onChangeText={(text) =>
                  setSubscription({ ...subscription, description: text })
                }
                placeholder="Add a description (optional)"
                placeholderTextColor={colors.text + "80"}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.buttonContainer}>
              <Pressable onPress={handleSave} style={styles.buttonWrapper}>
                <LinearGradient
                  colors={["#FF6B6B", "#FF8E8E"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradient}
                >
                  <ThemedText style={styles.buttonText}>
                    Add Subscription
                  </ThemedText>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  buttonContainer: {
    marginTop: 24,
  },
  buttonWrapper: {
    borderRadius: 8,
    overflow: "hidden",
  },
  gradient: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
