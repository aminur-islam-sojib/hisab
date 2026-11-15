import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert, Modal, StyleSheet } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export interface CategoryManagerCardProps {
  className?: string;
}

const PRESET_COLORS = [
  '#FF5A1F', // Orange
  '#2563EB', // Blue
  '#141414', // Jet Black
  '#EAB308', // Gold
  '#E11D48', // Rose
  '#10B981', // Emerald
  '#0891B2', // Cyan
  '#854D0E', // Brown
  '#F97316', // Soft Orange
  '#57534E', // Stone Gray
  '#1E3A8A', // Navy
  '#0F766E', // Deep Teal
];

const PRESET_ICONS = [
  'Utensils',
  'Coffee',
  'Bus',
  'ShoppingBag',
  'Receipt',
  'Tag',
  'HeartPulse',
  'CreditCard',
  'Wallet',
  'Building2',
  'Smartphone',
  'MoreHorizontal',
];

export function CategoryManagerCard({ className = '' }: CategoryManagerCardProps) {
  const categories = useAppStore((state) => state.categories);
  const addCategory = useAppStore((state) => state.addCategory);
  const updateCategory = useAppStore((state) => state.updateCategory);

  const [modalVisible, setModalVisible] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(PRESET_ICONS[0]);

  const handleCreateCategory = () => {
    if (!newCatName.trim()) {
      Alert.alert('Category Name Required', 'Please provide a name for the category.');
      return;
    }

    addCategory({
      name: newCatName.trim(),
      icon: selectedIcon,
      color: selectedColor,
      type: 'expense',
      isArchived: false,
      sortOrder: categories.length,
    });

    setNewCatName('');
    setModalVisible(false);
  };

  const handleToggleArchive = (id: string, currentArchived: boolean, isDefault: boolean) => {
    if (isDefault && !currentArchived) {
      Alert.alert(
        'Archive Default Category',
        'Archiving this category will hide it from the picker for future expenses. You can unarchive it anytime.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Archive',
            style: 'destructive',
            onPress: () => updateCategory(id, { isArchived: true }),
          },
        ]
      );
      return;
    }

    updateCategory(id, { isArchived: !currentArchived });
  };

  return (
    <Card className={`mb-3.5 ${className}`}>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-xs font-semibold text-[#71717A] uppercase tracking-wider">
          Categories ({categories.length})
        </Text>
        <Pressable
          onPress={() => setModalVisible(true)}
          className="flex-row items-center bg-[#FFF0EB] px-2.5 py-1 rounded-full"
        >
          <Icon name="Plus" size={13} color="#FF5A1F" />
          <Text className="text-xs font-bold text-[#FF5A1F] ml-1">Add New</Text>
        </Pressable>
      </View>

      {/* Category List */}
      <View className="gap-2">
        {categories.map((cat) => (
          <View
            key={cat.id}
            className={`flex-row items-center justify-between p-2.5 rounded-2xl border ${
              cat.isArchived
                ? 'bg-[#F4F1EA] border-[#E4E0D8] opacity-60'
                : 'bg-white border-[#E4E0D8] shadow-sm'
            }`}
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View
                style={{ backgroundColor: cat.color }}
                className="w-8 h-8 rounded-xl items-center justify-center mr-2.5"
              >
                <Icon name={cat.icon} size={15} color="#FFFFFF" strokeWidth={2.2} />
              </View>
              <View className="flex-1">
                <Text numberOfLines={1} className="text-sm font-bold text-[#18181B]">
                  {cat.name}
                </Text>
                {cat.isArchived && (
                  <Text className="text-[10px] text-[#71717A] font-semibold">Archived</Text>
                )}
              </View>
            </View>

            <Pressable
              hitSlop={8}
              onPress={() => handleToggleArchive(cat.id, cat.isArchived, cat.isDefault)}
              className={`px-2.5 py-1 rounded-full border ${
                cat.isArchived
                  ? 'bg-white border-[#E4E0D8]'
                  : 'bg-[#F4F1EA] border-[#E4E0D8]'
              }`}
            >
              <Text className="text-xs font-semibold text-[#71717A]">
                {cat.isArchived ? 'Restore' : 'Archive'}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>

      {/* Add Category Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay} className="flex-1 justify-end">
          <View className="bg-white rounded-t-3xl p-5 border-t border-[#E4E0D8]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-[#18181B]">Add Category</Text>
              <Pressable
                hitSlop={8}
                onPress={() => setModalVisible(false)}
                className="p-1 rounded-full bg-[#F4F1EA]"
              >
                <Icon name="X" size={18} color="#18181B" />
              </Pressable>
            </View>

            <Input
              label="Category Name"
              placeholder="e.g. Subscriptions, Laundry"
              value={newCatName}
              onChangeText={setNewCatName}
              containerClassName="mb-3"
            />

            {/* Color Swatches */}
            <Text className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-2">
              Color
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              <View className="flex-row gap-2 py-1">
                {PRESET_COLORS.map((color) => {
                  const isSelected = selectedColor === color;
                  return (
                    <Pressable
                      key={color}
                      onPress={() => setSelectedColor(color)}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: color },
                        isSelected && styles.selectedSwatch,
                      ]}
                      className="rounded-full items-center justify-center"
                    >
                      {isSelected && <Icon name="Check" size={14} color="#FFFFFF" strokeWidth={3} />}
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {/* Icon Picker */}
            <Text className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-2">
              Icon
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
              <View className="flex-row gap-2 py-1">
                {PRESET_ICONS.map((icon) => {
                  const isSelected = selectedIcon === icon;
                  return (
                    <Pressable
                      key={icon}
                      onPress={() => setSelectedIcon(icon)}
                      style={[
                        styles.iconOption,
                        isSelected && styles.selectedIconOption,
                      ]}
                      className={`rounded-2xl items-center justify-center border ${
                        isSelected
                          ? 'bg-[#FFF0EB] border-[#FF5A1F]'
                          : 'bg-[#F4F1EA] border-[#E4E0D8]'
                      }`}
                    >
                      <Icon
                        name={icon}
                        size={20}
                        color={isSelected ? '#FF5A1F' : '#18181B'}
                        strokeWidth={2.2}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <Button
              title="Create Category"
              variant="primary"
              size="lg"
              onPress={handleCreateCategory}
            />
          </View>
        </View>
      </Modal>
    </Card>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  colorSwatch: {
    width: 38,
    height: 38,
  },
  selectedSwatch: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#18181B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  iconOption: {
    width: 44,
    height: 44,
  },
  selectedIconOption: {
    borderWidth: 2,
  },
});
