import React, { useState } from 'react';
import { View, Text, Alert, Modal, Pressable, StyleSheet } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import {
  exportFullBackupJson,
  exportExpensesCsv,
  importAndValidateBackupJson,
} from '@/utils/backup';
import { BackupFilePayload } from '@/models/schema';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

export interface BackupManagerCardProps {
  className?: string;
}

export function BackupManagerCard({ className = '' }: BackupManagerCardProps) {
  const restoreFromBackup = useAppStore((state) => state.restoreFromBackup);
  const resetAllData = useAppStore((state) => state.resetAllData);
  const expenses = useAppStore((state) => state.expenses);

  const [isExportingJson, setIsExportingJson] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Restore Modal State
  const [pendingPayload, setPendingPayload] = useState<BackupFilePayload | null>(null);
  const [restoreStats, setRestoreStats] = useState<{ expenses: number; categories: number } | null>(null);

  const handleExportJson = async () => {
    setIsExportingJson(true);
    const result = await exportFullBackupJson();
    setIsExportingJson(false);

    if (result.success) {
      Alert.alert('Backup Exported', `Saved successfully as ${result.fileName}`);
    } else {
      Alert.alert('Export Failed', result.error ?? 'Could not create JSON backup file.');
    }
  };

  const handleExportCsv = async () => {
    if (expenses.length === 0) {
      Alert.alert('No Expenses', 'There are no expenses to export.');
      return;
    }

    setIsExportingCsv(true);
    const result = await exportExpensesCsv();
    setIsExportingCsv(false);

    if (result.success) {
      Alert.alert('CSV Exported', `Spreadsheet created as ${result.fileName}`);
    } else {
      Alert.alert('Export Failed', result.error ?? 'Could not create CSV file.');
    }
  };

  const handleImportJson = async () => {
    setIsImporting(true);
    const result = await importAndValidateBackupJson();
    setIsImporting(false);

    if (result.canceled) return;

    if (!result.success) {
      Alert.alert('Import Error', result.error);
      return;
    }

    setPendingPayload(result.payload);
    setRestoreStats({
      expenses: result.expenseCount,
      categories: result.categoryCount,
    });
  };

  const executeRestore = (mode: 'replace' | 'merge') => {
    if (!pendingPayload) return;

    restoreFromBackup(pendingPayload, mode);
    const modeName = mode === 'replace' ? 'replaced' : 'merged';
    Alert.alert(
      'Restore Complete',
      `All data has been successfully ${modeName} from the backup file.`
    );

    setPendingPayload(null);
    setRestoreStats(null);
  };

  const handleReset = () => {
    Alert.alert(
      'Reset All Data',
      'Are you sure you want to delete all expenses and restore default settings? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            resetAllData();
            Alert.alert('Data Reset', 'All expense data has been wiped.');
          },
        },
      ]
    );
  };

  return (
    <Card className={`mb-4 ${className}`}>
      <Text className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-3">
        Backup & Local Data
      </Text>

      <View className="gap-2.5">
        {/* Export JSON */}
        <Button
          title="Export Full Backup (.json)"
          variant="secondary"
          size="md"
          isLoading={isExportingJson}
          icon={<Icon name="Download" size={17} color="#18181B" />}
          onPress={handleExportJson}
        />

        {/* Restore JSON */}
        <Button
          title="Restore from Backup (.json)"
          variant="secondary"
          size="md"
          isLoading={isImporting}
          icon={<Icon name="Upload" size={17} color="#18181B" />}
          onPress={handleImportJson}
        />

        {/* Export CSV */}
        <Button
          title="Export Spreadsheet (.csv)"
          variant="secondary"
          size="md"
          isLoading={isExportingCsv}
          icon={<Icon name="FileText" size={17} color="#18181B" />}
          onPress={handleExportCsv}
        />

        {/* Danger: Reset All Data */}
        <View className="pt-2 mt-1 border-t border-[#E4E0D8]/60">
          <Button
            title="Reset All Local Data"
            variant="danger"
            size="md"
            icon={<Icon name="RotateCcw" size={17} color="#FFFFFF" />}
            onPress={handleReset}
          />
        </View>
      </View>

      {/* Restore Mode Confirmation Modal */}
      <Modal
        visible={pendingPayload !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPendingPayload(null)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 p-5">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm border border-[#E4E0D8]">
            <View className="w-12 h-12 rounded-full bg-[#16A34A]/10 items-center justify-center self-center mb-3">
              <Icon name="Check" size={24} color="#16A34A" />
            </View>

            <Text className="text-lg font-bold text-[#18181B] text-center mb-1">
              Backup Validated
            </Text>
            <Text className="text-xs text-[#71717A] text-center mb-5">
              Found {restoreStats?.expenses} expenses and {restoreStats?.categories} categories. How would you like to restore?
            </Text>

            <View className="gap-2.5">
              {/* Replace Mode */}
              <Pressable
                onPress={() => executeRestore('replace')}
                style={styles.modalOption}
                className="bg-[#DC2626]/10 border border-[#DC2626]/20 rounded-2xl p-3.5"
              >
                <Text className="text-sm font-bold text-[#DC2626] mb-0.5">
                  Replace All Data
                </Text>
                <Text className="text-[11px] text-[#71717A]">
                  Overwrites existing data completely with the backup file.
                </Text>
              </Pressable>

              {/* Merge Mode */}
              <Pressable
                onPress={() => executeRestore('merge')}
                style={styles.modalOption}
                className="bg-[#FAF8F5] border border-[#E4E0D8] rounded-2xl p-3.5"
              >
                <Text className="text-sm font-bold text-[#18181B] mb-0.5">
                  Merge Data
                </Text>
                <Text className="text-[11px] text-[#71717A]">
                  Keeps current data and appends any missing entries.
                </Text>
              </Pressable>

              {/* Cancel Button */}
              <Button
                title="Cancel"
                variant="ghost"
                size="md"
                onPress={() => setPendingPayload(null)}
                className="mt-1"
              />
            </View>
          </View>
        </View>
      </Modal>
    </Card>
  );
}

const styles = StyleSheet.create({
  modalOption: {
    minHeight: 52,
  },
});
