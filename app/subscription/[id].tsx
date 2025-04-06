import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  Pressable,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "components/Button";
import { useTheme } from "@/contexts/ThemeContext";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import Toast from "react-native-toast-message";
import { format } from 'date-fns';
import { useSubscriptionUsage } from '@/hooks/useSubscriptionUsage';
import { ShareSubscriptionModal } from '@/components/ShareSubscriptionModal';
import { useFamily } from '@/contexts/FamilyContext';
import { SharedSubscriptionManager } from '@/components/SharedSubscriptionManager';

// Default categories
const CATEGORIES = [
  "Streaming",
  "Music",
  "Gaming",
  "Shopping",
  "Software",
  "Other",
];

// Category icons mapping
const categoryIcons: { [key: string]: string } = {
  "Streaming": "🎬",
  "Music": "🎵",
  "Gaming": "🎮",
  "Shopping": "🛍️",
  "Software": "💻",
  "Other": "📦",
};

interface Subscription {
  id: string;
  name: string;
  amount: number;
  nextRenewal: string;
  category: string;
  description?: string;
  userId: string;
  splits?: { userId: string; amount: number }[];
}

const getRenewalDateStyle = (renewalDate: string) => {
  const today = new Date();
  const renewal = new Date(renewalDate);
  const diffDays = Math.ceil((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { color: '#FF6B6B', label: 'Overdue' };
  if (diffDays <= 3) return { color: '#FFB86C', label: 'Due Soon' };
  return { color: '#50FA7B', label: 'Upcoming' };
};

export default function SubscriptionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const { currentTheme } = useTheme();
  const colors = currentTheme === "dark" ? DarkTheme.colors : DefaultTheme.colors;
  const { t } = useTranslation();
  const { user } = useAuth();

  // State for custom category modal
  const [showCustomCategoryModal, setShowCustomCategoryModal] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [categories, setCategories] = useState(CATEGORIES);

  const { lastUsed, trackUsage, updating } = useSubscriptionUsage(id as string);

  const [showShareModal, setShowShareModal] = useState(false);
  const { familyGroup } = useFamily();

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!id || typeof id !== 'string') {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Invalid subscription ID",
          position: "top",  
        });
        router.back();
        return;
      }

      try {
        const docRef = doc(db, "subscriptions", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Omit<Subscription, 'id'>;
          // Verify the subscription belongs to the current user
          if (data.userId !== user?.uid) {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: "You don't have permission to view this subscription",
              position: "top",
            });
            router.back();
            return;
          }
          setSubscription({ id: docSnap.id, ...data });
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Subscription not found",
            position: "top",
          });
          router.back();
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load subscription",
          position: "top",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [id, user]);

  const handleSave = async () => {
    if (!subscription || !id) return;

    try {
      const docRef = doc(db, "subscriptions", id);
      await updateDoc(docRef, {
        ...subscription,
        amount: parseFloat(subscription.amount.toString()),
        updatedAt: new Date().toISOString(),
      });

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Subscription updated successfully",
        position: "top",
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating subscription:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update subscription",
        position: "top",
      });
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t("subscriptions.confirmDelete"),
      t("subscriptions.deleteWarning"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            if (!id) return;

            try {
              await deleteDoc(doc(db, "subscriptions", id));
              Toast.show({
                type: "success",
                text1: "Success",
                text2: "Subscription deleted successfully",
                position: "top",
              });
              router.back();
            } catch (error) {
              console.error("Error deleting subscription:", error);
              Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to delete subscription",
                position: "top",
              });
            }
          },
        },
      ]
    );
  };

  const handleAddCustomCategory = () => {
    if (customCategory.trim()) {
      setCategories([...categories, customCategory.trim()]);
      setSubscription(
        subscription ? 
        { ...subscription, category: customCategory.trim() } : 
        null
      );
      setCustomCategory("");
      setShowCustomCategoryModal(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!subscription) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ThemedText>{t("subscriptions.notFound")}</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
          {isEditing ? t("subscriptions.editSubscription") : subscription?.name}
        </ThemedText>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {isEditing ? (
            <View style={styles.form}>
              <View style={styles.formSection}>
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.label}>{t("subscriptions.name")}</ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.card,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    value={subscription?.name}
                    onChangeText={(text) =>
                      setSubscription(prev => prev ? { ...prev, name: text } : null)
                    }
                    placeholder={t("subscriptions.namePlaceholder")}
                    placeholderTextColor={colors.text + "80"}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <ThemedText style={styles.label}>{t("subscriptions.amount")}</ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.card,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    value={subscription?.amount.toString()}
                    onChangeText={(text) =>
                      setSubscription(prev => prev ? { ...prev, amount: parseFloat(text) || 0 } : null)
                    }
                    keyboardType="decimal-pad"
                    placeholder={t("subscriptions.amountPlaceholder")}
                    placeholderTextColor={colors.text + "80"}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <ThemedText style={styles.label}>{t("subscriptions.nextRenewal")}</ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.card,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    value={subscription?.nextRenewal}
                    onChangeText={(text) =>
                      setSubscription(prev => prev ? { ...prev, nextRenewal: text } : null)
                    }
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.text + "80"}
                  />
                </View>
              </View>

              <View style={styles.formSection}>
                <ThemedText style={styles.sectionTitle}>{t("subscriptions.category")}</ThemedText>
                <View style={styles.categoriesGrid}>
                  {Object.entries(categoryIcons).map(([category, icon]) => (
                    <Pressable
                      key={category}
                      style={({ pressed }) => [
                        styles.categoryButton,
                        {
                          backgroundColor:
                            subscription?.category === category
                              ? "#FF6B6B"
                              : colors.card,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                      onPress={() =>
                        setSubscription(prev => prev ? { ...prev, category } : null)
                      }
                    >
                      <ThemedText style={styles.categoryIcon}>{icon}</ThemedText>
                      <ThemedText
                        style={[
                          styles.categoryText,
                          {
                            color:
                              subscription?.category === category
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

              <View style={styles.formSection}>
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.label}>{t("subscriptions.description")}</ThemedText>
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
                    value={subscription?.description}
                    onChangeText={(text) =>
                      setSubscription(prev => prev ? { ...prev, description: text } : null)
                    }
                    placeholder={t("subscriptions.descriptionPlaceholder")}
                    placeholderTextColor={colors.text + "80"}
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  onPress={handleSave}
                  style={styles.saveButton}
                >
                  {t("common.save")}
                </Button>
              </View>
            </View>
          ) : (
            <View style={styles.detailsContainer}>
              {subscription && (
                <>
                  <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <View style={styles.headerInfo}>
                      <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
                        <ThemedText style={styles.headerIcon}>
                          {categoryIcons[subscription.category] || "📦"}
                        </ThemedText>
                      </View>
                      <View style={styles.headerText}>
                        <ThemedText type="title" style={styles.headerTitle}>
                          ${subscription.amount.toFixed(2)}
                        </ThemedText>
                        <ThemedText style={styles.headerSubtitle}>
                          {t("subscriptions.perMonth")}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.detailsGrid}>
                      <View style={styles.detailItem}>
                        <ThemedText style={styles.detailLabel}>
                          {t("subscriptions.category")}
                        </ThemedText>
                        <ThemedText type="defaultSemiBold">
                          {subscription.category}
                        </ThemedText>
                      </View>

                      <View style={styles.detailItem}>
                        <ThemedText style={styles.detailLabel}>
                          {t("subscriptions.nextRenewal")}
                        </ThemedText>
                        <View style={styles.renewalInfo}>
                          <ThemedText type="defaultSemiBold">
                            {format(new Date(subscription.nextRenewal), 'MMM d, yyyy')}
                          </ThemedText>
                          {subscription.nextRenewal && (
                            <View style={[
                              styles.statusBadge,
                              { backgroundColor: getRenewalDateStyle(subscription.nextRenewal).color + '20' }
                            ]}>
                              <ThemedText style={[
                                styles.statusText,
                                { color: getRenewalDateStyle(subscription.nextRenewal).color }
                              ]}>
                                {getRenewalDateStyle(subscription.nextRenewal).label}
                              </ThemedText>
                            </View>
                          )}
                        </View>
                      </View>

                      {subscription.description && (
                        <View style={[styles.detailItem, styles.fullWidth]}>
                          <ThemedText style={styles.detailLabel}>
                            {t("subscriptions.description")}
                          </ThemedText>
                          <ThemedText style={styles.description}>
                            {subscription.description}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.usageSection}>
                    <ThemedText style={styles.sectionTitle}>
                      {t('subscription.usage')}
                    </ThemedText>
                    {lastUsed && (
                      <ThemedText style={styles.lastUsed}>
                        {t('subscription.lastUsed', { date: format(new Date(lastUsed), 'PPP') })}
                      </ThemedText>
                    )}
                    <Button
                      onPress={trackUsage}
                      loading={updating}
                      style={styles.trackButton}
                    >
                      {t('subscription.trackUsage')}
                    </Button>
                  </View>

                  <View style={styles.actionButtons}>
                    <Button
                      onPress={() => setIsEditing(true)}
                      style={styles.editButton}
                    >
                      {t("common.edit")}
                    </Button>
                    <Button
                      onPress={handleDelete}
                      style={styles.deleteButton}
                    >
                      {t("common.delete")}
                    </Button>
                  </View>

                  {familyGroup && (
                    <>
                      <Pressable
                        style={[styles.shareButton, { backgroundColor: colors.primary }]}
                        onPress={() => setShowShareModal(true)}
                      >
                        <Ionicons name="share-outline" size={20} color="#FFFFFF" />
                        <ThemedText style={styles.shareButtonText}>
                          {t('family.shareWithFamily')}
                        </ThemedText>
                      </Pressable>

                      <ShareSubscriptionModal
                        visible={showShareModal}
                        onClose={() => setShowShareModal(false)}
                        subscriptionId={subscription.id}
                        amount={subscription.amount}
                      />
                    </>
                  )}

                  {familyGroup && (
                    <View style={styles.section}>
                      <SharedSubscriptionManager
                        subscriptionId={subscription.id}
                        totalAmount={subscription.amount}
                        currentSplits={subscription.splits || []}
                        onSplitsSaved={() => {
                          // Refresh subscription data if needed
                        }}
                      />
                    </View>
                  )}
                </>
              )}
            </View>
          )}
        </ScrollView>
      )}

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
    </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
    gap: 24,
  },
  formSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    minWidth: '45%',
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryText: {
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 24,
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
  }, detailsContainer: {
    padding: 16,
    gap: 24,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    gap: 24,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 24,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
  },
  headerSubtitle: {
    opacity: 0.7,
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
  },
  fullWidth: {
    minWidth: '100%',
  },
  detailLabel: {
    opacity: 0.7,
    marginBottom: 4,
  },
  renewalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#FF6B6B',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF6B6B20',
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  usageSection: {
    padding: 16,
    gap: 16,
  },
  lastUsed: {
    fontSize: 14,
    opacity: 0.7,
  },
  trackButton: {
    backgroundColor: '#FF6B6B',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 16,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  section: {
    padding: 16,
    gap: 16,
  },
});
