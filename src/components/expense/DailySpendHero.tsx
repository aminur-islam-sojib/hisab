import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import { BudgetProgressBar } from '@/components/expense/BudgetProgressBar';
import { formatCurrency } from '@/utils/currency';

export interface DailySpendHeroProps {
  spentMinor: number;
  limitMinor: number;
  incomeMinor?: number;
  currencySymbol?: string;
  showDecimals?: boolean;
  dateLabel?: string;
  className?: string;
}

export function DailySpendHero({
  spentMinor,
  limitMinor,
  incomeMinor = 0,
  currencySymbol = '৳',
  showDecimals = false,
  dateLabel = "Today's Total Spend",
  className = '',
}: DailySpendHeroProps) {
  const netBalanceMinor = incomeMinor - spentMinor;

  return (
    <Card className={`mb-4 ${className}`}>
      {/* Subtitle */}
      <Text className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-1">
        {dateLabel}
      </Text>

      {/* Main Spend Amount */}
      <Text className="text-3xl font-extrabold text-[#18181B] tracking-tight mb-3">
        {formatCurrency(spentMinor, { currencySymbol, showDecimals })}
      </Text>

      {/* Optional Daily Income / Net Row if income logged */}
      {incomeMinor > 0 && (
        <View className="flex-row items-center justify-between bg-[#FAF8F5] rounded-xl px-3 py-2 mb-3 border border-[#E4E0D8]">
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-[#16A34A] mr-1.5" />
            <Text className="text-xs text-[#71717A] mr-1">Income:</Text>
            <Text className="text-xs font-bold text-[#16A34A]">
              +{formatCurrency(incomeMinor, { currencySymbol, showDecimals })}
            </Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-[#18181B] mr-1.5" />
            <Text className="text-xs text-[#71717A] mr-1">Balance:</Text>
            <Text className={`text-xs font-bold ${netBalanceMinor >= 0 ? 'text-[#18181B]' : 'text-[#DC2626]'}`}>
              {formatCurrency(netBalanceMinor, { currencySymbol, showDecimals })}
            </Text>
          </View>
        </View>
      )}

      {/* Progress Bar & Status */}
      <BudgetProgressBar
        spentMinor={spentMinor}
        limitMinor={limitMinor}
        currencySymbol={currencySymbol}
        showDecimals={showDecimals}
      />
    </Card>
  );
}
