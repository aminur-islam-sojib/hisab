import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { DailyChartPoint } from '@/store/selectors';
import { formatCurrency } from '@/utils/currency';
import { Card } from '@/components/ui/Card';

export interface DailyBarChartProps {
  data: DailyChartPoint[];
  dailyLimitMinor: number;
  period: 'week' | 'month';
  currencySymbol?: string;
  className?: string;
}

const AnimatedBar = React.memo(function AnimatedBar({
  heightPercent,
  barColor,
  isWeek,
  index,
}: {
  heightPercent: number;
  barColor: string;
  isWeek: boolean;
  index: number;
}) {
  const animatedHeight = useSharedValue(0);

  useEffect(() => {
    animatedHeight.value = 0;
    animatedHeight.value = withDelay(
      index * 30,
      withSpring(heightPercent, { damping: 14, stiffness: 120 })
    );
  }, [heightPercent, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: `${animatedHeight.value}%`,
  }));

  return (
    <Animated.View
      style={[
        styles.barFill,
        animatedStyle,
        { backgroundColor: barColor },
      ]}
      className={isWeek ? 'w-5 rounded-t-md' : 'w-3 rounded-t-sm'}
    />
  );
});

export function DailyBarChart({
  data,
  dailyLimitMinor,
  period,
  currencySymbol = '৳',
  className = '',
}: DailyBarChartProps) {
  const isWeek = period === 'week';

  // Determine scale maximum (at least daily limit or highest day)
  const maxSpend = data.reduce((max, d) => Math.max(max, d.amountMinor), 0);
  const chartMax = Math.max(dailyLimitMinor * 1.25, maxSpend * 1.1, 10000); // ৳100 min baseline
  const limitLinePercent = Math.min(95, Math.max(5, (dailyLimitMinor / chartMax) * 100));

  const renderBar = (item: DailyChartPoint, index: number) => {
    const isOver = dailyLimitMinor > 0 && item.amountMinor >= dailyLimitMinor;
    const isNear =
      dailyLimitMinor > 0 &&
      item.amountMinor >= dailyLimitMinor * 0.8 &&
      !isOver;

    let barColor = '#E4E0D8';
    if (item.amountMinor > 0) {
      if (isOver) barColor = '#DC2626';
      else if (isNear) barColor = '#EAB308';
      else barColor = '#FF5A1F';
    }

    const heightPercent =
      item.amountMinor > 0
        ? Math.min(100, Math.max(6, (item.amountMinor / chartMax) * 100))
        : 2;

    return (
      <View
        key={item.date || index}
        style={styles.barColumn}
        className={isWeek ? 'flex-1 items-center' : 'items-center px-1.5'}
      >
        {/* Bar container */}
        <View style={styles.barTrack} className="w-full items-center justify-end">
          <AnimatedBar
            heightPercent={heightPercent}
            barColor={barColor}
            isWeek={isWeek}
            index={index}
          />
        </View>

        {/* X-axis Label */}
        <Text
          numberOfLines={1}
          className={`text-[10px] mt-1.5 font-semibold ${
            isOver ? 'text-[#DC2626]' : 'text-[#71717A]'
          }`}
        >
          {item.label}
        </Text>
      </View>
    );
  };

  return (
    <Card className={`mb-3 ${className}`}>
      {/* Title & Legend */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-xs font-semibold text-[#71717A] uppercase tracking-wider">
          Daily Spend vs Limit
        </Text>
        <View className="flex-row items-center gap-2">
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-[#FF5A1F] mr-1" />
            <Text className="text-[10px] text-[#71717A]">Normal</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-[#EAB308] mr-1" />
            <Text className="text-[10px] text-[#71717A]">80%+</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-[#DC2626] mr-1" />
            <Text className="text-[10px] text-[#71717A]">Over</Text>
          </View>
        </View>
      </View>

      {/* Chart Canvas Area */}
      <View style={styles.chartArea} className="w-full relative justify-end mb-2">
        {/* Horizontal Threshold Line for Daily Budget */}
        {dailyLimitMinor > 0 && (
          <View
            style={[styles.limitLine, { bottom: `${limitLinePercent}%` }]}
            className="w-full border-b border-dashed border-[#A1A1AA] absolute z-10 flex-row justify-end"
          >
            <View className="bg-[#FAF8F5] px-1 rounded -top-2.5">
              <Text className="text-[9px] font-bold text-[#71717A]">
                Limit {formatCurrency(dailyLimitMinor, { currencySymbol, showDecimals: false })}
              </Text>
            </View>
          </View>
        )}

        {/* Bars Container */}
        {isWeek ? (
          <View className="flex-row items-end justify-between w-full h-full pt-4">
            {data.map((item, index) => renderBar(item, index))}
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollBarContainer}
            className="w-full h-full pt-4"
          >
            {data.map((item, index) => renderBar(item, index))}
          </ScrollView>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  chartArea: {
    height: 140,
  },
  barTrack: {
    height: 110,
  },
  barColumn: {
    minWidth: 28,
  },
  barFill: {
    minHeight: 3,
  },
  limitLine: {
    left: 0,
    right: 0,
  },
  scrollBarContainer: {
    paddingRight: 12,
  },
});
