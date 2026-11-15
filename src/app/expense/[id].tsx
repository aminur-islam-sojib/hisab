import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { ExpenseForm, ExpenseFormValues } from '@/components/expense/ExpenseForm';
import { Button } from '@/components/ui/Button';

export default function EditExpenseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const expense = useAppStore((state) =>
    state.expenses.find((item) => item.id === id)
  );
  const updateExpense = useAppStore((state) => state.updateExpense);
  const deleteExpense = useAppStore((state) => state.deleteExpense);

  if (!expense) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-[#FAF8F5] items-center justify-center p-4">
        <Text className="text-lg font-bold text-[#18181B] mb-2">Expense Not Found</Text>
        <Text className="text-sm text-[#71717A] mb-6 text-center">
          This transaction may have been deleted or moved.
        </Text>
        <Button title="Go Back" variant="secondary" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const handleSubmit = (values: ExpenseFormValues) => {
    updateExpense(expense.id, {
      amountMinor: values.amountMinor,
      categoryId: values.categoryId,
      paymentMethod: values.paymentMethod,
      note: values.note,
      spentAtDate: values.spentAtDate,
      type: values.type,
    });
    router.back();
  };

  const handleDelete = () => {
    deleteExpense(expense.id);
    router.back();
  };

  return (
    <ExpenseForm
      title="Edit Expense"
      submitLabel="Update Expense"
      initialValues={expense}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
    />
  );
}
