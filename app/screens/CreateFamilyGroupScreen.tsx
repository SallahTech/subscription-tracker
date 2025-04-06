import React, { useState } from 'react';
import { StyleSheet, View, TextInput, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card } from '@/components/Card';

export default function CreateFamilyGroupScreen() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const colors = currentTheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors;
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!groupName.trim() || !user) return;

    setLoading(true);
    try {
      // Create new family group
      const groupData = {
        name: groupName.trim(),
        createdBy: user.uid,
        createdAt: new Date(),
        members: [{
          id: user.uid,
          name: user.displayName || user.email,
          email: user.email,
          role: 'admin',
          permissions: ['view', 'edit', 'delete', 'invite'],
        }],
        memberIds: [user.uid],
        sharedSubscriptions: [],
      };

      await addDoc(collection(db, 'familyGroups'), groupData);
      
      router.replace('/(tabs)/family');
      Alert.alert(
        t('family.success'),
        t('family.groupCreated')
      );
    } catch (error) {
      console.error('Error creating family group:', error);
      Alert.alert(
        t('common.error'),
        t('family.createError')
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <ThemedText type="title">{t('family.createGroup')}</ThemedText>
      </View>

      <Card>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>
              {t('family.groupName')}
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
              placeholder={t('family.groupNamePlaceholder')}
              placeholderTextColor={colors.text + '80'}
            />
          </View>

          <View style={styles.infoContainer}>
            <ThemedText style={styles.infoText}>
              {t('family.createInfo')}
            </ThemedText>
          </View>

          <Pressable
            style={[
              styles.createButton,
              { backgroundColor: colors.primary },
              !groupName.trim() && styles.disabledButton,
            ]}
            onPress={handleCreate}
            disabled={!groupName.trim()}
          >
            <ThemedText style={styles.buttonText}>
              {t('family.create')}
            </ThemedText>
          </Pressable>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 48,
  },
  form: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  infoContainer: {
    backgroundColor: '#FF6B6B20',
    padding: 16,
    borderRadius: 8,
  },
  infoText: {
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