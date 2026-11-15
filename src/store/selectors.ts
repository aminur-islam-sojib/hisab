import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  differenceInCalendarDays,
} from 'date-fns';
import {
  BudgetSettings,
  Category,
  Expense,
  PaymentMethod,
} from '@/models/schema';
import {
  formatDateToLocalString,
  formatDisplayHeader,
  getLocalTodayDateString,
  isDateInMonth,
  isDateInRange,
  isDateInWeek,
  parseLocalDateString,
} from '@/utils/date';

export interface DailyProgressResult {
  spentMinor: number;
  limitMinor: number;
  percentage: number;
  remainingMinor: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
}

export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  icon: string;
  color: string;
  amountMinor: number;
  percentage: number;
  transactionCount: number;
}

export interface AnalyticsSummaryResult {
  totalSpendMinor: number;
  dailyAverageMinor: number;
  highestSpendDay: { date: string; amountMinor: number } | null;
  budgetLimitMinor: number;
  transactionCount: number;
}

export interface DailyChartPoint {
  date: string;
  label: string;
  amountMinor: number;
}

export interface HistorySectionItem {
  title: string;
  date: string;
  totalMinor: number;
  data: Expense[];
}

export interface ExpenseFilterOptions {
  date?: string;
  paymentMethod?: PaymentMethod | 'all';
  categoryId?: string;
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Creates an ID-to-Category lookup map for fast resolution.
 */
export function selectCategoryMap(categories: Category[]): Map<string, Category> {
  const map = new Map<string, Category>();
  for (const cat of categories) {
    map.set(cat.id, cat);
  }
  return map;
}

/**
 * Returns non-archived categories sorted by sortOrder.
 */
export function selectActiveCategories(categories: Category[]): Category[] {
  return categories
    .filter((cat) => !cat.isArchived)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Filters expenses matching a specific local 'YYYY-MM-DD'.
 */
export function selectExpensesByDate(expenses: Expense[], dateStr: string): Expense[] {
  return expenses.filter((e) => e.spentAtDate === dateStr);
}

/**
 * Computes the total minor unit amount spent on a specific date.
 */
export function selectDailyTotal(expenses: Expense[], dateStr: string): number {
  return expenses
    .filter((e) => e.spentAtDate === dateStr)
    .reduce((sum, e) => sum + e.amountMinor, 0);
}

/**
 * Calculates progress against the daily budget limit.
 * Alerts:
 * - isNearLimit: >= 80% and < 100%
 * - isOverBudget: >= 100%
 */
export function selectDailyProgress(
  expenses: Expense[],
  dateStr: string,
  dailyLimitMinor: number
): DailyProgressResult {
  const spentMinor = selectDailyTotal(expenses, dateStr);
  const limitMinor = Math.max(0, dailyLimitMinor);
  const percentage = limitMinor > 0 ? (spentMinor / limitMinor) * 100 : 0;
  const remainingMinor = Math.max(0, limitMinor - spentMinor);

  return {
    spentMinor,
    limitMinor,
    percentage: Math.round(percentage),
    remainingMinor,
    isOverBudget: limitMinor > 0 && spentMinor >= limitMinor,
    isNearLimit: limitMinor > 0 && percentage >= 80 && percentage < 100,
  };
}

/**
 * Filters an expense list using various criteria (date, payment method, category, query, date range).
 */
export function selectFilteredExpenses(
  expenses: Expense[],
  filters: ExpenseFilterOptions
): Expense[] {
  return expenses.filter((exp) => {
    if (filters.date && exp.spentAtDate !== filters.date) {
      return false;
    }
    if (filters.paymentMethod && filters.paymentMethod !== 'all' && exp.paymentMethod !== filters.paymentMethod) {
      return false;
    }
    if (filters.categoryId && exp.categoryId !== filters.categoryId) {
      return false;
    }
    if (filters.startDate || filters.endDate) {
      if (!isDateInRange(exp.spentAtDate, filters.startDate, filters.endDate)) {
        return false;
      }
    }
    if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
      const q = filters.searchQuery.toLowerCase().trim();
      const noteMatch = exp.note.toLowerCase().includes(q);
      if (!noteMatch) return false;
    }
    return true;
  });
}

/**
 * Returns all expenses that occurred in the specified month.
 */
export function selectExpensesForMonth(
  expenses: Expense[],
  monthDate: Date = new Date()
): Expense[] {
  return expenses.filter((exp) => isDateInMonth(exp.spentAtDate, monthDate));
}

/**
 * Returns all expenses that occurred in the specified week.
 */
export function selectExpensesForWeek(
  expenses: Expense[],
  weekDate: Date = new Date(),
  weekStartsOn: 0 | 1 | 6 = 1
): Expense[] {
  return expenses.filter((exp) => isDateInWeek(exp.spentAtDate, weekDate, weekStartsOn));
}

/**
 * Computes monthly total spend in minor units.
 */
export function selectMonthlyTotal(
  expenses: Expense[],
  monthDate: Date = new Date()
): number {
  return selectExpensesForMonth(expenses, monthDate).reduce((sum, e) => sum + e.amountMinor, 0);
}

/**
 * Computes category breakdown for a set of expenses, ranked from highest to lowest spend.
 */
export function selectCategoryBreakdown(
  expenses: Expense[],
  categories: Category[],
  options?: {
    period?: 'week' | 'month' | 'all';
    referenceDate?: Date;
    startDate?: string;
    endDate?: string;
    date?: string;
  }
): CategoryBreakdownItem[] {
  let targetExpenses = expenses;
  const refDate = options?.referenceDate ?? new Date();

  if (options?.date) {
    targetExpenses = selectExpensesByDate(expenses, options.date);
  } else if (options?.period === 'week') {
    targetExpenses = selectExpensesForWeek(expenses, refDate);
  } else if (options?.period === 'month') {
    targetExpenses = selectExpensesForMonth(expenses, refDate);
  } else if (options?.startDate || options?.endDate) {
    targetExpenses = expenses.filter((e) =>
      isDateInRange(e.spentAtDate, options.startDate, options.endDate)
    );
  }

  const totalSpendMinor = targetExpenses.reduce((sum, e) => sum + e.amountMinor, 0);
  const categoryMap = selectCategoryMap(categories);

  // Group by categoryId
  const categorySpendMap = new Map<string, { amountMinor: number; count: number }>();
  for (const exp of targetExpenses) {
    const current = categorySpendMap.get(exp.categoryId) ?? { amountMinor: 0, count: 0 };
    categorySpendMap.set(exp.categoryId, {
      amountMinor: current.amountMinor + exp.amountMinor,
      count: current.count + 1,
    });
  }

  const breakdown: CategoryBreakdownItem[] = [];
  for (const [catId, stats] of categorySpendMap.entries()) {
    const category = categoryMap.get(catId);
    const percentage = totalSpendMinor > 0 ? (stats.amountMinor / totalSpendMinor) * 100 : 0;

    breakdown.push({
      categoryId: catId,
      categoryName: category?.name ?? 'Unknown',
      icon: category?.icon ?? 'MoreHorizontal',
      color: category?.color ?? '#141414',
      amountMinor: stats.amountMinor,
      percentage: Math.round(percentage * 10) / 10,
      transactionCount: stats.count,
    });
  }

  // Rank highest spend first
  return breakdown.sort((a, b) => b.amountMinor - a.amountMinor);
}

/**
 * Computes high-level analytics for a given period ('week' | 'month').
 */
export function selectAnalyticsSummary(
  expenses: Expense[],
  settings: BudgetSettings,
  period: 'week' | 'month',
  referenceDate: Date = new Date()
): AnalyticsSummaryResult {
  const isWeek = period === 'week';
  const targetExpenses = isWeek
    ? selectExpensesForWeek(expenses, referenceDate)
    : selectExpensesForMonth(expenses, referenceDate);

  const totalSpendMinor = targetExpenses.reduce((sum, e) => sum + e.amountMinor, 0);

  // Aggregate by day to find daily average & highest spend day
  const dailySpendMap = new Map<string, number>();
  for (const exp of targetExpenses) {
    const current = dailySpendMap.get(exp.spentAtDate) ?? 0;
    dailySpendMap.set(exp.spentAtDate, current + exp.amountMinor);
  }

  let highestSpendDay: { date: string; amountMinor: number } | null = null;
  for (const [date, amount] of dailySpendMap.entries()) {
    if (!highestSpendDay || amount > highestSpendDay.amountMinor) {
      highestSpendDay = { date, amountMinor: amount };
    }
  }

  // Days in period so far or total days in period
  const start = isWeek ? startOfWeek(referenceDate, { weekStartsOn: 1 }) : startOfMonth(referenceDate);
  const end = isWeek ? endOfWeek(referenceDate, { weekStartsOn: 1 }) : endOfMonth(referenceDate);
  const totalDays = Math.max(1, differenceInCalendarDays(end, start) + 1);

  const dailyAverageMinor = Math.round(totalSpendMinor / totalDays);
  const budgetLimitMinor = isWeek ? settings.dailyLimitMinor * 7 : settings.monthlyLimitMinor;

  return {
    totalSpendMinor,
    dailyAverageMinor,
    highestSpendDay,
    budgetLimitMinor,
    transactionCount: targetExpenses.length,
  };
}

/**
 * Builds data points for vertical bar charts (e.g. 7 days or 30 days).
 */
export function selectDailySpendChartData(
  expenses: Expense[],
  period: 'week' | 'month',
  referenceDate: Date = new Date()
): DailyChartPoint[] {
  const isWeek = period === 'week';
  const start = isWeek ? startOfWeek(referenceDate, { weekStartsOn: 1 }) : startOfMonth(referenceDate);
  const end = isWeek ? endOfWeek(referenceDate, { weekStartsOn: 1 }) : endOfMonth(referenceDate);

  const intervalDays = eachDayOfInterval({ start, end });
  const spendMap = new Map<string, number>();

  for (const exp of expenses) {
    const current = spendMap.get(exp.spentAtDate) ?? 0;
    spendMap.set(exp.spentAtDate, current + exp.amountMinor);
  }

  return intervalDays.map((day) => {
    const dateStr = formatDateToLocalString(day);
    const label = isWeek ? format(day, 'EEE') : format(day, 'd');
    const amountMinor = spendMap.get(dateStr) ?? 0;

    return {
      date: dateStr,
      label,
      amountMinor,
    };
  });
}

/**
 * Groups and sorts expenses into SectionList format grouped by spentAtDate (most recent first).
 */
export function selectGroupedExpensesByDate(
  expenses: Expense[],
  filters?: ExpenseFilterOptions
): HistorySectionItem[] {
  const filtered = filters ? selectFilteredExpenses(expenses, filters) : expenses;

  // Group by date
  const groups = new Map<string, Expense[]>();
  for (const exp of filtered) {
    const list = groups.get(exp.spentAtDate) ?? [];
    list.push(exp);
    groups.set(exp.spentAtDate, list);
  }

  // Sort dates descending
  const sortedDates = Array.from(groups.keys()).sort((a, b) => b.localeCompare(a));

  return sortedDates.map((dateStr) => {
    const items = groups.get(dateStr) ?? [];
    // Sort items within group by createdAt descending
    items.sort((a, b) => b.createdAt - a.createdAt);
    const totalMinor = items.reduce((sum, item) => sum + item.amountMinor, 0);

    return {
      title: formatDisplayHeader(dateStr),
      date: dateStr,
      totalMinor,
      data: items,
    };
  });
}
