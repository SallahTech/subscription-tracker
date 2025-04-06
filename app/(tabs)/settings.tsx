import { StyleSheet, View, Pressable, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { FontAwesome } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect } from "react";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";

interface SettingItemProps {
  icon: keyof typeof FontAwesome.glyphMap;
  title: string;
  onPress: () => void;
}

function SettingItem({ icon, title, onPress }: SettingItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.settingItem, pressed && { opacity: 0.7 }]}
      onPress={onPress}
    >
      <View style={styles.settingIcon}>
        <FontAwesome name={icon} size={20} color="#64748B" />
      </View>
      <ThemedText style={styles.settingTitle}>{title}</ThemedText>
      <FontAwesome name="chevron-right" size={16} color="#64748B" />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const auth = useAuth();
  const { theme, setTheme, currentTheme } = useTheme();

  const colors =
    currentTheme === "dark" ? DarkTheme.colors : DefaultTheme.colors;

  // Debug log to check auth object
  useEffect(() => {
    console.log("Auth context in settings:", {
      hasSignOut: !!auth.signOut,
      user: auth.user?.email,
    });
  }, [auth]);

  const handleProfile = () => {
    router.push("/(tabs)/profile");
  };

  const handlePaymentMethods = () => {
    Alert.alert("Payment Methods", "Here you can manage your payment methods", [
      { text: "OK" },
    ]);
  };

  const handleNotifications = () => {
    Alert.alert("Notifications", "Configure your notification preferences", [
      { text: "OK" },
    ]);
  };

  const handleLanguage = () => {
    Alert.alert("Language", "Select your preferred language", [
      { text: "English", onPress: () => console.log("English selected") },
      { text: "Spanish", onPress: () => console.log("Spanish selected") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleCurrency = () => {
    Alert.alert("Currency", "Select your preferred currency", [
      { text: "USD ($)", onPress: () => console.log("USD selected") },
      { text: "EUR (€)", onPress: () => console.log("EUR selected") },
      { text: "GBP (£)", onPress: () => console.log("GBP selected") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleHelp = () => {
    Alert.alert("Help & Support", "Contact us at support@subtracker.com", [
      { text: "OK" },
    ]);
  };

  const handleAbout = () => {
    Alert.alert(
      "About",
      "Subscription Tracker v1.0.0\n\nTrack and manage your subscriptions with ease.",
      [{ text: "OK" }]
    );
  };

  const handleLogout = () => {
    console.log("Logout button pressed");
    if (!auth.signOut) {
      console.error("signOut function is not available!");
      Alert.alert("Error", "Logout functionality is not available");
      return;
    }

    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => console.log("Logout cancelled"),
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          console.log("Logout confirmed, attempting to sign out...");
          try {
            console.log("Calling signOut function...");
            await auth.signOut();
            console.log("SignOut completed successfully");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <ThemedText type="title">Settings</ThemedText>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Account
          </ThemedText>
          <View style={[styles.settingsList, { backgroundColor: colors.card }]}>
            <SettingItem icon="user" title="Profile" onPress={handleProfile} />
            <SettingItem
              icon="credit-card"
              title="Payment Methods"
              onPress={handlePaymentMethods}
            />
            <SettingItem
              icon="bell"
              title="Notifications"
              onPress={handleNotifications}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Preferences
          </ThemedText>
          <View style={[styles.settingsList, { backgroundColor: colors.card }]}>
            <SettingItem
              icon="globe"
              title="Language"
              onPress={handleLanguage}
            />
            <SettingItem
              icon="dollar"
              title="Currency"
              onPress={handleCurrency}
            />
            <SettingItem
              icon="adjust"
              title="Theme"
              onPress={() => {
                Alert.alert(
                  "Theme",
                  "Select your preferred theme",
                  [
                    {
                      text: "Light",
                      onPress: () => setTheme("light"),
                      style: theme === "light" ? "destructive" : "default",
                    },
                    {
                      text: "Dark",
                      onPress: () => setTheme("dark"),
                      style: theme === "dark" ? "destructive" : "default",
                    },
                    {
                      text: "System",
                      onPress: () => setTheme("system"),
                      style: theme === "system" ? "destructive" : "default",
                    },
                    { text: "Cancel", style: "cancel" },
                  ],
                  { cancelable: true }
                );
              }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Support
          </ThemedText>
          <View style={[styles.settingsList, { backgroundColor: colors.card }]}>
            <SettingItem
              icon="question-circle"
              title="Help"
              onPress={handleHelp}
            />
            <SettingItem
              icon="info-circle"
              title="About"
              onPress={handleAbout}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && { opacity: 0.7 },
            ]}
            onPress={handleLogout}
          >
            <ThemedText style={styles.logoutText}>Log Out</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  settingsList: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingTitle: {
    flex: 1,
    fontSize: 16,
  },
  logoutButton: {
    padding: 16,
    backgroundColor: "#EF4444",
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
