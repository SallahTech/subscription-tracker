import React from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useFamily } from '@/contexts/FamilyContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card } from '@/components/Card';

export default function FamilyScreen() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const colors = currentTheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors;
  const { t } = useTranslation();
  const { familyGroup, loading, inviteMember } = useFamily();

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <ThemedText type="title">{t('family.title')}</ThemedText>
      </View>

      {!familyGroup ? (
        // Show create group option when no group exists
        <View style={styles.content}>
          <View style={styles.emptyState}>
            <Ionicons 
              name="people-outline" 
              size={48} 
              color={colors.text} 
              style={styles.emptyIcon} 
            />
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              {t('family.noGroup')}
            </ThemedText>
            <ThemedText style={styles.emptyText}>
              {t('family.createGroupPrompt')}
            </ThemedText>
            <Pressable
              style={[styles.createButton, { backgroundColor: '#FF6B6B' }]}
              onPress={() => router.push('/family/create')}
            >
              <ThemedText style={styles.buttonText}>
                {t('family.createGroup')}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      ) : (
        // Show group details when a group exists
        <View style={styles.content}>
          {/* Add this new button at the top */}
          <Pressable
            style={[styles.shareButton, { backgroundColor: '#FF6B6B' }]}
            onPress={() => router.push('/subscription/share')}
          >
            <Ionicons name="share-outline" size={20} color="#FFFFFF" />
            <ThemedText style={styles.buttonText}>
              {t('family.shareNewSubscription')}
            </ThemedText>
          </Pressable>

          {/* Group Info Card */}
          <Card style={styles.groupCard}>
            <View style={styles.groupHeader}>
              <ThemedText type="subtitle">{familyGroup.name}</ThemedText>
              <ThemedText style={styles.memberCount}>
                {t('family.memberCount', { count: familyGroup.members.length })}
              </ThemedText>
            </View>
          </Card>

          {/* Members Card */}
          <Card style={styles.membersCard}>
            <View style={styles.cardHeader}>
              <ThemedText type="subtitle">{t('family.members')}</ThemedText>
            </View>
            {familyGroup.members.map((member) => (
              <View key={member.id} style={styles.memberItem}>
                <View style={styles.memberInfo}>
                  <ThemedText style={styles.memberName}>
                    {member.name}
                  </ThemedText>
                  <View style={[
                    styles.roleBadge,
                    { backgroundColor: member.role === 'admin' ? '#FF6B6B20' : '#4CAF5020' }
                  ]}>
                    <ThemedText style={[
                      styles.roleText,
                      { color: member.role === 'admin' ? '#FF6B6B' : '#4CAF50' }
                    ]}>
                      {t(`family.roles.${member.role}`)}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.memberEmail}>
                  {member.email}
                </ThemedText>
              </View>
            ))}
          </Card>

          {/* Shared Subscriptions Card */}
          <Card style={styles.subscriptionsCard}>
            <View style={styles.cardHeader}>
              <ThemedText type="subtitle">{t('family.sharedSubscriptions')}</ThemedText>
            </View>
            {familyGroup.sharedSubscriptions && familyGroup.sharedSubscriptions.length > 0 ? (
              familyGroup.sharedSubscriptions.map((subscription) => (
                <Pressable
                  key={subscription.subscriptionId}
                  style={styles.subscriptionItem}
                  onPress={() => router.push(`/subscription/${subscription.subscriptionId}`)}
                >
                  <ThemedText>{subscription.name}</ThemedText>
                  <ThemedText style={styles.amount}>
                    ${subscription.totalAmount.toFixed(2)}
                  </ThemedText>
                </Pressable>
              ))
            ) : (
              <View style={styles.emptySubscriptions}>
                <ThemedText style={styles.emptyText}>
                  {t('family.noSharedSubscriptions')}
                </ThemedText>
              </View>
            )}
          </Card>

          {/* Invite Members Card */}
          <Card style={styles.inviteCard}>
            <View style={styles.cardHeader}>
              <ThemedText type="subtitle">{t('family.inviteMembers')}</ThemedText>
            </View>
            <Pressable
              style={[styles.inviteButton, { backgroundColor: '#FF6B6B' }]}
              onPress={() => router.push('/family/invite')}
            >
              <Ionicons name="person-add-outline" size={20} color="#FFFFFF" />
              <ThemedText style={styles.buttonText}>
                {t('family.inviteMember')}
              </ThemedText>
            </Pressable>
          </Card>
        </View>
      )}
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
  header: {
    padding: 16,
    paddingTop: 48,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#00000010',
    borderRadius: 12,
    marginTop: 16,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // New styles for group display
  groupCard: {
    marginBottom: 16,
  },
  groupHeader: {
    marginBottom: 8,
  },
  memberCount: {
    opacity: 0.7,
    fontSize: 14,
  },
  membersCard: {
    marginBottom: 16,
  },
  cardHeader: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F020',
    paddingBottom: 8,
  },
  memberItem: {
    marginBottom: 16,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  memberName: {
    fontWeight: '600',
  },
  memberEmail: {
    opacity: 0.7,
    fontSize: 14,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  subscriptionsCard: {
    marginBottom: 16,
  },
  subscriptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F020',
  },
  amount: {
    fontWeight: '600',
  },
  emptySubscriptions: {
    padding: 16,
    alignItems: 'center',
  },
  inviteCard: {
    marginBottom: 16,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 