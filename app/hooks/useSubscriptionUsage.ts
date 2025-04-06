import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useSubscriptionUsage(subscriptionId: string) {
  const [lastUsed, setLastUsed] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const trackUsage = async () => {
    if (!subscriptionId) return;
    
    setUpdating(true);
    try {
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'subscriptions', subscriptionId), {
        lastUsed: now
      });
      setLastUsed(now);
    } catch (error) {
      console.error('Error updating usage:', error);
    } finally {
      setUpdating(false);
    }
  };

  return { lastUsed, trackUsage, updating };
} 