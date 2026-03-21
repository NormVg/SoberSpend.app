import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import 'react-native-reanimated';

import { Fonts } from '@/constants/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

const SPLASH_BG_COLOR = '#C54770';

SplashScreen.preventAutoHideAsync().catch(() => null);

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    [Fonts.display]: require('@/assets/fonts/JockeyOne-Regular.ttf'),
    [Fonts.accent]: require('@/assets/fonts/SignPainterHouseScript.ttf'),
  });
  const [isAppReady, setIsAppReady] = useState(false);
  const [showLaunchAnimation, setShowLaunchAnimation] = useState(true);
  const logoScale = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (fontsLoaded) {
      setIsAppReady(true);
    }
  }, [fontsLoaded]);

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

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="scan"
          options={{
            animation: 'slide_from_bottom',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="decision"
          options={{
            animation: 'slide_from_right',
            gestureEnabled: false,
          }}
        />
      </Stack>
      <StatusBar style="light" />
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
    </>
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
