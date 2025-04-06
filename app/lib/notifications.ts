import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// Configure notifications behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationSettings {
  enabled: boolean;
  renewalReminders: boolean;
  renewalReminderDays: number; // Days before renewal to send notification
  priceChanges: boolean;
  weeklyReport: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  renewalReminders: true,
  renewalReminderDays: 3,
  priceChanges: true,
  weeklyReport: true,
};

export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B6B',
    });
  }

  return true;
}

export async function getUserNotificationSettings(userId: string): Promise<NotificationSettings> {
  try {
    const docRef = doc(db, 'userSettings', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().notifications as NotificationSettings;
    }
    
    // If no settings exist, create default settings
    await setDoc(docRef, { notifications: DEFAULT_SETTINGS });
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function updateNotificationSettings(
  userId: string,
  settings: Partial<NotificationSettings>
) {
  try {
    const docRef = doc(db, 'userSettings', userId);
    const currentSettings = await getUserNotificationSettings(userId);
    
    await setDoc(docRef, {
      notifications: {
        ...currentSettings,
        ...settings,
      },
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return false;
  }
}

export async function scheduleRenewalReminder(
  subscriptionId: string,
  subscriptionName: string,
  renewalDate: Date,
  amount: number,
  daysBeforeRenewal: number
) {
  const trigger = new Date(renewalDate);
  trigger.setDate(trigger.getDate() - daysBeforeRenewal);
  
  if (trigger <= new Date()) return; // Don't schedule if the date is in the past
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Subscription Renewal Reminder`,
      body: `Your ${subscriptionName} subscription ($${amount.toFixed(2)}) will renew in ${daysBeforeRenewal} days`,
      data: { subscriptionId },
    },
    trigger,
  });
} 