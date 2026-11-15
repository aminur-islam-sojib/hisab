import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/useAppStore';
import {
  selectAnalyticsSummary,
  selectCategoryBreakdown,
  selectDailySpendChartData,
} from '@/store/selectors';
import { AnalyticsSummaryCards } from '@/components/analytics/AnalyticsSummaryCards';
import { DailyBarChart } from '@/components/analytics/DailyBarChart';
import { CategoryBreakdownList } from '@/components/analytics/CategoryBreakdownList';

type PeriodType = 'week' | 'month';

export default function AnalyticsScreen() {
  const [period, setPeriod] = useState<PeriodType>('week');

  const expenses = useAppStore((state) => state.expenses);
  const categories = useAppStore((state) => state.categories);
  const settings = useAppStore((state) => state.settings);

  const summary = useMemo(
    () => selectAnalyticsSummary(expenses, settings, period),
    [expenses, settings, period]
  );

  const chartData = useMemo(
    () => selectDailySpendChartData(expenses, period),
    [expenses, period]
  );

  const breakdown = useMemo(
    () => selectCategoryBreakdown(expenses, categories, { period }),
    [expenses, categories, period]
  );

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F7F4EF]">
      <View className="flex-1 px-4">
        {/* Header with Title & Period Segmented Toggle */}
        <View className="flex-row items-center justify-between py-3">
          <Text className="text-2xl font-extrabold text-[#18181B] tracking-tight">
            Analytics
          </Text>

          {/* Period Toggle */}
          <View className="flex-row bg-[#E4E0D8]/40 p-1 rounded-2xl border border-[#E4E0D8]/60">
            <Pressable
              onPress={() => setPeriod('week')}
              style={[styles.toggleBtn, period === 'week' && styles.activeToggle]}
              className={`px-3 py-1.5 rounded-xl ${
                period === 'week' ? 'bg-white shadow-xs' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  period === 'week' ? 'text-[#FF5A1F]' : 'text-[#71717A]'
                }`}
              >
                This Week
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setPeriod('month')}
              style={[styles.toggleBtn, period === 'month' && styles.activeToggle]}
              className={`px-3 py-1.5 rounded-xl ${
                period === 'month' ? 'bg-white shadow-xs' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  period === 'month' ? 'text-[#FF5A1F]' : 'text-[#71717A]'
                }`}
              >
                This Month
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Summary Metric Cards */}
          <AnalyticsSummaryCards
            summary={summary}
            period={period}
            currencySymbol={settings.currencySymbol}
            showDecimals={settings.showDecimals}
            className="mt-1"
          />

          {/* Daily Spend vs Budget Vertical Bar Chart */}
          <DailyBarChart
            data={chartData}
            dailyLimitMinor={settings.dailyLimitMinor}
            period={period}
            currencySymbol={settings.currencySymbol}
            className="mt-3"
          />

          {/* Category Breakdown Progress Bars */}
          <CategoryBreakdownList
            breakdown={breakdown}
            currencySymbol={settings.currencySymbol}
            showDecimals={settings.showDecimals}
            className="mt-1"
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  toggleBtn: {
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeToggle: {
    shadowColor: '#18181B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});
