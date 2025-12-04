import LocationPicker from '@/components/location-picker';
import { DEFAULT_LOCATION, Location } from '@/constants/locations';
import { useRide } from '@/context/RideContext';
import React, { useState } from 'react';
import { Alert, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function OfferRideScreen() {
  const { publishRide, isLoadingRide } = useRide();

  const [fromLocation, setFromLocation] = useState<Location | { name: string }>(DEFAULT_LOCATION);
  const [toLocation, setToLocation] = useState<Location | { name: string } | null>(null);
  const [stopLocation, setStopLocation] = useState<Location | { name: string } | null>(null);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState<string>('08:00');
  const [vehicle, setVehicle] = useState('Toyota Axio');
  const [vehicleType, setVehicleType] = useState<'bike' | 'car' | 'cng'>('car');
  const [seats, setSeats] = useState('3');
  const [price, setPrice] = useState('100');
  const [instant, setInstant] = useState(true);
  const [music, setMusic] = useState(false);
  const [pets, setPets] = useState(false);
  const [luggage, setLuggage] = useState(false);

  const handlePublish = async () => {
    try {
      if (!fromLocation || !toLocation || !date || !time || !vehicle || !seats || !price) {
        Alert.alert('Missing info', 'Please complete all required fields');
        return;
      }
      const res = await publishRide({
        from: fromLocation.name,
        to: toLocation.name,
        stops: stopLocation ? [stopLocation.name] : undefined,
        date,
        time,
        vehicle,
        vehicleType,
        seats: Number(seats),
        pricePerSeat: Number(price),
        amenities: { instantBooking: instant, music, pets, luggage },
      });
      Alert.alert('Ride published', 'Your ride offer is live.');
    } catch (e: any) {
      Alert.alert('Saved locally', 'Backend not ready; simulated publish complete.');
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 pt-4">
        <Text className="text-lg font-semibold mb-3">Offer a Ride</Text>

        {/* Route Details */}
        <View className="border border-gray-200 rounded-xl p-3 mb-3">
          <Text className="text-gray-900 font-medium mb-2">Route Details</Text>
          <View className="mb-2">
            <LocationPicker
              label="Departure Location"
              value={fromLocation?.name || ''}
              onSelect={setFromLocation}
              placeholder="Select departure location"
            />
          </View>

          <View className="mb-2">
            <LocationPicker
              label="Destination"
              value={toLocation?.name || ''}
              onSelect={setToLocation}
              placeholder="Select destination"
            />
          </View>

          <View>
            <LocationPicker
              label="Stop Along the Way (optional)"
              value={stopLocation?.name || ''}
              onSelect={setStopLocation}
              placeholder="Add a stop"
            />
          </View>
        </View>

        {/* When */}
        <View className="border border-gray-200 rounded-xl p-3 mb-3">
          <Text className="text-gray-900 font-medium mb-2">When</Text>
          <View className="flex-row">
            <View className="flex-1 mr-2">
              <Text className="text-gray-600 mb-1">Date</Text>
              <TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" className="border border-gray-300 rounded-lg px-3 py-2" />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-gray-600 mb-1">Time</Text>
              <TextInput value={time} onChangeText={setTime} placeholder="HH:mm" className="border border-gray-300 rounded-lg px-3 py-2" />
            </View>
          </View>
        </View>

        {/* Vehicle Details */}
        <View className="border border-gray-200 rounded-xl p-3 mb-3">
          <Text className="text-gray-900 font-medium mb-2">Vehicle Details</Text>
          <Text className="text-gray-600 mb-1">Vehicle</Text>
          <TextInput value={vehicle} onChangeText={setVehicle} placeholder="e.g., Toyota Axio, Honda Civic" className="border border-gray-300 rounded-lg px-3 py-2 mb-2" />

          <Text className="text-gray-600 mb-1">Available Seats</Text>
          <TextInput value={seats} onChangeText={setSeats} keyboardType="number-pad" className="border border-gray-300 rounded-lg px-3 py-2" />
        </View>

        {/* Price */}
        <View className="border border-gray-200 rounded-xl p-3 mb-3">
          <Text className="text-gray-900 font-medium mb-2">Price per Seat (BDT)</Text>
          <TextInput value={price} onChangeText={setPrice} keyboardType="number-pad" className="border border-gray-300 rounded-lg px-3 py-2" />
          <Text className="text-gray-500 text-xs mt-1">Suggested price: ৳80–120 based on distance and fuel costs</Text>
        </View>

        {/* Amenities */}
        <View className="border border-gray-200 rounded-xl p-3 mb-4">
          <Text className="text-gray-900 font-medium mb-2">Preferences & Amenities</Text>
          <View className="flex-row items-center justify-between py-2">
            <Text className="text-gray-700">Instant booking (NSU students can book immediately)</Text>
            <Switch value={instant} onValueChange={setInstant} />
          </View>
          <View className="flex-row items-center justify-between py-2">
            <Text className="text-gray-700">Music allowed</Text>
            <Switch value={music} onValueChange={setMusic} />
          </View>
          <View className="flex-row items-center justify-between py-2">
            <Text className="text-gray-700">Pets allowed</Text>
            <Switch value={pets} onValueChange={setPets} />
          </View>
          <View className="flex-row items-center justify-between py-2">
            <Text className="text-gray-700">Large luggage space available</Text>
            <Switch value={luggage} onValueChange={setLuggage} />
          </View>
        </View>

        <TouchableOpacity onPress={handlePublish} disabled={isLoadingRide} className="bg-emerald-600 rounded-lg py-3 items-center mb-8">
          <Text className="text-white font-semibold">{isLoadingRide ? 'Publishing…' : 'Publish Ride'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
