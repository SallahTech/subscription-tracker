import React, { useState } from 'react';
import { StyleSheet, View, Pressable, TextInput, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from './ThemedText';
import { Card } from './Card';
import { useTheme } from '@/contexts/ThemeContext';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useFamily } from '@/contexts/FamilyContext';
import { LoadingSpinner } from './LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';

interface Split {
  userId: string;
  amount: number;
}

interface SharedSubscriptionManagerProps {
  subscriptionId: string;
  totalAmount: number;
  currentSplits?: Split[];
  onSplitsSaved?: () => void;
}

export function SharedSubscriptionManager({
  subscriptionId,
  totalAmount,
  currentSplits = [],
  onSplitsSaved
}: SharedSubscriptionManagerProps) {
  const { currentTheme } = useTheme();
  const colors = currentTheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors;
  const { t } = useTranslation();
  const { familyGroup, shareSubscription, loading } = useFamily();
  const [splits, setSplits] = useState<Split[]>(currentSplits);
  const [isEditing, setIsEditing] = useState(false);

  const totalSplit = splits.reduce((sum, split) => sum + split.amount, 0);
  const isValidSplit = Math.abs(totalSplit - totalAmount) < 0.01;

  const handleSplitChange = (userId: string, amount: string) => {
    const newAmount = parseFloat(amount) || 0;
    setSplits(current =>
      current.map(split =>
        split.userId === userId ? { ...split, amount: newAmount } : split
      )
    );
  };

  const handleSave = async () => {
    if (!isValidSplit) {
      Alert.alert(
        t('family.invalidSplit'),
        t('family.splitMustEqual', { amount: totalAmount })
      );
      return;
    }

    try {
      await shareSubscription(subscriptionId, splits);
      setIsEditing(false);
      onSplitsSaved?.();
      Alert.alert(t('family.success'), t('family.splitsUpdated'));
    } catch (error) {
      Alert.alert(t('common.error'), t('family.splitUpdateError'));
    }
  };

  if (loading || !familyGroup) {
    return <LoadingSpinner />;
  }

  return (
    <Card title={t('family.costSplitting')}>
      <View style={styles.container}>
        {isEditing ? (
          <>
            {familyGroup.members.map(member => (
              <View key={member.id} style={styles.splitRow}>
                <ThemedText style={styles.memberName}>
                  {member.name}
                </ThemedText>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border
                  }]}
                  value={splits.find(s => s.userId === member.id)?.amount.toString() || '0'}
                  onChangeText={(value) => handleSplitChange(member.id, value)}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                />
              </View>
            ))}
            
            <View style={styles.totalRow}>
              <ThemedText style={styles.totalLabel}>
                {t('family.total')}:
              </ThemedText>
              <ThemedText style={[
                styles.totalAmount,
                !isValidSplit && styles.invalidTotal
              ]}>
                {totalSplit.toFixed(2)}
              </ThemedText>
            </View>

            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setSplits(currentSplits);
                  setIsEditing(false);
                }}
              >
                <ThemedText style={styles.buttonText}>
                  {t('common.cancel')}
                </ThemedText>
              </Pressable>
              <Pressable
                style={[
                  styles.button,
                  styles.saveButton,
                  !isValidSplit && styles.disabledButton
                ]}
                onPress={handleSave}
                disabled={!isValidSplit}
              >
                <ThemedText style={styles.buttonText}>
                  {t('common.save')}
                </ThemedText>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            {splits.map(split => {
              const member = familyGroup.members.find(m => m.id === split.userId);
              return (
                <View key={split.userId} style={styles.splitRow}>
                  <ThemedText style={styles.memberName}>
                    {member?.name}
                  </ThemedText>
                  <ThemedText>
                    ${split.amount.toFixed(2)}
                  </ThemedText>
                </View>
              );
            })}
            <Pressable
              style={[styles.editButton, { backgroundColor: colors.primary }]}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="pencil" size={20} color="#FFFFFF" />
              <ThemedText style={styles.buttonText}>
                {t('family.editSplits')}
              </ThemedText>
            </Pressable>
          </>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberName: {
    flex: 1,
  },
  input: {
    width: 100,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 16,
    marginTop: 8,
  },
  totalLabel: {
    fontWeight: '600',
  },
  totalAmount: {
    fontWeight: '600',
  },
  invalidTotal: {
    color: '#FF6B6B',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E2E8F0',
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
}); 