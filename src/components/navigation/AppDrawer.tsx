import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  PanResponder,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import { useAppStore } from '@/store/useAppStore';
import { DrawerRoute } from '@/store/useDrawerStore';
import { exportFullBackupJson, importAndValidateBackupJson } from '@/utils/backup';

const DRAWER_WIDTH = 300;

export interface AppDrawerProps {
  visible: boolean;
  activeRoute?: DrawerRoute;
  onClose: () => void;
  onOpenCategories?: () => void;
}

export function AppDrawer({
  visible,
  activeRoute = 'home',
  onClose,
  onOpenCategories,
}: AppDrawerProps) {
  const [isMounted, setIsMounted] = useState(visible);
  const restoreFromBackup = useAppStore((state) => state.restoreFromBackup);
  const hasAnimatedOpen = useRef(false);

  // Position starts off-screen to the RIGHT
  const translateX = useSharedValue(DRAWER_WIDTH);
  const backdropOpacity = useSharedValue(0);

  const startOpenAnimation = useCallback(() => {
    if (hasAnimatedOpen.current) return;
    hasAnimatedOpen.current = true;
    // Apple fluid deceleration curve for ultra-smooth 60/120fps opening
    translateX.value = withTiming(0, {
      duration: 320,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
    backdropOpacity.value = withTiming(1, {
      duration: 260,
      easing: Easing.out(Easing.quad),
    });
  }, []);

  useEffect(() => {
    if (visible) {
      hasAnimatedOpen.current = false;
      // Pre-set offscreen before native modal paints
      translateX.value = DRAWER_WIDTH;
      backdropOpacity.value = 0;
      setIsMounted(true);

      // Trigger animation after native modal layout initialization (ensures 0 dropped frames)
      const timer = setTimeout(() => {
        startOpenAnimation();
      }, 35);
      return () => clearTimeout(timer);
    } else {
      hasAnimatedOpen.current = false;
      translateX.value = withTiming(DRAWER_WIDTH, {
        duration: 240,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
      backdropOpacity.value = withTiming(
        0,
        {
          duration: 200,
          easing: Easing.in(Easing.quad),
        },
        (finished) => {
          if (finished) {
            runOnJS(setIsMounted)(false);
          }
        }
      );
    }
  }, [visible, startOpenAnimation]);

  const handleDismiss = useCallback(() => {
    hasAnimatedOpen.current = false;
    translateX.value = withTiming(DRAWER_WIDTH, {
      duration: 240,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
    backdropOpacity.value = withTiming(
      0,
      {
        duration: 200,
        easing: Easing.in(Easing.quad),
      },
      (finished) => {
        if (finished) {
          runOnJS(setIsMounted)(false);
          runOnJS(onClose)();
        }
      }
    );
  }, [onClose]);

  const handleNavigate = (path: '/' | '/(tabs)/analytics' | '/(tabs)/history' | '/(tabs)/settings') => {
    handleDismiss();
    setTimeout(() => {
      router.push(path);
    }, 160);
  };

  const handleCategoriesPress = () => {
    handleDismiss();
    setTimeout(() => {
      if (onOpenCategories) {
        onOpenCategories();
      } else {
        router.push('/(tabs)/settings');
      }
    }, 160);
  };

  const handleBackupPress = async () => {
    handleDismiss();
    const result = await exportFullBackupJson();
    if (result.success) {
      Alert.alert('Backup Exported', `Saved as ${result.fileName}`);
    } else {
      Alert.alert('Export Failed', result.error ?? 'Could not create JSON backup file.');
    }
  };

  const handleRestorePress = async () => {
    handleDismiss();
    const result = await importAndValidateBackupJson();
    if (result.canceled) return;
    if (!result.success) {
      Alert.alert('Import Error', result.error);
      return;
    }

    Alert.alert(
      'Restore Backup',
      `Found ${result.expenseCount} transactions and ${result.categoryCount} categories. Restore mode:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Merge',
          onPress: () => {
            restoreFromBackup(result.payload, 'merge');
            Alert.alert('Restore Complete', 'Data merged successfully.');
          },
        },
        {
          text: 'Replace All',
          style: 'destructive',
          onPress: () => {
            restoreFromBackup(result.payload, 'replace');
            Alert.alert('Restore Complete', 'All data replaced from backup.');
          },
        },
      ]
    );
  };

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const animatedDrawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Natural swipe right gesture to dismiss
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return gestureState.dx > 14 && Math.abs(gestureState.dy) < 28;
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx > 50 || gestureState.vx > 0.4) {
            handleDismiss();
          }
        },
      }),
    [handleDismiss]
  );

  if (!isMounted) return null;

  return (
    <Modal
      visible={isMounted}
      animationType="none"
      transparent
      statusBarTranslucent
      onShow={startOpenAnimation}
      onRequestClose={handleDismiss}
    >
      <View style={styles.modalRoot}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
          <Pressable onPress={handleDismiss} style={styles.backdropPressArea} />
        </Animated.View>

        {/* Drawer Panel Sliding in from the RIGHT */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.drawerPanel, animatedDrawerStyle]}
          className="bg-[#FAF8F5]"
        >
          <SafeAreaView edges={['top', 'bottom']} className="flex-1 px-5 pt-3">
            {/* Header: Brand on Left + Close Button (X) on Right */}
            <View className="flex-row items-center justify-between mb-5 mt-1">
              <View>
                <Text className="text-3xl font-black text-[#18181B] tracking-tight">
                  In<Text className="text-[#FF5A1F]">Flow</Text>
                </Text>
                <Text className="text-xs font-semibold text-[#71717A] mt-0.5">
                  Money tracker
                </Text>
              </View>

              <Pressable
                onPress={handleDismiss}
                hitSlop={8}
                className="w-10 h-10 rounded-full bg-white border border-[#E4E0D8] items-center justify-center shadow-xs active:bg-[#ECE8DF]"
              >
                <Icon name="X" size={19} color="#18181B" strokeWidth={2.4} />
              </Pressable>
            </View>

            {/* Scrollable Menu Items */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollMenu}
              className="flex-1"
            >
              {/* Home */}
              <Pressable
                onPress={() => handleNavigate('/')}
                style={[styles.menuItem, activeRoute === 'home' && styles.activeMenuItem]}
                className="flex-row items-center px-4 py-3 rounded-2xl active:bg-[#ECE8DF]"
              >
                <Icon
                  name="Home"
                  size={20}
                  color={activeRoute === 'home' ? '#FF5A1F' : '#18181B'}
                  strokeWidth={2.4}
                />
                <Text
                  className={`text-base ml-3.5 ${
                    activeRoute === 'home'
                      ? 'font-extrabold text-[#18181B]'
                      : 'font-semibold text-[#18181B]'
                  }`}
                >
                  Home
                </Text>
              </Pressable>

              {/* Categories */}
              <Pressable
                onPress={handleCategoriesPress}
                style={[styles.menuItem, activeRoute === 'categories' && styles.activeMenuItem]}
                className="flex-row items-center px-4 py-3 rounded-2xl active:bg-[#ECE8DF]"
              >
                <Icon
                  name="Shapes"
                  size={20}
                  color={activeRoute === 'categories' ? '#FF5A1F' : '#18181B'}
                  strokeWidth={2.2}
                />
                <Text
                  className={`text-base ml-3.5 ${
                    activeRoute === 'categories'
                      ? 'font-extrabold text-[#18181B]'
                      : 'font-semibold text-[#18181B]'
                  }`}
                >
                  Categories
                </Text>
              </Pressable>

              {/* Statistics */}
              <Pressable
                onPress={() => handleNavigate('/(tabs)/analytics')}
                style={[styles.menuItem, activeRoute === 'statistics' && styles.activeMenuItem]}
                className="flex-row items-center px-4 py-3 rounded-2xl active:bg-[#ECE8DF]"
              >
                <Icon
                  name="PieChart"
                  size={20}
                  color={activeRoute === 'statistics' ? '#FF5A1F' : '#18181B'}
                  strokeWidth={2.2}
                />
                <Text
                  className={`text-base ml-3.5 ${
                    activeRoute === 'statistics'
                      ? 'font-extrabold text-[#18181B]'
                      : 'font-semibold text-[#18181B]'
                  }`}
                >
                  Statistics
                </Text>
              </Pressable>

              {/* Lend & Borrow */}
              <Pressable
                onPress={() => handleNavigate('/(tabs)/history')}
                style={[styles.menuItem, activeRoute === 'lend-borrow' && styles.activeMenuItem]}
                className="flex-row items-center px-4 py-3 rounded-2xl active:bg-[#ECE8DF]"
              >
                <Icon
                  name="Handshake"
                  size={20}
                  color={activeRoute === 'lend-borrow' ? '#FF5A1F' : '#18181B'}
                  strokeWidth={2.2}
                />
                <Text
                  className={`text-base ml-3.5 ${
                    activeRoute === 'lend-borrow'
                      ? 'font-extrabold text-[#18181B]'
                      : 'font-semibold text-[#18181B]'
                  }`}
                >
                  Lend & Borrow
                </Text>
              </Pressable>

              {/* Currency */}
              <Pressable
                onPress={() => handleNavigate('/(tabs)/settings')}
                style={[styles.menuItem, activeRoute === 'currency' && styles.activeMenuItem]}
                className="flex-row items-center px-4 py-3 rounded-2xl active:bg-[#ECE8DF]"
              >
                <Icon
                  name="CircleDollarSign"
                  size={20}
                  color={activeRoute === 'currency' ? '#FF5A1F' : '#18181B'}
                  strokeWidth={2.2}
                />
                <Text
                  className={`text-base ml-3.5 ${
                    activeRoute === 'currency'
                      ? 'font-extrabold text-[#18181B]'
                      : 'font-semibold text-[#18181B]'
                  }`}
                >
                  Currency
                </Text>
              </Pressable>

              {/* Theme */}
              <Pressable
                onPress={() => {
                  handleDismiss();
                  setTimeout(() => {
                    Alert.alert('Theme Settings', 'InFlow is currently styled in warm high-contrast mode.');
                  }, 180);
                }}
                style={[styles.menuItem, activeRoute === 'theme' && styles.activeMenuItem]}
                className="flex-row items-center px-4 py-3 rounded-2xl active:bg-[#ECE8DF]"
              >
                <Icon
                  name="Moon"
                  size={20}
                  color={activeRoute === 'theme' ? '#FF5A1F' : '#18181B'}
                  strokeWidth={2.2}
                />
                <Text
                  className={`text-base ml-3.5 ${
                    activeRoute === 'theme'
                      ? 'font-extrabold text-[#18181B]'
                      : 'font-semibold text-[#18181B]'
                  }`}
                >
                  Theme
                </Text>
              </Pressable>

              {/* Text size */}
              <Pressable
                onPress={() => {
                  handleDismiss();
                  setTimeout(() => {
                    Alert.alert('Text Size', 'Font sizes automatically follow your device accessibility settings.');
                  }, 180);
                }}
                style={[styles.menuItem, activeRoute === 'text-size' && styles.activeMenuItem]}
                className="flex-row items-center px-4 py-3 rounded-2xl active:bg-[#ECE8DF]"
              >
                <Icon
                  name="Type"
                  size={20}
                  color={activeRoute === 'text-size' ? '#FF5A1F' : '#18181B'}
                  strokeWidth={2.2}
                />
                <Text
                  className={`text-base ml-3.5 ${
                    activeRoute === 'text-size'
                      ? 'font-extrabold text-[#18181B]'
                      : 'font-semibold text-[#18181B]'
                  }`}
                >
                  Text size
                </Text>
              </Pressable>

              {/* Divider */}
              <View className="h-px bg-[#E4E0D8] my-2.5 mx-1" />

              {/* Back up data */}
              <Pressable
                onPress={handleBackupPress}
                style={styles.menuItem}
                className="flex-row items-center px-4 py-3 rounded-2xl active:bg-[#ECE8DF]"
              >
                <Icon name="Cloud" size={20} color="#18181B" strokeWidth={2.2} />
                <Text className="text-base font-semibold text-[#18181B] ml-3.5">
                  Back up data
                </Text>
              </Pressable>

              {/* Restore backup */}
              <Pressable
                onPress={handleRestorePress}
                style={styles.menuItem}
                className="flex-row items-center px-4 py-3 rounded-2xl active:bg-[#ECE8DF]"
              >
                <Icon name="RotateCcw" size={20} color="#18181B" strokeWidth={2.2} />
                <Text className="text-base font-semibold text-[#18181B] ml-3.5">
                  Restore backup
                </Text>
              </Pressable>
            </ScrollView>

            {/* Footer */}
            <View className="pt-3 border-t border-[#E4E0D8] items-center">
              <Text className="text-xs text-[#A1A1AA] font-semibold tracking-wide">
                Daily Cost Manager v1.0
              </Text>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
  },
  backdropPressArea: {
    flex: 1,
  },
  drawerPanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: DRAWER_WIDTH,
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
    borderLeftWidth: 1,
    borderLeftColor: '#E4E0D8',
    shadowColor: '#000',
    shadowOffset: { width: -8, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 24,
  },
  scrollMenu: {
    paddingBottom: 16,
    gap: 4,
  },
  menuItem: {
    minHeight: 48,
  },
  activeMenuItem: {
    backgroundColor: '#EFE9DF',
  },
});
