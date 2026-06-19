import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  MapPin,
  Navigation,
  Car,
  Bike,
  Users,
  Calendar,
  Clock,
  ChevronRight,
  Search,
  X,
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';

const COLORS = {
  primary: '#1A56DB',
  primaryDark: '#1E429F',
  accent: '#1A56DB',
  accentLight: '#3F83F8',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  background: '#F9FAFB',
  card: '#FFFFFF',
  cardPressed: '#F3F4F6',
  inputBg: '#F9FAFB',
};

type VehicleType = 'car' | 'bike';

interface LocationState {
  pickup: string;
  dropoff: string;
}

interface TripDetails {
  vehicleType: VehicleType;
  passengers: number;
  departureType: 'now' | 'later';
  scheduledDate?: Date;
  scheduledTime?: string;
}

export default function RideBookingScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<LocationState>({
    pickup: '',
    dropoff: '',
  });
  const [tripDetails, setTripDetails] = useState<TripDetails>({
    vehicleType: 'car',
    passengers: 1,
    departureType: 'now',
  });
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [activeLocationField, setActiveLocationField] = useState<'pickup' | 'dropoff'>('pickup');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const mockLocations = [
    'North South University, Bashundhara',
    'Bashundhara City Shopping Complex',
    'Jamuna Future Park, Baridhara',
    'Uttara, Sector 7',
    'Gulshan 1, Gulshan Circle',
    'Banani 11, Banani',
    'Dhanmondi 27, Dhanmondi',
    'Motijheel, Shapla Chattar',
    'Mirpur 10, Mirpur',
    'Farmgate, Tejgaon',
    'Mohakhali DOHS',
    'Badda, Pragati Sarani',
  ];

  const filteredLocations = mockLocations.filter((loc) =>
    loc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLocationSelect = (locationName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocation({
      ...location,
      [activeLocationField]: locationName,
    });
    setShowLocationModal(false);
    setSearchQuery('');
  };

  const openLocationModal = (field: 'pickup' | 'dropoff') => {
    setActiveLocationField(field);
    setShowLocationModal(true);
  };

  const handleFindDrivers = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push('/driver-matched');
  };

  const incrementPassengers = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (tripDetails.passengers < 8) {
      setTripDetails({ ...tripDetails, passengers: tripDetails.passengers + 1 });
    }
  };

  const decrementPassengers = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (tripDetails.passengers > 1) {
      setTripDetails({ ...tripDetails, passengers: tripDetails.passengers - 1 });
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Book Your Ride</Text>
          <Text style={styles.headerSubtitle}>Fast & reliable transportation in Dhaka</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route Details</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.locationInput}
              onPress={() => openLocationModal('pickup')}
              activeOpacity={0.7}
            >
              <View style={styles.iconCircle}>
                <Navigation size={18} color={COLORS.success} />
              </View>
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationLabel}>Pickup Location</Text>
                <Text
                  style={location.pickup ? styles.locationValue : styles.locationPlaceholder}
                >
                  {location.pickup || 'Select pickup location'}
                </Text>
              </View>
              <ChevronRight size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <View style={styles.locationDivider} />

            <TouchableOpacity
              style={styles.locationInput}
              onPress={() => openLocationModal('dropoff')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, styles.iconCircleSecondary]}>
                <MapPin size={18} color={COLORS.primary} />
              </View>
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationLabel}>Drop-off Location</Text>
                <Text
                  style={location.dropoff ? styles.locationValue : styles.locationPlaceholder}
                >
                  {location.dropoff || 'Select drop-off location'}
                </Text>
              </View>
              <ChevronRight size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Type</Text>
          <View style={styles.vehicleContainer}>
            <TouchableOpacity
              style={[
                styles.vehicleCard,
                tripDetails.vehicleType === 'car' && styles.vehicleCardActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setTripDetails({ ...tripDetails, vehicleType: 'car' });
              }}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.vehicleIcon,
                  tripDetails.vehicleType === 'car' && styles.vehicleIconActive,
                ]}
              >
                <Car size={24} color={tripDetails.vehicleType === 'car' ? COLORS.primary : COLORS.textSecondary} />
              </View>
              <Text
                style={[
                  styles.vehicleLabel,
                  tripDetails.vehicleType === 'car' && styles.vehicleLabelActive,
                ]}
              >
                Car
              </Text>
              <Text style={styles.vehicleDescription}>Comfortable & spacious</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.vehicleCard,
                tripDetails.vehicleType === 'bike' && styles.vehicleCardActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setTripDetails({ ...tripDetails, vehicleType: 'bike' });
              }}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.vehicleIcon,
                  tripDetails.vehicleType === 'bike' && styles.vehicleIconActive,
                ]}
              >
                <Bike size={24} color={tripDetails.vehicleType === 'bike' ? COLORS.primary : COLORS.textSecondary} />
              </View>
              <Text
                style={[
                  styles.vehicleLabel,
                  tripDetails.vehicleType === 'bike' && styles.vehicleLabelActive,
                ]}
              >
                Bike
              </Text>
              <Text style={styles.vehicleDescription}>Fast & economical</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Passengers</Text>
          <View style={styles.card}>
            <View style={styles.passengerContainer}>
              <View style={styles.passengerInfo}>
                <Users size={20} color={COLORS.primary} />
                <Text style={styles.passengerLabel}>Number of Passengers</Text>
              </View>
              <View style={styles.passengerControls}>
                <TouchableOpacity
                  style={[
                    styles.passengerButton,
                    tripDetails.passengers === 1 && styles.passengerButtonDisabled,
                  ]}
                  onPress={decrementPassengers}
                  disabled={tripDetails.passengers === 1}
                  activeOpacity={0.7}
                >
                  <Text style={styles.passengerButtonText}>−</Text>
                </TouchableOpacity>
                <View style={styles.passengerValue}>
                  <Text style={styles.passengerValueText}>{tripDetails.passengers}</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.passengerButton,
                    tripDetails.passengers === 8 && styles.passengerButtonDisabled,
                  ]}
                  onPress={incrementPassengers}
                  disabled={tripDetails.passengers === 8}
                  activeOpacity={0.7}
                >
                  <Text style={styles.passengerButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Departure Time</Text>
          <View style={styles.departureContainer}>
            <TouchableOpacity
              style={[
                styles.departureCard,
                tripDetails.departureType === 'now' && styles.departureCardActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setTripDetails({ ...tripDetails, departureType: 'now' });
              }}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.departureIcon,
                  tripDetails.departureType === 'now' && styles.departureIconActive,
                ]}
              >
                <Clock size={20} color={tripDetails.departureType === 'now' ? COLORS.primary : COLORS.textSecondary} />
              </View>
              <Text
                style={[
                  styles.departureLabel,
                  tripDetails.departureType === 'now' && styles.departureLabelActive,
                ]}
              >
                Leave Now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.departureCard,
                tripDetails.departureType === 'later' && styles.departureCardActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setTripDetails({ ...tripDetails, departureType: 'later' });
                setShowDatePicker(true);
              }}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.departureIcon,
                  tripDetails.departureType === 'later' && styles.departureIconActive,
                ]}
              >
                <Calendar size={20} color={tripDetails.departureType === 'later' ? COLORS.primary : COLORS.textSecondary} />
              </View>
              <Text
                style={[
                  styles.departureLabel,
                  tripDetails.departureType === 'later' && styles.departureLabelActive,
                ]}
              >
                Schedule Later
              </Text>
            </TouchableOpacity>
          </View>

          {tripDetails.departureType === 'later' && (
            <View style={styles.scheduledTimeCard}>
              <Text style={styles.scheduledTimeLabel}>Scheduled Time</Text>
              <TouchableOpacity
                style={styles.scheduledTimeButton}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Calendar size={16} color={COLORS.primary} />
                <Text style={styles.scheduledTimeText}>
                  {tripDetails.scheduledDate
                    ? `${tripDetails.scheduledDate.toLocaleDateString()} ${tripDetails.scheduledTime || '12:00 PM'}`
                    : 'Select date & time'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.findDriversButton}
          onPress={handleFindDrivers}
          activeOpacity={0.9}
        >
          <View style={styles.findDriversGradient}>
            <Text style={styles.findDriversText}>Find Available Drivers</Text>
            <Search size={20} color={"#FFFFFF"} />
          </View>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={showLocationModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Select {activeLocationField === 'pickup' ? 'Pickup' : 'Drop-off'} Location
            </Text>
            <TouchableOpacity
              onPress={() => setShowLocationModal(false)}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <X size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Search size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search location..."
              placeholderTextColor={COLORS.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>

          <ScrollView style={styles.locationList}>
            {filteredLocations.map((locationName, index) => (
              <TouchableOpacity
                key={index}
                style={styles.locationItem}
                onPress={() => handleLocationSelect(locationName)}
                activeOpacity={0.7}
              >
                <MapPin size={20} color={COLORS.primary} />
                <Text style={styles.locationItemText}>{locationName}</Text>
              </TouchableOpacity>
            ))}
            {filteredLocations.length === 0 && (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>No locations found</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={showDatePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDatePicker(false)}
        transparent
      >
        <View style={styles.datePickerOverlay}>
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Schedule Your Ride</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <X size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.datePickerContent}>
              <Text style={styles.datePickerLabel}>Date</Text>
              <View style={styles.dateOptions}>
                {['Today', 'Tomorrow', 'Dec 14', 'Dec 15'].map((date, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dateOption}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      const today = new Date();
                      const selectedDate = new Date(today);
                      selectedDate.setDate(today.getDate() + index);
                      setTripDetails({
                        ...tripDetails,
                        scheduledDate: selectedDate,
                      });
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.dateOptionText}>{date}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.datePickerLabel, { marginTop: 24 }]}>Time</Text>
              <View style={styles.timeOptions}>
                {['12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM'].map((time, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.timeOption}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setTripDetails({
                        ...tripDetails,
                        scheduledTime: time,
                      });
                    }}
                    activeOpacity={0.7}
                  >
                    <Clock size={16} color={COLORS.primary} />
                    <Text style={styles.timeOptionText}>{time}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setShowDatePicker(false);
              }}
              activeOpacity={0.9}
            >
              <View style={styles.confirmButtonGradient}>
                <Text style={styles.confirmButtonText}>Confirm Schedule</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    letterSpacing: 0,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 12,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSecondary: {
    backgroundColor: '#DBEAFE',
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  locationValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500' as const,
  },
  locationPlaceholder: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  locationDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 68,
  },
  vehicleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  vehicleCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  vehicleCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  vehicleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  vehicleIconActive: {
    backgroundColor: '#DBEAFE',
  },
  vehicleLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  vehicleLabelActive: {
    color: COLORS.text,
  },
  vehicleDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center' as const,
  },
  passengerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  passengerLabel: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500' as const,
  },
  passengerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  passengerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passengerButtonDisabled: {
    backgroundColor: COLORS.border,
    opacity: 0.4,
  },
  passengerButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  passengerValue: {
    minWidth: 32,
    alignItems: 'center',
  },
  passengerValueText: {
    fontSize: 20,
    color: COLORS.text,
    fontWeight: '600' as const,
  },
  departureContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  departureCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  departureCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  departureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  departureIconActive: {
    backgroundColor: '#DBEAFE',
  },
  departureLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
  },
  departureLabelActive: {
    color: COLORS.text,
  },
  scheduledTimeCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  scheduledTimeLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  scheduledTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduledTimeText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500' as const,
  },
  findDriversButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.primary,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  findDriversGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 10,
  },
  findDriversText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: COLORS.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    margin: 20,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 16,
  },
  locationList: {
    flex: 1,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  locationItemText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  noResults: {
    padding: 40,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: COLORS.text,
  },
  datePickerContent: {
    padding: 20,
  },
  datePickerLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  dateOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  dateOption: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateOptionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  timeOptions: {
    gap: 12,
  },
  timeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    padding: 16,
    borderRadius: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeOptionText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500' as const,
  },
  confirmButton: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.primary,
  },
  confirmButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
