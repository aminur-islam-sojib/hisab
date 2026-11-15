import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Category } from '@/models/schema';
import { Icon } from '@/components/ui/Icon';

export interface CategoryPickerGridProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  onAddCategoryPress?: () => void;
  className?: string;
}

export function CategoryPickerGrid({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onAddCategoryPress,
  className = '',
}: CategoryPickerGridProps) {
  const activeCategories = categories
    .filter((cat) => !cat.isArchived)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <View className={`w-full ${className}`}>
      <View className="flex-row flex-wrap justify-between">
        {activeCategories.map((category) => {
          const isSelected = category.id === selectedCategoryId;

          return (
            <Pressable
              key={category.id}
              onPress={() => onSelectCategory(category.id)}
              style={styles.gridItem}
            >
              <View
                style={[
                  styles.squircle,
                  { backgroundColor: category.color },
                  isSelected && styles.selectedSquircle,
                ]}
              >
                <Icon
                  name={category.icon}
                  size={24}
                  color="#FFFFFF"
                  strokeWidth={2.2}
                />
              </View>
              <Text
                numberOfLines={1}
                className={`text-xs text-center mt-1.5 ${
                  isSelected
                    ? 'font-bold text-[#18181B]'
                    : 'font-medium text-[#52525B]'
                }`}
              >
                {category.name}
              </Text>
            </Pressable>
          );
        })}

        {/* Add Category Button Tile */}
        {onAddCategoryPress && (
          <Pressable
            onPress={onAddCategoryPress}
            style={styles.gridItem}
          >
            <View style={styles.addSquircle}>
              <Icon name="Plus" size={22} color="#18181B" strokeWidth={2.4} />
            </View>
            <Text
              numberOfLines={1}
              className="text-xs font-medium text-[#71717A] text-center mt-1.5"
            >
              Add
            </Text>
          </Pressable>
        )}

        {/* Spacer items to ensure left-alignment on the last row */}
        <View style={styles.spacer} />
        <View style={styles.spacer} />
        <View style={styles.spacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 16,
  },
  squircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedSquircle: {
    borderWidth: 3.5,
    borderColor: '#18181B',
    shadowColor: '#18181B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  addSquircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1CDC7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    width: '23%',
    height: 0,
  },
});
