import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BudgetSettingsCard } from '@/components/settings/BudgetSettingsCard';
import { CategoryManagerCard } from '@/components/settings/CategoryManagerCard';
import { BackupManagerCard } from '@/components/settings/BackupManagerCard';
import { useDrawerStore } from '@/store/useDrawerStore';
import { Icon } from '@/components/ui/Icon';

export default function SettingsScreen() {
  const openDrawer = useDrawerStore((s) => s.openDrawer);

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
            <Text className="text-2xl font-black text-[#18181B] tracking-tight">
              Settings
            </Text>
          </View>

          <Pressable
            hitSlop={8}
            onPress={() => openDrawer('settings')}
            className="w-11 h-11 rounded-full bg-white border border-[#E4E0D8] items-center justify-center shadow-sm active:bg-[#ECE8DF]"
          >
            <Icon name="Menu" size={21} color="#18181B" strokeWidth={2.4} />
          </Pressable>
        </View>

        {/* Scrollable Settings Cards */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 1. Daily & Monthly Budget Configuration */}
          <BudgetSettingsCard />

          {/* 2. Custom Category Management */}
          <CategoryManagerCard />

          {/* 3. Full JSON Backup/Restore & CSV Spreadsheet Export */}
          <BackupManagerCard />

          {/* App Info Footer */}
          <View className="items-center py-4">
            <Text className="text-xs font-semibold text-[#71717A]">
              Daily Cost Manager (Hisab) • v1.0.0
            </Text>
            <Text className="text-[11px] text-[#A1A1AA] mt-0.5">
              Zero Database • Offline-First • Local Storage
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
});
