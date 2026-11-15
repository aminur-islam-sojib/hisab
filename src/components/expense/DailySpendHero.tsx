import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import { BudgetProgressBar } from '@/components/expense/BudgetProgressBar';
import { formatCurrency } from '@/utils/currency';

export interface DailySpendHeroProps {
  spentMinor: number;
  limitMinor: number;
  currencySymbol?: string;
  showDecimals?: boolean;
  dateLabel?: string;
  className?: string;
}

export function DailySpendHero({
  spentMinor,
  limitMinor,
  currencySymbol = '৳',
  showDecimals = false,
  dateLabel = "Today's Total Spend",
  className = '',
}: DailySpendHeroProps) {
  return (
    <Card className={`mb-4 ${className}`}>
      {/* Subtitle */}
      <Text className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-1">
        {dateLabel}
      </Text>

      {/* Main Spend Amount */}
      <Text className="text-3xl font-extrabold text-[#18181B] tracking-tight mb-4">
        {formatCurrency(spentMinor, { currencySymbol, showDecimals })}
      </Text>

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
