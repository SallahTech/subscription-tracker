import React, { useState } from 'react';
import { StyleSheet, View, Modal, Pressable, ScrollView } from 'react-native';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useFamily } from '@/contexts/FamilyContext';
import { Ionicons } from '@expo/vector-icons';

interface ShareSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  subscriptionId: string;
  amount: number;
}

export function ShareSubscriptionModal({
  visible,
  onClose,
  subscriptionId,
  amount,
}: ShareSubscriptionModalProps) {
  const { currentTheme } = useTheme();
  const colors = currentTheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors;
  const { t } = useTranslation();
  const { familyGroup, shareSubscription } = useFamily();
  
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (selectedMembers.length === 0) return;

    setLoading(true);
    try {
      const splitAmount = amount / (selectedMembers.length + 1); // +1 for the owner
      const splits = [
        ...selectedMembers.map(memberId => ({
          userId: memberId,
          amount: splitAmount,
        })),
      ];

      await shareSubscription(subscriptionId, splits);
      onClose();
    } catch (error) {
      console.error('Error sharing subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background + 'E6' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <ThemedText type="title">{t('family.shareSubscription')}</ThemedText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.memberList}>
            {familyGroup?.members.map(member => (
              <Pressable
                key={member.id}
                style={[
                  styles.memberItem,
                  selectedMembers.includes(member.id) && styles.selectedMember,
                ]}
                onPress={() => toggleMember(member.id)}
              >
                <View style={styles.memberInfo}>
                  <ThemedText type="defaultSemiBold">{member.name}</ThemedText>
                  <ThemedText style={styles.memberEmail}>{member.email}</ThemedText>
                </View>
                {selectedMembers.includes(member.id) && (
                  <Ionicons name="checkmark-circle" size={24} color="#50FA7B" />
                )}
              </Pressable>
            ))}
          </ScrollView>

          {selectedMembers.length > 0 && (
            <View style={styles.summary}>
              <ThemedText style={styles.summaryText}>
                {t('family.splitAmount', {
                  amount: (amount / (selectedMembers.length + 1)).toFixed(2),
                  count: selectedMembers.length + 1,
                })}
              </ThemedText>
            </View>
          )}

          <View style={styles.buttons}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <ThemedText style={styles.buttonText}>
                {t('common.cancel')}
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.button,
                styles.shareButton,
                (selectedMembers.length === 0 || loading) && styles.disabledButton,
              ]}
              onPress={handleShare}
              disabled={selectedMembers.length === 0 || loading}
            >
              <ThemedText style={styles.buttonText}>
                {loading ? t('family.sharing') : t('family.share')}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  memberList: {
    maxHeight: 300,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#00000010',
  },
  selectedMember: {
    backgroundColor: '#50FA7B20',
  },
  memberInfo: {
    flex: 1,
  },
  memberEmail: {
    fontSize: 12,
    opacity: 0.7,
  },
  summary: {
    padding: 16,
    backgroundColor: '#00000010',
    borderRadius: 8,
    marginVertical: 16,
  },
  summaryText: {
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#64748B',
  },
  shareButton: {
    backgroundColor: '#FF6B6B',
  },
  disabledButton: {
    opacity: 0.5,
  },
}); 