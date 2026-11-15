---
name: build-feature
description: Step-by-step workflow for implementing a new screen, component, or store milestone in the Daily Cost Manager Expo app.
---

# Build Feature Workflow

Whenever you are asked to build a milestone from `docs/TASKS.md` or add a new feature, execute these exact steps in order:

## Step 1: Context Check
1. Read `GEMINI.md`, `docs/SCHEMA.md`, and `docs/TASKS.md` to confirm data contracts and current progress.
2. Verify whether required types/schemas already exist in `src/models/schema.ts` and actions exist in `src/store/useAppStore.ts`.

## Step 2: Model & Store First
1. If new state or selectors are needed, implement or update `src/models/schema.ts`, `src/store/useAppStore.ts`, and `src/store/selectors.ts` before writing UI code.
2. Ensure all monetary inputs are converted to integer minor units (`amountMinor`) and dates use local `YYYY-MM-DD` strings.

## Step 3: UI Implementation
1. Build reusable domain components in `src/components/expense/` or atomic components in `src/components/ui/`.
2. Connect the screen in `src/app/` to `useAppStore` using granular selectors so components only re-render when their specific slice changes.

## Step 4: Self-Verification & Checklist Update
1. Run `npx tsc --noEmit` in the terminal.
2. If TypeScript reports any errors, fix them immediately before finishing your turn.
3. Check off the completed items (`- [x]`) in `docs/TASKS.md`.