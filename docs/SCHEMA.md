# Local Storage & Backup Schema Contract (`Zustand` + `AsyncStorage` + `Zod`)

## 1. Storage Architecture (Zero Database)

- **Persistence Key:** `@daily_cost_manager_v1` in `AsyncStorage`.
- **Monetary Values (`amountMinor`):** Stored as `number` (integer in minor units: `100` paisa = `1` BDT) to prevent floating-point math issues when summing arrays in JavaScript.
- **Dates:**
  - `spentAtDate`: `YYYY-MM-DD` string in local device time.
  - `createdAt` & `updatedAt`: Unix epoch milliseconds (`Date.now()`).

---

## 2. Zod Data Models & Backup Contract (`src/models/schema.ts`)

```typescript
import { z } from 'zod';

export const PaymentMethodEnum = z.enum(['cash', 'mobile_banking', 'card', 'bank']);
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;

/**
 * 1. CATEGORY MODEL
 */
export const CategorySchema = z.object({
  id: z.string(), // e.g., 'cat_food' or UUID
  name: z.string().min(1),
  icon: z.string(), // Lucide icon name (e.g., 'Utensils', 'Bus')
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
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

## 3. Zustand Store Interface (`src/store/useAppStore.ts`)

``` ts
export interface AppStoreState {
  // Persisted Data
  settings: BudgetSettings;
  categories: Category[];
  expenses: Expense[];
  hasHydrated: boolean;

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
```

## 4. Backup & Restore File Specifications (`src/utils/backup.ts`)

### A. JSON Backup Format (Primary Restore File)

- **File Name:** `daily-cost-backup-YYYY-MM-DD.json`
- **Restore Modes:**
  - `replace`: Replaces `settings`, `categories`, and `expenses`
        completely with the validated JSON file data.
  - `merge`: Keeps current `settings`, merges `categories` by `id`,
        and appends `expenses` whose `id` does not already exist
        locally.

### B. CSV Export Format (Read-Only Spreadsheet Export)

- **File Name:** `daily-cost-export-YYYY-MM-DD.csv`

- **Columns:**

    `id,spent_at_date,amount,currency,category_name,payment_method,note,created_at_iso`

- **Escaping Rule:** Wrap `note` and `category_name` in double quotes
    (`"..."`) and escape internal quotes (`""`) so commas inside notes
    never corrupt columns.

### Visible follow-up prompt snippet

The bottom code block in the screenshot is partially clipped
horizontally. Its visible text reads:

``` xml
<ElicitationsGroup message="What would you like to generate next for your project?">
  <Elicitation label="Generate TASKS.md & .agents rules" query="Generate docs/TASKS.md and the .agents/rules/ and .agents/skills/ files updated for this local JSON + Zustand architecture."/>
  <Elicitation label="Write the Zustand Store & Backup utility" query="Write the complete code for src/store/useAppStore.ts and src/utils/backup.ts with JSON restore and CSV export."/>
  <Elicitation label="Get the first Antigravity prompt" query="Give me the exact prompt to run in Antigravity to scaffold Milestone 1 with this local storage setup."/>
</ElicitationsGroup>
<FollowUp label="Want me to generate your docs/TASKS.md, .agents/rules/, and .agents/skills/ files for this local JSON setup next?" query="Yes, generate docs/TASKS.md along with the .agents/rules/ and .agents/skills/ files tailored for the local Zustand + AsyncStorage and JSON backup setup."/>
```

*Note: The ends of these lines are cut off in the source image, so the
omitted text is not recoverable.*
