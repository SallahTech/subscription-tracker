import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { useTheme } from '@/contexts/ThemeContext';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useFamily } from '@/contexts/FamilyContext';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

export default function SharedSubscriptionScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { currentTheme } = useTheme();
  const colors = currentTheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors;
  const { t } = useTranslation();
  const { user } = useAuth();
  const { familyGroup, markAsPaid, updateSubscriptionSplit } = useFamily();
  const [isEditing, setIsEditing] = useState(false);

  const subscription = familyGroup?.sharedSubscriptions.find(
    sub => sub.subscriptionId === id
  );

  const subscriptionDetails = familyGroup?.members.find(
    member => member.id === subscription?.splits[0].userId
  );

  if (!subscription || !subscriptionDetails) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedText style={styles.errorText}>
          {t('family.subscriptionNotFound')}
        </ThemedText>
      </View>
    );
  }

  const handleMarkAsPaid = async (userId: string) => {
    try {
      await markAsPaid(subscription.subscriptionId, userId);
      Alert.alert(t('family.success'), t('family.paymentMarked'));
    } catch (error) {
      Alert.alert(t('common.error'), t('family.paymentError'));
    }
  };

  const handleUpdateSplits = async (newSplits: { userId: string; amount: number }[]) => {
    try {
      await updateSubscriptionSplit(subscription.subscriptionId, newSplits);
      setIsEditing(false);
      Alert.alert(t('family.success'), t('family.splitsUpdated'));
    } catch (error) {
      Alert.alert(t('common.error'), t('family.updateError'));
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <ThemedText type="title">{t('family.sharedSubscription')}</ThemedText>
      </View>

      <Card>
        <View style={styles.subscriptionHeader}>
          <View style={styles.subscriptionInfo}>
            <ThemedText type="title" style={styles.subscriptionName}>
              {subscriptionDetails.name}
            </ThemedText>
            <ThemedText style={styles.totalAmount}>
              ${subscription.totalAmount.toFixed(2)} {t('subscriptions.perMonth')}
            </ThemedText>
          </View>
          {user?.uid === subscription.splits[0].userId && (
            <Pressable
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Ionicons
                name={isEditing ? 'close' : 'create-outline'}
                size={24}
                color={colors.text}
              />
            </Pressable>
          )}
        </View>
      </Card>

      <Card title={t('family.splits')}>
        {subscription.splits.map(split => {
          const member = familyGroup.members.find(m => m.id === split.userId);
          if (!member) return null;

          return (
            <View key={split.userId} style={styles.splitItem}>
              <View style={styles.splitInfo}>
                <ThemedText type="defaultSemiBold">{member.name}</ThemedText>
                <ThemedText style={styles.splitAmount}>
                  ${split.amount.toFixed(2)}
                </ThemedText>
              </View>
              {!isEditing && (
                <View style={styles.splitStatus}>
                  {split.paid ? (
                    <View style={[styles.paidBadge, { backgroundColor: '#50FA7B20' }]}>
                      <ThemedText style={[styles.paidText, { color: '#50FA7B' }]}>
                        {t('family.paid')}
                      </ThemedText>
                    </View>
                  ) : (
                    user?.uid === split.userId && (
                      <Pressable
                        style={[styles.payButton, { backgroundColor: colors.primary }]}
                        onPress={() => handleMarkAsPaid(split.userId)}
                      >
                        <ThemedText style={styles.payButtonText}>
                          {t('family.markAsPaid')}
                        </ThemedText>
                      </Pressable>
                    )
                  )}
                </View>
              )}
            </View>
          );
        })}
      </Card>

      {isEditing && (
        <Card title={t('family.editSplits')}>
          <SplitEditor
            splits={subscription.splits}
            totalAmount={subscription.totalAmount}
            onSave={handleUpdateSplits}
            onCancel={() => setIsEditing(false)}
          />
        </Card>
      )}
    </ScrollView>
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
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 24,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionName: {
    fontSize: 24,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 16,
    opacity: 0.7,
  },
  editButton: {
    padding: 8,
  },
  splitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F020',
  },
  splitInfo: {
    flex: 1,
  },
  splitAmount: {
    fontSize: 14,
    opacity: 0.7,
  },
  splitStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paidBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  paidText: {
    fontSize: 12,
    fontWeight: '600',
  },
  payButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
}); 