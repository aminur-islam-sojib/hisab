import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Category, Expense, PaymentMethod } from '@/models/schema';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/currency';
import { formatDisplayTime } from '@/utils/date';

export interface ExpenseItemProps {
  expense: Expense;
  category?: Category;
  currencySymbol?: string;
  showDecimals?: boolean;
  onPress?: (expense: Expense) => void;
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  mobile_banking: 'bKash/Nagad',
  card: 'Card',
  bank: 'Bank',
};

export function ExpenseItem({
  expense,
  category,
  currencySymbol = '৳',
  showDecimals = false,
  onPress,
  onEdit,
  onDelete,
  className = '',
}: ExpenseItemProps) {
  const categoryName = category?.name ?? 'General Expense';
  const categoryIcon = category?.icon ?? 'Receipt';
  const categoryColor = category?.color ?? '#FF5A1F';

  const noteText = expense.note && expense.note.trim().length > 0 ? expense.note : categoryName;
  const timeText = formatDisplayTime(expense.createdAt);
  const paymentLabel = PAYMENT_LABELS[expense.paymentMethod] ?? 'Cash';

  const handleEdit = () => {
    if (onEdit) {
      onEdit(expense);
    } else if (onPress) {
      onPress(expense);
    }
  };

  const handleDelete = () => {
    if (!onDelete) return;

    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${noteText}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(expense.id),
        },
      ]
    );
  };

  return (
    <Pressable
      onPress={handleEdit}
      onLongPress={handleDelete}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      className={`flex-row items-center justify-between bg-white rounded-2xl p-3.5 mb-2.5 border border-[#E4E0D8]/50 shadow-sm ${className}`}
    >
      {/* Left: Category Icon Squircle */}
      <View
        style={[styles.squircleBadge, { backgroundColor: categoryColor }]}
        className="items-center justify-center mr-3"
      >
        <Icon name={categoryIcon} size={22} color="#FFFFFF" strokeWidth={2.2} />
      </View>

      {/* Center: Note, Category & Meta */}
      <View className="flex-1 mr-2 justify-center">
        <Text
          numberOfLines={1}
          className="text-base font-semibold text-[#18181B] mb-0.5"
        >
          {noteText}
        </Text>
        <View className="flex-row items-center flex-wrap gap-1.5 mt-0.5">
          {expense.note && expense.note.trim().length > 0 && (
            <Text className="text-xs text-[#71717A] font-medium mr-1">
              {categoryName} •
            </Text>
          )}
          <Badge label={paymentLabel} variant="neutral" size="sm" />
          <Text className="text-xs text-[#A1A1AA] ml-1">{timeText}</Text>
        </View>
      </View>

      {/* Right: Amount & Action Buttons */}
      <View className="items-end justify-center">
        <Text className="text-base font-bold text-[#18181B]">
          {formatCurrency(expense.amountMinor, { currencySymbol, showDecimals })}
        </Text>

        <View className="flex-row items-center gap-1.5 mt-1">
          {(onEdit || onPress) && (
            <Pressable
              hitSlop={8}
              onPress={handleEdit}
              className="p-1"
            >
              <Icon name="Edit2" size={14} color="#A1A1AA" />
            </Pressable>
          )}
          {onDelete && (
            <Pressable
              hitSlop={8}
              onPress={handleDelete}
              className="p-1"
            >
              <Icon name="Trash2" size={14} color="#A1A1AA" />
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 64,
  },
  squircleBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
