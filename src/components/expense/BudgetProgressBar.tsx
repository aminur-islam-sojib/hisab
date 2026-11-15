import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency } from '@/utils/currency';

export interface BudgetProgressBarProps {
  spentMinor: number;
  limitMinor: number;
  currencySymbol?: string;
  showDecimals?: boolean;
  className?: string;
}

export function BudgetProgressBar({
  spentMinor,
  limitMinor,
  currencySymbol = '৳',
  showDecimals = false,
  className = '',
}: BudgetProgressBarProps) {
  const safeSpent = Math.max(0, spentMinor);
  const safeLimit = Math.max(0, limitMinor);
  const percentage = safeLimit > 0 ? (safeSpent / safeLimit) * 100 : 0;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  const isOverBudget = safeLimit > 0 && safeSpent >= safeLimit;
  const isNearLimit = safeLimit > 0 && percentage >= 80 && percentage < 100;

  // Determine color scheme
  let barColor = '#FF5A1F'; // Default accent orange
  let statusTextColor = '#71717A';
  let statusText = `${Math.round(percentage)}% of daily limit`;

  if (isOverBudget) {
    barColor = '#DC2626';
    statusTextColor = '#DC2626';
    const overAmount = safeSpent - safeLimit;
    statusText = `Over by ${formatCurrency(overAmount, { currencySymbol, showDecimals })}`;
  } else if (isNearLimit) {
    barColor = '#EAB308';
    statusTextColor = '#B45309';
    const remaining = safeLimit - safeSpent;
    statusText = `${Math.round(percentage)}% spent • ${formatCurrency(remaining, { currencySymbol, showDecimals })} left`;
  } else {
    const remaining = safeLimit - safeSpent;
    statusText = `${formatCurrency(remaining, { currencySymbol, showDecimals })} remaining`;
  }

  return (
    <View className={`w-full ${className}`}>
      {/* Top row: Spent / Limit */}
      <View className="flex-row items-baseline justify-between mb-2">
        <View className="flex-row items-baseline">
          <Text className="text-sm font-medium text-[#71717A]">Daily Limit: </Text>
          <Text className="text-sm font-semibold text-[#18181B]">
            {formatCurrency(safeLimit, { currencySymbol, showDecimals })}
          </Text>
        </View>
        <Text style={{ color: statusTextColor }} className="text-xs font-semibold">
          {statusText}
        </Text>
      </View>

      {/* Progress track */}
      <View className="h-2.5 w-full bg-[#E4E0D8]/60 rounded-full overflow-hidden">
        <View
          style={[
            styles.progressFill,
            {
              width: `${clampedPercentage}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progressFill: {
    height: '100%',
    borderRadius: 9999,
  },
});
