import { useRide } from '@/context/RideContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RideRequest {
  id: string;
  rider: {
    name: string;
    rating: number;
    trips: number;
    avatar?: string;
  };
  pickup: {
    address: string;
    distance: number; // km from driver
  };
  dropoff: {
    address: string;
  };
  seats: number;
  fare: number;
  requestedAt: Date;
  expiresIn: number; // seconds
}

export default function DriverRequestsScreen() {
  const { respondToBookingRequest, isLoadingRide } = useRide();
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    // Mock data - in production, fetch from API/WebSocket
    setRequests([
      {
        id: 'req-1',
        rider: { name: 'Nawmee Islam', rating: 4.8, trips: 15 },
        pickup: { address: 'NSU Campus Gate 2', distance: 0.5 },
        dropoff: { address: 'Gulshan 2 Circle' },
        seats: 2,
        fare: 180,
        requestedAt: new Date(),
        expiresIn: 30,
      },
      {
        id: 'req-2',
        rider: { name: 'Rafiq Ahmed', rating: 4.5, trips: 8 },
        pickup: { address: 'IUB Campus', distance: 1.2 },
        dropoff: { address: 'Banani 11' },
        seats: 1,
        fare: 120,
        requestedAt: new Date(Date.now() - 10000),
        expiresIn: 20,
      },
      {
        id: 'req-3',
        rider: { name: 'Farhana Begum', rating: 5.0, trips: 42 },
        pickup: { address: 'Bashundhara City', distance: 2.5 },
        dropoff: { address: 'Dhanmondi 27' },
        seats: 1,
        fare: 150,
        requestedAt: new Date(Date.now() - 20000),
        expiresIn: 10,
      },
    ]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAccept = (request: RideRequest) => {
    Alert.alert(
      'Accept Ride',
      `Accept ride from ${request.rider.name}?\n\nPickup: ${request.pickup.address}\nFare: ৳${request.fare}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await respondToBookingRequest(request.id, 'accept');
              setRequests((prev) => prev.filter((r) => r.id !== request.id));
              Alert.alert(
                'Ride Accepted! 🎉',
                `Navigate to ${request.pickup.address} to pick up ${request.rider.name}`,
                [
                  {
                    text: 'Start Navigation',
                    onPress: () => router.push(`/active-ride?id=${request.id}` as any),
                  },
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to accept ride. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDecline = async (requestId: string) => {
    try {
      await respondToBookingRequest(requestId, 'decline');
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (error) {
      // Still remove from local state even if API fails
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    }
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    if (isOnline) {
      Alert.alert('Going Offline', 'You will not receive new ride requests.');
    } else {
      Alert.alert('Going Online', 'You are now visible to riders.');
    }
  };

  const renderRequest = ({ item }: { item: RideRequest }) => (
    <View className="bg-white mx-4 mb-4 rounded-2xl shadow-sm overflow-hidden">
      {/* Timer Bar */}
      <View className="bg-orange-500 h-1">
        <View 
          className="bg-orange-300 h-full" 
          style={{ width: `${(item.expiresIn / 30) * 100}%` }} 
        />
      </View>

      <View className="p-4">
        {/* Rider Info */}
        <View className="flex-row items-center mb-3">
          <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
            <Text className="text-xl">{item.rider.name.charAt(0)}</Text>
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-gray-900 font-semibold">{item.rider.name}</Text>
            <Text className="text-gray-500 text-sm">⭐ {item.rider.rating} • {item.rider.trips} trips</Text>
          </View>
          <View className="items-end">
            <Text className="text-emerald-600 font-bold text-xl">৳{item.fare}</Text>
            <Text className="text-gray-400 text-xs">{item.seats} seat{item.seats > 1 ? 's' : ''}</Text>
          </View>
        </View>

        {/* Route */}
        <View className="bg-gray-50 rounded-xl p-3 mb-3">
          <View className="flex-row items-center mb-2">
            <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
            <Text className="text-gray-700 flex-1" numberOfLines={1}>{item.pickup.address}</Text>
            <Text className="text-emerald-600 text-sm">{item.pickup.distance} km</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
            <Text className="text-gray-700 flex-1" numberOfLines={1}>{item.dropoff.address}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => handleDecline(item.id)}
            className="flex-1 bg-gray-100 py-3 rounded-xl items-center mr-2"
          >
            <Text className="text-gray-600 font-medium">Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleAccept(item)}
            className="flex-1 bg-emerald-600 py-3 rounded-xl items-center ml-2"
          >
            <Text className="text-white font-semibold">Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Ride Requests</Text>
        <TouchableOpacity
          onPress={toggleOnlineStatus}
          className={`px-3 py-1 rounded-full ${isOnline ? 'bg-emerald-100' : 'bg-gray-100'}`}
        >
          <Text className={isOnline ? 'text-emerald-600 font-medium' : 'text-gray-500'}>
            {isOnline ? '● Online' : '○ Offline'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View className="flex-row px-4 py-4 bg-white border-b border-gray-100">
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold text-gray-900">{requests.length}</Text>
          <Text className="text-gray-500 text-sm">Pending</Text>
        </View>
        <View className="flex-1 items-center border-l border-r border-gray-200">
          <Text className="text-2xl font-bold text-emerald-600">৳2,450</Text>
          <Text className="text-gray-500 text-sm">Today's Earnings</Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold text-gray-900">12</Text>
          <Text className="text-gray-500 text-sm">Trips Today</Text>
        </View>
      </View>

      {/* Request List */}
      {requests.length > 0 ? (
        <FlatList
          data={requests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />
          }
        />
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-6xl mb-4">🚗</Text>
          <Text className="text-gray-900 font-semibold text-xl mb-2">No Requests Yet</Text>
          <Text className="text-gray-500 text-center">
            {isOnline
              ? 'Stay online to receive ride requests from nearby riders.'
              : 'Go online to start receiving ride requests.'}
          </Text>
          {!isOnline && (
            <TouchableOpacity
              onPress={toggleOnlineStatus}
              className="mt-6 bg-emerald-600 px-8 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Go Online</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
