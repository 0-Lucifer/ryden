import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 py-8 bg-emerald-600">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-white text-2xl font-bold mb-1">Hello Nawmee! 👋</Text>
              <Text className="text-emerald-100 text-sm">Ready for your next ride from NSU?</Text>
            </View>
            <TouchableOpacity className="w-12 h-12 bg-emerald-700 rounded-full items-center justify-center">
              <Text className="text-white text-xl">👤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Action Cards */}
        <View className="px-6 py-6">
          {/* Find a Ride Card */}
          <TouchableOpacity className="bg-white border-2 border-emerald-500 rounded-3xl p-6 mb-4" onPress={() => router.push('/find-ride')}>
            <View className="flex-row items-center">
              <View className="w-14 h-14 bg-emerald-500 rounded-2xl items-center justify-center mr-4">
                <Text className="text-3xl">📍</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="text-gray-900 font-bold text-lg">Find a Ride</Text>
                  <Text className="text-emerald-600 ml-2">✨</Text>
                </View>
                <Text className="text-gray-600 text-sm">Search rides from NSU to anywhere in Dhaka</Text>
                <Text className="text-emerald-600 text-xs mt-1">🕒 15 rides available now</Text>
              </View>
              <Text className="text-gray-400 text-3xl ml-2">→</Text>
            </View>
          </TouchableOpacity>

          {/* Offer a Ride Card */}
          <TouchableOpacity className="bg-orange-500 rounded-3xl p-6 mb-6" onPress={() => router.push('/offer-ride')}>
            <View className="flex-row items-center">
              <View className="w-14 h-14 bg-orange-600 rounded-2xl items-center justify-center mr-4">
                <Text className="text-3xl">📊</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-lg mb-1">Offer a Ride</Text>
                <Text className="text-orange-100 text-sm">Share your car and earn while commuting</Text>
                <Text className="text-orange-200 text-xs mt-1">💰 Earn up to 150tk/day</Text>
              </View>
              <Text className="text-white text-3xl ml-2">→</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Upcoming Ride */}
        <View className="px-6 pb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-900 font-bold text-xl">Upcoming Ride</Text>
            <TouchableOpacity>
              <Text className="text-emerald-600 font-medium">View All →</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white border-2 border-gray-200 rounded-3xl p-5">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-orange-100 rounded-full items-center justify-center mr-3">
                <Text className="text-2xl">👨</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-base">Driver: Tahsin Rahman</Text>
                <View className="flex-row items-center">
                  <Text className="text-yellow-500 mr-1">⭐</Text>
                  <Text className="text-gray-600 text-sm">4.9</Text>
                </View>
              </View>
              <View className="bg-emerald-100 px-4 py-2 rounded-full">
                <Text className="text-emerald-700 font-bold">৳120</Text>
              </View>
            </View>

            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                <Text className="text-xl">📍</Text>
              </View>
              <Text className="text-gray-700 flex-1">Dhanmondi</Text>
            </View>

            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                <Text className="text-xl">🕐</Text>
              </View>
              <Text className="text-gray-700 flex-1">Today, 5:00 PM</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 pb-6">
          <Text className="text-gray-900 font-bold text-base mb-4">Quick Actions</Text>
          <View className="flex-row">
            <TouchableOpacity className="flex-1 bg-purple-50 border border-purple-100 py-5 rounded-2xl items-center mr-3">
              <Text className="text-3xl mb-2">📅</Text>
              <Text className="text-purple-700 font-bold text-sm">My Rides</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-indigo-50 border border-indigo-100 py-5 rounded-2xl items-center">
              <Text className="text-3xl mb-2">👤</Text>
              <Text className="text-indigo-700 font-bold text-sm">Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Your NSU Impact */}
        <View className="px-6 pb-8">
          <Text className="text-gray-900 font-bold text-xl mb-4">Your NSU Impact</Text>
          <View className="bg-emerald-600 rounded-3xl p-6">
            <View className="flex-row justify-between mb-4">
              <View className="flex-1 items-center">
                <Text className="text-white text-3xl font-bold mb-1">12</Text>
                <Text className="text-emerald-100 text-xs text-center">Rides Taken</Text>
              </View>
              <View className="flex-1 items-center border-l-2 border-r-2 border-emerald-500">
                <Text className="text-white text-3xl font-bold mb-1">৳2.4K</Text>
                <Text className="text-emerald-100 text-xs text-center">Money Saved</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-white text-3xl font-bold mb-1">8</Text>
                <Text className="text-emerald-100 text-xs text-center">NSU Friends</Text>
              </View>
            </View>

            <View className="bg-emerald-700 rounded-2xl p-4 mt-2">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">🌱</Text>
                <View className="flex-1">
                  <Text className="text-white font-bold">Environmental Impact</Text>
                  <Text className="text-emerald-200 text-xs mt-1">You've saved 45kg of CO₂ emissions! 🎉</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
