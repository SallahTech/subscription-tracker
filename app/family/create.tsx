import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useFamily } from '@/contexts/FamilyContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function CreateFamilyGroupScreen() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const colors = currentTheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors;
  const { t, i18n } = useTranslation();
  const { createFamilyGroup } = useFamily();
  
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);

  // Debug information
  console.log('Create screen translations:', {
    groupName: t('family.groupName'),
    placeholder: t('family.groupNamePlaceholder'),
    createInfo: t('family.createInfo'),
    createButton: t('family.create')
  });

  const handleCreate = async () => {
    if (!groupName.trim()) {
      Alert.alert(
        "Error",
        "Please enter a group name"
      );
      return;
    }

    setLoading(true);
    try {
      await createFamilyGroup(groupName);
      router.replace('/(tabs)/family');
      Alert.alert(
        "Success",
        "Family group created successfully"
      );
    } catch (error) {
      console.error('Error creating family group:', error);
      Alert.alert(
        "Error",
        "Failed to create family group. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <ThemedText type="title">Create Family Group</ThemedText>
      </View>

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>
            Group Name
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Enter your family group name"
            placeholderTextColor={colors.text + '80'}
          />
        </View>

        <View style={styles.infoContainer}>
          <Ionicons name="information-circle-outline" size={20} color={colors.text} />
          <ThemedText style={styles.infoText}>
            Creating a family group will allow you to share and split subscription costs with your family members. You'll be the admin of this group.
          </ThemedText>
        </View>

        <Pressable
          style={[
            styles.createButton,
            { backgroundColor: '#FF6B6B' },
            !groupName.trim() && styles.disabledButton,
          ]}
          onPress={handleCreate}
          disabled={!groupName.trim() || loading}
        >
          <ThemedText style={styles.buttonText}>
            Create Group
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    opacity: 0.7,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: '#FF6B6B20',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    gap: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    opacity: 0.8,
  },
  createButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
}); 