import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HistoryScreen() {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F7F4EF]">
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-xl font-bold text-[#18181B]">Transaction History</Text>
        <Text className="text-sm text-[#71717A] mt-1">Coming in Milestone 4</Text>
      </View>
    </SafeAreaView>
  );
}
