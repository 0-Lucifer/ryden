import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  CheckCircle,
  Clock,
  Car,
  Phone,
  MessageCircle,
  Star,
  Navigation,
  User,
} from 'lucide-react-native';
import React, { useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    driverName: string;
    vehicleModel: string;
    fare: string;
    eta: string;
    rating: string;
    licensePlate: string;
  }>();

  const scaleAnim = useMemo(() => new Animated.Value(0), []);
  const slideAnim = useMemo(() => new Animated.Value(50), []);
  const fadeInAnim = useMemo(() => new Animated.Value(0), []);
  const pulseAnim = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeInAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim, slideAnim, fadeInAnim, pulseAnim]);

  const handleDone = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.successSection,
              {
                opacity: fadeInAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.successIconContainer}>
              <Animated.View
                style={[
                  styles.pulseCircle,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              />
              <CheckCircle size={64} color="#FFFFFF" strokeWidth={3} />
            </View>
            <Text style={styles.successTitle}>Booking Confirmed!</Text>
            <Text style={styles.successSubtitle}>Your driver is on the way</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.driverCard,
              {
                opacity: fadeInAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.driverHeader}>
              <View style={styles.driverAvatarSection}>
                <View style={styles.driverAvatar}>
                  <User size={36} color="#0891B2" strokeWidth={2.5} />
                </View>
                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>{params.driverName}</Text>
                  <View style={styles.driverRatingRow}>
                    <Star size={14} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.driverRating}>{params.rating}</Text>
                    <View style={styles.separator} />
                    <Text style={styles.driverPlate}>{params.licensePlate}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.etaIndicator}>
                <Clock size={16} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.etaText}>{params.eta} min</Text>
              </View>
            </View>

            <View style={styles.vehicleSection}>
              <View style={styles.vehicleIconWrapper}>
                <Car size={20} color="#0891B2" strokeWidth={2} />
              </View>
              <Text style={styles.vehicleText}>{params.vehicleModel}</Text>
            </View>

            <View style={styles.contactButtons}>
              <TouchableOpacity style={styles.contactButton} activeOpacity={0.7}>
                <Phone size={20} color="#0891B2" strokeWidth={2.5} />
                <Text style={styles.contactButtonText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactButton} activeOpacity={0.7}>
                <MessageCircle size={20} color="#0891B2" strokeWidth={2.5} />
                <Text style={styles.contactButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.tripDetailsCard,
              {
                opacity: fadeInAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Trip Details</Text>

            <View style={styles.routeContainer}>
              <View style={styles.routeLineContainer}>
                <View style={styles.routeDotStart} />
                <View style={styles.routeLine} />
                <View style={styles.routeDotEnd} />
              </View>
              <View style={styles.routeTextContainer}>
                <View style={styles.routeLocation}>
                  <Text style={styles.routeLabel}>Pickup</Text>
                  <Text style={styles.routeAddress}>NSU Campus Gate</Text>
                </View>
                <View style={styles.routeLocation}>
                  <Text style={styles.routeLabel}>Drop-off</Text>
                  <Text style={styles.routeAddress}>Bashundhara City</Text>
                </View>
              </View>
            </View>

            <View style={styles.fareSection}>
              <View style={styles.fareRow}>
                <Text style={styles.fareLabel}>Total Fare</Text>
                <View style={styles.fareAmountContainer}>
                  <Text style={styles.currencySymbol}>৳</Text>
                  <Text style={styles.fareAmount}>{params.fare}</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.trackingCard,
              {
                opacity: fadeInAnim,
              },
            ]}
          >
            <Navigation size={20} color="#0891B2" strokeWidth={2.5} />
            <Text style={styles.trackingText}>Track your driver in real-time</Text>
          </Animated.View>

          <TouchableOpacity
            style={styles.doneButton}
            onPress={handleDone}
            activeOpacity={0.85}
            testID="done-button"
          >
            <Text style={styles.doneButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0891B2',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 32,
  },
  successSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  pulseCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    fontWeight: '500' as const,
  },
  driverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  driverAvatarSection: {
    flexDirection: 'row',
    flex: 1,
  },
  driverAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#0891B2',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  driverInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  driverName: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#0F172A',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  driverRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  driverRating: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#92400E',
  },
  separator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#CBD5E1',
  },
  driverPlate: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600' as const,
  },
  etaIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  etaText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '800' as const,
  },
  vehicleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  vehicleIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E0F2FE',
    paddingVertical: 14,
    borderRadius: 14,
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#0891B2',
  },
  tripDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#0F172A',
    letterSpacing: -0.4,
    marginBottom: 20,
  },
  routeContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  routeLineContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  routeDotStart: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0891B2',
    borderWidth: 3,
    borderColor: '#E0F2FE',
  },
  routeLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 4,
  },
  routeDotEnd: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#D1FAE5',
  },
  routeTextContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  routeLocation: {
    paddingVertical: 4,
  },
  routeLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  routeAddress: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  fareSection: {
    backgroundColor: '#F8FAFC',
    padding: 18,
    borderRadius: 16,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fareLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  fareAmountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#0F172A',
    marginRight: 2,
  },
  fareAmount: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: '#0891B2',
    letterSpacing: -0.8,
  },
  trackingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  trackingText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  doneButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: '#0891B2',
    letterSpacing: 0.3,
  },
});
