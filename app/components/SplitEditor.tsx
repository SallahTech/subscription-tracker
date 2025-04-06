import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable } from 'react-native';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useFamily } from '@/contexts/FamilyContext';

interface SplitEditorProps {
  splits: { userId: string; amount: number }[];
  totalAmount: number;
  onSave: (splits: { userId: string; amount: number }[]) => void;
  onCancel: () => void;
}

export function SplitEditor({ splits, totalAmount, onSave, onCancel }: SplitEditorProps) {
  const { currentTheme } = useTheme();
  const colors = currentTheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors;
  const { t } = useTranslation();
  const { familyGroup } = useFamily();
  const [editedSplits, setEditedSplits] = useState(splits);

  const handleSplitChange = (userId: string, amount: string) => {
    const newAmount = parseFloat(amount) || 0;
    setEditedSplits(prev =>
      prev.map(split =>
        split.userId === userId ? { ...split, amount: newAmount } : split
      )
    );
  };

  const currentTotal = editedSplits.reduce((sum, split) => sum + split.amount, 0);
  const isValid = Math.abs(currentTotal - totalAmount) < 0.01;

  return (
    <View style={styles.container}>
      {editedSplits.map(split => {
        const member = familyGroup?.members.find(m => m.id === split.userId);
        if (!member) return null;

        return (
          <View key={split.userId} style={styles.splitRow}>
            <ThemedText style={styles.memberName}>{member.name}</ThemedText>
            <View style={styles.amountContainer}>
              <ThemedText style={styles.currencySymbol}>$</ThemedText>
              <TextInput
                style={[styles.amountInput, { color: colors.text }]}
                value={split.amount.toString()}
                onChangeText={(text) => handleSplitChange(split.userId, text)}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.text + '80'}
              />
            </View>
          </View>
        );
      })}

      <View style={styles.totalRow}>
        <ThemedText style={styles.totalLabel}>{t('family.total')}</ThemedText>
        <ThemedText
          style={[
            styles.totalAmount,
            { color: isValid ? '#50FA7B' : '#FF6B6B' },
          ]}
        >
          ${currentTotal.toFixed(2)}
        </ThemedText>
      </View>

      {!isValid && (
        <ThemedText style={styles.errorText}>
          {t('family.totalMustMatch', { amount: totalAmount.toFixed(2) })}
        </ThemedText>
      )}

      <View style={styles.buttons}>
        <Pressable
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <ThemedText style={styles.buttonText}>
            {t('common.cancel')}
          </ThemedText>
        </Pressable>
        <Pressable
          style={[
            styles.button,
            styles.saveButton,
            !isValid && styles.disabledButton,
          ]}
          onPress={() => isValid && onSave(editedSplits)}
          disabled={!isValid}
        >
          <ThemedText style={styles.buttonText}>
            {t('common.save')}
          </ThemedText>
        </Pressable>
      </View>
    </View>
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
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    marginRight: 4,
    opacity: 0.7,
  },
  amountInput: {
    width: 80,
    textAlign: 'right',
    fontSize: 16,
    padding: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F020',
  },
  totalLabel: {
    fontWeight: '600',
  },
  totalAmount: {
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    textAlign: 'right',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#64748B',
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
  },
  disabledButton: {
    opacity: 0.5,
  },
}); 