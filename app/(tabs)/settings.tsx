import { StyleSheet, View, Pressable, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { FontAwesome } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect } from "react";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { languages, changeLanguage } from "@/i18n";

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
  const { t, i18n } = useTranslation();

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
    Alert.alert(t("settings.paymentMethods"), t("settings.paymentMethods"), [
      { text: "OK" },
    ]);
  };

  const handleNotifications = () => {
    Alert.alert(t("settings.notifications"), t("settings.notifications"), [
      { text: "OK" },
    ]);
  };

  const handleLanguage = () => {
    Alert.alert(t("settings.language"), t("settings.selectLanguage"), [
      ...languages.map((lang) => ({
        text: lang.name,
        onPress: () => {
          changeLanguage(lang.code);
          console.log(`${lang.name} selected`);
        },
        style:
          i18n.language === lang.code
            ? ("destructive" as const)
            : ("default" as const),
      })),
      { text: t("common.cancel"), style: "cancel" as const },
    ]);
  };

  const handleCurrency = () => {
    Alert.alert(t("settings.currency"), t("settings.selectCurrency"), [
      { text: "USD ($)", onPress: () => console.log("USD selected") },
      { text: "EUR (€)", onPress: () => console.log("EUR selected") },
      { text: "GBP (£)", onPress: () => console.log("GBP selected") },
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };

  const handleHelp = () => {
    Alert.alert(t("settings.help"), t("settings.helpMessage"), [
      { text: "OK" },
    ]);
  };

  const handleAbout = () => {
    Alert.alert(t("settings.about"), t("settings.aboutMessage"), [
      { text: "OK" },
    ]);
  };

  const handleLogout = () => {
    console.log("Logout button pressed");
    if (!auth.signOut) {
      console.error("signOut function is not available!");
      Alert.alert(t("common.error"), t("settings.logoutError"));
      return;
    }

    Alert.alert(t("settings.logout"), t("settings.logoutConfirmation"), [
      {
        text: t("common.cancel"),
        style: "cancel",
        onPress: () => console.log("Logout cancelled"),
      },
      {
        text: t("settings.logout"),
        style: "destructive",
        onPress: async () => {
          console.log("Logout confirmed, attempting to sign out...");
          try {
            console.log("Calling signOut function...");
            await auth.signOut();
            console.log("SignOut completed successfully");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert(t("common.error"), t("settings.logoutError"));
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <ThemedText type="title">{t("settings.settings")}</ThemedText>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t("settings.account")}
          </ThemedText>
          <View style={[styles.settingsList, { backgroundColor: colors.card }]}>
            <SettingItem
              icon="user"
              title={t("settings.profile")}
              onPress={handleProfile}
            />
            <SettingItem
              icon="credit-card"
              title={t("settings.paymentMethods")}
              onPress={handlePaymentMethods}
            />
            <SettingItem
              icon="bell"
              title={t("settings.notifications")}
              onPress={handleNotifications}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t("settings.preferences")}
          </ThemedText>
          <View style={[styles.settingsList, { backgroundColor: colors.card }]}>
            <SettingItem
              icon="globe"
              title={t("settings.language")}
              onPress={handleLanguage}
            />
            <SettingItem
              icon="dollar"
              title={t("settings.currency")}
              onPress={handleCurrency}
            />
            <SettingItem
              icon="adjust"
              title={t("settings.theme")}
              onPress={() => {
                Alert.alert(
                  t("settings.theme"),
                  t("settings.selectTheme"),
                  [
                    {
                      text: t("settings.light"),
                      onPress: () => setTheme("light"),
                      style: theme === "light" ? "destructive" : "default",
                    },
                    {
                      text: t("settings.dark"),
                      onPress: () => setTheme("dark"),
                      style: theme === "dark" ? "destructive" : "default",
                    },
                    {
                      text: t("settings.system"),
                      onPress: () => setTheme("system"),
                      style: theme === "system" ? "destructive" : "default",
                    },
                    { text: t("common.cancel"), style: "cancel" },
                  ],
                  { cancelable: true }
                );
              }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t("settings.support")}
          </ThemedText>
          <View style={[styles.settingsList, { backgroundColor: colors.card }]}>
            <SettingItem
              icon="question-circle"
              title={t("settings.help")}
              onPress={handleHelp}
            />
            <SettingItem
              icon="info-circle"
              title={t("settings.about")}
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
            <ThemedText style={styles.logoutText}>
              {t("settings.logout")}
            </ThemedText>
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
