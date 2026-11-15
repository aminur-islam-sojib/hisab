import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Icon } from '@/components/ui/Icon';

export interface TodayBottomBarProps {
  onAddIncome: () => void;
  onAddExpense: () => void;
}

export const TodayBottomBar = React.memo(function TodayBottomBar({
  onAddIncome,
  onAddExpense,
}: TodayBottomBarProps) {
  return (
    <View style={styles.actionRow} className="flex-row items-center gap-3 px-4 pt-2 pb-3 bg-[#F7F4EF] border-t border-[#E4E0D8]">
      {/* + Income Button */}
      <Pressable
        onPress={onAddIncome}
        style={styles.actionBtn}
        className="flex-1 flex-row items-center justify-center bg-[#18181B] rounded-2xl py-3.5 shadow-sm active:opacity-90"
      >
        <Icon name="Plus" size={19} color="#FFFFFF" strokeWidth={2.5} />
        <Text className="text-white font-bold text-base ml-2">Income</Text>
      </Pressable>

      {/* − Expenses Button */}
      <Pressable
        onPress={onAddExpense}
        style={styles.actionBtn}
        className="flex-1 flex-row items-center justify-center bg-[#FF5A1F] rounded-2xl py-3.5 shadow-sm active:opacity-90"
      >
        <Icon name="Minus" size={19} color="#FFFFFF" strokeWidth={2.5} />
        <Text className="text-white font-bold text-base ml-2">Expenses</Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  actionRow: {
    minHeight: 64,
  },
  actionBtn: {
    minHeight: 52,
  },
});
