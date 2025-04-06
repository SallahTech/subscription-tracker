export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  permissions: ('view' | 'edit' | 'delete' | 'invite')[];
  avatar?: string;
}

export interface SharedSubscription {
  subscriptionId: string;
  splitType: 'equal' | 'percentage' | 'fixed';
  splits: {
    userId: string;
    amount: number;
    paid: boolean;
  }[];
  totalAmount: number;
}

export interface FamilyGroup {
  id: string;
  name: string;
  members: FamilyMember[];
  sharedSubscriptions: SharedSubscription[];
  createdBy: string;
  createdAt: Date;
} 