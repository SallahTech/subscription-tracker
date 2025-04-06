import { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  Pressable,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "components/Button";
import { useTheme } from "@/contexts/ThemeContext";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

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

// Default categories
const CATEGORIES = [
  "Streaming",
  "Music",
  "Gaming",
  "Shopping",
  "Software",
  "Other",
];

export default function SubscriptionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [subscription, setSubscription] = useState(MOCK_SUBSCRIPTION);
  const { currentTheme } = useTheme();
  const colors =
    currentTheme === "dark" ? DarkTheme.colors : DefaultTheme.colors;
  const { t } = useTranslation();

  // State for custom category modal
  const [showCustomCategoryModal, setShowCustomCategoryModal] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [categories, setCategories] = useState(CATEGORIES);

  const handleSave = () => {
    // TODO: Save changes to the database
    setIsEditing(false);
  };

  const handleDelete = () => {
    // TODO: Delete subscription from the database
    router.back();
  };

  const handleAddCustomCategory = () => {
    if (customCategory.trim()) {
      setCategories([...categories, customCategory.trim()]);
      setSubscription({ ...subscription, category: customCategory.trim() });
      setCustomCategory("");
      setShowCustomCategoryModal(false);
    }
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
          {isEditing ? t("subscriptions.editSubscription") : subscription.name}
        </ThemedText>
      </View>

      <View style={[styles.content, { backgroundColor: colors.background }]}>
        {isEditing ? (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <ThemedText>{t("subscriptions.name")}</ThemedText>
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
                placeholder={t("subscriptions.namePlaceholder")}
                placeholderTextColor={colors.text + "80"}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText>{t("subscriptions.amount")}</ThemedText>
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
                placeholder={t("subscriptions.amountPlaceholder")}
                placeholderTextColor={colors.text + "80"}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText>{t("subscriptions.category")}</ThemedText>
              <View style={styles.categoryContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.categoryInput,
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
                <Pressable
                  style={({ pressed }) => [
                    styles.addCategoryButton,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={() => setShowCustomCategoryModal(true)}
                >
                  <Ionicons
                    name="add-circle"
                    size={24}
                    color={colors.primary}
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText>{t("subscriptions.description")}</ThemedText>
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
                placeholder={t("subscriptions.descriptionPlaceholder")}
                placeholderTextColor={colors.text + "80"}
              />
            </View>

            <View style={styles.buttonContainer}>
              <Button onPress={handleSave}>
                {t("subscriptions.saveChanges")}
              </Button>
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.detailItem}>
              <ThemedText style={{ color: colors.text + "80" }}>
                {t("subscriptions.amount")}
              </ThemedText>
              <ThemedText type="defaultSemiBold">
                ${subscription.amount.toFixed(2)}
                {t("subscriptions.perMonth")}
              </ThemedText>
            </View>

            <View style={styles.detailItem}>
              <ThemedText style={{ color: colors.text + "80" }}>
                {t("subscriptions.category")}
              </ThemedText>
              <ThemedText>{subscription.category}</ThemedText>
            </View>

            <View style={styles.detailItem}>
              <ThemedText style={{ color: colors.text + "80" }}>
                {t("subscriptions.nextRenewal")}
              </ThemedText>
              <ThemedText>
                {new Date(subscription.nextRenewal).toLocaleDateString()}
              </ThemedText>
            </View>

            <View style={styles.detailItem}>
              <ThemedText style={{ color: colors.text + "80" }}>
                {t("subscriptions.description")}
              </ThemedText>
              <ThemedText>{subscription.description}</ThemedText>
            </View>

            <View style={styles.buttonContainer}>
              <Button onPress={() => setIsEditing(true)}>
                {t("subscriptions.edit")}
              </Button>
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
              {t("subscriptions.delete")}
            </ThemedText>
          </Pressable>
        </View>
      </View>

      {/* Custom Category Modal */}
      <Modal
        visible={showCustomCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCustomCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <ThemedText type="title" style={styles.modalTitle}>
              {t("subscriptions.addCustomCategory")}
            </ThemedText>

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
              value={customCategory}
              onChangeText={setCustomCategory}
              placeholder={t("subscriptions.customCategoryPlaceholder")}
              placeholderTextColor={colors.text + "80"}
            />

            <View style={styles.modalButtons}>
              <Button
                onPress={() => setShowCustomCategoryModal(false)}
                style={styles.modalButton}
              >
                {t("common.cancel")}
              </Button>
              <Button
                onPress={handleAddCustomCategory}
                style={styles.modalButton}
              >
                {t("common.save")}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
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
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryInput: {
    flex: 1,
    marginRight: 8,
  },
  addCategoryButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});
