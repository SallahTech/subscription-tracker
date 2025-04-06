import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { VictoryLine, VictoryPie, VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native';
import { useTranslation } from 'react-i18next';
import { SpendingAnalytics } from '@/types/analytics';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Card } from '@/components/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { currentTheme } = useTheme();
  const colors = currentTheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors;
  const { t } = useTranslation();
  const { analytics, loading, error } = useAnalytics();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <ThemedText type="title">{t('analytics.title')}</ThemedText>
      </View>

      {/* Monthly Spending Trends */}
      <Card title={t('analytics.monthlyTrends')}>
        <VictoryChart
          width={width - 40}
          theme={VictoryTheme.material}
          domainPadding={20}
        >
          <VictoryLine
            data={analytics.monthlyTrends}
            x="month"
            y="total"
            style={{
              data: { stroke: '#FF6B6B' },
            }}
          />
          <VictoryAxis
            style={{
              tickLabels: { fill: colors.text }
            }}
          />
          <VictoryAxis
            dependentAxis
            style={{
              tickLabels: { fill: colors.text }
            }}
          />
        </VictoryChart>
      </Card>

      {/* Category Breakdown */}
      <Card title={t('analytics.categoryBreakdown')}>
        <View style={styles.pieContainer}>
          <VictoryPie
            data={analytics.categoryBreakdown}
            x="category"
            y="percentage"
            width={width - 40}
            colorScale={['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFD93D']}
            style={{
              labels: {
                fill: colors.text,
                fontSize: 12,
              }
            }}
          />
        </View>
      </Card>

      {/* Savings Suggestions */}
      <Card title={t('analytics.savingSuggestions')}>
        {analytics.potentialSavings.map((suggestion, index) => (
          <View key={index} style={styles.suggestionItem}>
            <View style={styles.suggestionHeader}>
              <ThemedText type="defaultSemiBold">
                ${suggestion.savingAmount.toFixed(2)} {t('analytics.potential')}
              </ThemedText>
              <View style={[styles.suggestionType, { backgroundColor: getSuggestionColor(suggestion.type) }]}>
                <ThemedText style={styles.suggestionTypeText}>
                  {t(`analytics.suggestionTypes.${suggestion.type}`)}
                </ThemedText>
              </View>
            </View>
            <ThemedText style={styles.suggestionText}>
              {suggestion.explanation}
            </ThemedText>
          </View>
        ))}
      </Card>

      {/* Summary Stats */}
      <Card title={t('analytics.summary')}>
        <View style={styles.statsGrid}>
          <StatItem
            label={t('analytics.annualSpending')}
            value={`$${analytics.totalAnnualSpending.toFixed(2)}`}
          />
          <StatItem
            label={t('analytics.monthlyAverage')}
            value={`$${analytics.averageMonthlySpending.toFixed(2)}`}
          />
          <StatItem
            label={t('analytics.topCategory')}
            value={analytics.mostExpensiveCategory}
          />
          <StatItem
            label={t('analytics.fastestGrowing')}
            value={analytics.fastestGrowingCategory}
          />
        </View>
      </Card>
    </ScrollView>
  );
}

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.statItem}>
    <ThemedText style={styles.statLabel}>{label}</ThemedText>
    <ThemedText type="defaultSemiBold" style={styles.statValue}>
      {value}
    </ThemedText>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 48,
  },
  pieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  suggestionItem: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#00000010',
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  suggestionTypeText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  suggestionText: {
    fontSize: 14,
    opacity: 0.8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
  },
}); 