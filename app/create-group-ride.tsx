import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, Modal } from 'react-native';
import { MapPin, Calendar, Clock, Users, DollarSign, Car, Bike, X, Truck } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useState } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

type VehiclePreference = 'CNG' | 'Bike' | 'Uber/Pathao';
type GenderPreference = 'Male' | 'Female' | 'Any';

export default function CreateGroupRide() {
  const router = useRouter();
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [fareMin, setFareMin] = useState<string>('');
  const [fareMax, setFareMax] = useState<string>('');
  const [maxMembers, setMaxMembers] = useState<string>('4');
  const [vehiclePreferences, setVehiclePreferences] = useState<VehiclePreference[]>([]);
  const [genderPreference, setGenderPreference] = useState<GenderPreference>('Any');
  const [departureDateTime, setDepartureDateTime] = useState<string>('');
  const [showDateTimePicker, setShowDateTimePicker] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');

  const toggleVehiclePreference = (vehicle: VehiclePreference) => {
    setVehiclePreferences(prev => {
      if (prev.includes(vehicle)) {
        return prev.filter(v => v !== vehicle);
      } else {
        return [...prev, vehicle];
      }
    });
  };

  const handleDateTimeConfirm = () => {
    if (selectedDate && selectedTime) {
      setDepartureDateTime(`${selectedDate} at ${selectedTime}`);
      setShowDateTimePicker(false);
    } else {
      Alert.alert('Error', 'Please select both date and time');
    }
  };

  const handleCreateGroupRide = () => {
    if (!from || !to || !fareMin || !fareMax || !departureDateTime || vehiclePreferences.length === 0) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    Alert.alert('Success', 'Your group ride has been created!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Group Ride</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Details</Text>

          <View style={styles.inputContainer}>
            <MapPin size={20} color={Colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="From (e.g., NSU Campus)"
              placeholderTextColor={Colors.gray}
              value={from}
              onChangeText={setFrom}
            />
          </View>

          <View style={styles.inputContainer}>
            <MapPin size={20} color={Colors.accent} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="To (e.g., Bashundhara City)"
              placeholderTextColor={Colors.gray}
              value={to}
              onChangeText={setTo}
            />
          </View>

          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowDateTimePicker(true)}
            activeOpacity={0.7}
          >
            <Calendar size={20} color={Colors.gray} style={styles.inputIcon} />
            <Text style={[styles.input, !departureDateTime && styles.placeholderText]}>
              {departureDateTime || 'Select Departure Date & Time'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Approximate Fare Range (BDT)</Text>

          <View style={styles.fareContainer}>
            <View style={styles.fareInputWrapper}>
              <DollarSign size={18} color={Colors.primary} />
              <TextInput
                style={styles.fareInput}
                placeholder="Min"
                placeholderTextColor={Colors.gray}
                value={fareMin}
                onChangeText={setFareMin}
                keyboardType="numeric"
              />
            </View>

            <Text style={styles.fareSeparator}>-</Text>

            <View style={styles.fareInputWrapper}>
              <DollarSign size={18} color={Colors.primary} />
              <TextInput
                style={styles.fareInput}
                placeholder="Max"
                placeholderTextColor={Colors.gray}
                value={fareMax}
                onChangeText={setFareMax}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Maximum Members</Text>
          <View style={styles.membersSelector}>
            {['2', '3', '4', '5'].map((num) => (
              <TouchableOpacity
                key={num}
                style={[styles.memberChip, maxMembers === num && styles.memberChipActive]}
                onPress={() => setMaxMembers(num)}
                activeOpacity={0.7}
              >
                <Users size={18} color={maxMembers === num ? Colors.white : Colors.gray} />
                <Text style={[styles.memberText, maxMembers === num && styles.memberTextActive]}>
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Preferences *</Text>
          <Text style={styles.sectionSubtitle}>Select one or more</Text>

          <View style={styles.vehicleGrid}>
            <TouchableOpacity
              style={[
                styles.vehicleCard,
                vehiclePreferences.includes('CNG') && styles.vehicleCardActive
              ]}
              onPress={() => toggleVehiclePreference('CNG')}
              activeOpacity={0.7}
            >
              <Truck size={28} color={vehiclePreferences.includes('CNG') ? Colors.white : Colors.gray} />
              <Text style={[
                styles.vehicleCardText,
                vehiclePreferences.includes('CNG') && styles.vehicleCardTextActive
              ]}>
                CNG
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.vehicleCard,
                vehiclePreferences.includes('Bike') && styles.vehicleCardActive
              ]}
              onPress={() => toggleVehiclePreference('Bike')}
              activeOpacity={0.7}
            >
              <Bike size={28} color={vehiclePreferences.includes('Bike') ? Colors.white : Colors.gray} />
              <Text style={[
                styles.vehicleCardText,
                vehiclePreferences.includes('Bike') && styles.vehicleCardTextActive
              ]}>
                Bike
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.vehicleCard,
                vehiclePreferences.includes('Uber/Pathao') && styles.vehicleCardActive
              ]}
              onPress={() => toggleVehiclePreference('Uber/Pathao')}
              activeOpacity={0.7}
            >
              <Car size={28} color={vehiclePreferences.includes('Uber/Pathao') ? Colors.white : Colors.gray} />
              <Text style={[
                styles.vehicleCardText,
                vehiclePreferences.includes('Uber/Pathao') && styles.vehicleCardTextActive
              ]}>
                Uber/Pathao
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gender Preference</Text>

          <View style={styles.genderSelector}>
            {(['Male', 'Female', 'Any'] as GenderPreference[]).map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.genderChip,
                  genderPreference === gender && styles.genderChipActive
                ]}
                onPress={() => setGenderPreference(gender)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.genderText,
                  genderPreference === gender && styles.genderTextActive
                ]}>
                  {gender}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>

          <TextInput
            style={styles.notesInput}
            placeholder="Add any additional information..."
            placeholderTextColor={Colors.gray}
            value={additionalNotes}
            onChangeText={setAdditionalNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>


      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateGroupRide}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.createButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.createButtonText}>Create Group Ride</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showDateTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDateTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date & Time</Text>
              <TouchableOpacity onPress={() => setShowDateTimePicker(false)} style={styles.closeButton}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.dateTimeInputs}>
              <View style={styles.modalInputContainer}>
                <Calendar size={20} color={Colors.primary} />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Date (e.g., Dec 25, 2024)"
                  placeholderTextColor={Colors.gray}
                  value={selectedDate}
                  onChangeText={setSelectedDate}
                />
              </View>

              <View style={styles.modalInputContainer}>
                <Clock size={20} color={Colors.primary} />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Time (e.g., 3:00 PM)"
                  placeholderTextColor={Colors.gray}
                  value={selectedTime}
                  onChangeText={setSelectedTime}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleDateTimeConfirm}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.confirmButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backText: {
    fontSize: 28,
    color: Colors.text,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  placeholderText: {
    color: Colors.gray,
  },
  fareContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fareInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    gap: 8,
  },
  fareInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  fareSeparator: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.gray,
  },
  membersSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  memberChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lightGray,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 6,
  },
  memberChipActive: {
    backgroundColor: Colors.secondary,
  },
  memberText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.gray,
  },
  memberTextActive: {
    color: Colors.white,
  },
  vehicleGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  vehicleCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: 16,
    paddingVertical: 20,
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  vehicleCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  vehicleCardText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.gray,
  },
  vehicleCardTextActive: {
    color: Colors.white,
  },
  genderSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  genderChip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    paddingVertical: 16,
    borderRadius: 12,
  },
  genderChipActive: {
    backgroundColor: Colors.secondary,
  },
  genderText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.gray,
  },
  genderTextActive: {
    color: Colors.white,
  },
  notesInput: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    fontSize: 15,
    color: Colors.text,
    minHeight: 100,
  },
  infoCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: Colors.lightGray,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  verificationCard: {
    ...Colors.shadow,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  createButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Colors.shadow,
  },
  createButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateTimeInputs: {
    gap: 16,
    marginBottom: 24,
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
  },
  modalInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  confirmButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Colors.shadow,
  },
  confirmButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
    letterSpacing: 0.5,
  },
});
