import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { useTheme } from '@/contexts/ThemeContext';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useFamily } from '@/contexts/FamilyContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SubscriptionSelector } from '@/components/SubscriptionSelector';
import { formatCurrency } from '@/utils/currency';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Subscription } from '@/types/subscription';

interface Split {
  userId: string;
  userName: string;
  amount: string;
}

export default function ShareSubscriptionScreen() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const colors = currentTheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors;
  const { t } = useTranslation();
  const { familyGroup, shareSubscription, loading: familyLoading } = useFamily();
  const { user } = useAuth();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [splits, setSplits] = useState<Split[]>([]);
  const [isSharing, setIsSharing] = useState(false);

  // Fetch user's subscriptions
  useEffect(() => {
    async function fetchSubscriptions() {
      if (!user) return;

      try {
        const q = query(
          collection(db, 'subscriptions'),
          where('userId', '==', user.uid),
          where('isShared', '==', false)
        );
        
        const snapshot = await getDocs(q);
        const fetchedSubscriptions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Subscription[];
        
        setSubscriptions(fetchedSubscriptions);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        Alert.alert(t('common.error'), t('family.fetchError'));
      } finally {
        setLoading(false);
      }
    }

    fetchSubscriptions();
  }, [user]);

  // Initialize splits when subscription is selected
  useEffect(() => {
    if (selectedSubscription && familyGroup) {
      const initialSplits = familyGroup.members.map(member => ({
        userId: member.id,
        userName: member.name,
        amount: member.id === user?.uid ? 
          selectedSubscription.amount.toString() : 
          '0',
      }));
      setSplits(initialSplits);
    }
  }, [selectedSubscription, familyGroup]);

  const totalAmount = selectedSubscription?.amount || 0;
  const splitTotal = splits.reduce((sum, split) => sum + (parseFloat(split.amount) || 0), 0);
  const isValidSplit = Math.abs(splitTotal - totalAmount) < 0.01;

  const handleSplitChange = (userId: string, amount: string) => {
    // Only allow numbers and decimal point
    const cleanAmount = amount.replace(/[^0-9.]/g, '');
    
    setSplits(current =>
      current.map(split =>
        split.userId === userId ? { ...split, amount: cleanAmount } : split
      )
    );
  };

  const handleShare = async () => {
    if (!selectedSubscription || !isValidSplit) return;

    setIsSharing(true);
    try {
      await shareSubscription(selectedSubscription.id, splits.map(split => ({
        userId: split.userId,
        userName: split.userName,
        amount: parseFloat(split.amount) || 0,
      })));

      Alert.alert(
        t('family.success'),
        t('family.subscriptionShared'),
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert(t('family.error'), t('family.shareError'));
    } finally {
      setIsSharing(false);
    }
  };

  if (loading || familyLoading || !familyGroup) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <ThemedText type="title">{t('family.shareSubscription')}</ThemedText>
      </View>

      <View style={styles.content}>
        <Card>
          <View style={styles.form}>
            {/* Subscription Selection */}
            <View style={styles.section}>
              <ThemedText type="subtitle">
                {t('family.selectSubscription')}
              </ThemedText>
              {subscriptions.length > 0 ? (
                <SubscriptionSelector
                  subscriptions={subscriptions}
                  selectedId={selectedSubscription?.id}
                  onSelect={setSelectedSubscription}
                />
              ) : (
                <View style={styles.emptyState}>
                  <ThemedText style={styles.emptyText}>
                    {t('family.noSubscriptionsToShare')}
                  </ThemedText>
                </View>
              )}
            </View>

            {selectedSubscription && (
              <>
                {/* Cost Splitting */}
                <View style={styles.section}>
                  <ThemedText type="subtitle">
                    {t('family.costSplitting')}
                  </ThemedText>
                  <ThemedText style={styles.totalAmount}>
                    {t('family.totalAmount')}: {formatCurrency(totalAmount)}
                  </ThemedText>

                  <View style={styles.splits}>
                    {splits.map(split => (
                      <View key={split.userId} style={styles.splitRow}>
                        <ThemedText style={styles.memberName}>
                          {split.userName}
                        </ThemedText>
                        <TextInput
                          style={[styles.input, {
                            backgroundColor: colors.card,
                            color: colors.text,
                            borderColor: colors.border,
                          }]}
                          value={split.amount}
                          onChangeText={(value) => handleSplitChange(split.userId, value)}
                          keyboardType="decimal-pad"
                          placeholder="0.00"
                          placeholderTextColor={colors.text + '80'}
                        />
                      </View>
                    ))}
                  </View>

                  <View style={styles.splitTotal}>
                    <ThemedText style={styles.splitTotalLabel}>
                      {t('family.splitTotal')}:
                    </ThemedText>
                    <ThemedText style={[
                      styles.splitTotalAmount,
                      !isValidSplit && styles.invalidTotal
                    ]}>
                      {formatCurrency(splitTotal)}
                    </ThemedText>
                  </View>

                  {!isValidSplit && (
                    <ThemedText style={styles.errorText}>
                      {t('family.splitMustEqual', { amount: formatCurrency(totalAmount) })}
                    </ThemedText>
                  )}
                </View>

                {/* Share Button */}
                <Pressable
                  style={[
                    styles.shareButton,
                    { backgroundColor: '#FF6B6B' },
                    (!isValidSplit || isSharing) && styles.disabledButton,
                  ]}
                  onPress={handleShare}
                  disabled={!isValidSplit || isSharing}
                >
                  <ThemedText style={styles.buttonText}>
                    {isSharing ? t('family.sharing') : t('family.shareSubscription')}
                  </ThemedText>
                </Pressable>
              </>
            )}
          </View>
        </Card>
      </View>
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
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  form: {
    gap: 24,
  },
  section: {
    gap: 16,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    opacity: 0.7,
    textAlign: 'center',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  splits: {
    gap: 12,
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
  splitTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F020',
    paddingTop: 16,
    marginTop: 16,
  },
  splitTotalLabel: {
    fontWeight: '600',
  },
  splitTotalAmount: {
    fontWeight: '600',
  },
  invalidTotal: {
    color: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 8,
  },
  shareButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
}); 