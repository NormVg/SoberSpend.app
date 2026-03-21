import { Borders, Colors, Spacing } from '@/constants/theme';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter, withLayoutContext } from 'expo-router';
import { BarChart3, Heart, Home, ScanLine } from 'lucide-react-native';
import React from 'react';
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
    <View style={[styles.tabBarContainer, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
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
  );
}


const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext(Navigator);

export default function TabLayout() {
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
    borderRadius: 50,
    borderWidth: Borders.thick,
    borderColor: Colors.black,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 12,
    height: 72,
    width: '100%',
    shadowColor: Colors.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  centerButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.accent,
    borderWidth: Borders.thick,
    borderColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -18 }],
    shadowColor: Colors.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  }
});
