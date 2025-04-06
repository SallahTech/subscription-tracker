import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useFamily } from '@/contexts/FamilyContext';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useTheme } from '@/contexts/ThemeContext';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

export default function FamilyScreen() {
  const { currentTheme } = useTheme();
  const colors = currentTheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors;
  const { t } = useTranslation();
  const { user } = useAuth();
  const { familyGroup, loading, inviteToFamily, removeMember, updateMemberRole } = useFamily();
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  if (loading) {
    return <LoadingSpinner />;
  }

  const handleInvite = async () => {
    if (!inviteEmail) return;

    setIsInviting(true);
    try {
      await inviteToFamily(inviteEmail);
      setInviteEmail('');
      Alert.alert(
        t('family.inviteSuccess'),
        t('family.inviteSent', { email: inviteEmail })
      );
    } catch (error) {
      Alert.alert(
        t('common.error'),
        t('family.inviteError')
      );
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    Alert.alert(
      t('family.removeMember'),
      t('family.removeMemberConfirm', { name: memberName }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.remove'),
          style: 'destructive',
          onPress: () => removeMember(memberId),
        },
      ]
    );
  };

  const handleRoleChange = (memberId: string, currentRole: 'admin' | 'member') => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    Alert.alert(
      t('family.changeRole'),
      t('family.changeRoleConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.change'),
          onPress: () => updateMemberRole(memberId, newRole),
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <ThemedText type="title">{t('family.title')}</ThemedText>
      </View>

      {!familyGroup ? (
        <Card title={t('family.createGroup')}>
          <ThemedText style={styles.noGroupText}>
            {t('family.noGroup')}
          </ThemedText>
          <Pressable
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={() => {/* Handle create group */}}
          >
            <ThemedText style={styles.buttonText}>
              {t('family.create')}
            </ThemedText>
          </Pressable>
        </Card>
      ) : (
        <>
          <Card title={t('family.members')}>
            {familyGroup.members.map(member => (
              <View key={member.id} style={styles.memberItem}>
                <View style={styles.memberInfo}>
                  <ThemedText type="defaultSemiBold">
                    {member.name}
                  </ThemedText>
                  <ThemedText style={styles.memberRole}>
                    {t(`family.roles.${member.role}`)}
                  </ThemedText>
                </View>
                {user?.uid !== member.id && (
                  <View style={styles.memberActions}>
                    <Pressable
                      onPress={() => handleRoleChange(member.id, member.role)}
                      style={styles.actionButton}
                    >
                      <Ionicons
                        name="swap-horizontal-outline"
                        size={20}
                        color={colors.text}
                      />
                    </Pressable>
                    <Pressable
                      onPress={() => handleRemoveMember(member.id, member.name)}
                      style={styles.actionButton}
                    >
                      <Ionicons
                        name="remove-circle-outline"
                        size={20}
                        color="#FF6B6B"
                      />
                    </Pressable>
                  </View>
                )}
              </View>
            ))}
          </Card>

          <Card title={t('family.invite')}>
            <View style={styles.inviteContainer}>
              <TextInput
                style={[styles.input, {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                value={inviteEmail}
                onChangeText={setInviteEmail}
                placeholder={t('family.enterEmail')}
                placeholderTextColor={colors.text + '80'}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Pressable
                style={[
                  styles.inviteButton,
                  { backgroundColor: colors.primary },
                  (!inviteEmail || isInviting) && styles.disabledButton,
                ]}
                onPress={handleInvite}
                disabled={!inviteEmail || isInviting}
              >
                <ThemedText style={styles.buttonText}>
                  {isInviting ? t('family.inviting') : t('family.sendInvite')}
                </ThemedText>
              </Pressable>
            </View>
          </Card>

          <Card title={t('family.sharedSubscriptions')}>
            {familyGroup.sharedSubscriptions.length === 0 ? (
              <ThemedText style={styles.noSubscriptionsText}>
                {t('family.noSharedSubscriptions')}
              </ThemedText>
            ) : (
              familyGroup.sharedSubscriptions.map(subscription => (
                <View key={subscription.subscriptionId} style={styles.subscriptionItem}>
                  {/* Subscription details */}
                </View>
              ))
            )}
          </Card>
        </>
      )}
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
  noGroupText: {
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.7,
  },
  createButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  memberInfo: {
    flex: 1,
  },
  memberRole: {
    fontSize: 12,
    opacity: 0.7,
  },
  memberActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  inviteContainer: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inviteButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  noSubscriptionsText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  subscriptionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
}); 