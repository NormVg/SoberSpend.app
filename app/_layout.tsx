import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

const SPLASH_BG_COLOR = '#C54770';

SplashScreen.preventAutoHideAsync().catch(() => null);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isAppReady, setIsAppReady] = useState(false);
  const [showLaunchAnimation, setShowLaunchAnimation] = useState(true);
  const logoScale = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setIsAppReady(true);
  }, []);

  useEffect(() => {
    if (!isAppReady) {
      return;
    }

    let isMounted = true;

    const runLaunchAnimation = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch {
        // noop
      }

      Animated.sequence([
        Animated.delay(100),
        Animated.timing(logoScale, {
          toValue: 1.1,
          duration: 190,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(logoScale, {
            toValue: 7,
            duration: 680,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(overlayOpacity, {
            toValue: 0,
            duration: 200,
            delay: 470,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        if (isMounted) {
          setShowLaunchAnimation(false);
        }
      });
    };

    void runLaunchAnimation();

    return () => {
      isMounted = false;
    };
  }, [isAppReady, logoScale, overlayOpacity]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
      {showLaunchAnimation ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.splashOverlay,
            {
              opacity: overlayOpacity,
              backgroundColor: SPLASH_BG_COLOR,
            },
          ]}>
          <Animated.Image
            source={require('@/assets/images/ss-logo.png')}
            style={[
              styles.splashLogo,
              {
                transform: [{ scale: logoScale }],
              },
            ]}
            resizeMode="contain"
          />
        </Animated.View>
      ) : null}
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  splashLogo: {
    width: 200,
    height: 200,
  },
});
