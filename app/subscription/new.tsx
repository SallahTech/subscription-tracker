import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  Pressable,
  Modal,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/contexts/ThemeContext";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const CATEGORIES = [
  "Streaming",
  "Music",
  "Gaming",
  "Shopping",
  "Software",
  "Other",
];

export default function AddSubscriptionScreen() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const colors =
    currentTheme === "dark" ? DarkTheme.colors : DefaultTheme.colors;
  const { t } = useTranslation();
  const [subscription, setSubscription] = useState({
    name: "",
    amount: "",
    category: "",
    description: "",
    nextRenewal: new Date().toISOString().split("T")[0],
  });

  // State for custom category modal
  const [showCustomCategoryModal, setShowCustomCategoryModal] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [categories, setCategories] = useState(CATEGORIES);

  const handleSave = () => {
    // TODO: Save new subscription to the database
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
    <>
      <Stack.Screen
        options={{
          title: t("subscriptions.addNew"),
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
              <ThemedText style={styles.label}>
                {t("subscriptions.name")}
              </ThemedText>
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
                onChangeText={(text: string) =>
                  setSubscription({ ...subscription, name: text })
                }
                placeholder={t("subscriptions.namePlaceholder")}
                placeholderTextColor={colors.text + "80"}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>
                {t("subscriptions.amount")}
              </ThemedText>
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
                onChangeText={(text: string) =>
                  setSubscription({ ...subscription, amount: text })
                }
                placeholder={t("subscriptions.amountPlaceholder")}
                placeholderTextColor={colors.text + "80"}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>
                {t("subscriptions.category")}
              </ThemedText>
              <View style={styles.categoriesContainer}>
                <View style={styles.categories}>
                  {categories.map((category) => (
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
              <ThemedText style={styles.label}>
                {t("subscriptions.nextRenewal")}
              </ThemedText>
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
                onChangeText={(text: string) =>
                  setSubscription({ ...subscription, nextRenewal: text })
                }
                placeholder={t("subscriptions.nextRenewalPlaceholder")}
                placeholderTextColor={colors.text + "80"}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>
                {t("subscriptions.description")}
              </ThemedText>
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
                onChangeText={(text: string) =>
                  setSubscription({ ...subscription, description: text })
                }
                placeholder={t("subscriptions.descriptionPlaceholder")}
                placeholderTextColor={colors.text + "80"}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.buttonContainer}>
              <Pressable
                style={[styles.button, { backgroundColor: "#FF6B6B" }]}
                onPress={handleSave}
              >
                <ThemedText style={styles.buttonText}>
                  {t("subscriptions.save")}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

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
              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.card }]}
                onPress={() => setShowCustomCategoryModal(false)}
              >
                <ThemedText>{t("common.cancel")}</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: "#FF6B6B" }]}
                onPress={handleAddCustomCategory}
              >
                <ThemedText style={{ color: "#FFFFFF" }}>
                  {t("common.save")}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    marginBottom: 4,
    opacity: 0.7,
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
  categoriesContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  categories: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
  },
  addCategoryButton: {
    padding: 8,
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 24,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
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
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});
