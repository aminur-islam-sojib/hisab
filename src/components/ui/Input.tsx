import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TextInputProps,
  StyleSheet,
} from 'react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  containerClassName = '',
  style,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`w-full ${containerClassName}`}>
      {label && (
        <Text className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-1.5 ml-1">
          {label}
        </Text>
      )}
      <View
        style={[
          styles.container,
          isFocused && styles.focused,
          Boolean(error) && styles.hasError,
        ]}
        className="flex-row items-center bg-white rounded-2xl px-3.5 h-12 border border-[#E4E0D8]"
      >
        {leftIcon && <View className="mr-2.5">{leftIcon}</View>}
        <TextInput
          placeholderTextColor="#A1A1AA"
          style={[styles.input, style]}
          className="flex-1 text-base text-[#18181B]"
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {rightIcon && <View className="ml-2.5">{rightIcon}</View>}
      </View>
      {error && (
        <Text className="text-xs text-[#DC2626] mt-1 ml-1 font-medium">{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
  },
  focused: {
    borderColor: '#FF5A1F',
    borderWidth: 1.5,
  },
  hasError: {
    borderColor: '#DC2626',
    borderWidth: 1.5,
  },
  input: {
    paddingVertical: 0,
  },
});
