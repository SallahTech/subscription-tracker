export interface Subscription {
  id: string;
  name: string;
  amount: number;
  category: string;
  nextRenewal: string;
  description?: string;
  startDate: string;
  lastUsed?: string;
  userId: string;
  splits?: SubscriptionSplit[];
  isShared?: boolean;
}

export interface SubscriptionSplit {
  userId: string;
  userName: string;
  amount: number;
  paid?: boolean;
  lastPaid?: Date;
}

export interface SharedSubscription extends Subscription {
  splits: SubscriptionSplit[];
  status: 'paid' | 'pending' | 'overdue';
  totalAmount: number;
  nextDueDate: string;
} 