import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { VictoryPie } from "victory-native";
import { Ionicons } from "@expo/vector-icons";

// Temporary mock dataf
const MOCK_SUBSCRIPTIONS = [
  {
    id: "1",
    name: "Netflix",
    category: "Streaming",
    amount: 15.99,
    nextRenewal: "2024-04-12",
  },
  {
    id: "2",
    name: "Spotify",
    category: "Music",
    amount: 9.99,
    nextRenewal: "2024-04-20",
  },
  {
    id: "3",
    name: "Amazon Prime",
    category: "Shopping",
    amount: 14.99,
    nextRenewal: "2024-05-01",
  },
  {
    id: "4",
    name: "YouTube Premium",
    category: "Streaming",
    amount: 11.99,
    nextRenewal: "2024-05-05",
  },
];

export default function DashboardScreen() {
  const { currentTheme } = useTheme();
  const colors =
    currentTheme === "dark" ? DarkTheme.colors : DefaultTheme.colors;
  const router = useRouter();

  // Calculate total spending and category data for pie chart
  const categoryData = MOCK_SUBSCRIPTIONS.reduce((acc, sub) => {
    if (!acc[sub.category]) {
      acc[sub.category] = 0;
    }
    acc[sub.category] += sub.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData).map(([category, amount]) => ({
    x: category,
    y: amount,
  }));

  const totalSpending = MOCK_SUBSCRIPTIONS.reduce(
    (sum, sub) => sum + sub.amount,
    0
  );

  // Sort subscriptions by next renewal date
  const upcomingRenewals = [...MOCK_SUBSCRIPTIONS]
    .sort(
      (a, b) =>
        new Date(a.nextRenewal).getTime() - new Date(b.nextRenewal).getTime()
    )
    .slice(0, 3);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <ThemedText type="title">Dashboard</ThemedText>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <ThemedText type="subtitle">Total Monthly Spending</ThemedText>
        <View style={styles.chartContainer}>
          <VictoryPie
            data={pieData}
            width={250}
            height={250}
            colorScale={["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"]}
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
              Total: ${totalSpending.toFixed(2)}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <ThemedText type="subtitle">Upcoming Renewals</ThemedText>
        {upcomingRenewals.map((subscription) => (
          <Pressable
            key={subscription.id}
            style={[styles.renewalItem, { borderBottomColor: colors.border }]}
            onPress={() => router.push(`/subscription/${subscription.id}`)}
          >
            <View>
              <ThemedText type="defaultSemiBold">
                {subscription.name}
              </ThemedText>
              <ThemedText style={{ color: colors.text + "80" }}>
                Category: {subscription.category}
              </ThemedText>
              <ThemedText style={{ color: colors.text + "80" }}>
                Amount: ${subscription.amount.toFixed(2)}
              </ThemedText>
            </View>
            <View style={styles.renewalRight}>
              <ThemedText style={{ color: colors.text + "80" }}>
                Due:{" "}
                {new Date(subscription.nextRenewal).toLocaleDateString(
                  "en-US",
                  {
                    day: "numeric",
                    month: "short",
                  }
                )}
              </ThemedText>
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </View>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={[styles.addButton, { backgroundColor: "#FF6B6B" }]}
        onPress={() => router.push("/subscription/new")}
      >
        <ThemedText style={styles.addButtonText}>
          Add New Subscription
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
    paddingTop: 20,
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
  renewalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  renewalRight: {
    alignItems: "flex-end",
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
});
