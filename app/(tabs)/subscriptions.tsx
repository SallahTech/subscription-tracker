import { StyleSheet, View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { Link } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "components/Button";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import Toast from "react-native-toast-message";
import { format } from 'date-fns';

// Define the subscription type
interface Subscription {
  id: string;
  name: string;
  amount: number;
  nextRenewal: string;
  category: string;
  description?: string;
  icon?: string;
}

// Map categories to icons
const categoryIcons: { [key: string]: string } = {
  "Streaming": "🎬",
  "Music": "🎵",
  "Gaming": "🎮",
  "Shopping": "🛍️",
  "Software": "💻",
  "Other": "📦",
};

// Add the helper function for renewal date styling
const getRenewalDateStyle = (renewalDate: string) => {
  const today = new Date();
  const renewal = new Date(renewalDate);
  const diffDays = Math.ceil((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { color: '#FF6B6B', label: 'Overdue' }; // Red for overdue
  if (diffDays <= 3) return { color: '#FFB86C', label: 'Due Soon' }; // Orange for due soon
  return { color: '#50FA7B', label: 'Upcoming' }; // Green for upcoming
};

export default function SubscriptionsScreen() {
  const { currentTheme } = useTheme();
  const colors = currentTheme === "dark" ? DarkTheme.colors : DefaultTheme.colors;
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    // Create a query against the subscriptions collection
    const q = query(
      collection(db, "subscriptions"),
      where("userId", "==", user.uid)
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const subscriptionsData: Subscription[] = [];
        querySnapshot.forEach((doc) => {
          subscriptionsData.push({
            id: doc.id,
            ...doc.data(),
          } as Subscription);
        });
        setSubscriptions(subscriptionsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching subscriptions:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load subscriptions",
          position: "bottom",
        });
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user]);

  const totalMonthly = subscriptions.reduce(
    (sum, sub) => sum + (typeof sub.amount === 'number' ? sub.amount : 0),
    0
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <ThemedText type="title">{t("tabs.subscriptions")}</ThemedText>
        <View style={styles.totalContainer}>
          <ThemedText>{t("subscriptions.totalMonthlySpending")}</ThemedText>
          <ThemedText type="title">${totalMonthly.toFixed(2)}</ThemedText>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {subscriptions.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.emptyStateText}>
              {t("subscriptions.noSubscriptions")}
            </ThemedText>
          </View>
        ) : (
          <View style={[styles.subscriptionList, { backgroundColor: colors.card }]}>
            {subscriptions.map((subscription, index) => {
              const renewalStyle = getRenewalDateStyle(subscription.nextRenewal);
              
              return (
                <View key={subscription.id}>
                  <Link
                    href={`/subscription/${subscription.id}`}
                    asChild
                  >
                    <Pressable
                      style={({ pressed }) => [
                        styles.subscriptionItem,
                        {
                          backgroundColor: pressed ? colors.card + '80' : colors.card,
                          borderLeftColor: renewalStyle.color,
                        }
                      ]}
                    >
                      <View style={styles.subscriptionContent}>
                        <View style={[styles.subscriptionIconContainer, { backgroundColor: renewalStyle.color + '15' }]}>
                          <ThemedText style={styles.categoryIcon}>
                            {categoryIcons[subscription.category] || "📦"}
                          </ThemedText>
                        </View>
                        
                        <View style={styles.subscriptionInfo}>
                          <ThemedText type="defaultSemiBold" style={styles.subscriptionName}>
                            {subscription.name}
                          </ThemedText>
                          <ThemedText style={styles.subscriptionCategory}>
                            {subscription.category}
                          </ThemedText>
                          <View style={styles.renewalDateContainer}>
                            <ThemedText style={[styles.renewalDate, { color: renewalStyle.color }]}>
                              {format(new Date(subscription.nextRenewal), 'MMM d, yyyy')}
                            </ThemedText>
                            <View style={[styles.renewalBadge, { backgroundColor: renewalStyle.color + '20' }]}>
                              <ThemedText style={[styles.renewalBadgeText, { color: renewalStyle.color }]}>
                                {renewalStyle.label}
                              </ThemedText>
                            </View>
                          </View>
                        </View>

                        <View style={styles.subscriptionAmount}>
                          <ThemedText type="defaultSemiBold" style={styles.amount}>
                            ${subscription.amount.toFixed(2)}
                          </ThemedText>
                          <ThemedText style={styles.period}>
                            {t("subscriptions.perMonth")}
                          </ThemedText>
                        </View>
                      </View>
                    </Pressable>
                  </Link>
                  {index < subscriptions.length - 1 && (
                    <View style={[styles.separator, { backgroundColor: colors.border }]} />
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.fab}>
        <Link href="/subscription/new" asChild>
          <Button onPress={() => {}}>{t("subscriptions.addNew")}</Button>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  totalContainer: {
    marginTop: 16,
  },
  content: {
    flex: 1,
  },
  subscriptionList: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subscriptionItem: {
    borderRadius: 12,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  subscriptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  subscriptionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryIcon: {
    fontSize: 20,
  },
  subscriptionInfo: {
    flex: 1,
    marginRight: 12,
  },
  subscriptionName: {
    fontSize: 16,
    marginBottom: 4,
  },
  subscriptionCategory: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 8,
  },
  renewalDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  renewalDate: {
    fontSize: 13,
  },
  renewalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  renewalBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  subscriptionAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    marginBottom: 2,
  },
  period: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyState: {
    margin: 16,
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    marginHorizontal: 16,
    marginVertical: 12,
    opacity: 0.2,
  },
});
