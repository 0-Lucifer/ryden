import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const rideHistory = [
    {
      id: '1',
      date: 'Today, 2:30 PM',
      from: '123 Main Street',
      to: 'Central Mall',
      driver: 'John Doe',
      price: '$12.00',
      status: 'completed',
      rating: 5,
    },
    {
      id: '2',
      date: 'Yesterday, 5:45 PM',
      from: 'Home',
      to: 'Office Complex',
      driver: 'Sarah Smith',
      price: '$8.50',
      status: 'completed',
      rating: 5,
    },
    {
      id: '3',
      date: 'Nov 18, 9:15 AM',
      from: 'Airport Terminal 2',
      to: '456 Oak Avenue',
      driver: 'Mike Johnson',
      price: '$28.00',
      status: 'completed',
      rating: 4,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-indigo-600 px-6 py-6">
        <Text className="text-white text-3xl font-bold mb-2">My Trips</Text>
        <Text className="text-indigo-100 text-base">Track your ride history & savings</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Stats Cards */}
        <View className="flex-row px-5 py-5">
          <View className="flex-1 bg-indigo-600 p-5 rounded-2xl mr-3 shadow-lg">
            <Text className="text-indigo-100 text-sm font-medium mb-2">🚗 Total Trips</Text>
            <Text className="text-white text-4xl font-bold">24</Text>
            <Text className="text-indigo-200 text-xs mt-1">This month</Text>
          </View>
          <View className="flex-1 bg-green-600 p-5 rounded-2xl shadow-lg">
            <Text className="text-green-100 text-sm font-medium mb-2">💰 Money Saved</Text>
            <Text className="text-white text-4xl font-bold">$145</Text>
            <Text className="text-green-200 text-xs mt-1">vs. solo driving</Text>
          </View>
        </View>

        {/* Ride History */}
        <View className="px-5 py-3">
          <Text className="text-xl font-bold text-gray-900 mb-1">Recent Trips</Text>
          <Text className="text-gray-600 text-sm mb-4">Your ride sharing history</Text>
          
          {rideHistory.map((ride) => (
            <TouchableOpacity
              key={ride.id}
            className="bg-white p-5 rounded-3xl mb-4 border border-gray-200"
            >
              {/* Date and Price */}
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-500 text-sm font-medium">{ride.date}</Text>
                <View className="bg-indigo-50 px-3 py-1 rounded-full">
                  <Text className="text-indigo-600 font-bold text-base">{ride.price}</Text>
                </View>
              </View>

              {/* Route */}
              <View className="mb-4">
                <View className="flex-row items-center mb-2">
                  <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                    <Text className="text-green-600 text-base">📍</Text>
                  </View>
                  <Text className="flex-1 text-gray-900 font-medium">{ride.from}</Text>
                </View>
                <View className="ml-4 w-px h-5 bg-gray-300" />
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-indigo-100 rounded-full items-center justify-center mr-3">
                    <Text className="text-indigo-600 text-base">🎯</Text>
                  </View>
                  <Text className="flex-1 text-gray-900 font-medium">{ride.to}</Text>
                </View>
              </View>

              {/* Driver and Rating */}
              <View className="flex-row justify-between items-center pt-4 border-t border-gray-100">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-indigo-600 rounded-full items-center justify-center mr-3">
                    <Text className="text-white font-bold text-base">{ride.driver.charAt(0)}</Text>
                  </View>
                  <View>
                    <Text className="text-gray-900 font-bold">{ride.driver}</Text>
                    <Text className="text-gray-500 text-xs">Driver</Text>
                  </View>
                </View>
                <View className="flex-row items-center bg-yellow-50 px-3 py-1 rounded-full">
                  <Text className="text-yellow-600 mr-1">⭐</Text>
                  <Text className="text-gray-900 font-bold">{ride.rating}.0</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Load More Button */}
        <TouchableOpacity className="mx-5 mb-8 py-4 bg-white border-2 border-indigo-600 rounded-full shadow-sm">
          <Text className="text-indigo-600 text-center font-bold text-base">Load More Trips</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
