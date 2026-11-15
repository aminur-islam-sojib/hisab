import { z } from 'zod';

export const PaymentMethodEnum = z.enum(['cash', 'mobile_banking', 'card', 'bank']);
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;

export const TransactionTypeEnum = z.enum(['expense', 'income']);
export type TransactionType = z.infer<typeof TransactionTypeEnum>;

/**
 * 1. CATEGORY MODEL
 */
export const CategorySchema = z.object({
  id: z.string(), // e.g., 'cat_food' or UUID
  name: z.string().min(1),
  icon: z.string(), // Lucide icon name (e.g., 'Utensils', 'Bus')
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  type: z.enum(['expense', 'income', 'both']).default('expense'),
  isDefault: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  createdAt: z.number().int(),
});
export type Category = z.infer<typeof CategorySchema>;

/**
 * 2. EXPENSE MODEL
 */
export const ExpenseSchema = z.object({
  id: z.string(), // UUID
  amountMinor: z.number().int().nonnegative(), // e.g., 15000 = ৳150.00
  categoryId: z.string(),
  paymentMethod: PaymentMethodEnum.default('cash'),
  note: z.string().default(''),
  spentAtDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // Local 'YYYY-MM-DD'
  type: TransactionTypeEnum.default('expense'),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
});
export type Expense = z.infer<typeof ExpenseSchema>;

/**
 * 3. BUDGET & APP SETTINGS MODEL
 */
export const BudgetSettingsSchema = z.object({
  dailyLimitMinor: z.number().int().nonnegative().default(50000), // ৳500
  monthlyLimitMinor: z.number().int().nonnegative().default(1500000), // ৳15,000
  currencySymbol: z.string().default('৳'),
  currencyCode: z.string().default('BDT'),
  showDecimals: z.boolean().default(false),
  updatedAt: z.number().int(),
});
export type BudgetSettings = z.infer<typeof BudgetSettingsSchema>;

/**
 * 4. FULL JSON BACKUP FILE SCHEMA
 * Used to validate exported and imported .json backup files.
 */
export const BackupFileSchema = z.object({
  app: z.literal('daily-cost-manager'),
  schemaVersion: z.number().int().default(1),
  exportedAt: z.string(), // ISO 8601 timestamp
  data: z.object({
    settings: BudgetSettingsSchema,
    categories: z.array(CategorySchema),
    expenses: z.array(ExpenseSchema),
  }),
});
export type BackupFilePayload = z.infer<typeof BackupFileSchema>;
