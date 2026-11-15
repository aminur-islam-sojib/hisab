import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { toMinorUnits } from '@/utils/currency';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export interface BudgetSettingsCardProps {
  className?: string;
}

export function BudgetSettingsCard({ className = '' }: BudgetSettingsCardProps) {
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);

  const [dailyStr, setDailyStr] = useState((settings.dailyLimitMinor / 100).toString());
  const [monthlyStr, setMonthlyStr] = useState((settings.monthlyLimitMinor / 100).toString());
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    const dailyNum = parseFloat(dailyStr);
    const monthlyNum = parseFloat(monthlyStr);

    if (isNaN(dailyNum) || dailyNum < 0 || isNaN(monthlyNum) || monthlyNum < 0) {
      Alert.alert('Invalid Limits', 'Please enter valid non-negative numbers for budget limits.');
      return;
    }

    updateSettings({
      dailyLimitMinor: toMinorUnits(dailyNum),
      monthlyLimitMinor: toMinorUnits(monthlyNum),
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <Card className={`mb-3.5 ${className}`}>
      <Text className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-3">
        Budget Limits ({settings.currencySymbol})
      </Text>

      <View className="gap-3">
        <Input
          label="Daily Budget Limit"
          placeholder="500"
          keyboardType="numeric"
          value={dailyStr}
          onChangeText={setDailyStr}
          leftIcon={<Text className="font-bold text-[#FF5A1F]">{settings.currencySymbol}</Text>}
        />

        <Input
          label="Monthly Budget Limit"
          placeholder="15000"
          keyboardType="numeric"
          value={monthlyStr}
          onChangeText={setMonthlyStr}
          leftIcon={<Text className="font-bold text-[#FF5A1F]">{settings.currencySymbol}</Text>}
        />

        <Button
          title={isSaved ? 'Budget Saved!' : 'Save Budget Limits'}
          variant={isSaved ? 'secondary' : 'primary'}
          size="md"
          onPress={handleSave}
          className="mt-1"
        />
      </View>
    </Card>
  );
}
