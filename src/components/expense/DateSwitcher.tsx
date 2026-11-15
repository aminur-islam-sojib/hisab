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

  const formattedSubDate = format(parseLocalDateString(currentDate), 'EEE, d MMM');
  const dateDisplayTitle = isToday ? `Today · ${formattedSubDate}` : formattedSubDate;

  return (
    <View className={`flex-row items-center justify-between py-2 ${className}`}>
      {/* Left: Prev Day Button */}
      <Pressable
        onPress={handlePrevDay}
        hitSlop={8}
        style={styles.circleBtn}
        className="w-11 h-11 rounded-full bg-white items-center justify-center border border-[#E4E0D8] shadow-sm active:bg-[#ECE8DF]"
      >
        <Icon name="ChevronLeft" size={20} color="#18181B" strokeWidth={2.4} />
      </Pressable>

      {/* Center: Current Date Display (Matching InFlow format: "Today · Sun, 15 Nov") */}
      <Pressable onPress={handleJumpToToday} className="items-center py-1 px-2">
        <Text className="text-base font-extrabold text-[#18181B] tracking-tight">
          {dateDisplayTitle}
        </Text>
        {!isToday && (
          <Text className="text-[11px] font-bold text-[#FF5A1F] mt-0.5">
            Tap to return to Today
          </Text>
        )}
      </Pressable>

      {/* Right: Next Day Button */}
      <Pressable
        onPress={handleNextDay}
        hitSlop={8}
        style={styles.circleBtn}
        className="w-11 h-11 rounded-full bg-white items-center justify-center border border-[#E4E0D8] shadow-sm active:bg-[#ECE8DF]"
      >
        <Icon
          name="ChevronRight"
          size={20}
          color="#18181B"
          strokeWidth={2.4}
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
