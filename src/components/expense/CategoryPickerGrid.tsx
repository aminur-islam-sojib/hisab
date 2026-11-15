import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Category } from '@/models/schema';
import { Icon } from '@/components/ui/Icon';

export interface CategoryPickerGridProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  className?: string;
}

export function CategoryPickerGrid({
  categories,
  selectedCategoryId,
  onSelectCategory,
  className = '',
}: CategoryPickerGridProps) {
  const activeCategories = categories
    .filter((cat) => !cat.isArchived)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Split into 2 rows for a 2-row horizontal pill grid
  const row1 = activeCategories.filter((_, idx) => idx % 2 === 0);
  const row2 = activeCategories.filter((_, idx) => idx % 2 !== 0);

  const renderPill = (category: Category) => {
    const isSelected = category.id === selectedCategoryId;

    return (
      <Pressable
        key={category.id}
        onPress={() => onSelectCategory(category.id)}
        style={[
          styles.pill,
          isSelected ? styles.selectedPill : styles.unselectedPill,
        ]}
        className={`flex-row items-center rounded-2xl px-3.5 mr-2.5 ${
          isSelected
            ? 'bg-[#FF5A1F]/10 border-[#FF5A1F]'
            : 'bg-white border-[#E4E0D8]'
        }`}
      >
        <View
          style={[styles.iconCircle, { backgroundColor: category.color }]}
          className="items-center justify-center mr-2 rounded-full"
        >
          <Icon name={category.icon} size={15} color="#FFFFFF" strokeWidth={2.2} />
        </View>
        <Text
          className={`text-sm font-semibold ${
            isSelected ? 'text-[#18181B]' : 'text-[#71717A]'
          }`}
        >
          {category.name}
        </Text>
      </Pressable>
    );
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
      className={`py-1 ${className}`}
    >
      <View>
        <View className="flex-row mb-2">
          {row1.map(renderPill)}
        </View>
        <View className="flex-row">
          {row2.map(renderPill)}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingRight: 16,
  },
  pill: {
    minHeight: 44,
    borderWidth: 1.5,
  },
  selectedPill: {
    borderColor: '#FF5A1F',
  },
  unselectedPill: {
    borderColor: '#E4E0D8',
  },
  iconCircle: {
    width: 28,
    height: 28,
  },
});
