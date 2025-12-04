import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type RideStatus = 'waiting' | 'driver_arriving' | 'picked_up' | 'in_progress' | 'arriving' | 'completed';

interface ActiveRideData {
  id: string;
  status: RideStatus;
  driver: {
    name: string;
    phone: string;
    rating: number;
    avatar?: string;
  };
  vehicle: {
    make: string;
    model: string;
    color: string;
    plate: string;
  };
  route: {
    from: string;
    to: string;
  };
  eta: number; // minutes
  fare: number;
}

const STATUS_CONFIG: Record<RideStatus, { title: string; subtitle: string; color: string; icon: string }> = {
  waiting: { title: 'Waiting for driver', subtitle: 'Driver will arrive soon', color: 'bg-yellow-500', icon: '⏳' },
  driver_arriving: { title: 'Driver is on the way', subtitle: 'Be ready at pickup point', color: 'bg-blue-500', icon: '🚗' },
  picked_up: { title: 'Driver has arrived', subtitle: 'Meet your driver at pickup', color: 'bg-emerald-500', icon: '📍' },
  in_progress: { title: 'Ride in progress', subtitle: 'Enjoy your ride!', color: 'bg-emerald-600', icon: '🛣️' },
  arriving: { title: 'Almost there!', subtitle: 'Arriving at destination', color: 'bg-purple-500', icon: '🎯' },
  completed: { title: 'Ride completed', subtitle: 'Thanks for riding with us!', color: 'bg-gray-500', icon: '✅' },
};

export default function ActiveRideScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const [ride, setRide] = useState<ActiveRideData | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    // Mock ride data - in production, fetch from API and subscribe to WebSocket updates
    setRide({
      id: params.id || 'ride-1',
      status: 'driver_arriving',
      driver: {
        name: 'Tahsin Rahman',
        phone: '+8801712345678',
        rating: 4.9,
      },
      vehicle: {
        make: 'Toyota',
        model: 'Axio',
        color: 'Silver',
        plate: 'Dhaka Metro GA 12-3456',
      },
      route: {
        from: 'NSU Campus, Bashundhara',
        to: 'Dhanmondi 27',
      },
      eta: 5,
      fare: 126,
    });

    // Simulate status updates
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [params.id]);

  // Simulate ride progress
  useEffect(() => {
    if (!ride) return;

    const statusSequence: RideStatus[] = ['waiting', 'driver_arriving', 'picked_up', 'in_progress', 'arriving', 'completed'];
    const currentIndex = statusSequence.indexOf(ride.status);
    
    if (currentIndex < statusSequence.length - 1 && timeElapsed > 0 && timeElapsed % 15 === 0) {
      setRide((prev) => prev ? { ...prev, status: statusSequence[currentIndex + 1] } : null);
    }
  }, [timeElapsed]);

  const handleCall = () => {
    if (ride?.driver.phone) {
      Linking.openURL(`tel:${ride.driver.phone}`);
    }
  };

  const handleMessage = () => {
    Alert.alert('Chat', 'In-app chat coming soon!');
  };

  const handleEmergency = () => {
    Alert.alert(
      'Emergency',
      'Are you sure you want to share your location with emergency contacts?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share Location', style: 'destructive', onPress: () => Alert.alert('Location Shared', 'Your emergency contacts have been notified.') },
      ]
    );
  };

  const handleCancelRide = () => {
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride? A cancellation fee may apply.',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive', 
          onPress: () => {
            Alert.alert('Ride Cancelled', 'Your ride has been cancelled.');
            router.replace('/(tabs)');
          }
        },
      ]
    );
  };

  if (!ride) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Loading ride...</Text>
      </SafeAreaView>
    );
  }

  const statusConfig = STATUS_CONFIG[ride.status];

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Map Placeholder */}
      <View className="flex-1 bg-gray-200 items-center justify-center">
        <View className="bg-white/90 px-6 py-4 rounded-2xl items-center">
          <Text className="text-4xl mb-2">🗺️</Text>
          <Text className="text-gray-600">Map View</Text>
          <Text className="text-gray-400 text-sm">Real-time tracking</Text>
        </View>
        
        {/* ETA Badge */}
        <View className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg">
          <Text className="text-emerald-600 font-bold">{ride.eta} min</Text>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View className="bg-white rounded-t-3xl shadow-lg">
        {/* Status Bar */}
        <View className={`${statusConfig.color} px-6 py-4 rounded-t-3xl`}>
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">{statusConfig.icon}</Text>
            <View className="flex-1">
              <Text className="text-white font-bold text-lg">{statusConfig.title}</Text>
              <Text className="text-white/80">{statusConfig.subtitle}</Text>
            </View>
          </View>
        </View>

        {/* Driver Info */}
        <View className="px-6 py-4 border-b border-gray-100">
          <View className="flex-row items-center">
            <View className="w-14 h-14 bg-emerald-100 rounded-full items-center justify-center">
              <Text className="text-xl">{ride.driver.name.charAt(0)}</Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-gray-900 font-semibold text-lg">{ride.driver.name}</Text>
              <Text className="text-gray-500">⭐ {ride.driver.rating} • {ride.vehicle.make} {ride.vehicle.model}</Text>
              <Text className="text-gray-400 text-sm">{ride.vehicle.color} • {ride.vehicle.plate}</Text>
            </View>
            
            {/* Action Buttons */}
            <View className="flex-row">
              <TouchableOpacity onPress={handleCall} className="w-12 h-12 bg-emerald-100 rounded-full items-center justify-center mr-2">
                <Ionicons name="call" size={22} color="#059669" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleMessage} className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
                <Ionicons name="chatbubble" size={22} color="#2563EB" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Route Info */}
        <View className="px-6 py-4 border-b border-gray-100">
          <View className="flex-row items-center mb-2">
            <View className="w-3 h-3 rounded-full bg-emerald-500 mr-3" />
            <Text className="text-gray-700 flex-1" numberOfLines={1}>{ride.route.from}</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-red-500 mr-3" />
            <Text className="text-gray-700 flex-1" numberOfLines={1}>{ride.route.to}</Text>
          </View>
        </View>

        {/* Fare & Actions */}
        <View className="px-6 py-4">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-gray-500 text-sm">Estimated Fare</Text>
              <Text className="text-2xl font-bold text-gray-900">৳{ride.fare}</Text>
            </View>
            <View className="flex-row">
              <TouchableOpacity onPress={handleEmergency} className="bg-red-50 px-4 py-2 rounded-lg mr-2">
                <Text className="text-red-600 font-medium">🆘 Emergency</Text>
              </TouchableOpacity>
            </View>
          </View>

          {ride.status !== 'completed' && ride.status !== 'in_progress' && ride.status !== 'arriving' && (
            <TouchableOpacity onPress={handleCancelRide} className="border border-gray-300 py-3 rounded-xl items-center">
              <Text className="text-gray-600 font-medium">Cancel Ride</Text>
            </TouchableOpacity>
          )}

          {ride.status === 'completed' && (
            <TouchableOpacity onPress={() => router.replace('/(tabs)')} className="bg-emerald-600 py-3 rounded-xl items-center">
              <Text className="text-white font-semibold">Rate & Finish</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
