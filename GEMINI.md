# Project Rules & Context: Daily Cost Manager (Expo React Native)

## 1. Tech Stack & Core Dependencies

- **Framework:** React Native with Expo SDK (Latest) & Expo Router (File-based routing in `src/app/`)
- **Language:** TypeScript (`strict: true` — zero `any` types allowed)
- **Styling:** NativeWind v4 (Tailwind CSS utility classes for React Native)
- **Local Persistence (No DB Engine):** Zustand `persist` middleware backed by `@react-native-async-storage/async-storage`
- **Backup & Restore:** `expo-file-system`, `expo-sharing`, and `expo-document-picker` (Full state JSON backup/restore + optional CSV export)
- **Validation:** `zod` (Mandatory for validating imported JSON backup files before overwriting local state)
- **Icons:** `lucide-react-native`
- **Date Handling:** `date-fns` (Always normalize "today" to local device timezone `YYYY-MM-DD`)

## 2. Directory Structure

```text
src/
├── app/                      # Expo Router screens & layouts
│   ├── (tabs)/               # Bottom tab navigation (index, analytics, history, settings)
│   ├── expense/              # Modals for add/edit expense ([id].tsx, new.tsx)
│   └── _layout.tsx           # Root layout waiting for Zustand hydration
├── components/
│   ├── ui/                   # Reusable atomic components (Button, Card, Input, Badge)
│   └── expense/              # Domain components (ExpenseItem, BudgetProgressBar, Keypad)
├── models/
│   ├── schema.ts             # Zod schemas & TypeScript interfaces for Store & Backup JSON
│   └── defaults.ts           # Default seed categories and initial budget settings
├── store/
│   ├── useAppStore.ts        # Main persisted Zustand store (expenses, categories, settings)
│   └── selectors.ts          # Computed selectors (daily totals, monthly breakdowns, filters)
└── utils/
    ├── backup.ts             # JSON export/import & CSV export using Expo FileSystem/Sharing
    ├── currency.ts           # Integer/paisa-to-display formatters (default BDT ৳)
    └── date.ts               # Local YYYY-MM-DD boundary helpers

```

## 3. Strict Coding & Architecture Constraints

1. **No Database Engine:** Do NOT install or use SQLite, Drizzle,
    Prisma, or external cloud DBs. All app data lives in the persisted
    Zustand store (`useAppStore`) synced to local `AsyncStorage`.

2. **No Floating-Point Currency Math:** Store all monetary values as
    **integers in minor units** (e.g., Paisa/Cents: `15050` = `150.50`
    BDT) or whole integers. Format to display strings (`৳1,250`) only in
    the UI via `src/utils/currency.ts`.

3. **Safe Backup & Restore:** Never blindly load an imported JSON file
    into the store. Always parse imported files through
    `BackupFileSchema.safeParse()` from `src/models/schema.ts` first to
    prevent corrupted files from crashing the app.

4. **Date Boundary Accuracy:** Every expense must store both
    `spentAtDate` (`YYYY-MM-DD` string in local device time for instant
    filtering) and `createdAt` (Unix epoch milliseconds).

5. **Mobile UX Standards:**

    - Wrap screens in `SafeAreaView` from
        `react-native-safe-area-context`.
    - Use `KeyboardAvoidingView` on modals and forms.
    - Keep screen files in `src/app/` under 180 lines.

## 4. Mandatory Agent Verification Loop

After creating or modifying any `.ts` or `.tsx` file, you MUST:

1. Run `npx tsc --noEmit` to verify zero TypeScript compilation or
    import errors.
2. Verify all path aliases match `tsconfig.json` (`@/*` -\> `./src/*`).
