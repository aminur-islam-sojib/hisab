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

export const PaymentMethodSelector = React.memo(function PaymentMethodSelector({
  selected,
  onSelect,
  className = '',
}: PaymentMethodSelectorProps) {
  return (
    <View
      style={styles.container}
      className={`flex-row p-1 rounded-2xl ${className}`}
    >
      {METHODS.map((method) => {
        const isSelected = selected === method.id;
        return (
          <Pressable
            key={method.id}
            onPress={() => onSelect(method.id)}
            style={[
              styles.segment,
              isSelected ? styles.selectedSegment : styles.unselectedSegment,
            ]}
            className="flex-1 flex-row items-center justify-center py-2.5 rounded-xl"
          >
            <Icon
              name={method.icon}
              size={15}
              color={isSelected ? '#FF5A1F' : '#71717A'}
              strokeWidth={2.2}
            />
            <Text
              style={isSelected ? styles.selectedText : styles.unselectedText}
              className="text-xs ml-1.5 font-bold"
            >
              {method.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ECE8DF',
    borderColor: '#E4E0D8',
    borderWidth: 1,
  },
  segment: {
    minHeight: 44,
  },
  selectedSegment: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#18181B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  unselectedSegment: {
    backgroundColor: 'transparent',
  },
  selectedText: {
    color: '#18181B',
  },
  unselectedText: {
    color: '#71717A',
  },
});
