import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { CategoryBreakdownItem } from '@/store/selectors';
import { formatCurrency } from '@/utils/currency';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';

export interface CategoryBreakdownListProps {
  breakdown: CategoryBreakdownItem[];
  currencySymbol?: string;
  showDecimals?: boolean;
  className?: string;
}

const AnimatedBreakdownRow = React.memo(function AnimatedBreakdownRow({
  item,
  index,
  currencySymbol,
  showDecimals,
}: {
  item: CategoryBreakdownItem;
  index: number;
  currencySymbol: string;
  showDecimals: boolean;
}) {
  const barWidth = useSharedValue(0);

  useEffect(() => {
    barWidth.value = 0;
    barWidth.value = withDelay(
      index * 35,
      withTiming(Math.min(100, Math.max(3, item.percentage)), {
        duration: 400,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      })
    );
  }, [item.percentage, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value}%`,
  }));

  return (
    <View>
      {/* Top Row: Icon + Name + Count vs Amount + % */}
      <View className="flex-row items-center justify-between mb-1.5">
        <View className="flex-row items-center flex-1 mr-2">
          <View
            style={{ backgroundColor: item.color }}
            className="w-8 h-8 rounded-xl items-center justify-center mr-2.5 shadow-xs"
          >
            <Icon name={item.icon} size={15} color="#FFFFFF" strokeWidth={2.2} />
          </View>
          <View className="flex-1">
            <Text numberOfLines={1} className="text-sm font-bold text-[#18181B]">
              {item.categoryName}
            </Text>
            <Text className="text-[11px] text-[#71717A]">
              {item.transactionCount} {item.transactionCount === 1 ? 'item' : 'items'}
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text className="text-sm font-bold text-[#18181B]">
            {formatCurrency(item.amountMinor, { currencySymbol, showDecimals })}
          </Text>
          <Text className="text-[11px] font-semibold text-[#71717A]">
            {item.percentage.toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Horizontal Animated Color Bar */}
      <View className="h-2 w-full bg-[#E4E0D8] rounded-full overflow-hidden">
        <Animated.View
          style={[
            animatedStyle,
            { backgroundColor: item.color },
          ]}
          className="h-full rounded-full"
        />
      </View>
    </View>
  );
});

export function CategoryBreakdownList({
  breakdown,
  currencySymbol = '৳',
  showDecimals = false,
  className = '',
}: CategoryBreakdownListProps) {
  if (breakdown.length === 0) {
    return (
      <Card className={`p-6 items-center justify-center ${className}`}>
        <View className="w-12 h-12 rounded-full bg-[#E4E0D8] items-center justify-center mb-2">
          <Icon name="PieChart" size={22} color="#71717A" />
        </View>
        <Text className="text-sm font-semibold text-[#18181B] mb-0.5">
          No Expenses Recorded
        </Text>
        <Text className="text-xs text-[#71717A] text-center">
          Expenses added in this period will appear in this breakdown.
        </Text>
      </Card>
    );
  }

  return (
    <Card className={`mb-4 ${className}`}>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-xs font-semibold text-[#71717A] uppercase tracking-wider">
          Category Breakdown
        </Text>
        <Text className="text-xs font-semibold text-[#71717A]">
          {breakdown.length} {breakdown.length === 1 ? 'category' : 'categories'}
        </Text>
      </View>

      <View className="gap-3.5">
        {breakdown.map((item, index) => (
          <AnimatedBreakdownRow
            key={`${item.categoryId}-${index}`}
            item={item}
            index={index}
            currencySymbol={currencySymbol}
            showDecimals={showDecimals}
          />
        ))}
      </View>
    </Card>
  );
}
