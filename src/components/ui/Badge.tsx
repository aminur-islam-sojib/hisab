import React from 'react';
import { View, Text, ViewProps } from 'react-native';

export type BadgeVariant =
  | 'default'
  | 'accent'
  | 'income'
  | 'warning'
  | 'danger'
  | 'outline'
  | 'neutral';

export interface BadgeProps extends ViewProps {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export function Badge({
  label,
  variant = 'default',
  icon,
  className = '',
  size = 'md',
  ...rest
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, { container: string; text: string }> = {
    default: {
      container: 'bg-[#F4F1EA] border border-[#E4E0D8]',
      text: 'text-[#18181B]',
    },
    neutral: {
      container: 'bg-[#E4E0D8]/40 border border-transparent',
      text: 'text-[#71717A]',
    },
    accent: {
      container: 'bg-[#FF5A1F]/10 border border-[#FF5A1F]/20',
      text: 'text-[#FF5A1F]',
    },
    income: {
      container: 'bg-[#16A34A]/10 border border-[#16A34A]/20',
      text: 'text-[#16A34A]',
    },
    warning: {
      container: 'bg-[#EAB308]/15 border border-[#EAB308]/30',
      text: 'text-[#B45309]',
    },
    danger: {
      container: 'bg-[#DC2626]/10 border border-[#DC2626]/20',
      text: 'text-[#DC2626]',
    },
    outline: {
      container: 'bg-transparent border border-[#E4E0D8]',
      text: 'text-[#71717A]',
    },
  };

  const sizeStyles = {
    sm: { container: 'py-0.5 px-2 rounded-full', text: 'text-xs font-medium' },
    md: { container: 'py-1 px-2.5 rounded-full', text: 'text-xs font-semibold' },
  };

  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];

  return (
    <View
      className={`flex-row items-center self-start ${currentSize.container} ${currentVariant.container} ${className}`}
      {...rest}
    >
      {icon && <View className="mr-1">{icon}</View>}
      <Text className={`${currentSize.text} ${currentVariant.text}`}>{label}</Text>
    </View>
  );
}
