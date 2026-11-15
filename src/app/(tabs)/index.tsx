import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import {
  selectCategoryMap,
  selectDailyTotal,
  selectExpensesByDate,
  selectFilteredExpenses,
} from '@/store/selectors';
import { getLocalTodayDateString } from '@/utils/date';
import { DateSwitcher } from '@/components/expense/DateSwitcher';
import { DailySpendHero } from '@/components/expense/DailySpendHero';
import {
  PaymentFilterChips,
  PaymentFilterType,
} from '@/components/expense/PaymentFilterChips';
import { ExpenseItem } from '@/components/expense/ExpenseItem';
import { Icon } from '@/components/ui/Icon';
import { Expense } from '@/models/schema';

export default function TodayScreen() {
  const [selectedDate, setSelectedDate] = useState<string>(getLocalTodayDateString());
  const [selectedPayment, setSelectedPayment] = useState<PaymentFilterType>('all');

  const expenses = useAppStore((state) => state.expenses);
  const categories = useAppStore((state) => state.categories);
  const settings = useAppStore((state) => state.settings);
  const deleteExpense = useAppStore((state) => state.deleteExpense);

  const categoryMap = useMemo(() => selectCategoryMap(categories), [categories]);

  const dayExpenses = useMemo(
    () => selectExpensesByDate(expenses, selectedDate),
    [expenses, selectedDate]
  );

  const dailyTotal = useMemo(
    () => selectDailyTotal(expenses, selectedDate),
    [expenses, selectedDate]
  );

  const filteredExpenses = useMemo(
    () => selectFilteredExpenses(dayExpenses, { paymentMethod: selectedPayment }),
    [dayExpenses, selectedPayment]
  );

  const isToday = selectedDate === getLocalTodayDateString();
  const heroDateLabel = isToday ? "Today's Total Spend" : 'Total Daily Spend';

  const handleExpensePress = (item: Expense) => {
    router.push({
      pathname: '/expense/[id]',
      params: { id: item.id },
    });
  };

  const handleAddPress = () => {
    router.push('/expense/new');
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F7F4EF]">
      <View className="flex-1 px-4">
        {/* Date Switcher */}
        <DateSwitcher
          currentDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {/* Transactions FlatList with Hero & Filters in ListHeaderComponent */}
        <FlatList
          data={filteredExpenses}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View className="mt-2">
              <DailySpendHero
                spentMinor={dailyTotal}
                limitMinor={settings.dailyLimitMinor}
                currencySymbol={settings.currencySymbol}
                showDecimals={settings.showDecimals}
                dateLabel={heroDateLabel}
              />

              <View className="flex-row items-center justify-between mb-1 mt-1">
                <Text className="text-base font-bold text-[#18181B]">
                  Transactions
                </Text>
                <Text className="text-xs font-semibold text-[#71717A]">
                  {dayExpenses.length} {dayExpenses.length === 1 ? 'item' : 'items'}
                </Text>
              </View>

              <PaymentFilterChips
                selected={selectedPayment}
                onSelect={setSelectedPayment}
                className="mb-3"
              />
            </View>
          }
          renderItem={({ item }) => (
            <ExpenseItem
              expense={item}
              category={categoryMap.get(item.categoryId)}
              currencySymbol={settings.currencySymbol}
              showDecimals={settings.showDecimals}
              onPress={handleExpensePress}
              onEdit={handleExpensePress}
              onDelete={deleteExpense}
            />
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-12 px-4">
              <View className="w-16 h-16 rounded-full bg-[#ECE8DF] items-center justify-center mb-3">
                <Icon name="Receipt" size={28} color="#71717A" />
              </View>
              <Text className="text-base font-semibold text-[#18181B] mb-1">
                No expenses logged
              </Text>
              <Text className="text-xs text-[#71717A] text-center max-w-[240px]">
                {dayExpenses.length === 0
                  ? 'Tap the + button below to add your first expense for this day.'
                  : 'No transactions match the selected payment method.'}
              </Text>
            </View>
          }
        />

        {/* Floating Action Button (FAB) */}
        <Pressable
          onPress={handleAddPress}
          style={styles.fab}
          className="absolute right-5 bottom-6 bg-[#FF5A1F] rounded-full items-center justify-center shadow-lg"
        >
          <Icon name="Plus" size={28} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 96,
  },
  fab: {
    width: 58,
    height: 58,
    minWidth: 44,
    minHeight: 44,
    elevation: 5,
    shadowColor: '#FF5A1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
});
