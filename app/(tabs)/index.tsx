import { StyleSheet, View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { VictoryPie } from "victory-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import Toast from "react-native-toast-message";
import { format } from 'date-fns';

interface Subscription {
  id: string;
  name: string;
  category: string;
  amount: number;
  nextRenewal: string;
}

// Chart colors for different categories
const categoryColors: { [key: string]: string } = {
  "Streaming": "#FF6B6B",
  "Music": "#4ECDC4",
  "Gaming": "#45B7D1",
  "Shopping": "#96CEB4",
  "Software": "#FFD93D",
  "Other": "#6C5B7B"
};

// Add this helper function for renewal date styling
const getRenewalDateStyle = (renewalDate: string) => {
  const today = new Date();
  const renewal = new Date(renewalDate);
  const diffDays = Math.ceil((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { color: '#FF6B6B', label: 'Overdue' }; // Red for overdue
  if (diffDays <= 3) return { color: '#FFB86C', label: 'Due Soon' }; // Orange for due soon
  return { color: '#50FA7B', label: 'Upcoming' }; // Green for upcoming
};

// Add category icons mapping if not already present
const categoryIcons: { [key: string]: string } = {
  "Streaming": "🎬",
  "Music": "🎵",
  "Gaming": "🎮",
  "Shopping": "🛍️",
  "Software": "💻",
  "Other": "📦",
};

export default function DashboardScreen() {
  const { currentTheme } = useTheme();
  const colors = currentTheme === "dark" ? DarkTheme.colors : DefaultTheme.colors;
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    if (!user) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "subscriptions"),
      where("userId", "==", user.uid)
    );

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
          position: "top",
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Calculate total spending and category data for pie chart
  const categoryData = subscriptions.reduce((acc, sub) => {
    if (!acc[sub.category]) {
      acc[sub.category] = 0;
    }
    acc[sub.category] += sub.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData).map(([category, amount]) => ({
    x: category,
    y: amount,
    color: categoryColors[category] || categoryColors.Other
  }));

  const totalSpending = subscriptions.reduce(
    (sum, sub) => sum + sub.amount,
    0
  );

  // Sort subscriptions by next renewal date
  const upcomingRenewals = [...subscriptions]
    .sort(
      (a, b) =>
        new Date(a.nextRenewal).getTime() - new Date(b.nextRenewal).getTime()
    )
    .slice(0, 3);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <ThemedText type="title">{t("tabs.home")}</ThemedText>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <ThemedText type="subtitle">
          {t("subscriptions.totalMonthlySpending")}
        </ThemedText>
        {subscriptions.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>
              {t("subscriptions.noSubscriptions")}
            </ThemedText>
          </View>
        ) : (
          <View style={styles.chartContainer}>
            <VictoryPie
              data={pieData}
              width={250}
              height={250}
              colorScale={pieData.map(d => d.color)}
              innerRadius={70}
              labelRadius={70 + 30}
              style={{
                labels: {
                  fill: colors.text,
                  fontSize: 12,
                },
              }}
            />
            <View style={styles.totalContainer}>
              <ThemedText type="defaultSemiBold">
                {t("subscriptions.total")} ${totalSpending.toFixed(2)}
              </ThemedText>
            </View>
          </View>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">
            {t("subscriptions.upcomingRenewals")}
          </ThemedText>
          {upcomingRenewals.length > 0 && (
            <ThemedText style={styles.renewalCount}>
              {upcomingRenewals.length} {t("subscriptions.upcoming")}
            </ThemedText>
          )}
        </View>
        
        {upcomingRenewals.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>
              {t("subscriptions.noUpcomingRenewals")}
            </ThemedText>
          </View>
        ) : (
          <View style={styles.renewalsList}>
            {upcomingRenewals.map((subscription, index) => {
              const renewalStyle = getRenewalDateStyle(subscription.nextRenewal);
              
              return (
                <View key={subscription.id}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.renewalItem,
                      {
                        backgroundColor: pressed 
                          ? colors.card + '80'
                          : colors.card,
                        borderLeftColor: renewalStyle.color,
                      }
                    ]}
                    onPress={() => router.push(`/subscription/${subscription.id}`)}
                  >
                    <View style={styles.renewalContent}>
                      <View style={[styles.renewalIconContainer, { backgroundColor: renewalStyle.color + '15' }]}>
                        <ThemedText style={styles.categoryIcon}>
                          {categoryIcons[subscription.category] || "📦"}
                        </ThemedText>
                      </View>
                      
                      <View style={styles.renewalInfo}>
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

                      <View style={styles.renewalAmount}>
                        <ThemedText type="defaultSemiBold" style={styles.amount}>
                          ${subscription.amount.toFixed(2)}
                        </ThemedText>
                        <ThemedText style={styles.period}>
                          {t("subscriptions.perMonth")}
                        </ThemedText>
                      </View>
                    </View>
                  </Pressable>
                  {index < upcomingRenewals.length - 1 && (
                    <View style={[styles.separator, { backgroundColor: colors.border }]} />
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>

      <Pressable
        style={[styles.addButton, { backgroundColor: "#FF6B6B" }]}
        onPress={() => router.push("/subscription/new")}
      >
        <ThemedText style={styles.addButtonText}>
          {t("subscriptions.addNew")}
        </ThemedText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 48,
    marginBottom: 8,
  },
  card: {
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
  chartContainer: {
    alignItems: "center",
    position: "relative",
  },
  totalContainer: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -20 }],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  renewalCount: {
    fontSize: 12,
    opacity: 0.7,
  },
  renewalsList: {
  },
  renewalItem: {
    borderRadius: 12,
    borderLeftWidth: 4,
    backgroundColor: '#ffffff10',
    overflow: 'hidden',
  },
  renewalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  renewalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryIcon: {
    fontSize: 20,
  },
  renewalInfo: {
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
  renewalAmount: {
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
  addButton: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  separator: {
    height: 1,
    marginHorizontal: 16,
    opacity: 0.2,
  },
});
