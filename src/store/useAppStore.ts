import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BackupFilePayload,
  BudgetSettings,
  Category,
  Expense,
} from '@/models/schema';
import { DEFAULT_BUDGET_SETTINGS, DEFAULT_CATEGORIES } from '@/models/defaults';

function generateUniqueId(prefix = ''): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const randomPart = Math.random().toString(36).substring(2, 10);
  const timePart = Date.now().toString(36);
  return prefix ? `${prefix}_${timePart}_${randomPart}` : `${timePart}-${randomPart}`;
}

export interface AppStoreState {
  // Persisted Data
  settings: BudgetSettings;
  categories: Category[];
  expenses: Expense[];

  // Hydration state (in-memory only)
  hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;

  // Expense Actions
  addExpense: (input: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id' | 'createdAt'>>) => void;
  deleteExpense: (id: string) => void;

  // Category & Budget Actions
  updateSettings: (updates: Partial<BudgetSettings>) => void;
  addCategory: (input: Omit<Category, 'id' | 'createdAt' | 'isDefault'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;

  // Backup & Restore Actions
  exportBackupPayload: () => BackupFilePayload;
  restoreFromBackup: (payload: BackupFilePayload, mode: 'replace' | 'merge') => void;
  resetAllData: () => void;
}

export const useAppStore = create<AppStoreState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_BUDGET_SETTINGS,
      categories: DEFAULT_CATEGORIES,
      expenses: [],
      hasHydrated: false,

      setHasHydrated: (hydrated: boolean) => {
        set({ hasHydrated: hydrated });
      },

      addExpense: (input) => {
        const now = Date.now();
        const newExpense: Expense = {
          id: generateUniqueId('exp'),
          amountMinor: Math.round(input.amountMinor),
          categoryId: input.categoryId,
          paymentMethod: input.paymentMethod,
          note: input.note ?? '',
          spentAtDate: input.spentAtDate,
          type: input.type ?? 'expense',
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          expenses: [newExpense, ...state.expenses],
        }));
      },

      updateExpense: (id, updates) => {
        set((state) => ({
          expenses: state.expenses.map((exp) => {
            if (exp.id !== id) return exp;
            return {
              ...exp,
              ...updates,
              ...(updates.amountMinor !== undefined
                ? { amountMinor: Math.round(updates.amountMinor) }
                : {}),
              updatedAt: Date.now(),
            };
          }),
        }));
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((exp) => exp.id !== id),
        }));
      },

      updateSettings: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...updates,
            ...(updates.dailyLimitMinor !== undefined
              ? { dailyLimitMinor: Math.round(updates.dailyLimitMinor) }
              : {}),
            ...(updates.monthlyLimitMinor !== undefined
              ? { monthlyLimitMinor: Math.round(updates.monthlyLimitMinor) }
              : {}),
            updatedAt: Date.now(),
          },
        }));
      },

      addCategory: (input) => {
        const newCategory: Category = {
          id: generateUniqueId('cat'),
          name: input.name,
          icon: input.icon,
          color: input.color,
          type: input.type ?? 'expense',
          isDefault: false,
          isArchived: input.isArchived ?? false,
          sortOrder: input.sortOrder ?? get().categories.length,
          createdAt: Date.now(),
        };

        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((cat) => {
            if (cat.id !== id) return cat;
            return {
              ...cat,
              ...updates,
            };
          }),
        }));
      },

      exportBackupPayload: () => {
        const state = get();
        return {
          app: 'daily-cost-manager',
          schemaVersion: 1,
          exportedAt: new Date().toISOString(),
          data: {
            settings: state.settings,
            categories: state.categories,
            expenses: state.expenses,
          },
        };
      },

      restoreFromBackup: (payload, mode) => {
        if (mode === 'replace') {
          set({
            settings: payload.data.settings,
            categories: payload.data.categories,
            expenses: payload.data.expenses,
          });
          return;
        }

        // Merge mode
        const currentCategories = get().categories;
        const currentExpenses = get().expenses;

        const existingCategoryIds = new Set(currentCategories.map((c) => c.id));
        const mergedCategories = [...currentCategories];
        for (const cat of payload.data.categories) {
          if (!existingCategoryIds.has(cat.id)) {
            mergedCategories.push(cat);
            existingCategoryIds.add(cat.id);
          }
        }

        const existingExpenseIds = new Set(currentExpenses.map((e) => e.id));
        const mergedExpenses = [...currentExpenses];
        for (const exp of payload.data.expenses) {
          if (!existingExpenseIds.has(exp.id)) {
            mergedExpenses.push(exp);
            existingExpenseIds.add(exp.id);
          }
        }

        set({
          categories: mergedCategories,
          expenses: mergedExpenses,
        });
      },

      resetAllData: () => {
        set({
          settings: DEFAULT_BUDGET_SETTINGS,
          categories: DEFAULT_CATEGORIES,
          expenses: [],
        });
      },
    }),
    {
      name: '@daily_cost_manager_v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        settings: state.settings,
        categories: state.categories,
        expenses: state.expenses,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Normalize existing categories to ensure type field is present
          const normalized = (state.categories || []).map((cat) => ({
            ...cat,
            type: cat.type || 'expense',
          }));

          // Purge unwanted categories from Expense list:
          // User requested removal of salary, business, freelance, other from expense
          const unwantedExpenseNames = new Set(['salary', 'selery', 'business', 'freelance', 'other']);
          const unwantedExpenseIds = new Set([
            'cat_other',
            'cat_salary_expense',
            'cat_business_expense',
            'cat_freelance_expense',
          ]);

          const purged = normalized.filter((cat) => {
            const isExpense = (cat.type ?? 'expense') === 'expense';
            if (!isExpense) return true; // keep income categories
            const nameLower = cat.name.trim().toLowerCase();
            return !unwantedExpenseNames.has(nameLower) && !unwantedExpenseIds.has(cat.id);
          });

          // Re-map any expenses pointing to removed category IDs to cat_food
          if (state.expenses && state.expenses.length > 0) {
            state.expenses = state.expenses.map((exp) => {
              if (unwantedExpenseIds.has(exp.categoryId)) {
                return { ...exp, categoryId: 'cat_food' };
              }
              return exp;
            });
          }

          // Merge any newly introduced default categories
          const existingIds = new Set(purged.map((c) => c.id));
          const missingDefaults = DEFAULT_CATEGORIES.filter((d) => !existingIds.has(d.id));

          state.categories = missingDefaults.length > 0 ? [...purged, ...missingDefaults] : purged;
          state.setHasHydrated(true);
        }
      },
    }
  )
);
