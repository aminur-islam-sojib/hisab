import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import {
  selectAnalyticsSummary,
  selectCategoryBreakdown,
  selectDailySpendChartData,
} from '@/store/selectors';
import { AnalyticsSummaryCards } from '@/components/analytics/AnalyticsSummaryCards';
import { DailyBarChart } from '@/components/analytics/DailyBarChart';
import { CategoryBreakdownList } from '@/components/analytics/CategoryBreakdownList';
import { useDrawerStore } from '@/store/useDrawerStore';
import { Icon } from '@/components/ui/Icon';

type PeriodType = 'week' | 'month';

export default function AnalyticsScreen() {
  const [period, setPeriod] = useState<PeriodType>('week');
  const openDrawer = useDrawerStore((s) => s.openDrawer);

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
        {/* Header with Back Button, Title & Menu Button */}
        <View className="flex-row items-center justify-between py-1 mb-2">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              className="w-10 h-10 rounded-full bg-white border border-[#E4E0D8] items-center justify-center mr-3 shadow-sm active:bg-[#ECE8DF]"
            >
              <Icon name="ChevronLeft" size={20} color="#18181B" strokeWidth={2.4} />
            </Pressable>
            <Text className="text-2xl font-black text-[#18181B] tracking-tight">
              Statistics
            </Text>
          </View>

          <Pressable
            hitSlop={8}
            onPress={() => openDrawer('statistics')}
            className="w-11 h-11 rounded-full bg-white border border-[#E4E0D8] items-center justify-center shadow-sm active:bg-[#ECE8DF]"
          >
            <Icon name="Menu" size={21} color="#18181B" strokeWidth={2.4} />
          </Pressable>
        </View>

        {/* Period Segmented Toggle */}
        <View className="flex-row bg-[#ECE8DF] p-1 rounded-2xl border border-[#E4E0D8] mb-3 self-start">
            <Pressable
              onPress={() => setPeriod('week')}
              style={[styles.toggleBtn, period === 'week' && styles.activeToggle]}
              className={`px-3 py-1.5 rounded-xl ${
                period === 'week' ? 'bg-white shadow-sm' : 'bg-transparent'
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
                period === 'month' ? 'bg-white shadow-sm' : 'bg-transparent'
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
