import React from 'react';
import { StyleSheet, View, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from './ThemedText';
import { Card } from './Card';
import { useTheme } from '@/contexts/ThemeContext';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '@/utils/currency';
import { SharedSubscription } from '@/types/subscription';

interface SharedSubscriptionListProps {
  subscriptions: SharedSubscription[];
  onShare?: (subscriptionId: string) => void;
}

export function SharedSubscriptionList({ subscriptions, onShare }: SharedSubscriptionListProps) {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const colors = currentTheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors;
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#4CAF50';
      case 'pending':
        return '#FF6B6B';
      case 'overdue':
        return '#FF6B6B';
      default:
        return colors.text;
    }
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle">{t('family.sharedSubscriptions')}</ThemedText>
        {onShare && (
          <Pressable
            style={[styles.shareButton, { backgroundColor: '#FF6B6B' }]}
            onPress={() => router.push('/subscription/share')}
          >
            <Ionicons name="share-outline" size={20} color="#FFFFFF" />
            <ThemedText style={styles.buttonText}>
              {t('family.shareNew')}
            </ThemedText>
          </Pressable>
        )}
      </View>

      {subscriptions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons 
            name="receipt-outline" 
            size={48} 
            color={colors.text} 
            style={styles.emptyIcon} 
          />
          <ThemedText style={styles.emptyText}>
            {t('family.noSharedSubscriptions')}
          </ThemedText>
        </View>
      ) : (
        <View style={styles.list}>
          {subscriptions.map((subscription) => (
            <Pressable
              key={subscription.id}
              style={styles.subscriptionItem}
              onPress={() => router.push(`/subscription/${subscription.id}/shared`)}
            >
              <View style={styles.subscriptionHeader}>
                <View style={styles.subscriptionInfo}>
                  <ThemedText type="subtitle">
                    {subscription.name}
                  </ThemedText>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(subscription.status) + '20' }
                  ]}>
                    <ThemedText style={[
                      styles.statusText,
                      { color: getStatusColor(subscription.status) }
                    ]}>
                      {t(`family.status.${subscription.status}`)}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText type="subtitle">
                  {formatCurrency(subscription.totalAmount)}
                </ThemedText>
              </View>

              <View style={styles.splits}>
                {subscription.splits.map((split) => (
                  <View key={split.userId} style={styles.splitItem}>
                    <ThemedText style={styles.splitName}>
                      {split.userName}
                    </ThemedText>
                    <ThemedText style={[
                      styles.splitAmount,
                      { color: split.paid ? '#4CAF50' : colors.text }
                    ]}>
                      {formatCurrency(split.amount)}
                      {split.paid && (
                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      )}
                    </ThemedText>
                  </View>
                ))}
              </View>

              <View style={styles.dueDate}>
                <ThemedText style={styles.dueDateText}>
                  {t('family.nextDue')}: {subscription.nextDueDate}
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    opacity: 0.7,
    textAlign: 'center',
  },
  list: {
    gap: 16,
  },
  subscriptionItem: {
    borderWidth: 1,
    borderColor: '#E2E8F020',
    borderRadius: 8,
    padding: 16,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subscriptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  splits: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F020',
  },
  splitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  splitName: {
    opacity: 0.8,
  },
  splitAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDate: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F020',
  },
  dueDateText: {
    fontSize: 12,
    opacity: 0.7,
  },
}); 