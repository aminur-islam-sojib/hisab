import React from 'react';
import { View, Pressable, ViewProps, StyleSheet, Platform } from 'react-native';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
}

export function Card({ children, onPress, className = '', style, ...rest }: CardProps) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={(state) => [
          styles.card,
          state.pressed && styles.pressed,
          style,
        ]}
        className={`bg-white rounded-3xl p-[18px] border border-[#E4E0D8] ${className}`}
        {...rest}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View
      style={[styles.card, style]}
      className={`bg-white rounded-3xl p-[18px] border border-[#E4E0D8] ${className}`}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#18181B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
});
