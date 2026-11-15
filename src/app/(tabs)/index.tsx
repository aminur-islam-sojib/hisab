import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { useAppStore } from '@/store/useAppStore';
import {
  selectDailyTotal,
  selectDailyIncomeTotal,
  selectMonthlyExpenseTotal,
  selectMonthlyIncomeTotal,
  selectCategoryBreakdown,
} from '@/store/selectors';
import { getLocalTodayDateString, parseLocalDateString } from '@/utils/date';
import { DateSwitcher } from '@/components/expense/DateSwitcher';
import { DailySpendHero } from '@/components/expense/DailySpendHero';
import { InFlowCard } from '@/components/expense/InFlowCard';
import { ExpenseModal } from '@/components/expense/ExpenseModal';
import { TodayBottomBar } from '@/components/expense/TodayBottomBar';
import { useDrawerStore } from '@/store/useDrawerStore';
import { Icon } from '@/components/ui/Icon';
import { TransactionType } from '@/models/schema';

export default function TodayScreen() {
  const [selectedDate, setSelectedDate] = useState<string>(getLocalTodayDateString());
  const openDrawer = useDrawerStore((state) => state.openDrawer);
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    type: TransactionType;
  }>({ visible: false, type: 'expense' });

  const expenses = useAppStore((state) => state.expenses);
  const categories = useAppStore((state) => state.categories);
  const settings = useAppStore((state) => state.settings);

  const parsedDate = useMemo(() => parseLocalDateString(selectedDate), [selectedDate]);
  const monthName = useMemo(() => format(parsedDate, 'MMMM'), [parsedDate]);

  // Today / Selected Date Totals & Breakdowns
  const todayExpenseTotal = useMemo(
    () => selectDailyTotal(expenses, selectedDate),
    [expenses, selectedDate]
  );
  const todayIncomeTotal = useMemo(
    () => selectDailyIncomeTotal(expenses, selectedDate),
    [expenses, selectedDate]
  );
  const todayExpenseBreakdown = useMemo(
    () => selectCategoryBreakdown(expenses, categories, { date: selectedDate, type: 'expense' }),
    [expenses, categories, selectedDate]
  );
  const todayIncomeBreakdown = useMemo(
    () => selectCategoryBreakdown(expenses, categories, { date: selectedDate, type: 'income' }),
    [expenses, categories, selectedDate]
  );

  // Month Totals & Breakdowns
  const monthExpenseTotal = useMemo(
    () => selectMonthlyExpenseTotal(expenses, parsedDate),
    [expenses, parsedDate]
  );
  const monthIncomeTotal = useMemo(
    () => selectMonthlyIncomeTotal(expenses, parsedDate),
    [expenses, parsedDate]
  );
  const expenseBreakdown = useMemo(
    () =>
      selectCategoryBreakdown(expenses, categories, {
        period: 'month',
        referenceDate: parsedDate,
        type: 'expense',
      }),
    [expenses, categories, parsedDate]
  );
  const incomeBreakdown = useMemo(
    () =>
      selectCategoryBreakdown(expenses, categories, {
        period: 'month',
        referenceDate: parsedDate,
        type: 'income',
      }),
    [expenses, categories, parsedDate]
  );

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F7F4EF]">
      <View className="flex-1 px-4">
        {/* Top Header: InFlow Logo + Hamburger Menu Button (≡) */}
        <View className="flex-row items-center justify-between py-1 mb-1">
          <Text className="text-2xl font-black text-[#18181B] tracking-tight">
            In<Text className="text-[#FF5A1F]">Flow</Text>
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

        {/* Main Overview & Donut Chart */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 3-Column Month Overview: Income | Expense | Balance */}
          <DailySpendHero
            spentMinor={monthExpenseTotal}
            incomeMinor={monthIncomeTotal}
            currencySymbol={settings.currencySymbol}
            showDecimals={settings.showDecimals}
            dateLabel={`${monthName} overview`}
            className="mt-1"
          />

          {/* InFlow Donut Chart Card with Tabs (Today, Expenses, Income, Loans) */}
          <InFlowCard
            monthName={monthName}
            selectedDate={selectedDate}
            todayExpenseTotalMinor={todayExpenseTotal}
            todayIncomeTotalMinor={todayIncomeTotal}
            todayExpenseBreakdown={todayExpenseBreakdown}
            todayIncomeBreakdown={todayIncomeBreakdown}
            expenseTotalMinor={monthExpenseTotal}
            incomeTotalMinor={monthIncomeTotal}
            expenseBreakdown={expenseBreakdown}
            incomeBreakdown={incomeBreakdown}
            currencySymbol={settings.currencySymbol}
            showDecimals={settings.showDecimals}
          />
        </ScrollView>
      </View>

      {/* Dual Quick Action Buttons at the Bottom (+ Income | − Expenses) */}
      <TodayBottomBar
        onAddIncome={() => setModalConfig({ visible: true, type: 'income' })}
        onAddExpense={() => setModalConfig({ visible: true, type: 'expense' })}
      />

      {/* In-Place Slide-up Bottom Sheet Modal */}
      <ExpenseModal
        visible={modalConfig.visible}
        type={modalConfig.type}
        onClose={() => setModalConfig((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  menuBtn: { width: 44, height: 44 },
  scrollContent: { paddingBottom: 20 },
});
