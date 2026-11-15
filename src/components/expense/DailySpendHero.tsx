import React from 'react';
import { View, Text } from 'react-native';
import { formatCurrency } from '@/utils/currency';

export interface DailySpendHeroProps {
  spentMinor: number;
  limitMinor?: number;
  incomeMinor?: number;
  currencySymbol?: string;
  showDecimals?: boolean;
  dateLabel?: string;
  className?: string;
}

export const DailySpendHero = React.memo(function DailySpendHero({
  spentMinor,
  incomeMinor = 0,
  currencySymbol = '৳',
  showDecimals = false,
  dateLabel = 'November overview',
  className = '',
}: DailySpendHeroProps) {
  const netBalanceMinor = incomeMinor - spentMinor;

  return (
    <View className={`mb-3.5 ${className}`}>
      {/* Title above the card */}
      <Text className="text-sm font-bold text-[#18181B] mb-2 px-1">
        {dateLabel}
      </Text>

      {/* 3-Column Overview Card matching CoinPie: Income | Expense | Balance */}
      <View className="bg-white rounded-3xl p-4 border border-[#E4E0D8] shadow-sm">
        <View className="flex-row items-center justify-between">
          {/* Income */}
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <View className="w-2 h-2 rounded-full bg-[#10B981] mr-1.5" />
              <Text className="text-xs font-semibold text-[#71717A]">Income</Text>
            </View>
            <Text numberOfLines={1} className="text-base font-black text-[#18181B]">
              {formatCurrency(incomeMinor, { currencySymbol, showDecimals })}
            </Text>
          </View>

          {/* Expense */}
          <View className="flex-1 items-center">
            <View className="flex-row items-center mb-1">
              <View className="w-2 h-2 rounded-full bg-[#FF5A1F] mr-1.5" />
              <Text className="text-xs font-semibold text-[#71717A]">Expense</Text>
            </View>
            <Text numberOfLines={1} className="text-base font-black text-[#18181B]">
              {formatCurrency(spentMinor, { currencySymbol, showDecimals })}
            </Text>
          </View>

          {/* Balance */}
          <View className="flex-1 items-end">
            <View className="flex-row items-center mb-1">
              <View className="w-2 h-2 rounded-full bg-[#18181B] mr-1.5" />
              <Text className="text-xs font-semibold text-[#71717A]">Balance</Text>
            </View>
            <Text
              numberOfLines={1}
              className={`text-base font-black ${
                netBalanceMinor >= 0 ? 'text-[#18181B]' : 'text-[#DC2626]'
              }`}
            >
              {formatCurrency(netBalanceMinor, { currencySymbol, showDecimals })}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});
