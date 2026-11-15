---
description: Rules for Zustand state management, AsyncStorage persistence, integer currency math, and JSON/CSV backup utilities.
globs:
  - "src/store/**/*.ts"
  - "src/models/**/*.ts"
  - "src/utils/**/*.ts"
---

# State, Local Storage & Backup Rules

1. **Zero Database Constraint:**
   - Do NOT import or install SQLite, Drizzle, Realm, or remote databases. All persistent state must live in `src/store/useAppStore.ts` using `zustand/middleware` (`persist` with `createJSONStorage(() => AsyncStorage)`).

2. **Integer Minor-Unit Math:**
   - All monetary values (`amountMinor`, `dailyLimitMinor`, `monthlyLimitMinor`) must be stored and calculated as integers (`Math.round(amount * 100)`).
   - Never store float values in Zustand or JSON backups.

3. **Strict Backup Validation (`src/utils/backup.ts`):**
   - When importing a `.json` backup file, always parse raw JSON with `JSON.parse()` inside a `try/catch` block, then validate with `BackupFileSchema.safeParse(parsed)` from `@/models/schema`.
   - If validation fails, return a structured error message to the UI and never mutate `useAppStore`.
   - In `merge` restore mode: preserve existing expenses/categories and only insert items from the backup whose `id` does not already exist in the current store.

4. **CSV Escaping:**
   - When generating CSV exports, wrap string fields (`note`, `categoryName`) in double quotes and escape internal double quotes (`value.replace(/"/g, '""')`) so commas or newlines in notes never break spreadsheet columns.
