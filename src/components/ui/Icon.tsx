import React from 'react';
import {
  Utensils,
  Coffee,
  Bus,
  ShoppingBag,
  Receipt,
  Tag,
  HeartPulse,
  MoreHorizontal,
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2,
  CreditCard,
  Wallet,
  Building2,
  Smartphone,
  TrendingUp,
  History,
  Settings,
  AlertCircle,
  Check,
  X,
  Search,
  Share2,
  FileText,
  Upload,
  Download,
  RotateCcw,
  Sliders,
  HelpCircle,
  PieChart,
  ArrowRight,
  Filter,
  DollarSign,
  LucideIcon,
  LucideProps,
  Delete,
} from 'lucide-react-native';

export const ICON_MAP: Record<string, LucideIcon> = {
  Utensils,
  Coffee,
  Bus,
  ShoppingBag,
  Receipt,
  Tag,
  HeartPulse,
  MoreHorizontal,
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2,
  CreditCard,
  Wallet,
  Building2,
  Smartphone,
  TrendingUp,
  History,
  Settings,
  AlertCircle,
  Check,
  X,
  Search,
  Share2,
  FileText,
  Upload,
  Download,
  RotateCcw,
  Sliders,
  PieChart,
  ArrowRight,
  Filter,
  DollarSign,
  HelpCircle,
  Delete,
};

import { ColorValue } from 'react-native';

export type IconName = keyof typeof ICON_MAP | string;

export interface IconProps extends Omit<LucideProps, 'color'> {
  name: IconName;
  size?: number;
  color?: ColorValue | string;
  strokeWidth?: number;
}

export function Icon({
  name,
  size = 20,
  color = '#18181B',
  strokeWidth = 2,
  ...rest
}: IconProps) {
  const Component = ICON_MAP[name] ?? HelpCircle;
  return (
    <Component
      size={size}
      color={color ? String(color) : '#18181B'}
      strokeWidth={strokeWidth}
      {...rest}
    />
  );
}
