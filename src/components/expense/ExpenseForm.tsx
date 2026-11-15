import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { PaymentMethod } from '@/models/schema';
import { getLocalTodayDateString } from '@/utils/date';
import { formatCurrency, toMinorUnits } from '@/utils/currency';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DateSwitcher } from '@/components/expense/DateSwitcher';
import { CategoryPickerGrid } from '@/components/expense/CategoryPickerGrid';
import { PaymentMethodSelector } from '@/components/expense/PaymentMethodSelector';
import {
  NumericKeypad,
  evaluateExpression,
} from '@/components/expense/NumericKeypad';

export interface ExpenseFormValues {
  amountMinor: number;
  categoryId: string;
  paymentMethod: PaymentMethod;
  note: string;
  spentAtDate: string;
}

export interface ExpenseFormProps {
  initialValues?: Partial<ExpenseFormValues>;
  onSubmit: (values: ExpenseFormValues) => void;
  onDelete?: () => void;
  title: string;
  submitLabel: string;
}

export function ExpenseForm({
  initialValues,
  onSubmit,
  onDelete,
  title,
  submitLabel,
}: ExpenseFormProps) {
  const categories = useAppStore((state) => state.categories);
  const settings = useAppStore((state) => state.settings);

  const defaultCategoryId =
    categories.find((c) => !c.isArchived)?.id ?? categories[0]?.id ?? 'cat_other';

  const initialAmount = initialValues?.amountMinor
    ? (initialValues.amountMinor / 100).toString()
    : '0';

  const [amountStr, setAmountStr] = useState<string>(initialAmount);
  const [categoryId, setCategoryId] = useState<string>(
    initialValues?.categoryId ?? defaultCategoryId
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initialValues?.paymentMethod ?? 'cash'
  );
  const [note, setNote] = useState<string>(initialValues?.note ?? '');
  const [spentAtDate, setSpentAtDate] = useState<string>(
    initialValues?.spentAtDate ?? getLocalTodayDateString()
  );

  const evaluatedAmount = evaluateExpression(amountStr);
  const hasExpression = amountStr.includes('+') || amountStr.includes('-');

  const handleSubmit = () => {
    const finalAmount = evaluateExpression(amountStr);
    const amountMinor = toMinorUnits(finalAmount);

    if (amountMinor <= 0) {
      Alert.alert('Invalid Amount', 'Please enter an expense amount greater than 0.');
      return;
    }

    if (!categoryId) {
      Alert.alert('Select Category', 'Please choose a category for this expense.');
      return;
    }

    onSubmit({
      amountMinor,
      categoryId,
      paymentMethod,
      note: note.trim(),
      spentAtDate,
    });
  };

  const handleDelete = () => {
    if (!onDelete) return;

    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: onDelete,
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-[#FAF8F5]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#E4E0D8]/60 bg-white">
          <Pressable
            hitSlop={10}
            onPress={() => router.back()}
            style={styles.headerBtn}
            className="items-center justify-center rounded-full bg-[#FAF8F5] border border-[#E4E0D8]"
          >
            <Icon name="X" size={20} color="#18181B" />
          </Pressable>

          <Text className="text-lg font-bold text-[#18181B]">{title}</Text>

          {onDelete ? (
            <Pressable
              hitSlop={10}
              onPress={handleDelete}
              style={styles.headerBtn}
              className="items-center justify-center rounded-full bg-[#DC2626]/10 border border-[#DC2626]/20"
            >
              <Icon name="Trash2" size={18} color="#DC2626" />
            </Pressable>
          ) : (
            <View style={styles.headerBtn} />
          )}
        </View>

        {/* Scrollable Form Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          className="flex-1 px-4"
        >
          {/* Amount Box */}
          <View
            style={styles.amountBox}
            className="bg-white rounded-3xl p-4 my-3 items-center justify-center border-2 border-[#FF5A1F] shadow-sm"
          >
            <Text className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-1">
              Amount Spent
            </Text>
            <View className="flex-row items-baseline justify-center">
              <Text className="text-2xl font-bold text-[#FF5A1F] mr-1.5">
                {settings.currencySymbol}
              </Text>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                className="text-4xl font-extrabold text-[#18181B]"
              >
                {amountStr || '0'}
              </Text>
            </View>

            {hasExpression && (
              <Text className="text-xs font-semibold text-[#FF5A1F] mt-1 bg-[#FF5A1F]/10 px-2.5 py-0.5 rounded-full">
                = {formatCurrency(toMinorUnits(evaluatedAmount), settings)}
              </Text>
            )}
          </View>

          {/* Category Picker */}
          <View className="mb-3">
            <Text className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-1.5 ml-1">
              Category
            </Text>
            <CategoryPickerGrid
              categories={categories}
              selectedCategoryId={categoryId}
              onSelectCategory={setCategoryId}
            />
          </View>

          {/* Payment Method Selector */}
          <View className="mb-3">
            <Text className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-1.5 ml-1">
              Payment Method
            </Text>
            <PaymentMethodSelector
              selected={paymentMethod}
              onSelect={setPaymentMethod}
            />
          </View>

          {/* Note Input */}
          <View className="mb-3">
            <Input
              label="Note (Optional)"
              placeholder="e.g. Lunch at cafe, Rickshaw to office"
              value={note}
              onChangeText={setNote}
              leftIcon={<Icon name="FileText" size={18} color="#71717A" />}
            />
          </View>

          {/* Date Switcher */}
          <View className="mb-3">
            <Text className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-1 ml-1">
              Date
            </Text>
            <DateSwitcher
              currentDate={spentAtDate}
              onDateChange={setSpentAtDate}
            />
          </View>

          {/* Numeric Keypad */}
          <View className="mb-4">
            <NumericKeypad
              value={amountStr}
              onChangeValue={setAmountStr}
              onDone={handleSubmit}
            />
          </View>

          {/* Submit Action Button */}
          <Button
            title={submitLabel}
            size="lg"
            variant="primary"
            onPress={handleSubmit}
            className="mb-8"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerBtn: {
    width: 44,
    height: 44,
  },
  amountBox: {
    minHeight: 88,
  },
  scrollContent: {
    paddingBottom: 24,
  },
});
