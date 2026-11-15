# 1. Product Overview

A lightweight, offline-first mobile application built with React Native (Expo) to track daily personal expenses, monitor daily/monthly budget burn rates, and manage data locally without any external database setup. Data is persisted directly on the device with 1-tap JSON full backup/restore and CSV export.

## 2. Core MVP User Flows & Screens

### Screen 1: Today's Dashboard (`src/app/(tabs)/index.tsx`)

- **Header:** Date switcher (`Today`, `Yesterday`, or calendar date picker).
- **Daily Spend Hero Card:**
  - Displays **Today's Total Spend** (e.g., `৳480`).
  - **Daily Budget Progress Bar:** Visual indicator showing `Spent / Daily Limit` (turns amber at 80%, red at 100%+).
  - **Remaining Daily Allowance:** Safe spend remaining for today.
- **Quick-Filter Chips:** Filter today's list by payment method (`All`, `Cash`, `bKash/Nagad`, `Card`).
- **Today's Transactions List:** Shows Category Icon, Note, Payment Method badge, Time, and Amount. Swipe to Delete or tap to Edit.
- **Floating Action Button (FAB):** `+` button at bottom-right opening the Quick-Add modal.

### Screen 2: Quick-Add / Edit Expense Modal (`src/app/expense/new.tsx` & `[id].tsx`)

- **Custom Numeric Keypad:** Quick-add chips (`+50`, `+100`, `+500`) and basic inline `+ / -` math.
- **Category Selector Grid:** 2-row pill grid of categories with icons and colors.
- **Payment Method Selector:** Segmented control (`Cash`, `Mobile Banking`, `Card`, `Bank`).
- **Optional Note Input:** Single-line input (e.g., "Rickshaw to office", "Lunch").
- **Date Picker:** Defaults to local `Today` (`YYYY-MM-DD`).
- **Save Action:** Appends directly to the Zustand store (auto-persisted to local storage) and closes modal.

### Screen 3: Analytics & Breakdown (`src/app/(tabs)/analytics.tsx`)

- **Period Toggle:** `This Week` | `This Month` | `Custom Month`.
- **Summary Cards:** Total Spend, Daily Average Spend, Highest Spend Day.
- **Category Breakdown:** Ranked list of categories with percentage of total spend, color bar, and amount.
- **Daily Bar Chart:** 7-day or 30-day vertical bar visual comparing daily spend against the daily budget limit.

### Screen 4: Transaction History & Search (`src/app/(tabs)/history.tsx`)

- **Search & Filter:** Search by note text, filter by category, payment method, or date range.
- **SectionList by Date:** Sticky headers showing Date (`Nov 15, 2026 — Today`) and that day's total sum.

### Screen 5: Budgets, Backup & Settings (`src/app/(tabs)/settings.tsx`)

- **Budget Configuration:** Set **Daily Budget Limit** and **Monthly Budget Limit**.
- **Category Management:** Add custom categories, edit names/icons/colors, or archive unused ones.
- **Backup & Restore System (Local File Management):**
  1. **Export Full Backup (`.json`):** Generates `daily-cost-backup-YYYY-MM-DD.json` containing all expenses, custom categories, and budget settings, and opens the native share/save sheet (`expo-sharing`).
  2. **Restore from Backup (`.json`):** Opens native file picker (`expo-document-picker`), validates the JSON structure via Zod, and lets the user choose between:
     - **Replace All Data:** Wipes current local state and restores the backup file cleanly.
     - **Merge Data:** Keeps existing entries and merges non-duplicate IDs from the backup file.
  3. **Export Spreadsheet (`.csv`):** Generates a clean, flat CSV table (`Date, Category, Amount, Payment Method, Note`) for viewing in Excel or Google Sheets.
