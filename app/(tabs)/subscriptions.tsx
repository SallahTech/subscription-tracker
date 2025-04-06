import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { Link } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "components/Button";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useTheme } from "@/contexts/ThemeContext";

// Using the same mock data from the home screen
const MOCK_SUBSCRIPTIONS = [
  {
    id: "1",
    name: "Netflix",
    amount: 15.99,
    nextRenewal: "2024-05-20",
    icon: "🎬",
    category: "Entertainment",
  },
  {
    id: "2",
    name: "Spotify",
    amount: 9.99,
    nextRenewal: "2024-05-15",
    icon: "🎵",
    category: "Music",
  },
  {
    id: "3",
    name: "YouTube Premium",
    amount: 11.99,
    nextRenewal: "2024-05-18",
    icon: "📺",
    category: "Entertainment",
  },
];

export default function SubscriptionsScreen() {
  const { currentTheme } = useTheme();
  const colors =
    currentTheme === "dark" ? DarkTheme.colors : DefaultTheme.colors;

  const totalMonthly = MOCK_SUBSCRIPTIONS.reduce(
    (sum, sub) => sum + sub.amount,
    0
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <ThemedText type="title">Subscriptions</ThemedText>
        <View style={styles.totalContainer}>
          <ThemedText>Total monthly cost</ThemedText>
          <ThemedText type="title">${totalMonthly.toFixed(2)}</ThemedText>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View
          style={[styles.subscriptionList, { backgroundColor: colors.card }]}
        >
          {MOCK_SUBSCRIPTIONS.map((subscription) => (
            <Link
              key={subscription.id}
              href={`/subscription/${subscription.id}`}
              asChild
              style={[styles.LinkItem, { borderBottomColor: colors.border }]}
            >
              <Pressable style={styles.subscriptionItem}>
                <View style={styles.subscriptionIcon}>
                  <ThemedText style={styles.icon}>
                    {subscription.icon}
                  </ThemedText>
                </View>
                <View style={styles.subscriptionInfo}>
                  <ThemedText type="defaultSemiBold">
                    {subscription.name}
                  </ThemedText>
                  <ThemedText style={styles.category}>
                    {subscription.category}
                  </ThemedText>
                </View>
                <View style={styles.subscriptionAmount}>
                  <ThemedText type="defaultSemiBold">
                    ${subscription.amount.toFixed(2)}
                  </ThemedText>
                  <ThemedText>/month</ThemedText>
                </View>
              </Pressable>
            </Link>
          ))}
        </View>
      </ScrollView>

      <View style={styles.fab}>
        <Link href="/subscription/new" asChild>
          <Button onPress={() => {}}>Add Subscription</Button>
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
    gap: 12,
  },
  LinkItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  subscriptionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  subscriptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 20,
  },
  subscriptionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  category: {
    fontSize: 14,
  },
  subscriptionAmount: {
    alignItems: "flex-end",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
  },
});
