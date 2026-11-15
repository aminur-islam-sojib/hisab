import React, { useState, useMemo } from 'react';
import { View, Text, SectionList, StyleSheet, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { selectCategoryMap, selectGroupedExpensesByDate } from '@/store/selectors';
import { Expense, PaymentMethod } from '@/models/schema';
import { formatCurrency } from '@/utils/currency';
import { ExpenseItem } from '@/components/expense/ExpenseItem';
import { ExpenseModal } from '@/components/expense/ExpenseModal';
import { HistoryFilterBar } from '@/components/history/HistoryFilterBar';
import { useDrawerStore } from '@/store/useDrawerStore';
import { Icon } from '@/components/ui/Icon';

export default function HistoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const openDrawer = useDrawerStore((s) => s.openDrawer);

  const expenses = useAppStore((state) => state.expenses);
  const categories = useAppStore((state) => state.categories);
  const settings = useAppStore((state) => state.settings);
  const deleteExpense = useAppStore((state) => state.deleteExpense);

  const categoryMap = useMemo(() => selectCategoryMap(categories), [categories]);

  const sections = useMemo(
    () =>
      selectGroupedExpensesByDate(expenses, {
        searchQuery,
        paymentMethod: selectedPayment === 'all' ? undefined : selectedPayment,
        categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
      }),
    [expenses, searchQuery, selectedPayment, selectedCategory]
  );

  const totalResultsCount = useMemo(
    () => sections.reduce((sum, sec) => sum + sec.data.length, 0),
    [sections]
  );

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F7F4EF]">
      <View className="flex-1 px-4">
        {/* Header with Back Button, Title & Menu Button */}
        <View className="flex-row items-center justify-between py-1 mb-2">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              className="w-10 h-10 rounded-full bg-white border border-[#E4E0D8] items-center justify-center mr-3 shadow-sm active:bg-[#ECE8DF]"
            >
              <Icon name="ChevronLeft" size={20} color="#18181B" strokeWidth={2.4} />
            </Pressable>
            <Text className="text-2xl font-black text-[#18181B] tracking-tight">History</Text>
            <Text className="text-xs font-semibold text-[#71717A] ml-2">
              ({totalResultsCount})
            </Text>
          </View>

          <Pressable
            hitSlop={8}
            onPress={() => openDrawer('history')}
            className="w-11 h-11 rounded-full bg-white border border-[#E4E0D8] items-center justify-center shadow-sm active:bg-[#ECE8DF]"
          >
            <Icon name="Menu" size={21} color="#18181B" strokeWidth={2.4} />
          </Pressable>
        </View>

        {/* Search & Filters */}
        <HistoryFilterBar
          searchQuery={searchQuery}
          onChangeSearch={setSearchQuery}
          selectedPayment={selectedPayment}
          onSelectPayment={setSelectedPayment}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categories={categories}
          className="mb-2"
        />

        {/* Grouped SectionList */}
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader} className="flex-row items-center justify-between py-2 px-1 bg-[#F7F4EF]">
              <Text className="text-xs font-bold text-[#71717A] uppercase tracking-wider">{section.title}</Text>
              <Text className="text-xs font-extrabold text-[#18181B]">
                {formatCurrency(section.totalMinor, {
                  currencySymbol: settings.currencySymbol,
                  showDecimals: settings.showDecimals,
                })}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <ExpenseItem
              expense={item}
              category={categoryMap.get(item.categoryId)}
              currencySymbol={settings.currencySymbol}
              showDecimals={settings.showDecimals}
              onPress={setEditingExpense}
              onEdit={setEditingExpense}
              onDelete={deleteExpense}
            />
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-16 px-4">
              <View className="w-16 h-16 rounded-full bg-[#ECE8DF] items-center justify-center mb-3">
                <Icon name="Search" size={26} color="#71717A" />
              </View>
              <Text className="text-base font-semibold text-[#18181B] mb-1">No Transactions Found</Text>
              <Text className="text-xs text-[#71717A] text-center max-w-[240px]">
                {expenses.length === 0
                  ? 'No expenses have been recorded yet.'
                  : 'Try searching with different keywords or clearing your filters.'}
              </Text>
            </View>
          }
        />
      </View>

      {/* In-Place Slide-up Edit Modal */}
      <ExpenseModal
        visible={editingExpense !== null}
        type={editingExpense?.type ?? 'expense'}
        expenseToEdit={editingExpense}
        onClose={() => setEditingExpense(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    zIndex: 10,
  },
});
