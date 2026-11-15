import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { ExpenseForm, ExpenseFormValues } from '@/components/expense/ExpenseForm';
import { TransactionType } from '@/models/schema';

export default function NewExpenseScreen() {
  const { type } = useLocalSearchParams<{ type?: TransactionType }>();
  const addExpense = useAppStore((state) => state.addExpense);

  const handleSubmit = (values: ExpenseFormValues) => {
    addExpense({
      amountMinor: values.amountMinor,
      categoryId: values.categoryId,
      paymentMethod: values.paymentMethod,
      note: values.note,
      spentAtDate: values.spentAtDate,
      type: values.type,
    });
    router.back();
  };

  return (
    <ExpenseForm
      initialType={type === 'income' ? 'income' : 'expense'}
      onSubmit={handleSubmit}
    />
  );
}
