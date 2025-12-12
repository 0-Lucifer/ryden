
import { useRouter } from 'expo-router';
import { Star, MapPin, X, Clock, User, Award, Car as CarIcon, UserRound } from 'lucide-react-native';
import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { mockDrivers, Driver } from '@/mocks/drivers';

export default function AvailableDriversScreen() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>(mockDrivers);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const fadeAnim = useMemo(() => new Animated.Value(1), []);
  const cardScaleAnimations = useMemo(
    () => mockDrivers.map(() => new Animated.Value(1)),
    []
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setDrivers((prevDrivers) =>
        prevDrivers.map((driver) => ({
          ...driver,
          eta: Math.max(1, driver.eta - 1),
        }))
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isConnecting) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.4,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isConnecting, fadeAnim]);

  const handleBookRide = (driver: Driver, index: number) => {
    setIsConnecting(true);
    setSelectedDriverId(driver.id);

    Animated.sequence([
      Animated.timing(cardScaleAnimations[index], {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardScaleAnimations[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      setIsConnecting(false);
      router.push({
        pathname: '/booking-confirm' as any,
        params: {
          driverId: driver.id,
          driverName: driver.name,
          vehicleModel: driver.vehicleModel,
          fare: driver.fare.toString(),
          eta: driver.eta.toString(),
          rating: driver.rating.toString(),
          licensePlate: driver.licensePlate,
        },
      });
    }, 1500);
  };

  const handleCancel = () => {
    console.log('Search cancelled');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Available Drivers</Text>
            <View style={styles.locationContainer}>
              <MapPin size={14} color="#6B7280" />
              <Text style={styles.locationText}>
                NSU Campus Gate → Bashundhara City
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            testID="cancel-button"
          >
            <X size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {drivers.map((driver, index) => (
          <Animated.View
            key={driver.id}
            style={[
              styles.driverCard,
              {
                transform: [{ scale: cardScaleAnimations[index] }],
              },
            ]}
          >
            <View style={styles.cardTopSection}>
              <View style={styles.driverMainInfo}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatarBackground}>
                    {driver.gender === 'female' ? (
                      <UserRound size={32} color="#EC4899" strokeWidth={2.5} />
                    ) : (
                      <User size={32} color="#0891B2" strokeWidth={2.5} />
                    )}
                  </View>
                  <View style={styles.verifiedBadge}>
                    <Award size={14} color="#FFFFFF" fill="#10B981" />
                  </View>
                </View>

                <View style={styles.driverDetails}>
                  <Text style={styles.driverName}>{driver.name}</Text>
                  <View style={styles.ratingRow}>
                    <View style={styles.ratingContainer}>
                      <Star size={13} color="#F59E0B" fill="#F59E0B" />
                      <Text style={styles.rating}>{driver.rating}</Text>
                    </View>
                    <View style={styles.dotSeparator} />
                    <Text style={styles.licensePlate}>{driver.licensePlate}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.etaBadge}>
                <Clock size={14} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.etaText}>{driver.eta} min</Text>
              </View>
            </View>

            <View style={styles.dividerLine} />

            <View style={styles.vehicleInfoSection}>
              <View style={styles.vehicleIconContainer}>
                <CarIcon size={18} color="#0891B2" strokeWidth={2} />
              </View>
              <View style={styles.vehicleTextContainer}>
                <Text style={styles.vehicleLabel}>Vehicle</Text>
                <Text style={styles.vehicleInfo}>
                  {driver.vehicleModel}
                </Text>
              </View>
              <View style={styles.vehicleTypeBadge}>
                <Text style={styles.vehicleTypeText}>{driver.vehicleType}</Text>
              </View>
            </View>

            <View style={styles.fareBookSection}>
              <View style={styles.fareContainer}>
                <Text style={styles.fareLabel}>Fare</Text>
                <View style={styles.fareRow}>
                  <Text style={styles.currencySymbol}>৳</Text>
                  <Text style={styles.fare}>{driver.fare}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.bookButton,
                  isConnecting &&
                    selectedDriverId === driver.id &&
                    styles.bookButtonConnecting,
                ]}
                onPress={() => handleBookRide(driver, index)}
                disabled={isConnecting}
                activeOpacity={0.85}
                testID={`book-ride-${driver.id}`}
              >
                {isConnecting && selectedDriverId === driver.id ? (
                  <Animated.Text style={[styles.bookButtonText, { opacity: fadeAnim }]}>
                    Connecting...
                  </Animated.Text>
                ) : (
                  <Text style={styles.bookButtonText}>Book Ride</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        ))}

        <View style={styles.infoFooter}>
          <Text style={styles.footerText}>
            All drivers are verified and rated by passengers
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: '800' as const,
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  cancelButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  driverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  cardTopSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  driverMainInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarBackground: {
    width: 70,
    height: 70,
    borderRadius: 35,
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
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  driverDetails: {
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#92400E',
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#CBD5E1',
  },
  licensePlate: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600' as const,
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0891B2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  etaText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700' as const,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
  },
  vehicleInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 14,
    marginBottom: 18,
  },
  vehicleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  vehicleLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  vehicleInfo: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '700' as const,
  },
  vehicleTypeBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  vehicleTypeText: {
    fontSize: 12,
    color: '#0891B2',
    fontWeight: '700' as const,
  },
  fareBookSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fareContainer: {
    flex: 1,
  },
  fareLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  fareRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#0F172A',
    marginRight: 2,
  },
  fare: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: '#0F172A',
    letterSpacing: -1,
  },
  bookButton: {
    backgroundColor: '#0891B2',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#0891B2',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    minWidth: 130,
    alignItems: 'center',
  },
  bookButtonConnecting: {
    backgroundColor: '#06B6D4',
  },
  bookButtonText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  infoFooter: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500' as const,
    textAlign: 'center',
  },
});
