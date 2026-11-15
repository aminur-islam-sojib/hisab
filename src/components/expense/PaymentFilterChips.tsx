import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { PaymentMethod } from '@/models/schema';

export type PaymentFilterType = PaymentMethod | 'all';

export interface PaymentFilterChipsProps {
  selected: PaymentFilterType;
  onSelect: (selected: PaymentFilterType) => void;
  className?: string;
}

const FILTER_ITEMS: Array<{ id: PaymentFilterType; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'cash', label: 'Cash' },
  { id: 'mobile_banking', label: 'Mobile Banking' },
  { id: 'card', label: 'Card' },
  { id: 'bank', label: 'Bank' },
];

export function PaymentFilterChips({
  selected,
  onSelect,
  className = '',
}: PaymentFilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      className={`py-1 ${className}`}
    >
      {FILTER_ITEMS.map((item) => {
        const isSelected = selected === item.id;
        return (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.id)}
            style={styles.chip}
            className={`px-4 py-2 rounded-full mr-2 border ${
              isSelected
                ? 'bg-[#141414] border-[#141414]'
                : 'bg-white border-[#E4E0D8]'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                isSelected ? 'text-white' : 'text-[#71717A]'
              }`}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingRight: 16,
  },
  chip: {
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
