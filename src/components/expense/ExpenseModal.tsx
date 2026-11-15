import React, { useState, useMemo, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {
  format,
  subDays,
  addDays,
  isToday as checkIsToday,
  isYesterday as checkIsYesterday,
} from 'date-fns';
import { useAppStore } from '@/store/useAppStore';
import { Expense, PaymentMethod, TransactionType } from '@/models/schema';
import {
  formatDateToLocalString,
  getLocalTodayDateString,
  parseLocalDateString,
} from '@/utils/date';
import { parseCurrencyInput } from '@/utils/currency';
import { Icon } from '@/components/ui/Icon';
import { CategoryPickerGrid } from '@/components/expense/CategoryPickerGrid';
import { PaymentMethodSelector } from '@/components/expense/PaymentMethodSelector';

export interface ExpenseModalProps {
  visible: boolean;
  type?: TransactionType;
  expenseToEdit?: Expense | null;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#FF5A1F',
  '#2563EB',
  '#18181B',
  '#EAB308',
  '#E11D48',
  '#059669',
  '#06B6D4',
  '#854D0E',
  '#F97316',
  '#64748B',
];

const PRESET_ICONS = [
  'Utensils',
  'Bus',
  'Home',
  'Receipt',
  'ShoppingBag',
  'HeartPulse',
  'Wifi',
  'Film',
  'Users',
  'GraduationCap',
  'Laptop',
  'ShoppingCart',
  'Briefcase',
  'Gift',
  'DollarSign',
];

export function ExpenseModal({
  visible,
  type = 'expense',
  expenseToEdit,
  onClose,
}: ExpenseModalProps) {
  const categories = useAppStore((state) => state.categories);
  const settings = useAppStore((state) => state.settings);
  const addExpense = useAppStore((state) => state.addExpense);
  const updateExpense = useAppStore((state) => state.updateExpense);
  const deleteExpense = useAppStore((state) => state.deleteExpense);
  const addCategory = useAppStore((state) => state.addCategory);

  const transactionType: TransactionType = expenseToEdit?.type ?? type;

  const activeCategories = useMemo(() => {
    const filtered = categories.filter(
      (c) => !c.isArchived && ((c.type ?? 'expense') === transactionType || c.type === 'both')
    );
    return filtered.length > 0 ? filtered : categories.filter((c) => !c.isArchived);
  }, [categories, transactionType]);

  const defaultCategoryId = activeCategories[0]?.id ?? 'cat_food';

  const [amountStr, setAmountStr] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>(defaultCategoryId);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [note, setNote] = useState<string>('');
  const [spentAtDate, setSpentAtDate] = useState<string>(getLocalTodayDateString());

  // Date picker expand toggle
  const [showDateSelector, setShowDateSelector] = useState(false);

  // Quick category creation modal state
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0]);
  const [newCatIcon, setNewCatIcon] = useState(PRESET_ICONS[0]);

  // Sync form state whenever modal opens or expenseToEdit changes
  useEffect(() => {
    if (visible) {
      if (expenseToEdit) {
        setAmountStr((expenseToEdit.amountMinor / 100).toString());
        setCategoryId(expenseToEdit.categoryId);
        setPaymentMethod(expenseToEdit.paymentMethod);
        setNote(expenseToEdit.note ?? '');
        setSpentAtDate(expenseToEdit.spentAtDate);
      } else {
        setAmountStr('');
        setCategoryId(activeCategories[0]?.id ?? 'cat_food');
        setPaymentMethod('cash');
        setNote('');
        setSpentAtDate(getLocalTodayDateString());
      }
      setShowDateSelector(false);
      setShowAddCategoryModal(false);
    }
  }, [visible, expenseToEdit, transactionType, activeCategories]);

  // Ensure categoryId is valid for current category list
  useEffect(() => {
    if (visible && !activeCategories.some((c) => c.id === categoryId)) {
      if (activeCategories[0]) {
        setCategoryId(activeCategories[0].id);
      }
    }
  }, [visible, activeCategories, categoryId]);

  const parsedDate = parseLocalDateString(spentAtDate);
  const isToday = checkIsToday(parsedDate);
  const isYesterday = checkIsYesterday(parsedDate);

  let datePrefix = '';
  if (isToday) datePrefix = 'Today · ';
  else if (isYesterday) datePrefix = 'Yesterday · ';

  const formattedDate = format(parsedDate, 'EEE, d MMM');
  const isValidAmount = parseCurrencyInput(amountStr) > 0;

  const displayTitle = expenseToEdit
    ? transactionType === 'income' ? 'Edit income' : 'Edit expense'
    : transactionType === 'income' ? 'Add income' : 'Add expense';

  const handleAmountChange = (text: string) => {
    const sanitized = text.replace(/,/g, '.').replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setAmountStr(sanitized);
  };

  const handleShiftDate = (days: number) => {
    const nextDate = addDays(parsedDate, days);
    setSpentAtDate(formatDateToLocalString(nextDate));
  };

  const handleSubmit = () => {
    const amountMinor = parseCurrencyInput(amountStr);

    if (amountMinor <= 0) {
      Alert.alert('Invalid Amount', 'Please enter an amount greater than 0.');
      return;
    }

    if (!categoryId) {
      Alert.alert('Select Category', 'Please choose a category.');
      return;
    }

    if (expenseToEdit) {
      updateExpense(expenseToEdit.id, {
        amountMinor,
        categoryId,
        paymentMethod,
        note: note.trim(),
        spentAtDate,
        type: transactionType,
      });
    } else {
      addExpense({
        amountMinor,
        categoryId,
        paymentMethod,
        note: note.trim(),
        spentAtDate,
        type: transactionType,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (!expenseToEdit) return;

    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteExpense(expenseToEdit.id);
            onClose();
          },
        },
      ]
    );
  };

  const handleCreateCategory = () => {
    const trimmed = newCatName.trim();
    if (!trimmed) {
      Alert.alert('Category Name Required', 'Please provide a name for the new category.');
      return;
    }

    const newId = `cat_${Date.now()}`;
    addCategory({
      name: trimmed,
      icon: newCatIcon,
      color: newCatColor,
      type: transactionType,
      isArchived: false,
      sortOrder: categories.length,
    });

    setCategoryId(newId);
    setNewCatName('');
    setShowAddCategoryModal(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        {/* Backdrop overlay */}
        <Pressable
          onPress={onClose}
          style={styles.backdrop}
        />

        {/* Bottom Sheet Modal Container */}
        <View style={styles.sheetContainer} className="bg-[#FAF8F5] rounded-t-[32px] pt-2 px-5 border-t border-[#E4E0D8]">
          {/* Top Pill Handle */}
          <View style={styles.grabHandle} className="bg-[#D1CDC7] rounded-full self-center mb-2 mt-1" />

          {/* Scrollable Form Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header Row */}
            <View className="flex-row items-start justify-between mt-1 mb-1">
              <View className="flex-1">
                <Text className="text-3xl font-extrabold text-[#18181B] tracking-tight">
                  {displayTitle}
                </Text>

                {/* Date line: Today · Sun, 15 Nov · change */}
                <Pressable
                  onPress={() => setShowDateSelector((prev) => !prev)}
                  hitSlop={8}
                  className="flex-row items-center mt-1 py-1"
                >
                  <Text className="text-sm font-medium text-[#71717A]">
                    {datePrefix}{formattedDate} ·{' '}
                    <Text className="font-bold text-[#18181B] underline">
                      change
                    </Text>
                  </Text>
                </Pressable>
              </View>

              {/* Actions: Delete or Close */}
              <View className="flex-row items-center gap-2">
                {expenseToEdit && (
                  <Pressable
                    hitSlop={10}
                    onPress={handleDelete}
                    style={styles.headerBtn}
                    className="items-center justify-center rounded-full bg-[#FEECEC] border border-[#FACDCD]"
                  >
                    <Icon name="Trash2" size={17} color="#DC2626" />
                  </Pressable>
                )}
                <Pressable
                  hitSlop={10}
                  onPress={onClose}
                  style={styles.headerBtn}
                  className="items-center justify-center rounded-full bg-white border border-[#E4E0D8]"
                >
                  <Icon name="X" size={18} color="#18181B" />
                </Pressable>
              </View>
            </View>

            {/* Collapsible Date Selector Bar */}
            {showDateSelector && (
              <View className="flex-row items-center justify-between bg-white rounded-2xl p-2.5 my-2 border border-[#E4E0D8]">
                <Pressable
                  onPress={() => handleShiftDate(-1)}
                  style={styles.dateCircleBtn}
                  className="rounded-full bg-[#FAF8F5] border border-[#E4E0D8] items-center justify-center"
                >
                  <Icon name="ChevronLeft" size={18} color="#18181B" />
                </Pressable>

                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => {
                      setSpentAtDate(getLocalTodayDateString());
                      setShowDateSelector(false);
                    }}
                    className={`px-3 py-1.5 rounded-full ${
                      isToday ? 'bg-[#FF5A1F]' : 'bg-[#FAF8F5] border border-[#E4E0D8]'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${isToday ? 'text-white' : 'text-[#71717A]'}`}>
                      Today
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setSpentAtDate(formatDateToLocalString(subDays(new Date(), 1)));
                      setShowDateSelector(false);
                    }}
                    className={`px-3 py-1.5 rounded-full ${
                      isYesterday ? 'bg-[#FF5A1F]' : 'bg-[#FAF8F5] border border-[#E4E0D8]'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${isYesterday ? 'text-white' : 'text-[#71717A]'}`}>
                      Yesterday
                    </Text>
                  </Pressable>
                </View>

                <Pressable
                  onPress={() => handleShiftDate(1)}
                  disabled={isToday}
                  style={[styles.dateCircleBtn, isToday && styles.disabledDateBtn]}
                  className="rounded-full bg-[#FAF8F5] border border-[#E4E0D8] items-center justify-center"
                >
                  <Icon name="ChevronRight" size={18} color={isToday ? '#A1A1AA' : '#18181B'} />
                </Pressable>
              </View>
            )}

            {/* Amount Card: Orange border for expense, Charcoal border for income */}
            <View
              style={[
                styles.amountCard,
                transactionType === 'income' ? styles.amountCardIncome : styles.amountCardExpense,
              ]}
              className="bg-white rounded-3xl px-5 py-3 my-2 justify-center shadow-sm"
            >
              <View className="flex-row items-center">
                <Text className="text-3xl font-extrabold text-[#18181B] mr-2">
                  {settings.currencySymbol}
                </Text>
                <TextInput
                  value={amountStr}
                  onChangeText={handleAmountChange}
                  placeholder="0"
                  placeholderTextColor="#D1CDC7"
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  autoFocus={!expenseToEdit}
                  selectTextOnFocus
                  style={styles.amountInput}
                />
              </View>
            </View>

            {/* Note Card */}
            <View
              style={styles.noteCard}
              className="bg-white rounded-3xl border border-[#E4E0D8] px-5 py-3 mb-4 justify-center shadow-sm"
            >
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Note: what was it for?"
                placeholderTextColor="#A1A1AA"
                style={styles.noteInput}
                className="text-base text-[#18181B]"
              />
            </View>

            {/* Category Section Header */}
            <Text className="text-base font-bold text-[#18181B] mb-3 ml-0.5">
              Category
            </Text>

            {/* 4-Column Category Grid */}
            <CategoryPickerGrid
              categories={activeCategories}
              selectedCategoryId={categoryId}
              onSelectCategory={setCategoryId}
              onAddCategoryPress={() => setShowAddCategoryModal(true)}
              className="mb-2"
            />

            {/* Payment Method Selector */}
            <View className="my-3">
              <Text className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-2 ml-0.5">
                Payment Method
              </Text>
              <PaymentMethodSelector
                selected={paymentMethod}
                onSelect={setPaymentMethod}
              />
            </View>

            {/* Save Action Button */}
            <Pressable
              onPress={handleSubmit}
              disabled={!isValidAmount}
              style={[
                styles.saveBtn,
                isValidAmount
                  ? transactionType === 'income'
                    ? styles.saveBtnActiveIncome
                    : styles.saveBtnActiveExpense
                  : styles.saveBtnDisabled,
              ]}
              className={`w-full rounded-2xl items-center justify-center mt-2 mb-8 ${
                isValidAmount
                  ? transactionType === 'income'
                    ? 'bg-[#18181B]'
                    : 'bg-[#FF5A1F]'
                  : 'bg-[#D9D6CE]'
              }`}
            >
              <Text
                className={`text-base font-bold ${
                  isValidAmount ? 'text-white' : 'text-[#78756E]'
                }`}
              >
                Save
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Quick Add Category Modal */}
      <Modal
        visible={showAddCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddCategoryModal(false)}
      >
        <View style={styles.quickModalOverlay} className="flex-1 justify-center items-center p-5">
          <View className="bg-white rounded-3xl p-5 w-full max-w-sm border border-[#E4E0D8] shadow-lg">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-[#18181B]">
                New {transactionType === 'income' ? 'Income' : 'Expense'} Category
              </Text>
              <Pressable
                hitSlop={8}
                onPress={() => setShowAddCategoryModal(false)}
                className="w-8 h-8 rounded-full bg-[#FAF8F5] items-center justify-center border border-[#E4E0D8]"
              >
                <Icon name="X" size={16} color="#18181B" />
              </Pressable>
            </View>

            <TextInput
              value={newCatName}
              onChangeText={setNewCatName}
              placeholder="Category name (e.g. Bonus, Petrol)"
              placeholderTextColor="#A1A1AA"
              className="bg-[#FAF8F5] rounded-2xl px-4 py-3 text-base text-[#18181B] border border-[#E4E0D8] mb-4"
            />

            {/* Color Swatches */}
            <Text className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-2">
              Color
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {PRESET_COLORS.map((col) => (
                <Pressable
                  key={col}
                  onPress={() => setNewCatColor(col)}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: col },
                    newCatColor === col && styles.selectedSwatch,
                  ]}
                />
              ))}
            </View>

            {/* Icon Picker */}
            <Text className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-2">
              Icon
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-5">
              {PRESET_ICONS.map((iconName) => (
                <Pressable
                  key={iconName}
                  onPress={() => setNewCatIcon(iconName)}
                  style={[
                    styles.iconOption,
                    newCatIcon === iconName && styles.selectedIconOption,
                  ]}
                  className="rounded-xl items-center justify-center bg-[#FAF8F5] border border-[#E4E0D8]"
                >
                  <Icon
                    name={iconName}
                    size={20}
                    color={newCatIcon === iconName ? '#FF5A1F' : '#71717A'}
                  />
                </Pressable>
              ))}
            </View>

            {/* Create Button */}
            <Pressable
              onPress={handleCreateCategory}
              className={`rounded-2xl py-3.5 items-center justify-center ${
                transactionType === 'income' ? 'bg-[#18181B]' : 'bg-[#FF5A1F]'
              }`}
            >
              <Text className="text-white font-bold text-base">Add Category</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheetContainer: {
    marginTop: 'auto',
    maxHeight: '92%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  grabHandle: {
    width: 44,
    height: 5,
  },
  headerBtn: {
    width: 36,
    height: 36,
  },
  dateCircleBtn: {
    width: 34,
    height: 34,
  },
  disabledDateBtn: {
    opacity: 0.35,
  },
  amountCard: {
    minHeight: 74,
  },
  amountCardExpense: {
    borderWidth: 2,
    borderColor: '#FF5A1F',
  },
  amountCardIncome: {
    borderWidth: 2,
    borderColor: '#18181B',
  },
  amountInput: {
    flex: 1,
    fontSize: 34,
    fontWeight: '800',
    color: '#18181B',
    paddingVertical: 0,
  },
  noteCard: {
    minHeight: 52,
  },
  noteInput: {
    paddingVertical: 0,
    fontSize: 15,
  },
  saveBtn: {
    minHeight: 52,
  },
  saveBtnActiveExpense: {
    shadowColor: '#FF5A1F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtnActiveIncome: {
    shadowColor: '#18181B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtnDisabled: {},
  scrollContent: {
    paddingBottom: 24,
  },
  quickModalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  selectedSwatch: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#18181B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  iconOption: {
    width: 40,
    height: 40,
  },
  selectedIconOption: {
    borderColor: '#FF5A1F',
    borderWidth: 2,
    backgroundColor: '#FFF0EB',
  },
});
