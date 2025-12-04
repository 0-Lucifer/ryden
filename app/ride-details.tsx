import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RideDetails {
  id: string;
  driver: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    reviews: number;
    trips: number;
    phone?: string;
    isVerified: boolean;
  };
  vehicle: {
    type: string;
    make: string;
    model: string;
    color: string;
    plate: string;
    year: number;
  };
  route: {
    from: string;
    to: string;
    stops?: string[];
    distance: number;
    duration: number;
  };
  schedule: {
    date: string;
    time: string;
    departureTime: string;
  };
  pricing: {
    pricePerSeat: number;
    currency: string;
  };
  seats: {
    total: number;
    available: number;
  };
  amenities: string[];
  rules: string[];
}

export default function RideDetailsScreen() {
  const params = useLocalSearchParams<{ id: string; data?: string }>();
  const [ride, setRide] = useState<RideDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to parse passed data or fetch from API
    if (params.data) {
      try {
        const parsed = JSON.parse(params.data);
        setRide(transformToRideDetails(parsed));
      } catch (e) {
        loadRideDetails();
      }
    } else {
      loadRideDetails();
    }
    setLoading(false);
  }, [params.id]);

  const loadRideDetails = () => {
    // Mock data - in production, fetch from API
    setRide({
      id: params.id || 'ride-1',
      driver: {
        id: 'driver-1',
        name: 'Tahsin Rahman',
        rating: 4.9,
        reviews: 127,
        trips: 342,
        isVerified: true,
      },
      vehicle: {
        type: 'car',
        make: 'Toyota',
        model: 'Axio',
        color: 'Silver',
        plate: 'Dhaka Metro GA 12-3456',
        year: 2019,
      },
      route: {
        from: 'NSU Campus, Bashundhara',
        to: 'Dhanmondi 27',
        stops: ['Badda', 'Rampura'],
        distance: 15.5,
        duration: 45,
      },
      schedule: {
        date: new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
        time: '08:30 AM',
        departureTime: new Date().toISOString(),
      },
      pricing: {
        pricePerSeat: 120,
        currency: '৳',
      },
      seats: {
        total: 3,
        available: 2,
      },
      amenities: ['AC', 'Music', 'Wifi', 'Phone Charger'],
      rules: ['No smoking', 'Max 1 bag', 'Be on time'],
    });
  };

  const transformToRideDetails = (data: any): RideDetails => {
    return {
      id: data.id,
      driver: {
        id: data.driver?.id || 'unknown',
        name: data.driver?.name || 'Unknown Driver',
        rating: data.driver?.rating || 0,
        reviews: data.driver?.reviews || 0,
        trips: data.driver?.trips || 0,
        isVerified: data.driver?.isVerified ?? true,
      },
      vehicle: {
        type: data.vehicle?.type || 'car',
        make: data.vehicle?.make || 'Unknown',
        model: data.vehicle?.model || 'Unknown',
        color: data.vehicle?.color || 'Unknown',
        plate: data.vehicle?.plate || 'N/A',
        year: data.vehicle?.year || 2020,
      },
      route: {
        from: data.route?.from || 'Unknown',
        to: data.route?.to || 'Unknown',
        stops: data.route?.stops || [],
        distance: data.route?.distance || 0,
        duration: data.when?.durationMinutes || 45,
      },
      schedule: {
        date: new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
        time: new Date(data.when?.dateTime || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        departureTime: data.when?.dateTime || new Date().toISOString(),
      },
      pricing: {
        pricePerSeat: data.pricePerSeat || 100,
        currency: data.currency || '৳',
      },
      seats: {
        total: data.totalSeats || 4,
        available: data.availableSeats || 2,
      },
      amenities: data.tags || ['AC'],
      rules: ['No smoking', 'Be on time'],
    };
  };

  const handleBookNow = () => {
    if (!ride) return;
    router.push(`/booking-confirm?rideId=${ride.id}&data=${encodeURIComponent(JSON.stringify(ride))}` as any);
  };

  if (loading || !ride) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Ride Details</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Driver Card */}
        <View className="bg-white m-4 rounded-2xl p-4 shadow-sm">
          <View className="flex-row items-center">
            <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center">
              {ride.driver.avatar ? (
                <Image source={{ uri: ride.driver.avatar }} className="w-16 h-16 rounded-full" />
              ) : (
                <Text className="text-2xl">{ride.driver.name.charAt(0)}</Text>
              )}
            </View>
            <View className="ml-4 flex-1">
              <View className="flex-row items-center">
                <Text className="text-lg font-semibold text-gray-900">{ride.driver.name}</Text>
                {ride.driver.isVerified && (
                  <View className="ml-2 bg-blue-100 px-2 py-0.5 rounded-full">
                    <Text className="text-blue-600 text-xs">✓ Verified</Text>
                  </View>
                )}
              </View>
              <View className="flex-row items-center mt-1">
                <Text className="text-yellow-500">⭐</Text>
                <Text className="text-gray-700 ml-1">{ride.driver.rating}</Text>
                <Text className="text-gray-400 mx-1">•</Text>
                <Text className="text-gray-500">{ride.driver.reviews} reviews</Text>
                <Text className="text-gray-400 mx-1">•</Text>
                <Text className="text-gray-500">{ride.driver.trips} trips</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Route Card */}
        <View className="bg-white mx-4 rounded-2xl p-4 shadow-sm mb-4">
          <Text className="text-gray-900 font-semibold mb-3">Route</Text>
          
          <View className="flex-row">
            <View className="items-center mr-3">
              <View className="w-3 h-3 rounded-full bg-emerald-500" />
              <View className="w-0.5 flex-1 bg-gray-300 my-1" />
              {ride.route.stops?.map((_, i) => (
                <React.Fragment key={i}>
                  <View className="w-2 h-2 rounded-full bg-gray-400" />
                  <View className="w-0.5 flex-1 bg-gray-300 my-1" />
                </React.Fragment>
              ))}
              <View className="w-3 h-3 rounded-full bg-red-500" />
            </View>
            
            <View className="flex-1">
              <View className="mb-3">
                <Text className="text-gray-900 font-medium">{ride.route.from}</Text>
                <Text className="text-gray-500 text-sm">{ride.schedule.time} departure</Text>
              </View>
              
              {ride.route.stops?.map((stop, i) => (
                <View key={i} className="mb-3">
                  <Text className="text-gray-700">{stop}</Text>
                  <Text className="text-gray-400 text-xs">Stop</Text>
                </View>
              ))}
              
              <View>
                <Text className="text-gray-900 font-medium">{ride.route.to}</Text>
                <Text className="text-gray-500 text-sm">~{ride.route.duration} min ({ride.route.distance} km)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Vehicle Card */}
        <View className="bg-white mx-4 rounded-2xl p-4 shadow-sm mb-4">
          <Text className="text-gray-900 font-semibold mb-3">Vehicle</Text>
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center">
              <Text className="text-2xl">🚗</Text>
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-gray-900 font-medium">{ride.vehicle.make} {ride.vehicle.model}</Text>
              <Text className="text-gray-500 text-sm">{ride.vehicle.color} • {ride.vehicle.year}</Text>
            </View>
            <View className="bg-gray-100 px-3 py-1 rounded-lg">
              <Text className="text-gray-700 text-xs font-mono">{ride.vehicle.plate}</Text>
            </View>
          </View>
        </View>

        {/* Amenities */}
        <View className="bg-white mx-4 rounded-2xl p-4 shadow-sm mb-4">
          <Text className="text-gray-900 font-semibold mb-3">Amenities</Text>
          <View className="flex-row flex-wrap">
            {ride.amenities.map((amenity, i) => (
              <View key={i} className="bg-emerald-50 px-3 py-1.5 rounded-full mr-2 mb-2">
                <Text className="text-emerald-700 text-sm">{amenity}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Rules */}
        <View className="bg-white mx-4 rounded-2xl p-4 shadow-sm mb-4">
          <Text className="text-gray-900 font-semibold mb-3">Ride Rules</Text>
          {ride.rules.map((rule, i) => (
            <View key={i} className="flex-row items-center mb-2">
              <Ionicons name="information-circle-outline" size={18} color="#6B7280" />
              <Text className="text-gray-600 ml-2">{rule}</Text>
            </View>
          ))}
        </View>

        {/* Spacing for bottom button */}
        <View className="h-24" />
      </ScrollView>

      {/* Bottom Booking Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
        <View className="flex-row items-center justify-between">
          <View>
            <View className="flex-row items-baseline">
              <Text className="text-2xl font-bold text-emerald-600">{ride.pricing.currency}{ride.pricing.pricePerSeat}</Text>
              <Text className="text-gray-500 ml-1">/seat</Text>
            </View>
            <Text className="text-gray-500 text-sm">{ride.seats.available} seats available</Text>
          </View>
          <TouchableOpacity
            onPress={handleBookNow}
            className="bg-emerald-600 px-8 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold text-lg">Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
