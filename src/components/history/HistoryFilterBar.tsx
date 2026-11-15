import React from 'react';
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet } from 'react-native';
import { Category, PaymentMethod } from '@/models/schema';
import { Icon } from '@/components/ui/Icon';

export interface HistoryFilterBarProps {
  searchQuery: string;
  onChangeSearch: (query: string) => void;
  selectedPayment: PaymentMethod | 'all';
  onSelectPayment: (method: PaymentMethod | 'all') => void;
  selectedCategory: string | 'all';
  onSelectCategory: (categoryId: string | 'all') => void;
  categories: Category[];
  className?: string;
}

const PAYMENT_METHODS: Array<{ id: PaymentMethod | 'all'; label: string }> = [
  { id: 'all', label: 'All Methods' },
  { id: 'cash', label: 'Cash' },
  { id: 'mobile_banking', label: 'Mobile' },
  { id: 'card', label: 'Card' },
  { id: 'bank', label: 'Bank' },
];

export function HistoryFilterBar({
  searchQuery,
  onChangeSearch,
  selectedPayment,
  onSelectPayment,
  selectedCategory,
  onSelectCategory,
  categories,
  className = '',
}: HistoryFilterBarProps) {
  const activeCategories = categories.filter((c) => !c.isArchived);

  return (
    <View className={`w-full ${className}`}>
      {/* Search Input Box */}
      <View
        style={styles.searchBox}
        className="flex-row items-center bg-white rounded-2xl px-3.5 border border-[#E4E0D8] mb-2.5 shadow-2xs"
      >
        <Icon name="Search" size={18} color="#71717A" />
        <TextInput
          value={searchQuery}
          onChangeText={onChangeSearch}
          placeholder="Search transactions by note..."
          placeholderTextColor="#A1A1AA"
          className="flex-1 ml-2.5 text-sm text-[#18181B]"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Pressable
            hitSlop={8}
            onPress={() => onChangeSearch('')}
            className="p-1 rounded-full bg-[#E4E0D8]/60"
          >
            <Icon name="X" size={13} color="#18181B" />
          </Pressable>
        )}
      </View>

      {/* Payment Method Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollRow}
        className="mb-2"
      >
        {PAYMENT_METHODS.map((item) => {
          const isSelected = selectedPayment === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => onSelectPayment(item.id)}
              style={styles.chip}
              className={`px-3 py-1.5 rounded-full mr-2 border ${
                isSelected
                  ? 'bg-[#141414] border-[#141414]'
                  : 'bg-white border-[#E4E0D8]'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  isSelected ? 'text-white' : 'text-[#71717A]'
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Category Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollRow}
        className="mb-1"
      >
        <Pressable
          onPress={() => onSelectCategory('all')}
          style={styles.chip}
          className={`px-3 py-1.5 rounded-full mr-2 border ${
            selectedCategory === 'all'
              ? 'bg-[#FF5A1F] border-[#FF5A1F]'
              : 'bg-white border-[#E4E0D8]'
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              selectedCategory === 'all' ? 'text-white' : 'text-[#71717A]'
            }`}
          >
            All Categories
          </Text>
        </Pressable>

        {activeCategories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => onSelectCategory(cat.id)}
              style={styles.chip}
              className={`flex-row items-center px-3 py-1.5 rounded-full mr-2 border ${
                isSelected
                  ? 'bg-[#FF5A1F] border-[#FF5A1F]'
                  : 'bg-white border-[#E4E0D8]'
              }`}
            >
              <View
                style={{ backgroundColor: isSelected ? '#FFFFFF' : cat.color }}
                className="w-2.5 h-2.5 rounded-full mr-1.5"
              />
              <Text
                className={`text-xs font-semibold ${
                  isSelected ? 'text-white' : 'text-[#71717A]'
                }`}
              >
                {cat.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    height: 44,
  },
  scrollRow: {
    paddingRight: 16,
  },
  chip: {
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
