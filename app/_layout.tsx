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

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { currentTheme } = useTheme();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "auth";
    console.log("Current route segment:", segments[0]);
    console.log("Auth state:", { user: user?.email, loading, inAuthGroup });

    if (!user && !inAuthGroup) {
      console.log("Redirecting to login...");
      router.replace("/auth/login");
    } else if (user && inAuthGroup) {
      console.log("Redirecting to home...");
      router.replace("/(tabs)");
    }
  }, [user, loading, segments]);

  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          // Prevent going back to auth screens
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="auth"
        options={{
          headerShown: false,
          statusBarStyle: "dark",
          // Prevent going back to tabs when not authenticated
          gestureEnabled: false,
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
