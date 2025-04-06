import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { SpendingAnalytics } from '@/types/analytics';
import { format, subMonths } from 'date-fns';

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<SpendingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchAnalytics() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch subscriptions
        const subscriptionsRef = collection(db, 'subscriptions');
        const q = query(subscriptionsRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        const subscriptions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Calculate monthly trends (last 6 months)
        const monthlyTrends = Array.from({ length: 6 }).map((_, index) => {
          const month = format(subMonths(new Date(), index), 'MMM yyyy');
          const total = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
          const change = index === 5 ? 0 : (total - (subscriptions.reduce((sum, sub) => sum + sub.amount, 0))) / total * 100;
          
          return { month, total, change };
        }).reverse();

        // Calculate category breakdown
        const categories = subscriptions.reduce((acc, sub) => {
          acc[sub.category] = (acc[sub.category] || 0) + sub.amount;
          return acc;
        }, {} as Record<string, number>);

        const totalSpending = Object.values(categories).reduce((sum, amount) => sum + amount, 0);

        const categoryBreakdown = Object.entries(categories).map(([category, amount]) => ({
          category,
          amount,
          percentage: (amount / totalSpending) * 100,
          trend: 'stable' as const // You would need historical data to determine trend
        }));

        // Find potential savings
        const potentialSavings = [];

        // Check for subscription overlaps
        const streamingServices = subscriptions.filter(sub => sub.category === 'Streaming');
        if (streamingServices.length > 1) {
          potentialSavings.push({
            type: 'overlap',
            suggestion: 'Consider consolidating streaming services',
            savingAmount: streamingServices[0].amount,
            explanation: `You have multiple streaming subscriptions. Consider rotating between ${streamingServices.map(s => s.name).join(' and ')} instead of keeping them all active.`
          });
        }

        // More savings calculations would go here...

        setAnalytics({
          monthlyTrends,
          categoryBreakdown,
          potentialSavings,
          totalAnnualSpending: totalSpending * 12,
          averageMonthlySpending: totalSpending,
          mostExpensiveCategory: categoryBreakdown.sort((a, b) => b.amount - a.amount)[0]?.category || '',
          fastestGrowingCategory: categoryBreakdown[0]?.category || '' // Would need historical data
        });

      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [user]);

  return { analytics, loading, error };
} 