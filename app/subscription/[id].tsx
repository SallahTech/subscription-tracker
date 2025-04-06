import { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "components/Button";
import { useTheme } from "@/contexts/ThemeContext";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// Mock data (in a real app, this would come from a database)
const MOCK_SUBSCRIPTION = {
  id: "1",
  name: "Netflix",
  amount: 15.99,
  nextRenewal: "2024-05-20",
  icon: "🎬",
  category: "Entertainment",
  description: "Standard HD streaming plan",
};

export default function SubscriptionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [subscription, setSubscription] = useState(MOCK_SUBSCRIPTION);
  const { currentTheme } = useTheme();
  const colors =
    currentTheme === "dark" ? DarkTheme.colors : DefaultTheme.colors;

  const handleSave = () => {
    // TODO: Save changes to the database
    setIsEditing(false);
  };

  const handleDelete = () => {
    // TODO: Delete subscription from the database
    router.back();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <ThemedText type="title">
          {isEditing ? "Edit Subscription" : subscription.name}
        </ThemedText>
      </View>

      <View style={[styles.content, { backgroundColor: colors.background }]}>
        {isEditing ? (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <ThemedText>Name</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      currentTheme === "dark" ? colors.card : "#fff",
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={subscription.name}
                onChangeText={(text) =>
                  setSubscription({ ...subscription, name: text })
                }
                placeholderTextColor={colors.text + "80"}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText>Amount</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      currentTheme === "dark" ? colors.card : "#fff",
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={subscription.amount.toString()}
                onChangeText={(text) =>
                  setSubscription({
                    ...subscription,
                    amount: parseFloat(text) || 0,
                  })
                }
                keyboardType="decimal-pad"
                placeholderTextColor={colors.text + "80"}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText>Category</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      currentTheme === "dark" ? colors.card : "#fff",
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={subscription.category}
                onChangeText={(text) =>
                  setSubscription({ ...subscription, category: text })
                }
                placeholderTextColor={colors.text + "80"}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText>Description</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor:
                      currentTheme === "dark" ? colors.card : "#fff",
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={subscription.description}
                onChangeText={(text) =>
                  setSubscription({ ...subscription, description: text })
                }
                multiline
                numberOfLines={4}
                placeholderTextColor={colors.text + "80"}
              />
            </View>

            <View style={styles.buttonContainer}>
              <Button onPress={handleSave}>Save Changes</Button>
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.detailItem}>
              <ThemedText style={{ color: colors.text + "80" }}>
                Amount
              </ThemedText>
              <ThemedText type="defaultSemiBold">
                ${subscription.amount.toFixed(2)}/month
              </ThemedText>
            </View>

            <View style={styles.detailItem}>
              <ThemedText style={{ color: colors.text + "80" }}>
                Category
              </ThemedText>
              <ThemedText>{subscription.category}</ThemedText>
            </View>

            <View style={styles.detailItem}>
              <ThemedText style={{ color: colors.text + "80" }}>
                Next Renewal
              </ThemedText>
              <ThemedText>
                {new Date(subscription.nextRenewal).toLocaleDateString()}
              </ThemedText>
            </View>

            <View style={styles.detailItem}>
              <ThemedText style={{ color: colors.text + "80" }}>
                Description
              </ThemedText>
              <ThemedText>{subscription.description}</ThemedText>
            </View>

            <View style={styles.buttonContainer}>
              <Button onPress={() => setIsEditing(true)}>Edit</Button>
            </View>
          </View>
        )}

        <View style={styles.deleteContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.deleteButtonPressed,
            ]}
            onPress={handleDelete}
          >
            <ThemedText style={styles.deleteButtonText}>
              Delete Subscription
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  content: {
    padding: 20,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
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
  detailItem: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
    opacity: 0.7,
  },
  buttonContainer: {
    marginTop: 24,
  },
  deleteContainer: {
    marginTop: 40,
  },
  deleteButton: {
    backgroundColor: "#dc2626",
    borderColor: "#dc2626",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonPressed: {
    opacity: 0.8,
  },
  deleteButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
