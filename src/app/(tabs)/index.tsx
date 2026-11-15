import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/useAppStore';
import {
  selectCategoryMap,
  selectDailyTotal,
  selectDailyIncomeTotal,
  selectExpensesByDate,
  selectFilteredExpenses,
} from '@/store/selectors';
import { getLocalTodayDateString } from '@/utils/date';
import { DateSwitcher } from '@/components/expense/DateSwitcher';
import { DailySpendHero } from '@/components/expense/DailySpendHero';
import { PaymentFilterChips, PaymentFilterType } from '@/components/expense/PaymentFilterChips';
import { ExpenseItem } from '@/components/expense/ExpenseItem';
import { ExpenseModal } from '@/components/expense/ExpenseModal';
import { Icon } from '@/components/ui/Icon';
import { Expense, TransactionType } from '@/models/schema';

export default function TodayScreen() {
  const [selectedDate, setSelectedDate] = useState<string>(getLocalTodayDateString());
  const [selectedPayment, setSelectedPayment] = useState<PaymentFilterType>('all');
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    type: TransactionType;
    expenseToEdit: Expense | null;
  }>({
    visible: false,
    type: 'expense',
    expenseToEdit: null,
  });

  const expenses = useAppStore((state) => state.expenses);
  const categories = useAppStore((state) => state.categories);
  const settings = useAppStore((state) => state.settings);
  const deleteExpense = useAppStore((state) => state.deleteExpense);

  const categoryMap = useMemo(() => selectCategoryMap(categories), [categories]);
  const dayExpenses = useMemo(() => selectExpensesByDate(expenses, selectedDate), [expenses, selectedDate]);
  const dailyTotal = useMemo(() => selectDailyTotal(expenses, selectedDate), [expenses, selectedDate]);
  const dailyIncome = useMemo(() => selectDailyIncomeTotal(expenses, selectedDate), [expenses, selectedDate]);
  const filteredExpenses = useMemo(
    () => selectFilteredExpenses(dayExpenses, { paymentMethod: selectedPayment }),
    [dayExpenses, selectedPayment]
  );

  const isToday = selectedDate === getLocalTodayDateString();
  const heroDateLabel = isToday ? "Today's Total Spend" : 'Total Daily Spend';

  const handleExpensePress = useCallback((item: Expense) => {
    setModalConfig({ visible: true, type: item.type ?? 'expense', expenseToEdit: item });
  }, []);

  const handleAddTransaction = useCallback((type: TransactionType) => {
    setModalConfig({ visible: true, type, expenseToEdit: null });
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalConfig((prev) => ({ ...prev, visible: false }));
  }, []);

  const renderExpenseItem = useCallback(({ item }: { item: Expense }) => (
    <ExpenseItem
      expense={item}
      category={categoryMap.get(item.categoryId)}
      currencySymbol={settings.currencySymbol}
      showDecimals={settings.showDecimals}
      onPress={handleExpensePress}
      onEdit={handleExpensePress}
      onDelete={deleteExpense}
    />
  ), [categoryMap, settings.currencySymbol, settings.showDecimals, handleExpensePress, deleteExpense]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F7F4EF]">
      <View className="flex-1 px-4">
        {/* Date Switcher */}
        <DateSwitcher currentDate={selectedDate} onDateChange={setSelectedDate} />

        {/* Transactions FlatList */}
        <FlatList
          data={filteredExpenses}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          ListHeaderComponent={
            <View className="mt-2">
              <DailySpendHero
                spentMinor={dailyTotal}
                limitMinor={settings.dailyLimitMinor}
                incomeMinor={dailyIncome}
                currencySymbol={settings.currencySymbol}
                showDecimals={settings.showDecimals}
                dateLabel={heroDateLabel}
              />
              <View className="flex-row items-center justify-between mb-1 mt-1">
                <Text className="text-base font-bold text-[#18181B]">Transactions</Text>
                <Text className="text-xs font-semibold text-[#71717A]">
                  {dayExpenses.length} {dayExpenses.length === 1 ? 'item' : 'items'}
                </Text>
              </View>
              <PaymentFilterChips selected={selectedPayment} onSelect={setSelectedPayment} className="mb-3" />
            </View>
          }
          renderItem={renderExpenseItem}
          ListEmptyComponent={
            <View className="items-center justify-center py-12 px-4">
              <View className="w-16 h-16 rounded-full bg-[#ECE8DF] items-center justify-center mb-3">
                <Icon name="Receipt" size={28} color="#71717A" />
              </View>
              <Text className="text-base font-semibold text-[#18181B] mb-1">No transactions logged</Text>
              <Text className="text-xs text-[#71717A] text-center max-w-[240px]">
                {dayExpenses.length === 0
                  ? 'Tap + Income or − Expenses below to add your first transaction.'
                  : 'No transactions match the selected payment method.'}
              </Text>
            </View>
          }
        />
      </View>

      {/* Dual Quick Action Buttons at the Bottom */}
      <View style={styles.actionRow} className="flex-row items-center gap-3 px-4 pt-2 pb-3 bg-[#F7F4EF] border-t border-[#E4E0D8]">
        {/* + Income Button */}
        <Pressable
          onPress={() => handleAddTransaction('income')}
          style={styles.actionBtn}
          className="flex-1 flex-row items-center justify-center bg-[#18181B] rounded-2xl py-3.5 shadow-sm active:opacity-90"
        >
          <Icon name="Plus" size={19} color="#FFFFFF" strokeWidth={2.5} />
          <Text className="text-white font-bold text-base ml-2">Income</Text>
        </Pressable>

        {/* − Expenses Button */}
        <Pressable
          onPress={() => handleAddTransaction('expense')}
          style={styles.actionBtn}
          className="flex-1 flex-row items-center justify-center bg-[#FF5A1F] rounded-2xl py-3.5 shadow-sm active:opacity-90"
        >
          <Icon name="Minus" size={19} color="#FFFFFF" strokeWidth={2.5} />
          <Text className="text-white font-bold text-base ml-2">Expenses</Text>
        </Pressable>
      </View>

      {/* In-Place Slide-up Bottom Sheet Modal */}
      <ExpenseModal
        visible={modalConfig.visible}
        type={modalConfig.type}
        expenseToEdit={modalConfig.expenseToEdit}
        onClose={handleCloseModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 24,
  },
  actionRow: {
    minHeight: 64,
  },
  actionBtn: {
    minHeight: 52,
  },
});
