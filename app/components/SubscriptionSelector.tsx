import React from 'react';
import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Subscription } from '@/types/subscription';
import { formatCurrency } from '@/utils/currency';

interface SubscriptionSelectorProps {
  subscriptions: Subscription[];
  selectedId?: string;
  onSelect: (subscription: Subscription) => void;
}

export function SubscriptionSelector({
  subscriptions,
  selectedId,
  onSelect,
}: SubscriptionSelectorProps) {
  const { currentTheme } = useTheme();
  const colors = currentTheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors;

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.container}
    >
      {subscriptions.map((subscription) => (
        <Pressable
          key={subscription.id}
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: selectedId === subscription.id ? '#FF6B6B' : colors.border,
            },
          ]}
          onPress={() => onSelect(subscription)}
        >
          <View style={styles.iconContainer}>
            <Ionicons
              name={subscription.icon || 'card-outline'}
              size={24}
              color={selectedId === subscription.id ? '#FF6B6B' : colors.text}
            />
          </View>
          <ThemedText style={styles.name} numberOfLines={1}>
            {subscription.name}
          </ThemedText>
          <ThemedText style={[
            styles.amount,
            selectedId === subscription.id && { color: '#FF6B6B' }
          ]}>
            {formatCurrency(subscription.amount)}
          </ThemedText>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
    width: 140,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  amount: {
    opacity: 0.8,
  },
}); 