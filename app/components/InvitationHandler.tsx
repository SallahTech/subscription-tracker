import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { collection, query, where, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export function InvitationHandler() {
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (!user) return;

    // Listen for invitations
    const q = query(
      collection(db, 'familyInvitations'),
      where('invitedEmail', '==', user.email?.toLowerCase()),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const invitation = change.doc.data();
          Alert.alert(
            t('family.newInvite'),
            t('family.inviteMessage', {
              groupName: invitation.familyGroupName,
              invitedBy: invitation.invitedByName
            }),
            [
              {
                text: t('family.acceptInvite'),
                onPress: () => handleInvitation(change.doc.id, 'accept')
              },
              {
                text: t('family.declineInvite'),
                onPress: () => handleInvitation(change.doc.id, 'decline'),
                style: 'cancel'
              }
            ]
          );
        }
      });
    });

    return () => unsubscribe();
  }, [user]);

  const handleInvitation = async (invitationId: string, action: 'accept' | 'decline') => {
    try {
      if (action === 'accept') {
        // Update invitation status
        await updateDoc(doc(db, 'familyInvitations', invitationId), {
          status: 'accepted'
        });
        Alert.alert(t('family.success'), t('family.inviteAccepted'));
      } else {
        // Delete declined invitation
        await deleteDoc(doc(db, 'familyInvitations', invitationId));
        Alert.alert(t('family.success'), t('family.inviteDeclined'));
      }
    } catch (error) {
      console.error('Error handling invitation:', error);
      Alert.alert(t('family.error'), t('family.inviteError'));
    }
  };

  return null; // This component doesn't render anything
} 