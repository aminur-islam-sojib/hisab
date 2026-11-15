# UI & Data Rules for Agent

1. **Warm Cream Canvas:** Every screen root container MUST use `bg-[#F7F4EF]`. Cards MUST use `bg-white rounded-3xl`.
2. **Currency Prefix:** Always format amounts using `formatBDT(amount)` -> `৳${amount.toLocaleString('en-IN')}` (or standard comma formatting `৳22,885`).
3. **Donut Chart Empty State:** When a month has `0` expenses or `0` income, render a neutral light-gray ring (`#E4E0D8`) with `৳0` in the center so the layout never collapses.
4. **Swipe-to-Delete:** Use `ReanimatedSwipeable` from `react-native-gesture-handler/ReanimatedSwipeable` on transaction cards in `src/app/category/[id].tsx`.
5. **Safe Category Deletion:** If a user deletes a category that already has transactions in `transactions`, soft-archive it (`isArchived = true`) so historical monthly donut charts remain accurate.
