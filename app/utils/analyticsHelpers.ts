import { format, subMonths, isSameMonth } from 'date-fns';
import { Subscription } from '@/types/subscription';

export function calculateMonthlyTrends(subscriptions: Subscription[]) {
  return Array.from({ length: 6 }).map((_, index) => {
    const date = subMonths(new Date(), index);
    const monthSubscriptions = subscriptions.filter(sub => {
      const startDate = new Date(sub.startDate);
      return startDate <= date;
    });

    const total = monthSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);
    const prevMonth = subMonths(date, 1);
    const prevMonthTotal = monthSubscriptions
      .filter(sub => new Date(sub.startDate) <= prevMonth)
      .reduce((sum, sub) => sum + sub.amount, 0);

    const change = prevMonthTotal ? ((total - prevMonthTotal) / prevMonthTotal) * 100 : 0;

    return {
      month: format(date, 'MMM yyyy'),
      total,
      change
    };
  }).reverse();
}

export function findSubscriptionOverlaps(subscriptions: Subscription[]) {
  const categories = subscriptions.reduce((acc, sub) => {
    if (!acc[sub.category]) {
      acc[sub.category] = [];
    }
    acc[sub.category].push(sub);
    return acc;
  }, {} as Record<string, Subscription[]>);

  const overlaps = [];
  
  for (const [category, subs] of Object.entries(categories)) {
    if (subs.length > 1) {
      const totalSpent = subs.reduce((sum, sub) => sum + sub.amount, 0);
      const mostExpensive = subs.reduce((max, sub) => 
        sub.amount > max.amount ? sub : max
      );

      overlaps.push({
        type: 'overlap' as const,
        suggestion: `Multiple ${category} subscriptions detected`,
        savingAmount: totalSpent - mostExpensive.amount,
        explanation: `You're paying for multiple ${category.toLowerCase()} services (${
          subs.map(s => s.name).join(', ')
        }). Consider keeping only ${mostExpensive.name} to save ${
          (totalSpent - mostExpensive.amount).toFixed(2)
        } per month.`
      });
    }
  }

  return overlaps;
}

export function findUnusedSubscriptions(subscriptions: Subscription[]) {
  const threeMonthsAgo = subMonths(new Date(), 3);
  
  return subscriptions
    .filter(sub => sub.lastUsed && new Date(sub.lastUsed) < threeMonthsAgo)
    .map(sub => ({
      type: 'unused' as const,
      suggestion: `Unused subscription: ${sub.name}`,
      savingAmount: sub.amount,
      explanation: `You haven't used ${sub.name} since ${format(
        new Date(sub.lastUsed!),
        'MMMM d, yyyy'
      )}. Consider cancelling to save ${sub.amount.toFixed(2)} per month.`
    }));
}

export function getSuggestionColor(type: string) {
  switch (type) {
    case 'overlap':
      return '#FF6B6B';
    case 'unused':
      return '#FFB86C';
    case 'alternative':
      return '#4ECDC4';
    case 'bundle':
      return '#45B7D1';
    default:
      return '#6C5B7B';
  }
} 