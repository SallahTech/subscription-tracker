import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import type { User } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  AuthError,
} from "firebase/auth";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

// Initialize WebBrowser for auth session
WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getErrorMessage = (error: AuthError) => {
  switch (error.code) {
    case "auth/invalid-email":
      return "The email address is not valid.";
    case "auth/user-disabled":
      return "This user account has been disabled.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/email-already-in-use":
      return "This email is already registered.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/operation-not-allowed":
      return "This login method is not enabled.";
    default:
      return error.message || "An error occurred during authentication.";
  }
};

const googleConfig = {
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  scopes: ["openid", "profile", "email"],
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Set up Google auth request at the component level
  const [request, response, promptAsync] = Google.useAuthRequest(googleConfig);

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user?.email);
      setUser(user);
      setLoading(false);

      if (user) {
        Toast.show({
          type: "success",
          text1: "Welcome",
          text2: `Signed in as ${user.email}`,
          position: "bottom",
        });
      }
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, {
        displayName: name,
      });
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Account created successfully!",
        position: "bottom",
      });
    } catch (error: any) {
      const message = getErrorMessage(error);
      Toast.show({
        type: "error",
        text1: "Sign Up Error",
        text2: message,
        position: "bottom",
      });
      throw new Error(message);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Signed in successfully!",
        position: "bottom",
      });
    } catch (error: any) {
      const message = getErrorMessage(error);
      Toast.show({
        type: "error",
        text1: "Sign In Error",
        text2: message,
        position: "bottom",
      });
      throw new Error(message);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await promptAsync();
      console.log("Google Sign-in result:", result);

      if (result?.type === "success") {
        const { id_token } = result.params;
        const credential = GoogleAuthProvider.credential(id_token);
        await signInWithCredential(auth, credential);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Signed in with Google successfully!",
          position: "bottom",
        });
      } else if (result?.type === "cancel") {
        Toast.show({
          type: "info",
          text1: "Cancelled",
          text2: "Google sign in was cancelled",
          position: "bottom",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to sign in with Google",
          position: "bottom",
        });
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      const message = getErrorMessage(error);
      Toast.show({
        type: "error",
        text1: "Google Sign In Error",
        text2: message,
        position: "bottom",
      });
      throw new Error(message);
    }
  };

  const signOut = async () => {
    try {
      console.log("AuthContext: Starting signOut process");
      await firebaseSignOut(auth);
      console.log("AuthContext: Firebase signOut successful");
      setUser(null);
      console.log("AuthContext: User state cleared");
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Signed out successfully",
        position: "bottom",
      });
      console.log("AuthContext: Toast shown, navigating to login");
      router.replace("/auth/login");
      console.log("AuthContext: Navigation completed");
    } catch (error: any) {
      console.error("AuthContext: SignOut error:", error);
      const message = getErrorMessage(error);
      Toast.show({
        type: "error",
        text1: "Sign Out Error",
        text2: message,
        position: "bottom",
      });
      throw new Error(message);
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
