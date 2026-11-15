import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Icon } from '@/components/ui/Icon';

export interface NumericKeypadProps {
  value: string;
  onChangeValue: (nextValue: string) => void;
  onDone?: () => void;
  className?: string;
}

/**
 * Evaluates inline + / - mathematical expressions safely without eval.
 */
export function evaluateExpression(expr: string): number {
  if (!expr || expr.trim() === '') return 0;
  const sanitized = expr.replace(/,/g, '').trim();
  const tokens = sanitized.match(/(\d+(?:\.\d+)?|[+\-])/g);
  if (!tokens || tokens.length === 0) return 0;

  let total = 0;
  let currentOp: '+' | '-' = '+';

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === '+' || token === '-') {
      currentOp = token;
    } else {
      const num = parseFloat(token);
      if (!isNaN(num)) {
        if (currentOp === '+') {
          total += num;
        } else if (currentOp === '-') {
          total -= num;
        }
      }
    }
  }

  return Math.max(0, total);
}

const QUICK_CHIPS = [50, 100, 500];

export function NumericKeypad({
  value,
  onChangeValue,
  onDone,
  className = '',
}: NumericKeypadProps) {
  const handleDigit = (digit: string) => {
    if (!value || value === '0') {
      onChangeValue(digit);
    } else {
      onChangeValue(value + digit);
    }
  };

  const handleDecimal = () => {
    if (!value || value === '0') {
      onChangeValue('0.');
      return;
    }

    // Check if the current trailing number segment already has a decimal
    const segments = value.split(/[+\-]/);
    const lastSegment = segments[segments.length - 1];
    if (!lastSegment.includes('.')) {
      onChangeValue(value + '.');
    }
  };

  const handleOperator = (op: '+' | '-') => {
    if (!value || value.trim() === '') return;

    const trimmed = value.trim();
    const lastChar = trimmed[trimmed.length - 1];

    if (lastChar === '+' || lastChar === '-') {
      // Replace existing trailing operator
      onChangeValue(trimmed.slice(0, -1).trim() + ` ${op} `);
    } else {
      onChangeValue(`${trimmed} ${op} `);
    }
  };

  const handleBackspace = () => {
    if (!value || value.length === 0) return;

    const trimmed = value.trimEnd();
    const lastChar = trimmed[trimmed.length - 1];

    // If deleting an operator with spacing like " + "
    if (lastChar === '+' || lastChar === '-') {
      onChangeValue(trimmed.slice(0, -1).trimEnd());
    } else {
      const next = trimmed.slice(0, -1);
      onChangeValue(next === '' ? '0' : next);
    }
  };

  const handleClear = () => {
    onChangeValue('0');
  };

  const handleEvaluate = () => {
    const result = evaluateExpression(value);
    const formatted = Number.isInteger(result) ? result.toString() : result.toFixed(2);
    onChangeValue(formatted);
    onDone?.();
  };

  const handleQuickChip = (amount: number) => {
    const current = evaluateExpression(value);
    const nextTotal = current + amount;
    onChangeValue(nextTotal.toString());
  };

  return (
    <View className={`w-full ${className}`}>
      {/* Quick Add Chips */}
      <View className="flex-row items-center justify-between mb-2.5 px-0.5">
        {QUICK_CHIPS.map((chip) => (
          <Pressable
            key={chip}
            onPress={() => handleQuickChip(chip)}
            style={styles.chip}
            className="flex-1 mx-1 bg-white border border-[#E4E0D8] rounded-xl py-2 items-center justify-center shadow-sm"
          >
            <Text className="text-xs font-bold text-[#FF5A1F]">+{chip}</Text>
          </Pressable>
        ))}
      </View>

      {/* Keypad Grid */}
      <View className="gap-2">
        {/* Row 1 */}
        <View className="flex-row gap-2">
          <KeypadButton label="1" onPress={() => handleDigit('1')} />
          <KeypadButton label="2" onPress={() => handleDigit('2')} />
          <KeypadButton label="3" onPress={() => handleDigit('3')} />
          <KeypadButton
            label="+"
            variant="operator"
            onPress={() => handleOperator('+')}
          />
        </View>

        {/* Row 2 */}
        <View className="flex-row gap-2">
          <KeypadButton label="4" onPress={() => handleDigit('4')} />
          <KeypadButton label="5" onPress={() => handleDigit('5')} />
          <KeypadButton label="6" onPress={() => handleDigit('6')} />
          <KeypadButton
            label="−"
            variant="operator"
            onPress={() => handleOperator('-')}
          />
        </View>

        {/* Row 3 */}
        <View className="flex-row gap-2">
          <KeypadButton label="7" onPress={() => handleDigit('7')} />
          <KeypadButton label="8" onPress={() => handleDigit('8')} />
          <KeypadButton label="9" onPress={() => handleDigit('9')} />
          <KeypadButton
            icon={<Icon name="Delete" size={20} color="#71717A" />}
            variant="action"
            onPress={handleBackspace}
          />
        </View>

        {/* Row 4 */}
        <View className="flex-row gap-2">
          <KeypadButton label="C" variant="action" onPress={handleClear} />
          <KeypadButton label="0" onPress={() => handleDigit('0')} />
          <KeypadButton label="." onPress={handleDecimal} />
          <KeypadButton
            label="="
            variant="primary"
            onPress={handleEvaluate}
          />
        </View>
      </View>
    </View>
  );
}

interface KeypadButtonProps {
  label?: string;
  icon?: React.ReactNode;
  variant?: 'digit' | 'operator' | 'action' | 'primary';
  onPress: () => void;
}

function KeypadButton({
  label,
  icon,
  variant = 'digit',
  onPress,
}: KeypadButtonProps) {
  const variantStyles = {
    digit: {
      container: 'bg-white border-[#E4E0D8] shadow-sm',
      text: 'text-[#18181B] font-bold text-xl',
    },
    operator: {
      container: 'bg-[#F4F1EA] border-[#E4E0D8]',
      text: 'text-[#FF5A1F] font-extrabold text-2xl',
    },
    action: {
      container: 'bg-[#F4F1EA] border-[#E4E0D8]',
      text: 'text-[#71717A] font-bold text-base',
    },
    primary: {
      container: 'bg-[#FF5A1F] border-transparent shadow-sm',
      text: 'text-white font-extrabold text-2xl',
    },
  };

  const current = variantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      style={styles.key}
      className={`flex-1 rounded-2xl items-center justify-center border ${current.container}`}
    >
      {icon ? icon : <Text className={current.text}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 38,
  },
  key: {
    minHeight: 52,
  },
});
