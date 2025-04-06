import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);

  const router = useRouter();
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { t } = useTranslation();
  const colors = currentTheme === "dark" ? DarkTheme.colors : DefaultTheme.colors;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("profile.permissionRequired"),
        t("profile.cameraRollPermission")
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    // Here you would typically update the user's profile in your backend
    Alert.alert(t("common.success"), t("profile.profileUpdated"));
    setIsEditing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText type="title">{t("profile.title")}</ThemedText>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.card }]}>
                <Ionicons name="person" size={40} color={colors.text} />
              </View>
            )}
            <View style={styles.editAvatarButton}>
              <Ionicons name="camera" size={12} color="white" />
            </View>
          </TouchableOpacity>

          <ThemedText type="title" style={styles.name}>
            {user?.displayName || "User"}
          </ThemedText>
          <ThemedText style={[styles.email, { color: colors.text + "80" }]}>
            {user?.email}
          </ThemedText>
        </View>

        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeader}>
              <ThemedText type="subtitle">
                {t("profile.personalInfo")}
              </ThemedText>
              <TouchableOpacity
                onPress={() => setIsEditing(!isEditing)}
                style={styles.editButton}
              >
                <ThemedText style={{ color: "#FF6B6B" }}>
                  {isEditing ? t("common.cancel") : t("common.edit")}
                </ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                {t("profile.displayName")}
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder={t("profile.enterName")}
                placeholderTextColor={colors.text + "80"}
                editable={isEditing}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                {t("profile.phoneNumber")}
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder={t("profile.enterPhone")}
                placeholderTextColor={colors.text + "80"}
                keyboardType="phone-pad"
                editable={isEditing}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>{t("profile.bio")}</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  styles.bioInput,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={bio}
                onChangeText={setBio}
                placeholder={t("profile.tellAboutYourself")}
                placeholderTextColor={colors.text + "80"}
                multiline
                numberOfLines={4}
                editable={isEditing}
              />
            </View>

            {isEditing && (
              <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <LinearGradient
                  colors={["#FF6B6B", "#FF8E8E"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradient}
                >
                  <ThemedText style={styles.saveButtonText}>
                    {t("profile.saveChanges")}
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: "center",
    padding: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF6B6B",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
  },
  section: {
    padding: 20,
  },
  card: {
    borderRadius: 12,
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  editButton: {
    padding: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    opacity: 0.7,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  bioInput: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  saveButton: {
    marginTop: 24,
    overflow: "hidden",
    borderRadius: 8,
  },
  gradient: {
    padding: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
}); 