import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  permissions: string[];
}

interface SharedSubscription {
  id: string;
  name: string;
  amount: number;
  period: string;
  splits: {
    userId: string;
    amount: number;
  }[];
}

interface FamilyGroup {
  id: string;
  name: string;
  createdBy: string;
  members: FamilyMember[];
  memberIds: string[];
  sharedSubscriptions: SharedSubscription[];
}

interface FamilyContextType {
  familyGroup: FamilyGroup | null;
  loading: boolean;
  error: string | null;
  createFamilyGroup: (name: string) => Promise<void>;
  inviteMember: (email: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  updateMemberRole: (memberId: string, role: 'admin' | 'member') => Promise<void>;
  shareSubscription: (subscriptionId: string, splits: { userId: string; amount: number }[]) => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const [familyGroup, setFamilyGroup] = useState<FamilyGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    console.log('FamilyProvider: Starting effect', { user: user?.email });
    
    if (!user) {
      console.log('FamilyProvider: No user, resetting state');
      setFamilyGroup(null);
      setLoading(false);
      return;
    }

    try {
      console.log('FamilyProvider: Setting up Firestore query');
      const q = query(
        collection(db, 'familyGroups'),
        where('memberIds', 'array-contains', user.uid)
      );

      console.log('FamilyProvider: Setting up snapshot listener');
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log('FamilyProvider: Received snapshot', { empty: snapshot.empty });
          if (snapshot.empty) {
            setFamilyGroup(null);
          } else {
            const groupData = snapshot.docs[0].data();
            setFamilyGroup({
              id: snapshot.docs[0].id,
              ...groupData,
            } as FamilyGroup);
          }
          setLoading(false);
        },
        (err) => {
          console.error('FamilyProvider: Error in snapshot listener:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => {
        console.log('FamilyProvider: Cleaning up snapshot listener');
        unsubscribe();
      };
    } catch (err) {
      console.error('FamilyProvider: Error in effect:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  }, [user]);

  const createFamilyGroup = async (name: string) => {
    if (!user) throw new Error('User must be logged in');
    
    try {
      const groupData = {
        name: name.trim(),
        createdBy: user.uid,
        createdAt: new Date(),
        members: [{
          id: user.uid,
          name: user.displayName || user.email,
          email: user.email,
          role: 'admin',
          permissions: ['view', 'edit', 'delete', 'invite'],
        }],
        memberIds: [user.uid],
        sharedSubscriptions: [],
      };

      await addDoc(collection(db, 'familyGroups'), groupData);
    } catch (err) {
      console.error('Error creating family group:', err);
      throw err;
    }
  };

  const inviteMember = async (email: string) => {
    if (!user || !familyGroup) {
      throw new Error('User must be logged in and have a family group');
    }

    try {
      // Create an invitation in the invitations collection
      await addDoc(collection(db, 'familyInvitations'), {
        familyGroupId: familyGroup.id,
        familyGroupName: familyGroup.name,
        invitedEmail: email.toLowerCase(),
        invitedBy: user.uid,
        invitedByName: user.displayName || user.email,
        status: 'pending',
        createdAt: new Date(),
      });
    } catch (err) {
      console.error('Error inviting member:', err);
      throw err;
    }
  };

  const removeMember = async (memberId: string) => {
    // Implementation will be added later
    throw new Error('Not implemented');
  };

  const updateMemberRole = async (memberId: string, role: 'admin' | 'member') => {
    // Implementation will be added later
    throw new Error('Not implemented');
  };

  const shareSubscription = async (subscriptionId: string, splits: { userId: string; amount: number }[]) => {
    // Implementation will be added later
    throw new Error('Not implemented');
  };

  const value = {
    familyGroup,
    loading,
    error,
    createFamilyGroup,
    inviteMember,
    removeMember,
    updateMemberRole,
    shareSubscription,
  };

  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
} 