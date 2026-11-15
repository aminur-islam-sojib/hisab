import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { useAppStore } from '@/store/useAppStore';
import {
  selectCategoryMap,
  selectExpensesByDate,
  selectFilteredExpenses,
  selectMonthlyExpenseTotal,
  selectMonthlyIncomeTotal,
  selectCategoryBreakdown,
} from '@/store/selectors';
import { getLocalTodayDateString, parseLocalDateString } from '@/utils/date';
import { DateSwitcher } from '@/components/expense/DateSwitcher';
import { DailySpendHero } from '@/components/expense/DailySpendHero';
import { CoinPieCard } from '@/components/expense/CoinPieCard';
import { PaymentFilterChips, PaymentFilterType } from '@/components/expense/PaymentFilterChips';
import { ExpenseItem } from '@/components/expense/ExpenseItem';
import { ExpenseModal } from '@/components/expense/ExpenseModal';
import { TodayBottomBar } from '@/components/expense/TodayBottomBar';
import { useDrawerStore } from '@/store/useDrawerStore';
import { Icon } from '@/components/ui/Icon';
import { Expense, TransactionType } from '@/models/schema';

export default function TodayScreen() {
  const [selectedDate, setSelectedDate] = useState<string>(getLocalTodayDateString());
  const [selectedPayment, setSelectedPayment] = useState<PaymentFilterType>('all');
  const openDrawer = useDrawerStore((state) => state.openDrawer);
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    type: TransactionType;
    expenseToEdit: Expense | null;
  }>({ visible: false, type: 'expense', expenseToEdit: null });

  const expenses = useAppStore((state) => state.expenses);
  const categories = useAppStore((state) => state.categories);
  const settings = useAppStore((state) => state.settings);
  const deleteExpense = useAppStore((state) => state.deleteExpense);

  const parsedDate = useMemo(() => parseLocalDateString(selectedDate), [selectedDate]);
  const monthName = useMemo(() => format(parsedDate, 'MMMM'), [parsedDate]);
  const categoryMap = useMemo(() => selectCategoryMap(categories), [categories]);

  const monthExpenseTotal = useMemo(() => selectMonthlyExpenseTotal(expenses, parsedDate), [expenses, parsedDate]);
  const monthIncomeTotal = useMemo(() => selectMonthlyIncomeTotal(expenses, parsedDate), [expenses, parsedDate]);
  const expenseBreakdown = useMemo(() => selectCategoryBreakdown(expenses, categories, { period: 'month', referenceDate: parsedDate, type: 'expense' }), [expenses, categories, parsedDate]);
  const incomeBreakdown = useMemo(() => selectCategoryBreakdown(expenses, categories, { period: 'month', referenceDate: parsedDate, type: 'income' }), [expenses, categories, parsedDate]);

  const dayExpenses = useMemo(() => selectExpensesByDate(expenses, selectedDate), [expenses, selectedDate]);
  const filteredExpenses = useMemo(
    () => selectFilteredExpenses(dayExpenses, { paymentMethod: selectedPayment }),
    [dayExpenses, selectedPayment]
  );

  const handleExpensePress = useCallback((item: Expense) => {
    setModalConfig({ visible: true, type: item.type ?? 'expense', expenseToEdit: item });
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
        {/* Top Header: CoinPie Logo + Hamburger Menu Button (≡) */}
        <View className="flex-row items-center justify-between py-1 mb-1">
          <Text className="text-2xl font-black text-[#18181B] tracking-tight">
            His<Text className="text-[#FF5A1F]">hab</Text>
          </Text>
          <Pressable
            hitSlop={8}
            onPress={() => openDrawer('home')}
            style={styles.menuBtn}
            className="w-11 h-11 rounded-full bg-white border border-[#E4E0D8] items-center justify-center shadow-sm active:bg-[#ECE8DF]"
          >
            <Icon name="Menu" size={21} color="#18181B" strokeWidth={2.4} />
          </Pressable>
        </View>

        {/* Date Switcher (< Today · Sun, 15 Nov >) */}
        <DateSwitcher currentDate={selectedDate} onDateChange={setSelectedDate} />

        {/* Transactions FlatList */}
        <FlatList
          data={filteredExpenses}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          ListHeaderComponent={
            <View className="mt-1">
              {/* 3-Column Month Overview: Income | Expense | Balance */}
              <DailySpendHero
                spentMinor={monthExpenseTotal}
                incomeMinor={monthIncomeTotal}
                currencySymbol={settings.currencySymbol}
                showDecimals={settings.showDecimals}
                dateLabel={`${monthName} overview`}
              />

              {/* CoinPie Donut Chart Card with Tabs & Category Breakdown */}
              <CoinPieCard
                monthName={monthName}
                expenseTotalMinor={monthExpenseTotal}
                incomeTotalMinor={monthIncomeTotal}
                expenseBreakdown={expenseBreakdown}
                incomeBreakdown={incomeBreakdown}
                currencySymbol={settings.currencySymbol}
                showDecimals={settings.showDecimals}
              />

              {/* Day's Transactions Header */}
              <View className="flex-row items-center justify-between mb-2 mt-1">
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
            <View className="items-center justify-center py-8 px-4">
              <Text className="text-sm font-semibold text-[#71717A] text-center">
                {dayExpenses.length === 0
                  ? 'No transactions for this date. Tap + Income or − Expenses below.'
                  : 'No transactions match this filter.'}
              </Text>
            </View>
          }
        />
      </View>

      {/* Dual Quick Action Buttons at the Bottom (+ Income | − Expenses) */}
      <TodayBottomBar
        onAddIncome={() => setModalConfig({ visible: true, type: 'income', expenseToEdit: null })}
        onAddExpense={() => setModalConfig({ visible: true, type: 'expense', expenseToEdit: null })}
      />

      {/* In-Place Slide-up Bottom Sheet Modal */}
      <ExpenseModal
        visible={modalConfig.visible}
        type={modalConfig.type}
        expenseToEdit={modalConfig.expenseToEdit}
        onClose={() => setModalConfig((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  menuBtn: { width: 44, height: 44 },
  listContent: { paddingBottom: 24 },
});
