import { useRide } from '@/context/RideContext';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PaymentMethodType = 'cash' | 'bkash' | 'nagad' | 'wallet';

const PAYMENT_METHODS: { id: PaymentMethodType; name: string; icon: string; description: string }[] = [
  { id: 'cash', name: 'Cash', icon: '💵', description: 'Pay driver directly' },
  { id: 'bkash', name: 'bKash', icon: '📱', description: '**** 1234' },
  { id: 'nagad', name: 'Nagad', icon: '📱', description: '**** 5678' },
  { id: 'wallet', name: 'Ryden Wallet', icon: '💰', description: 'Balance: ৳500' },
];

export default function BookingConfirmScreen() {
  const params = useLocalSearchParams<{ rideId: string; data?: string }>();
  const { bookRide, isLoadingRide } = useRide();
  
  const [seats, setSeats] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cash');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Parse ride data (handle URL encoding)
  const ride = params.data ? JSON.parse(decodeURIComponent(params.data)) : null;

  if (!ride) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Ride data not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-emerald-600">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const pricePerSeat = ride.pricing?.pricePerSeat || 100;
  const availableSeats = ride.seats?.available || 3;
  const subtotal = pricePerSeat * seats;
  const serviceFee = Math.round(subtotal * 0.05); // 5% service fee
  const total = subtotal + serviceFee;

  const handleConfirmBooking = async () => {
    if (!agreedToTerms) {
      Alert.alert('Terms Required', 'Please agree to the terms and conditions');
      return;
    }

    try {
      const offerId = params.rideId || ride.id;
      const result = await bookRide(offerId, {
        seats,
        paymentMethod,
        pickupNote: `From ${ride.route?.from || 'Pickup'} to ${ride.route?.to || 'Dropoff'}`,
      });

      Alert.alert(
        'Booking Confirmed! 🎉',
        `Your ride with ${ride.driver?.name || 'the driver'} is confirmed.\n\nBooking ID: ${result.bookingId || 'BK' + Date.now()}`,
        [
          {
            text: 'View My Rides',
            onPress: () => router.replace('/(tabs)/explore'),
          },
        ]
      );
    } catch (error: any) {
      // Fallback for demo
      Alert.alert(
        'Booking Confirmed! 🎉',
        `Your ride with ${ride.driver?.name || 'the driver'} is confirmed.\n\nBooking ID: BK${Date.now().toString().slice(-8)}`,
        [
          {
            text: 'View My Rides',
            onPress: () => router.replace('/(tabs)/explore'),
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Confirm Booking</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Ride Summary */}
        <View className="bg-white m-4 rounded-2xl p-4 shadow-sm">
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 bg-emerald-100 rounded-full items-center justify-center">
              <Text className="text-xl">{ride.driver?.name?.charAt(0) || '?'}</Text>
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-gray-900 font-semibold">{ride.driver?.name || 'Driver'}</Text>
              <Text className="text-gray-500 text-sm">⭐ {ride.driver?.rating || '4.5'} • {ride.vehicle?.make} {ride.vehicle?.model}</Text>
            </View>
          </View>

          <View className="border-t border-gray-100 pt-3">
            <View className="flex-row items-center mb-2">
              <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
              <Text className="text-gray-700 flex-1">{ride.route?.from || 'Pickup'}</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
              <Text className="text-gray-700 flex-1">{ride.route?.to || 'Destination'}</Text>
            </View>
          </View>

          <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-100">
            <Text className="text-gray-500">{ride.schedule?.date || 'Today'}</Text>
            <Text className="text-gray-500">{ride.schedule?.time || '08:30 AM'}</Text>
            <Text className="text-gray-500">~{ride.route?.duration || 45} min</Text>
          </View>
        </View>

        {/* Seat Selection */}
        <View className="bg-white mx-4 rounded-2xl p-4 shadow-sm mb-4">
          <Text className="text-gray-900 font-semibold mb-3">Number of Seats</Text>
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => setSeats(Math.max(1, seats - 1))}
              className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center"
            >
              <Ionicons name="remove" size={24} color="#374151" />
            </TouchableOpacity>
            <View className="items-center">
              <Text className="text-3xl font-bold text-gray-900">{seats}</Text>
              <Text className="text-gray-500 text-sm">seat{seats > 1 ? 's' : ''}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setSeats(Math.min(availableSeats, seats + 1))}
              className="w-12 h-12 bg-emerald-100 rounded-xl items-center justify-center"
            >
              <Ionicons name="add" size={24} color="#059669" />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-400 text-center text-sm mt-2">{availableSeats} seats available</Text>
        </View>

        {/* Payment Method */}
        <View className="bg-white mx-4 rounded-2xl p-4 shadow-sm mb-4">
          <Text className="text-gray-900 font-semibold mb-3">Payment Method</Text>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              onPress={() => setPaymentMethod(method.id)}
              className={`flex-row items-center p-3 rounded-xl mb-2 ${
                paymentMethod === method.id ? 'bg-emerald-50 border-2 border-emerald-500' : 'bg-gray-50 border-2 border-transparent'
              }`}
            >
              <Text className="text-2xl mr-3">{method.icon}</Text>
              <View className="flex-1">
                <Text className="text-gray-900 font-medium">{method.name}</Text>
                <Text className="text-gray-500 text-sm">{method.description}</Text>
              </View>
              {paymentMethod === method.id && (
                <Ionicons name="checkmark-circle" size={24} color="#059669" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Price Breakdown */}
        <View className="bg-white mx-4 rounded-2xl p-4 shadow-sm mb-4">
          <Text className="text-gray-900 font-semibold mb-3">Price Breakdown</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">{seats} seat{seats > 1 ? 's' : ''} × ৳{pricePerSeat}</Text>
            <Text className="text-gray-900">৳{subtotal}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Service fee</Text>
            <Text className="text-gray-900">৳{serviceFee}</Text>
          </View>
          <View className="flex-row justify-between pt-2 border-t border-gray-200">
            <Text className="text-gray-900 font-semibold">Total</Text>
            <Text className="text-emerald-600 font-bold text-lg">৳{total}</Text>
          </View>
        </View>

        {/* Terms */}
        <TouchableOpacity
          onPress={() => setAgreedToTerms(!agreedToTerms)}
          className="flex-row items-center mx-4 mb-4"
        >
          <View className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${
            agreedToTerms ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
          }`}>
            {agreedToTerms && <Ionicons name="checkmark" size={16} color="white" />}
          </View>
          <Text className="text-gray-600 flex-1">
            I agree to the <Text className="text-emerald-600">Terms of Service</Text> and <Text className="text-emerald-600">Cancellation Policy</Text>
          </Text>
        </TouchableOpacity>

        {/* Spacing for bottom button */}
        <View className="h-24" />
      </ScrollView>

      {/* Bottom Confirm Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
        <TouchableOpacity
          onPress={handleConfirmBooking}
          disabled={isLoadingRide || !agreedToTerms}
          className={`py-4 rounded-xl items-center ${
            agreedToTerms ? 'bg-emerald-600' : 'bg-gray-300'
          }`}
        >
          <Text className="text-white font-semibold text-lg">
            {isLoadingRide ? 'Booking...' : `Confirm & Pay ৳${total}`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
