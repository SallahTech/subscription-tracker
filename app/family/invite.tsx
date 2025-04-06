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
import { Card } from '@/components/Card';

export default function InviteMemberScreen() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const colors = currentTheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors;
  const { t } = useTranslation();
  const { inviteMember, loading } = useFamily();
  
  const [email, setEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) {
      Alert.alert(t('family.error'), t('family.emailRequired'));
      return;
    }

    setIsInviting(true);
    try {
      await inviteMember(email.trim());
      Alert.alert(
        t('family.success'),
        t('family.inviteSent', { email: email.trim() }),
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert(t('family.error'), t('family.inviteError'));
    } finally {
      setIsInviting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
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
        <ThemedText type="title">{t('family.inviteMember')}</ThemedText>
      </View>

      <View style={styles.content}>
        <Card>
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>
                {t('family.memberEmail')}
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
                value={email}
                onChangeText={setEmail}
                placeholder={t('family.emailPlaceholder')}
                placeholderTextColor={colors.text + '80'}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
              />
            </View>

            <View style={styles.infoContainer}>
              <Ionicons 
                name="information-circle-outline" 
                size={20} 
                color={colors.text} 
              />
              <ThemedText style={styles.infoText}>
                {t('family.inviteInfo')}
              </ThemedText>
            </View>

            <Pressable
              style={[
                styles.inviteButton,
                { backgroundColor: '#FF6B6B' },
                (!email.trim() || isInviting) && styles.disabledButton,
              ]}
              onPress={handleInvite}
              disabled={!email.trim() || isInviting}
            >
              <ThemedText style={styles.buttonText}>
                {isInviting ? t('family.sending') : t('family.sendInvite')}
              </ThemedText>
            </Pressable>
          </View>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    gap: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    opacity: 0.8,
  },
  inviteButton: {
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