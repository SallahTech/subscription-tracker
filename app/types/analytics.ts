export interface SpendingTrend {
  month: string;
  total: number;
  change: number;
}

export interface CategoryBreakdown {
  category: string;
  percentage: number;
  amount: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SavingSuggestion {
  suggestion: string;
  savingAmount: number;
  explanation: string;
  type: 'overlap' | 'unused' | 'alternative' | 'bundle';
}

export interface SpendingAnalytics {
  monthlyTrends: SpendingTrend[];
  categoryBreakdown: CategoryBreakdown[];
  potentialSavings: SavingSuggestion[];
  totalAnnualSpending: number;
  averageMonthlySpending: number;
  mostExpensiveCategory: string;
  fastestGrowingCategory: string;
} 