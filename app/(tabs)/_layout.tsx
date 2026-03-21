import { Borders, Colors, Radii, Spacing } from '@/constants/theme';
import { useBudgetStore } from '@/store/budget-store';
import { useExpenseStore } from '@/store/expense-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import * as Haptics from 'expo-haptics';
import { Redirect, usePathname, useRouter, withLayoutContext } from 'expo-router';
import { BarChart3, Heart, Home, ScanLine } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isHome = pathname === '/';
  const isInsights = pathname === '/insights';
  const isWishlist = pathname === '/wishlist';

  const handlePress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (route === '/scan') {
      router.push('/scan');
    } else {
      router.navigate(route as any);
    }
  };

  return (
    <View style={[styles.floatingWrapper, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
      <View style={{ width: '100%', height: 72 }}>
        <View style={styles.tabBarShadow} />
        <View style={styles.tabBarInner}>
          {/* Left: Insights */}
          <Pressable
            style={styles.tabItem}
            onPress={() => handlePress('/insights')}
          >
            <BarChart3
              size={32}
              color={isInsights ? Colors.accent : Colors.textMuted}
              strokeWidth={isInsights ? 3 : 2}
            />
          </Pressable>

          {/* Center: Dynamic (Scan QR or Home) */}
          <View style={styles.centerButtonWrapper}>
            <View style={styles.centerButtonShadow} />
            <Pressable
              style={styles.centerButton}
              onPress={() => {
                if (isHome) handlePress('/scan');
                else handlePress('/');
              }}
            >
              {isHome ? (
                <ScanLine size={32} color={Colors.black} strokeWidth={3} />
              ) : (
                <Home size={32} color={Colors.black} strokeWidth={3} />
              )}
            </Pressable>
          </View>

          {/* Right: Wishlist */}
          <Pressable
            style={styles.tabItem}
            onPress={() => handlePress('/wishlist')}
          >
            <Heart
              size={32}
              color={isWishlist ? Colors.accent : Colors.textMuted}
              strokeWidth={isWishlist ? 3 : 2}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}


const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext(Navigator);

export default function TabLayout() {
  const hasCompletedOnboarding = useBudgetStore((s) => s.hasCompletedOnboarding);

  useEffect(() => {
    if (hasCompletedOnboarding) {
      useExpenseStore.getState().initialize();
      useWishlistStore.getState().initialize();
    }
  }, [hasCompletedOnboarding]);

  if (!hasCompletedOnboarding) {
    return <Redirect href={"/onboarding" as any} />;
  }

  return (
    <MaterialTopTabs
      tabBar={(props) => <CustomTabBar />}
      tabBarPosition="bottom"
      screenOptions={{
        swipeEnabled: true,
        animationEnabled: true,
      }}
    >
      <MaterialTopTabs.Screen name="insights" />
      <MaterialTopTabs.Screen name="index" />
      <MaterialTopTabs.Screen name="wishlist" />
    </MaterialTopTabs>
  );
}

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  tabBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: Radii.pill,
    borderWidth: Borders.thick,
    borderColor: Colors.black,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    height: 72,
    width: '100%',
  },
  tabBarShadow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.white,
    top: 4,
    left: 4,
    borderRadius: Radii.pill,
    borderWidth: Borders.thick,
    borderColor: Colors.black,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  centerButtonWrapper: {
    width: 60,
    height: 60,
    transform: [{ translateY: -18 }],
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF85A2',
    borderWidth: 3,
    borderColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButtonShadow: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.black,
  }
});
