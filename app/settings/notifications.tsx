import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import {
  NotificationSettings,
  getUserNotificationSettings,
  updateNotificationSettings,
  requestNotificationPermissions,
} from '@/lib/notifications';
import Toast from 'react-native-toast-message';

export default function NotificationsSettingsScreen() {
  const { currentTheme } = useTheme();
  const colors = currentTheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors;
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    try {
      const settings = await getUserNotificationSettings(user.uid);
      setSettings(settings);
    } catch (error) {
      console.error('Error loading notification settings:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load notification settings',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof NotificationSettings, value: boolean) => {
    if (!user || !settings) return;

    if (key === 'enabled' && value) {
      const permitted = await requestNotificationPermissions();
      if (!permitted) {
        Toast.show({
          type: 'error',
          text1: 'Permission Required',
          text2: 'Please enable notifications in your device settings',
          position: 'top',
        });
        return;
      }
    }

    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await updateNotificationSettings(user.uid, { [key]: value });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update notification settings',
        position: 'top',
      });
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingTitle}>
                {t('notifications.enable')}
              </ThemedText>
              <ThemedText style={styles.settingDescription}>
                {t('notifications.enableDescription')}
              </ThemedText>
            </View>
            <Switch
              value={settings?.enabled}
              onValueChange={(value) => handleToggle('enabled', value)}
            />
          </View>
        </View>

        {settings?.enabled && (
          <>
            <View style={[styles.section, { backgroundColor: colors.card }]}>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingTitle}>
                    {t('notifications.renewalReminders')}
                  </ThemedText>
                  <ThemedText style={styles.settingDescription}>
                    {t('notifications.renewalRemindersDescription')}
                  </ThemedText>
                </View>
                <Switch
                  value={settings.renewalReminders}
                  onValueChange={(value) => handleToggle('renewalReminders', value)}
                />
              </View>
            </View>

            <View style={[styles.section, { backgroundColor: colors.card }]}>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingTitle}>
                    {t('notifications.priceChanges')}
                  </ThemedText>
                  <ThemedText style={styles.settingDescription}>
                    {t('notifications.priceChangesDescription')}
                  </ThemedText>
                </View>
                <Switch
                  value={settings.priceChanges}
                  onValueChange={(value) => handleToggle('priceChanges', value)}
                />
              </View>
            </View>

            <View style={[styles.section, { backgroundColor: colors.card }]}>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingTitle}>
                    {t('notifications.weeklyReport')}
                  </ThemedText>
                  <ThemedText style={styles.settingDescription}>
                    {t('notifications.weeklyReportDescription')}
                  </ThemedText>
                </View>
                <Switch
                  value={settings.weeklyReport}
                  onValueChange={(value) => handleToggle('weeklyReport', value)}
                />
              </View>
            </View>
          </>
        )}
      </View>
    </ScrollView>
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
  content: {
    padding: 16,
    gap: 16,
  },
  section: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
}); 