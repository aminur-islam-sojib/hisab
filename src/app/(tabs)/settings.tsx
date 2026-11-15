import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BudgetSettingsCard } from '@/components/settings/BudgetSettingsCard';
import { CategoryManagerCard } from '@/components/settings/CategoryManagerCard';
import { BackupManagerCard } from '@/components/settings/BackupManagerCard';

export default function SettingsScreen() {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F7F4EF]">
      <View className="flex-1 px-4">
        {/* Header */}
        <View className="py-3">
          <Text className="text-2xl font-extrabold text-[#18181B] tracking-tight">
            Settings
          </Text>
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
