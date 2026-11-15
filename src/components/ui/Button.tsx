import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  View,
  StyleSheet,
  PressableProps,
} from 'react-native';

export type ButtonVariant = 'primary' | 'dark' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  title?: string;
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
}

export function Button({
  title,
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  className = '',
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  // Base styling classes
  const sizeClasses: Record<ButtonSize, { container: string; text: string }> = {
    sm: { container: 'h-10 min-h-[44px] px-3 rounded-xl', text: 'text-sm font-semibold' },
    md: { container: 'h-12 min-h-[44px] px-5 rounded-2xl', text: 'text-base font-semibold' },
    lg: { container: 'h-14 min-h-[44px] px-6 rounded-full', text: 'text-base font-bold' },
  };

  const variantClasses: Record<ButtonVariant, { container: string; text: string; spinner: string }> = {
    primary: {
      container: isDisabled ? 'bg-[#D9D6CE]' : 'bg-[#FF5A1F]',
      text: isDisabled ? 'text-[#78756E]' : 'text-white',
      spinner: '#FFFFFF',
    },
    dark: {
      container: isDisabled ? 'bg-[#D9D6CE]' : 'bg-[#141414]',
      text: isDisabled ? 'text-[#78756E]' : 'text-white',
      spinner: '#FFFFFF',
    },
    secondary: {
      container: isDisabled
        ? 'bg-[#F7F4EF] border border-[#E4E0D8]'
        : 'bg-[#FAF8F5] border border-[#E4E0D8]',
      text: isDisabled ? 'text-[#78756E]' : 'text-[#18181B]',
      spinner: '#18181B',
    },
    danger: {
      container: isDisabled ? 'bg-[#D9D6CE]' : 'bg-[#DC2626]',
      text: isDisabled ? 'text-[#78756E]' : 'text-white',
      spinner: '#FFFFFF',
    },
    ghost: {
      container: 'bg-transparent',
      text: isDisabled ? 'text-[#78756E]' : 'text-[#71717A]',
      spinner: '#71717A',
    },
  };

  const currentSize = sizeClasses[size];
  const currentVariant = variantClasses[variant];

  return (
    <Pressable
      disabled={isDisabled}
      style={(state) => [
        state.pressed && !isDisabled && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}
      className={`flex-row items-center justify-center ${currentSize.container} ${currentVariant.container} ${className}`}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={currentVariant.spinner} />
      ) : (
        <>
          {icon && iconPosition === 'left' && <View className="mr-2">{icon}</View>}
          {title ? (
            <Text className={`${currentSize.text} ${currentVariant.text}`}>{title}</Text>
          ) : (
            children
          )}
          {icon && iconPosition === 'right' && <View className="ml-2">{icon}</View>}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
