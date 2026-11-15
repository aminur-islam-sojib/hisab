import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { format, subDays, addDays } from 'date-fns';
import { Icon } from '@/components/ui/Icon';
import {
  formatDateToLocalString,
  formatDisplayDate,
  getLocalTodayDateString,
  parseLocalDateString,
} from '@/utils/date';

export interface DateSwitcherProps {
  currentDate: string; // 'YYYY-MM-DD'
  onDateChange: (newDate: string) => void;
  className?: string;
}

export function DateSwitcher({
  currentDate,
  onDateChange,
  className = '',
}: DateSwitcherProps) {
  const todayStr = getLocalTodayDateString();
  const isToday = currentDate === todayStr;

  const handlePrevDay = () => {
    const current = parseLocalDateString(currentDate);
    const prev = subDays(current, 1);
    onDateChange(formatDateToLocalString(prev));
  };

  const handleNextDay = () => {
    const current = parseLocalDateString(currentDate);
    const next = addDays(current, 1);
    onDateChange(formatDateToLocalString(next));
  };

  const handleJumpToToday = () => {
    onDateChange(todayStr);
  };

  const displayDate = formatDisplayDate(currentDate, { showRelative: true });
  const formattedSubDate = format(parseLocalDateString(currentDate), 'EEE, d MMM');

  return (
    <View className={`flex-row items-center justify-between py-2 ${className}`}>
      {/* Left: Prev Day Button */}
      <Pressable
        onPress={handlePrevDay}
        hitSlop={8}
        style={styles.circleBtn}
        className="w-11 h-11 rounded-full bg-white items-center justify-center border border-[#E4E0D8] shadow-sm"
      >
        <Icon name="ChevronLeft" size={20} color="#18181B" />
      </Pressable>

      {/* Center: Current Date Display */}
      <View className="items-center">
        <View className="flex-row items-center">
          <Text className="text-lg font-bold text-[#18181B]">{displayDate}</Text>
          {!isToday && (
            <Pressable
              onPress={handleJumpToToday}
              className="ml-2 bg-[#FFF0EB] px-2 py-0.5 rounded-full"
            >
              <Text className="text-xs font-semibold text-[#FF5A1F]">Today</Text>
            </Pressable>
          )}
        </View>
        <Text className="text-xs text-[#71717A] font-medium">{formattedSubDate}</Text>
      </View>

      {/* Right: Next Day Button */}
      <Pressable
        onPress={handleNextDay}
        disabled={isToday}
        hitSlop={8}
        style={[styles.circleBtn, isToday && styles.disabledBtn]}
        className={`w-11 h-11 rounded-full items-center justify-center border ${
          isToday ? 'bg-[#F4F1EA] border-[#E4E0D8]' : 'bg-white border-[#E4E0D8] shadow-sm'
        }`}
      >
        <Icon
          name="ChevronRight"
          size={20}
          color={isToday ? '#A1A1AA' : '#18181B'}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  circleBtn: {
    minWidth: 44,
    minHeight: 44,
  },
  disabledBtn: {
    opacity: 0.5,
  },
});
