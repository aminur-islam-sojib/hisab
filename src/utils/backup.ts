import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { BackupFilePayload, BackupFileSchema, Expense, Category } from '@/models/schema';
import { useAppStore } from '@/store/useAppStore';
import { getLocalTodayDateString } from '@/utils/date';
import { selectCategoryMap } from '@/store/selectors';

export interface BackupImportSuccessResult {
  canceled: false;
  success: true;
  payload: BackupFilePayload;
  expenseCount: number;
  categoryCount: number;
}

export interface BackupImportErrorResult {
  canceled: false;
  success: false;
  error: string;
}

export interface BackupImportCanceledResult {
  canceled: true;
  success: false;
}

export type BackupImportResult =
  | BackupImportSuccessResult
  | BackupImportErrorResult
  | BackupImportCanceledResult;

export interface ExportResult {
  success: boolean;
  fileName: string;
  error?: string;
}

/**
 * Escapes CSV field per RFC-4180.
 * Wraps in double quotes and escapes existing double quotes as double-double quotes ("").
 */
function escapeCsvField(value: string | number): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Helper to write a file locally and open the native system share/save sheet.
 */
async function shareOrDownloadFile(
  fileName: string,
  contents: string,
  mimeType: string
): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const blob = new Blob([contents], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    return;
  }

  const baseDirectory = FileSystem.cacheDirectory || FileSystem.documentDirectory;
  if (!baseDirectory) {
    throw new Error('Local file storage is unavailable on this device.');
  }

  const fileUri = `${baseDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(fileUri, contents, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(fileUri, {
      mimeType,
      dialogTitle: `Export ${fileName}`,
      UTI: mimeType === 'application/json' ? 'public.json' : 'public.comma-separated-values-text',
    });
  } else {
    throw new Error('File sharing is not supported on this platform.');
  }
}

/**
 * Exports full store state into a JSON backup file and prompts sharing.
 * File Name: inflow-backup-YYYY-MM-DD.json
 */
export async function exportFullBackupJson(): Promise<ExportResult> {
  try {
    const payload = useAppStore.getState().exportBackupPayload();
    // Strict schema parse verification before outputting
    BackupFileSchema.parse(payload);

    const jsonString = JSON.stringify(payload, null, 2);
    const dateStr = getLocalTodayDateString();
    const fileName = `inflow-backup-${dateStr}.json`;

    await shareOrDownloadFile(fileName, jsonString, 'application/json');
    return { success: true, fileName };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to export backup file.';
    return { success: false, fileName: '', error: message };
  }
}

/**
 * Prompts user to pick a .json file, reads, and strictly validates using BackupFileSchema.
 */
export async function importAndValidateBackupJson(): Promise<BackupImportResult> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/json', 'text/json', '*/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return { canceled: true, success: false };
    }

    const asset = result.assets[0];
    let fileContent = '';

    if (Platform.OS === 'web' && asset.file) {
      fileContent = await asset.file.text();
    } else {
      fileContent = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    }

    if (!fileContent || fileContent.trim() === '') {
      return {
        canceled: false,
        success: false,
        error: 'The selected backup file is completely empty.',
      };
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(fileContent);
    } catch {
      return {
        canceled: false,
        success: false,
        error: 'The selected file is not a valid JSON document.',
      };
    }

    const validationResult = BackupFileSchema.safeParse(parsedJson);
    if (!validationResult.success) {
      const errorDetail = validationResult.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ');
      return {
        canceled: false,
        success: false,
        error: `Invalid backup schema: ${errorDetail}`,
      };
    }

    const payload = validationResult.data;
    return {
      canceled: false,
      success: true,
      payload,
      expenseCount: payload.data.expenses.length,
      categoryCount: payload.data.categories.length,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error reading backup file.';
    return {
      canceled: false,
      success: false,
      error: message,
    };
  }
}

/**
 * Exports all expenses into RFC-4180 escaped CSV for spreadsheets.
 * File Name: inflow-export-YYYY-MM-DD.csv
 * Columns: id,spent_at_date,amount,currency,category_name,payment_method,note,created_at_iso
 */
export async function exportExpensesCsv(): Promise<ExportResult> {
  try {
    const state = useAppStore.getState();
    const expenses: Expense[] = state.expenses;
    const categories: Category[] = state.categories;
    const categoryMap = selectCategoryMap(categories);
    const currency = state.settings.currencyCode || 'BDT';

    const header = 'id,spent_at_date,amount,currency,category_name,payment_method,note,created_at_iso';

    const rows = expenses.map((exp) => {
      const categoryName = categoryMap.get(exp.categoryId)?.name ?? 'Unknown';
      const majorAmount = (exp.amountMinor / 100).toFixed(2);
      const createdAtIso = new Date(exp.createdAt).toISOString();

      return [
        escapeCsvField(exp.id),
        escapeCsvField(exp.spentAtDate),
        majorAmount,
        escapeCsvField(currency),
        escapeCsvField(categoryName),
        escapeCsvField(exp.paymentMethod),
        escapeCsvField(exp.note),
        escapeCsvField(createdAtIso),
      ].join(',');
    });

    const csvContent = [header, ...rows].join('\n');
    const dateStr = getLocalTodayDateString();
    const fileName = `inflow-export-${dateStr}.csv`;

    await shareOrDownloadFile(fileName, csvContent, 'text/csv');
    return { success: true, fileName };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to export CSV file.';
    return { success: false, fileName: '', error: message };
  }
}
