import React from 'react';
import { View, Text } from 'react-native';
import { AnalyticsSummaryResult } from '@/store/selectors';
import { formatCurrency } from '@/utils/currency';
import { formatDisplayDate } from '@/utils/date';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';

export interface AnalyticsSummaryCardsProps {
  summary: AnalyticsSummaryResult;
  period: 'week' | 'month';
  currencySymbol?: string;
  showDecimals?: boolean;
  className?: string;
}

export function AnalyticsSummaryCards({
  summary,
  period,
  currencySymbol = '৳',
  showDecimals = false,
  className = '',
}: AnalyticsSummaryCardsProps) {
  const periodLabel = period === 'week' ? 'This Week' : 'This Month';
  const highestDayText = summary.highestSpendDay
    ? formatDisplayDate(summary.highestSpendDay.date, { showRelative: true })
    : 'None';

  return (
    <View className={`w-full ${className}`}>
      {/* Hero Card: Total Spend */}
      <Card className="mb-3">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-xs font-semibold text-[#71717A] uppercase tracking-wider">
            Total Spent ({periodLabel})
          </Text>
          <View className="flex-row items-center bg-[#FF5A1F]/10 px-2 py-0.5 rounded-full">
            <Icon name="Receipt" size={12} color="#FF5A1F" />
            <Text className="text-xs font-semibold text-[#FF5A1F] ml-1">
              {summary.transactionCount} {summary.transactionCount === 1 ? 'txn' : 'txns'}
            </Text>
          </View>
        </View>

        <Text className="text-3xl font-extrabold text-[#18181B] tracking-tight mb-2">
          {formatCurrency(summary.totalSpendMinor, { currencySymbol, showDecimals })}
        </Text>

        <View className="flex-row items-center justify-between pt-2 border-t border-[#E4E0D8]/60">
          <Text className="text-xs font-medium text-[#71717A]">
            Budget Cap: {formatCurrency(summary.budgetLimitMinor, { currencySymbol, showDecimals })}
          </Text>
          <Text
            className={`text-xs font-bold ${
              summary.totalSpendMinor > summary.budgetLimitMinor
                ? 'text-[#DC2626]'
                : 'text-[#16A34A]'
            }`}
          >
            {summary.totalSpendMinor > summary.budgetLimitMinor
              ? 'Over Budget'
              : 'Within Budget'}
          </Text>
        </View>
      </Card>

      {/* 2-Column Row: Daily Average & Highest Day */}
      <View className="flex-row gap-3">
        {/* Daily Average Card */}
        <Card className="flex-1 p-3.5">
          <View className="flex-row items-center mb-1">
            <Icon name="TrendingUp" size={14} color="#71717A" />
            <Text className="text-xs font-semibold text-[#71717A] uppercase tracking-wider ml-1">
              Daily Avg
            </Text>
          </View>
          <Text className="text-lg font-bold text-[#18181B]">
            {formatCurrency(summary.dailyAverageMinor, { currencySymbol, showDecimals })}
          </Text>
        </Card>

        {/* Highest Spend Day Card */}
        <Card className="flex-1 p-3.5">
          <View className="flex-row items-center mb-1">
            <Icon name="AlertCircle" size={14} color="#71717A" />
            <Text className="text-xs font-semibold text-[#71717A] uppercase tracking-wider ml-1">
              Highest Day
            </Text>
          </View>
          <Text className="text-lg font-bold text-[#18181B]">
            {summary.highestSpendDay
              ? formatCurrency(summary.highestSpendDay.amountMinor, { currencySymbol, showDecimals })
              : '৳0'}
          </Text>
          <Text className="text-xs text-[#71717A] mt-0.5" numberOfLines={1}>
            {highestDayText}
          </Text>
        </Card>
      </View>
    </View>
  );
}
