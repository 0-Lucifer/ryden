import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Car } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';
import { useAuth } from '@/context/AuthContext';

export default function SplashScreen() {
  const router = useRouter();
  const { hasOnboarded, isAuthenticated, isLoading } = useAuth();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 2,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(tabs)/index');
      } else {
        router.replace('/SecondScreen');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, router]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.gradient.primary[0], Colors.gradient.primary[1]]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Logo and Tagline */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconCircle}>
            <Car size={64} color={Colors.white} strokeWidth={2.5} />
          </View>

          <Text style={styles.appName}>RYDEN</Text>
          <Text style={styles.tagline}>Community Ride-Sharing</Text>
          <Text style={styles.subtitle}>for Students</Text>
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by Student Community</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  appName: {
    ...Typography.h1,
    fontSize: 56,
    fontWeight: '800' as const,
    color: Colors.white,
    letterSpacing: 4,
    marginBottom: 8,
  },
  tagline: {
    ...Typography.h5,
    color: Colors.white,
    opacity: 0.95,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.body1,
    color: Colors.white,
    opacity: 0.85,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
  },
  footerText: {
    ...Typography.body2,
    color: Colors.white,
    opacity: 0.8,
  },
});
