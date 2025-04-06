import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { ThemedText } from "@/components/ThemedText";
import { AuthAnimation } from "@/components/AuthAnimation";
import { useTheme } from "@/contexts/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();
  const { currentTheme } = useTheme();
  const colors =
    currentTheme === "dark" ? DarkTheme.colors : DefaultTheme.colors;

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signInWithGoogle();
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Google login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Sign In" }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <AuthAnimation type="login" />

          <View style={styles.form}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Email"
              placeholderTextColor={colors.text + "80"}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <View>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Password"
                placeholderTextColor={colors.text + "80"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color={colors.text}
                />
              </Pressable>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/(auth)/forgot-password")}
            >
              <Pressable style={styles.forgotPassword}>
                <ThemedText style={{ color: "#FF6B6B" }}>
                  Forgot Password?
                </ThemedText>
              </Pressable>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={styles.buttonContainer}
            >
              <LinearGradient
                colors={["#FF6B6B", "#FF8E8E"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
              >
                <ThemedText style={styles.buttonText}>
                  {loading ? <ActivityIndicator color="#FFFFFF" /> : "Sign In"}
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View
                style={[styles.dividerLine, { backgroundColor: colors.border }]}
              />
              <ThemedText style={{ color: colors.text + "80" }}>
                or continue with
              </ThemedText>
              <View
                style={[styles.dividerLine, { backgroundColor: colors.border }]}
              />
            </View>

            <TouchableOpacity
              onPress={handleGoogleSignIn}
              disabled={loading}
              style={[
                styles.socialButton,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                },
              ]}
            >
              <Ionicons
                name="logo-google"
                size={20}
                color={colors.text}
                style={styles.socialIcon}
              />
              <ThemedText style={styles.socialButtonText}>
                Sign in with Google
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {}}
              disabled={loading}
              style={[
                styles.socialButton,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                },
              ]}
            >
              <Ionicons
                name="logo-apple"
                size={20}
                color={colors.text}
                style={styles.socialIcon}
              />
              <ThemedText style={styles.socialButtonText}>
                Continue with Apple
              </ThemedText>
            </TouchableOpacity>

            <View style={styles.footer}>
              <ThemedText style={{ color: colors.text + "80" }}>
                Don't have an account?
              </ThemedText>
              <TouchableOpacity
                onPress={() => router.push("/auth/register")}
                style={styles.linkButton}
              >
                <ThemedText
                  style={[styles.linkText, { color: colors.primary }]}
                >
                  Sign up
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  form: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 12,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  buttonContainer: {
    marginTop: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  gradient: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  socialButton: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  socialIcon: {
    marginRight: 10,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 8,
  },
  linkButton: {
    marginLeft: 4,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
