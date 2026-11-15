import React from 'react';
import { Tabs } from 'expo-router';
import { useDrawerStore } from '@/store/useDrawerStore';
import { AppDrawer } from '@/components/navigation/AppDrawer';

export default function TabsLayout() {
  const isOpen = useDrawerStore((s) => s.isOpen);
  const activeRoute = useDrawerStore((s) => s.activeRoute);
  const closeDrawer = useDrawerStore((s) => s.closeDrawer);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="analytics" options={{ title: 'Statistics' }} />
        <Tabs.Screen name="history" options={{ title: 'History' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      </Tabs>

      {/* Global Right-Side Menu Drawer accessible across all screens */}
      <AppDrawer
        visible={isOpen}
        activeRoute={activeRoute}
        onClose={closeDrawer}
      />
    </>
  );
}
