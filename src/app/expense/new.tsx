import React from 'react';
import { router } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { ExpenseForm, ExpenseFormValues } from '@/components/expense/ExpenseForm';

export default function NewExpenseScreen() {
  const addExpense = useAppStore((state) => state.addExpense);

  const handleSubmit = (values: ExpenseFormValues) => {
    addExpense({
      amountMinor: values.amountMinor,
      categoryId: values.categoryId,
      paymentMethod: values.paymentMethod,
      note: values.note,
      spentAtDate: values.spentAtDate,
    });
    router.back();
  };

  return (
    <ExpenseForm
      title="Add expense"
      submitLabel="Save"
      onSubmit={handleSubmit}
    />
  );
}
