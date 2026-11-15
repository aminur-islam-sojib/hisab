import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { PaymentMethod } from '@/models/schema';
import { Icon } from '@/components/ui/Icon';

export interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  className?: string;
}

const METHODS: Array<{ id: PaymentMethod; label: string; icon: string }> = [
  { id: 'cash', label: 'Cash', icon: 'Wallet' },
  { id: 'mobile_banking', label: 'Mobile', icon: 'Smartphone' },
  { id: 'card', label: 'Card', icon: 'CreditCard' },
  { id: 'bank', label: 'Bank', icon: 'Building2' },
];

export function PaymentMethodSelector({
  selected,
  onSelect,
  className = '',
}: PaymentMethodSelectorProps) {
  return (
    <View
      className={`flex-row bg-[#E4E0D8]/40 p-1 rounded-2xl border border-[#E4E0D8]/60 ${className}`}
    >
      {METHODS.map((method) => {
        const isSelected = selected === method.id;
        return (
          <Pressable
            key={method.id}
            onPress={() => onSelect(method.id)}
            style={[
              styles.segment,
              isSelected && styles.selectedSegment,
            ]}
            className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl ${
              isSelected ? 'bg-white shadow-sm' : 'bg-transparent'
            }`}
          >
            <Icon
              name={method.icon}
              size={15}
              color={isSelected ? '#FF5A1F' : '#71717A'}
              strokeWidth={2.2}
            />
            <Text
              className={`text-xs ml-1.5 font-bold ${
                isSelected ? 'text-[#18181B]' : 'text-[#71717A]'
              }`}
            >
              {method.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  segment: {
    minHeight: 44,
  },
  selectedSegment: {
    shadowColor: '#18181B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
});
