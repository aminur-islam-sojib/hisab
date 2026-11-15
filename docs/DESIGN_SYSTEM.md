# UI/UX Design System & Component Specifications

## 1. Color Palette

- **App Canvas Background (Warm Cream):** `#F7F4EF`
- **Card / Surface Background:** `#FFFFFF`
- **Modal / Sheet Background:** `#FAF8F5`
- **Primary Text (Charcoal Black):** `#18181B`
- **Secondary Text (Warm Muted Gray):** `#71717A`
- **Primary Accent / Expense Orange:** `#FF5A1F`
- **Income / Positive Emerald Green:** `#16A34A`
- **Primary Dark Action Button (`+ Income`, `+ Lend`):** `#141414`
- **Disabled Button Background:** `#D9D6CE` (Text: `#78756E`)
- **Border / Input Stroke Default:** `#E4E0D8`
- **Category Preset Swatch Palette:**
  - `#FF5A1F` (Vibrant Orange - Food)
  - `#2563EB` (Royal Blue - Transport/Freelance)
  - `#141414` (Jet Black - Rent/Other)
  - `#EAB308` (Amber Gold - Bills)
  - `#E11D48` (Rose Red - Shopping/Gift)
  - `#10B981` (Emerald Green - Salary/Health)
  - `#0891B2` (Cyan Teal - Mobile & Net/Utility)
  - `#854D0E` (Warm Brown - Family)
  - `#F97316` (Soft Orange - Fun)
  - `#57534E` (Stone Gray - Education)
  - `#1E3A8A` (Navy Blue - Office)
  - `#0F766E` (Deep Teal - Savings/Other)

## 2. Geometry, Borders & Elevation

- **Outer Screen Horizontal Padding:** `16px` (`px-4`)
- **Summary & Content Cards:** `backgroundColor: '#FFFFFF'`, `borderRadius: 24px` (`rounded-3xl`), `padding: 18px`, subtle elevation (`shadowOpacity: 0.04`, `shadowRadius: 10`).
- **Circular Icon Buttons (`<`, `>`, Hamburger `≡`):** `44x44px` circle (`rounded-full`), `backgroundColor: '#FFFFFF'`.
- **Category Squircle Icon Badge:** `48x48px`, `borderRadius: 14px`, centered white icon (`22px`) or emoji.
- **Bottom Action Pill Buttons (`+ Income` / `- Expenses`):** Height `56px`, `borderRadius: 28px` (`rounded-full`), bold `16px` white text, side-by-side in a 2-column row (`gap: 12px`).
- **Amount Input Field (in Add Sheet):** Height `68px`, `borderRadius: 18px`, `borderWidth: 2px`.
  - When adding **Income**: Focus border is `#141414` (Black) with an orange cursor.
  - When adding **Expense**: Focus border is `#FF5A1F` (Orange).
  - Font size inside amount box: `32px` bold with leading `৳` prefix.

## 3. Custom SVG Donut Chart Specs

- **Outer Diameter:** `220px`
- **Stroke Width (Ring Thickness):** `32px`
- **Segment Gap:** `2px` white separator between slices when >1 category exists.
- **Center Label:**
  - Subtitle: `13px` `#71717A` (`Spent in November` or `Earned in November`)
  - Amount: `28px` ExtraBold `#18181B` (`৳7,565`)
  