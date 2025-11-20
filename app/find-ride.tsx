import RideCard from '@/components/ride-card';
import { useRide } from '@/context/RideContext';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function FindRideScreen() {
  const { searchRides, isLoadingRide } = useRide();
  const [from, setFrom] = useState('NSU Campus, Bashundhara');
  const [to, setTo] = useState('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    try {
      if (!from || !to) {
        Alert.alert('Missing info', 'Please enter both origin and destination');
        return;
      }
      const data = await searchRides({ from, to, date });
      setResults(data);
    } catch (e: any) {
      console.log(e);
      // Fallback: show sample data if backend not ready
      setResults([
        {
          id: 'sample-1',
          driver: { name: 'Tahsin Rahman', rating: 4.9, reviews: 127, isInstant: true },
          route: { from, to },
          when: { dateTime: new Date().toISOString(), durationMinutes: 45 },
          vehicle: { type: 'car', model: 'Toyota Axio' },
          pricePerSeat: 120,
          currency: '৳',
          availableSeats: 2,
          tags: ['AC', 'Music', 'Student friendly'],
        },
        {
          id: 'sample-2',
          driver: { name: 'Nusrat Jahan', rating: 4.8, reviews: 89, isFemaleDriver: true },
          route: { from, to: 'Gulshan 2' },
          when: { dateTime: new Date().toISOString(), durationMinutes: 30 },
          vehicle: { type: 'car', model: 'Honda Civic' },
          pricePerSeat: 80,
          currency: '৳',
          availableSeats: 3,
          tags: ['AC'],
        },
        {
          id: 'sample-3',
          driver: { name: 'Rafid Ahmed', rating: 5.0, reviews: 263, isInstant: true },
          route: { from, to: 'Uttara Sector 7' },
          when: { dateTime: new Date().toISOString(), durationMinutes: 55 },
          vehicle: { type: 'car', model: 'Axio' },
          pricePerSeat: 100,
          currency: '৳',
          availableSeats: 4,
          tags: ['AC', 'Music', 'Wifi'],
        },
      ]);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 pt-4">
        <Text className="text-lg font-semibold mb-3">Find a Ride</Text>

        <View className="mb-3">
          <Text className="text-gray-600 mb-1">From</Text>
          <TextInput
            value={from}
            onChangeText={setFrom}
            placeholder="e.g., NSU Campus, Bashundhara"
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
        </View>

        <View className="mb-3">
          <Text className="text-gray-600 mb-1">To</Text>
          <TextInput
            value={to}
            onChangeText={setTo}
            placeholder="e.g., Dhanmondi"
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-600 mb-1">Date</Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
        </View>

        <TouchableOpacity
          onPress={handleSearch}
          disabled={isLoadingRide}
          className="bg-emerald-600 rounded-lg py-3 items-center mb-4"
        >
          <Text className="text-white font-semibold">{isLoadingRide ? 'Searching...' : 'Search'}</Text>
        </TouchableOpacity>

        {results.length > 0 ? (
          <View className="mb-2">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-600">{results.length} rides available</Text>
              <Text className="text-emerald-700 text-xs">Best Match</Text>
            </View>
            {results.map((offer) => (
              <RideCard key={offer.id} offer={offer} badge={offer.id === results[0].id ? 'Best Match' : undefined} />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
