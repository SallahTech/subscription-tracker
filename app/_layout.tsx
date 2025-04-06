import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useSegments, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import Toast from "react-native-toast-message";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import "@/i18n"; // Import i18n configuration
import { initializeLanguage } from "@/i18n";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { currentTheme } = useTheme();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";
    console.log("Current route segment:", segments[0]);
    console.log("Auth state:", {
      user: user?.email,
      loading,
      inAuthGroup,
      inTabsGroup,
    });

    // Only redirect if user is authenticated and trying to access auth screens
    // or if user is not authenticated and trying to access protected screens
    if (user && inAuthGroup) {
      console.log("Redirecting to home...");
      router.replace("/(tabs)");
    } else if (!user && inTabsGroup) {
      console.log("Redirecting to welcome...");
      router.replace("/");
    }
  }, [user, loading, segments]);

  // Initialize language from storage
  useEffect(() => {
    initializeLanguage();
  }, []);

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="(tabs)"
        options={{
          title: "Back",
          headerShown: false,
          // Prevent going back to auth screens
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="(auth)"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

function ThemedApp() {
  const { currentTheme } = useTheme();

  return (
    <NavigationThemeProvider
      value={currentTheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <AuthProvider>
        <RootLayoutNav />
        <StatusBar style={currentTheme === "dark" ? "light" : "dark"} />
        <Toast />
      </AuthProvider>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}
