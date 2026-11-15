# Implementation Roadmap (`docs/TASKS.md`)

## Milestone 1: Foundation, Models & Local Store

- [x] Configure NativeWind v4, path aliases (`@/*` -> `./src/*`), and Expo Router root layout (`src/app/_layout.tsx`).
- [x] Create `src/models/schema.ts` with Zod schemas (`CategorySchema`, `ExpenseSchema`, `BudgetSettingsSchema`, `BackupFileSchema`).
- [x] Create `src/models/defaults.ts` with default BDT (`৳`) budget settings and the 8 default seed categories (`Food & Dining`, `Tea & Snacks`, `Transport`, `Groceries`, `Bills & Recharge`, `Shopping`, `Health & Pharmacy`, `Other`).
- [x] Create `src/utils/currency.ts` (minor unit integer <-> formatted BDT string helpers) and `src/utils/date.ts` (local `YYYY-MM-DD` helpers using `date-fns`).
- [x] Implement `src/store/useAppStore.ts` using Zustand `persist` middleware with `@react-native-async-storage/async-storage` (key: `@daily_cost_manager_v1`).
- [x] Implement `src/store/selectors.ts` for memoized daily summaries, payment method filters, and monthly category breakdowns.
- [x] Run `npx tsc --noEmit` to verify zero TypeScript errors.

## Milestone 2: Core UI Components & Today's Dashboard

- [x] Build atomic UI components in `src/components/ui/` (`Card.tsx`, `Button.tsx`, `Badge.tsx`, `Icon.tsx` wrapping `lucide-react-native`).
- [x] Build `src/components/expense/BudgetProgressBar.tsx` (shows spent vs. daily limit, turns amber at 80% and red at 100%).
- [x] Build `src/components/expense/ExpenseItem.tsx` (displays category icon/color, note, payment badge, amount, and swipe/tap actions).
- [x] Implement Today's Dashboard (`src/app/(tabs)/index.tsx`) with date switcher, hero spend card, payment method filter chips, and Floating Action Button (`+`).
- [x] Verify store hydration gating in `src/app/_layout.tsx` so UI renders cleanly without flash of empty state.

## Milestone 3: Quick-Add & Edit Expense Modal

- [x] Build `src/components/expense/NumericKeypad.tsx` with quick-add chips (`+50`, `+100`, `+500`) and basic inline `+ / -` evaluation.
- [x] Build `src/components/expense/CategoryPickerGrid.tsx` (2-row selectable pill grid).
- [x] Implement `src/app/expense/new.tsx` and `src/app/expense/[id].tsx` modals with `KeyboardAvoidingView`, payment method segmented control, note input, and date selector.
- [x] Connect save/update/delete actions to `useAppStore` and verify instant dashboard updates.

## Milestone 4: Analytics & Transaction History

- [x] Implement `src/app/(tabs)/analytics.tsx` with period toggle (`This Week`, `This Month`), summary metric cards, and category percentage breakdown bars.
- [x] Build a lightweight 7-day / 30-day vertical bar chart component comparing daily spend against the daily budget limit.
- [x] Implement `src/app/(tabs)/history.tsx` with search input (filters by note), category/payment filter chips, and a `SectionList` grouped by `spentAtDate` showing daily totals in sticky headers.

## Milestone 5: Settings, Categories & JSON/CSV Backup System

- [ ] Implement `src/utils/backup.ts`:
  - `exportFullBackupJson()`: Serializes store state into `BackupFileSchema` format and shares `daily-cost-backup-YYYY-MM-DD.json` via `expo-file-system` and `expo-sharing`.
  - `importAndValidateBackupJson()`: Picks `.json` file via `expo-document-picker` and validates with `BackupFileSchema.safeParse()`.
  - `exportExpensesCsv()`: Exports RFC-4180 escaped CSV (`daily-cost-export-YYYY-MM-DD.csv`) for Excel/Google Sheets.
- [ ] Implement `src/app/(tabs)/settings.tsx` with Daily/Monthly budget inputs, custom category creator/archiver, and Backup/Restore buttons (`Replace All` vs `Merge Data` confirmation modal).
- [ ] Final verification: Run `npx tsc --noEmit` and test full JSON export -> reset -> restore cycle.
