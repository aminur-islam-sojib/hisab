import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/currency';
import { Icon } from '@/components/ui/Icon';
import { CategoryBreakdownItem } from '@/store/selectors';
import { getLocalTodayDateString, parseLocalDateString } from '@/utils/date';

export type CoinPieTab = 'today' | 'expenses' | 'income' | 'loans';

export interface CoinPieCardProps {
  monthName: string;
  selectedDate: string;
  todayExpenseTotalMinor: number;
  todayIncomeTotalMinor: number;
  todayExpenseBreakdown: CategoryBreakdownItem[];
  todayIncomeBreakdown: CategoryBreakdownItem[];
  expenseTotalMinor: number;
  incomeTotalMinor: number;
  expenseBreakdown: CategoryBreakdownItem[];
  incomeBreakdown: CategoryBreakdownItem[];
  currencySymbol?: string;
  showDecimals?: boolean;
  onSelectCategory?: (categoryId: string) => void;
  className?: string;
}

const CHART_SIZE = 220;
const CX = CHART_SIZE / 2;
const CY = CHART_SIZE / 2;
const THICKNESS = 32;
const RADIUS = (CHART_SIZE - THICKNESS - 8) / 2;

// SVG Arc path generator
function createArcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const rad = Math.PI / 180;
  const startRad = (startAngle - 90) * rad;
  const endRad = (endAngle - 90) * rad;

  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);

  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
}

export const CoinPieCard = React.memo(function CoinPieCard({
  monthName,
  selectedDate,
  todayExpenseTotalMinor,
  todayIncomeTotalMinor,
  todayExpenseBreakdown,
  todayIncomeBreakdown,
  expenseTotalMinor,
  incomeTotalMinor,
  expenseBreakdown,
  incomeBreakdown,
  currencySymbol = '৳',
  showDecimals = false,
  onSelectCategory,
  className = '',
}: CoinPieCardProps) {
  const [activeTab, setActiveTab] = useState<CoinPieTab>('today');
  const [todaySubTab, setTodaySubTab] = useState<'expense' | 'income'>('expense');

  const isToday = selectedDate === getLocalTodayDateString();
  const dateDisplay = format(parseLocalDateString(selectedDate), 'd MMM');

  const { currentTotalMinor, currentBreakdown, centerLabel } = useMemo(() => {
    if (activeTab === 'today') {
      if (todaySubTab === 'expense') {
        return {
          currentTotalMinor: todayExpenseTotalMinor,
          currentBreakdown: todayExpenseBreakdown,
          centerLabel: isToday ? 'Spent Today' : `Spent on ${dateDisplay}`,
        };
      }
      return {
        currentTotalMinor: todayIncomeTotalMinor,
        currentBreakdown: todayIncomeBreakdown,
        centerLabel: isToday ? 'Earned Today' : `Earned on ${dateDisplay}`,
      };
    }
    if (activeTab === 'expenses') {
      return {
        currentTotalMinor: expenseTotalMinor,
        currentBreakdown: expenseBreakdown,
        centerLabel: `Spent in ${monthName}`,
      };
    }
    if (activeTab === 'income') {
      return {
        currentTotalMinor: incomeTotalMinor,
        currentBreakdown: incomeBreakdown,
        centerLabel: `Earned in ${monthName}`,
      };
    }
    return {
      currentTotalMinor: 0,
      currentBreakdown: [],
      centerLabel: 'Loans & Debts',
    };
  }, [
    activeTab,
    todaySubTab,
    todayExpenseTotalMinor,
    todayIncomeTotalMinor,
    todayExpenseBreakdown,
    todayIncomeBreakdown,
    expenseTotalMinor,
    incomeTotalMinor,
    expenseBreakdown,
    incomeBreakdown,
    isToday,
    dateDisplay,
    monthName,
  ]);

  // Calculate arc segments for the donut chart
  const slices = useMemo(() => {
    if (currentTotalMinor <= 0 || currentBreakdown.length === 0) {
      return [];
    }

    let currentAngle = 0;
    const items: Array<{
      id: string;
      path?: string;
      isFullCircle?: boolean;
      color: string;
    }> = [];

    const total = currentBreakdown.reduce((sum, item) => sum + item.amountMinor, 0);
    if (total <= 0) return [];

    currentBreakdown.forEach((item, index) => {
      const sliceAngle = (item.amountMinor / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      currentAngle = endAngle;

      if (sliceAngle >= 359.9) {
        items.push({
          id: item.categoryId || `slice-${index}`,
          isFullCircle: true,
          color: item.color,
        });
      } else if (sliceAngle > 1) {
        items.push({
          id: item.categoryId || `slice-${index}`,
          path: createArcPath(CX, CY, RADIUS, startAngle, Math.min(endAngle, 359.99)),
          color: item.color,
        });
      }
    });

    return items;
  }, [currentBreakdown, currentTotalMinor]);

  return (
    <View className={`bg-white rounded-3xl p-4 shadow-sm border border-[#E4E0D8] mb-3.5 ${className}`}>
      {/* 4 Tabs: Today | Expenses | Income | Loans */}
      <View className="border-b border-[#E4E0D8] pb-1 mb-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {/* Today Tab */}
          <Pressable
            onPress={() => setActiveTab('today')}
            className={`mr-6 pb-2 relative ${activeTab === 'today' ? 'border-b-2 border-[#FF5A1F]' : ''}`}
          >
            <Text
              className={`text-base ${
                activeTab === 'today' ? 'font-black text-[#18181B]' : 'font-semibold text-[#71717A]'
              }`}
            >
              Today
            </Text>
          </Pressable>

          {/* Month Expenses Tab */}
          <Pressable
            onPress={() => setActiveTab('expenses')}
            className={`mr-6 pb-2 relative ${activeTab === 'expenses' ? 'border-b-2 border-[#FF5A1F]' : ''}`}
          >
            <Text
              className={`text-base ${
                activeTab === 'expenses' ? 'font-black text-[#18181B]' : 'font-semibold text-[#71717A]'
              }`}
            >
              Expenses
            </Text>
          </Pressable>

          {/* Month Income Tab */}
          <Pressable
            onPress={() => setActiveTab('income')}
            className={`mr-6 pb-2 relative ${activeTab === 'income' ? 'border-b-2 border-[#FF5A1F]' : ''}`}
          >
            <Text
              className={`text-base ${
                activeTab === 'income' ? 'font-black text-[#18181B]' : 'font-semibold text-[#71717A]'
              }`}
            >
              Income
            </Text>
          </Pressable>

          {/* Loans Tab */}
          <Pressable
            onPress={() => setActiveTab('loans')}
            className={`mr-2 pb-2 relative ${activeTab === 'loans' ? 'border-b-2 border-[#FF5A1F]' : ''}`}
          >
            <Text
              className={`text-base ${
                activeTab === 'loans' ? 'font-black text-[#18181B]' : 'font-semibold text-[#71717A]'
              }`}
            >
              Loans
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Sub-selector for Today: Expense vs Income Pill Chips */}
      {activeTab === 'today' && (
        <View className="flex-row items-center justify-center gap-2 mb-2">
          <Pressable
            onPress={() => setTodaySubTab('expense')}
            className={`flex-row items-center px-3.5 py-1.5 rounded-full border ${
              todaySubTab === 'expense'
                ? 'bg-[#FFF0EB] border-[#FF5A1F]'
                : 'bg-[#F4F1EA] border-[#E4E0D8]'
            }`}
          >
            <View className="w-2 h-2 rounded-full bg-[#FF5A1F] mr-1.5" />
            <Text
              className={`text-xs font-bold ${
                todaySubTab === 'expense' ? 'text-[#FF5A1F]' : 'text-[#71717A]'
              }`}
            >
              Expense: {formatCurrency(todayExpenseTotalMinor, { currencySymbol, showDecimals })}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setTodaySubTab('income')}
            className={`flex-row items-center px-3.5 py-1.5 rounded-full border ${
              todaySubTab === 'income'
                ? 'bg-[#EBFDF5] border-[#10B981]'
                : 'bg-[#F4F1EA] border-[#E4E0D8]'
            }`}
          >
            <View className="w-2 h-2 rounded-full bg-[#10B981] mr-1.5" />
            <Text
              className={`text-xs font-bold ${
                todaySubTab === 'income' ? 'text-[#10B981]' : 'text-[#71717A]'
              }`}
            >
              Income: {formatCurrency(todayIncomeTotalMinor, { currencySymbol, showDecimals })}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Donut Chart with Center Text */}
      <View className="items-center justify-center my-2">
        <View style={{ width: CHART_SIZE, height: CHART_SIZE }} className="items-center justify-center relative">
          <Svg width={CHART_SIZE} height={CHART_SIZE} style={StyleSheet.absoluteFill}>
            <G>
              {slices.length === 0 ? (
                // Empty subtle background ring
                <Circle
                  cx={CX}
                  cy={CY}
                  r={RADIUS}
                  stroke="#EFEBE4"
                  strokeWidth={THICKNESS}
                  fill="none"
                />
              ) : (
                slices.map((slice) =>
                  slice.isFullCircle ? (
                    <Circle
                      key={slice.id}
                      cx={CX}
                      cy={CY}
                      r={RADIUS}
                      stroke={slice.color}
                      strokeWidth={THICKNESS}
                      fill="none"
                    />
                  ) : (
                    <Path
                      key={slice.id}
                      d={slice.path ?? ''}
                      stroke={slice.color}
                      strokeWidth={THICKNESS}
                      strokeLinecap="round"
                      fill="none"
                    />
                  )
                )
              )}
            </G>
          </Svg>

          {/* Center Hole Content */}
          <View className="items-center justify-center px-4">
            <Text numberOfLines={1} className="text-xs font-semibold text-[#71717A] mb-0.5 text-center">
              {centerLabel}
            </Text>
            <Text numberOfLines={1} className="text-2xl font-black text-[#18181B] text-center">
              {formatCurrency(currentTotalMinor, { currencySymbol, showDecimals })}
            </Text>
          </View>
        </View>
      </View>

      {/* Category Breakdown List */}
      {currentBreakdown.length > 0 ? (
        <View className="mt-3 gap-2.5">
          {currentBreakdown.slice(0, 5).map((item) => (
            <Pressable
              key={item.categoryId}
              onPress={() => onSelectCategory?.(item.categoryId)}
              className="flex-row items-center justify-between py-2 border-t border-[#F0ECE4] active:opacity-70"
            >
              {/* Category Icon + Info */}
              <View className="flex-row items-center flex-1 mr-3">
                <View
                  style={{ backgroundColor: item.color }}
                  className="w-10 h-10 rounded-2xl items-center justify-center mr-3 shadow-xs"
                >
                  <Icon name={item.icon} size={18} color="#FFFFFF" strokeWidth={2.4} />
                </View>
                <View className="flex-1">
                  <Text numberOfLines={1} className="text-sm font-bold text-[#18181B]">
                    {item.categoryName}
                  </Text>
                  <Text className="text-xs font-semibold text-[#71717A]">
                    {item.percentage.toFixed(0)}%
                  </Text>
                </View>
              </View>

              {/* Amount + Chevron */}
              <View className="flex-row items-center">
                <Text className="text-sm font-extrabold text-[#18181B] mr-2">
                  {formatCurrency(item.amountMinor, { currencySymbol, showDecimals })}
                </Text>
                <Icon name="ChevronRight" size={16} color="#A1A1AA" strokeWidth={2.2} />
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <View className="py-4 items-center justify-center">
          <Text className="text-xs text-[#71717A] font-medium text-center">
            {activeTab === 'loans'
              ? 'No active loans or borrowings found.'
              : activeTab === 'today'
              ? `No ${todaySubTab} logged for ${isToday ? 'today' : dateDisplay}.`
              : `No ${activeTab} logged for ${monthName}.`}
          </Text>
        </View>
      )}
    </View>
  );
});
