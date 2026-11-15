---
description: UI, styling, and Expo Router component rules for React Native screens and components.
globs:
  - "src/app/**/*.tsx"
  - "src/components/**/*.tsx"
---

# Expo UI & Component Rules

1. **Styling with NativeWind:**
   - Use Tailwind CSS utility classes via `className` for all layout, spacing, typography, and colors.
   - Do not use inline `StyleSheet.create` unless required for animated values or third-party props.

2. **Safe Areas & Keyboard Handling:**
   - Every top-level tab screen must wrap content in `SafeAreaView` from `react-native-safe-area-context` (`edges={['top']}`).
   - Every modal or screen containing a `TextInput` must use `KeyboardAvoidingView` (`behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`).

3. **Currency & Date Display:**
   - Never format currency inline with `.toFixed(2)` or string concatenation. Always call `formatCurrency(amountMinor, settings)` from `@/utils/currency`.
   - Never use `new Date().toISOString().split('T')[0]` for local dates (this causes UTC timezone shift bugs). Always use `getLocalTodayDateString()` from `@/utils/date`.

4. **File Size & Modularity:**
   - Keep screen files in `src/app/` under 180 lines. Move reusable cards, rows, and modals into `src/components/`.
   - Ensure all interactive buttons/rows have a minimum touch target of 44x44 dp (`min-h-[44px] min-w-[44px]`).
