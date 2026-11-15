import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { useAppStore } from "@/store/useAppStore";

export default function RootLayout() {
  const hasHydrated = useAppStore((state) => state.hasHydrated);

  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F7F4EF" }}>
        <ActivityIndicator size="large" color="#FF5A1F" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
