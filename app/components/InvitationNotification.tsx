import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable, Alert } from 'react-native';
import { collection, query, where, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { ThemedText } from './ThemedText';
import { Card } from './Card';
import { Ionicons } from '@expo/vector-icons';

interface Invitation {
  id: string;
  familyGroupId: string;
  familyGroupName: string;
  invitedBy: string;
  invitedByName: string;
  status: 'pending' | 'accepted' | 'declined';
}

export function InvitationNotification() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  useEffect(() => {
    if (!user?.email) return;

    const q = query(
      collection(db, 'familyInvitations'),
      where('invitedEmail', '==', user.email.toLowerCase()),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newInvitations: Invitation[] = [];
      snapshot.forEach((doc) => {
        newInvitations.push({ id: doc.id, ...doc.data() } as Invitation);
      });
      setInvitations(newInvitations);
    });

    return () => unsubscribe();
  }, [user]);

  const handleInvitation = async (invitationId: string, action: 'accept' | 'decline') => {
    try {
      const invitation = invitations.find(inv => inv.id === invitationId);
      if (!invitation) return;

      if (action === 'accept') {
        // Update family group members
        const groupRef = doc(db, 'familyGroups', invitation.familyGroupId);
        await updateDoc(groupRef, {
          members: arrayUnion({
            id: user!.uid,
            name: user!.displayName || user!.email,
            email: user!.email,
            role: 'member',
            permissions: ['view'],
          }),
          memberIds: arrayUnion(user!.uid),
        });
      }

      // Delete the invitation
      await deleteDoc(doc(db, 'familyInvitations', invitationId));

      Alert.alert(
        t('family.success'),
        action === 'accept' 
          ? t('family.inviteAccepted', { groupName: invitation.familyGroupName })
          : t('family.inviteDeclined')
      );
    } catch (error) {
      Alert.alert(t('family.error'), t('family.inviteActionError'));
    }
  };

  if (invitations.length === 0) return null;

  return (
    <View style={styles.container}>
      {invitations.map((invitation) => (
        <Card key={invitation.id} style={styles.invitationCard}>
          <View style={styles.invitationContent}>
            <View style={styles.invitationHeader}>
              <Ionicons name="people" size={24} color="#FF6B6B" />
              <ThemedText type="subtitle">
                {t('family.invitationTitle')}
              </ThemedText>
            </View>
            
            <ThemedText style={styles.invitationText}>
              {t('family.invitationMessage', {
                inviter: invitation.invitedByName,
                groupName: invitation.familyGroupName,
              })}
            </ThemedText>

            <View style={styles.buttonContainer}>
              <Pressable
                style={[styles.button, styles.declineButton]}
                onPress={() => handleInvitation(invitation.id, 'decline')}
              >
                <ThemedText style={styles.buttonText}>
                  {t('family.decline')}
                </ThemedText>
              </Pressable>
              <Pressable
                style={[styles.button, styles.acceptButton]}
                onPress={() => handleInvitation(invitation.id, 'accept')}
              >
                <ThemedText style={styles.buttonText}>
                  {t('family.accept')}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  invitationCard: {
    marginBottom: 16,
  },
  invitationContent: {
    gap: 16,
  },
  invitationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  invitationText: {
    opacity: 0.8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  declineButton: {
    backgroundColor: '#E2E8F0',
  },
  acceptButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
}); 