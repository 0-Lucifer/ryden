import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const router = useRouter();
  const { logout, isLoading } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/welcome');
            } catch (error) {
              console.error('[Profile] Logout failed:', error);
            }
          }
        }
      ]
    );
  };

  const menuItems = [
    { icon: '👤', title: 'Personal Info', subtitle: 'Update your details', screen: '' },
    { icon: '💳', title: 'Payment Methods', subtitle: 'Manage cards & wallets', screen: '' },
    { icon: '🎫', title: 'Promotions', subtitle: 'View offers & discounts', screen: '' },
    { icon: '❤️', title: 'Saved Places', subtitle: 'Home, work & more', screen: '' },
    { icon: '🛡️', title: 'Safety', subtitle: 'Emergency contacts', screen: '' },
    { icon: '📊', title: 'My Stats', subtitle: 'View your activity', screen: '' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="bg-indigo-600 px-6 py-10 items-center">
          <View className="w-28 h-28 bg-white rounded-full items-center justify-center mb-4 border-4 border-indigo-400">
            <Text className="text-indigo-600 text-5xl font-bold">JD</Text>
          </View>
          <Text className="text-white text-3xl font-bold mb-2">John Doe</Text>
          <Text className="text-indigo-100 mb-1 text-base">john.doe@email.com</Text>
          <Text className="text-indigo-200 text-sm">+1 (555) 123-4567</Text>
          
          {/* Rating */}
          <View className="flex-row items-center mt-5 bg-white px-6 py-3 rounded-full border-2 border-indigo-300">
            <Text className="text-yellow-500 text-2xl mr-2">⭐</Text>
            <Text className="text-gray-900 font-bold text-xl">4.9</Text>
            <Text className="text-gray-600 ml-2 font-medium">(24 trips)</Text>
          </View>
          
          {/* Community Badge */}
          <View className="mt-4 bg-indigo-500 px-5 py-2 rounded-full">
            <Text className="text-white font-bold text-sm">🌟 Community Member</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-5 py-5">
          <View className="flex-row">
            <TouchableOpacity className="flex-1 bg-white p-5 rounded-2xl items-center border-2 border-gray-200 mr-3">
              <View className="w-12 h-12 bg-indigo-100 rounded-full items-center justify-center mb-2">
                <Text className="text-2xl">✏️</Text>
              </View>
              <Text className="text-gray-900 font-bold text-sm">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-white p-5 rounded-2xl items-center border-2 border-gray-200 mr-3">
              <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-2">
                <Text className="text-2xl">🎁</Text>
              </View>
              <Text className="text-gray-900 font-bold text-sm">Refer</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-white p-5 rounded-2xl items-center border-2 border-gray-200">
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-2">
                <Text className="text-2xl">💬</Text>
              </View>
              <Text className="text-gray-900 font-bold text-sm">Help</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Section */}
        <View className="px-5 py-3">
          <Text className="text-xl font-bold text-gray-900 mb-4">Preferences</Text>
          
          {/* Notifications Toggle */}
          <View className="bg-white px-5 py-5 rounded-2xl mb-3 border border-gray-200">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-xl">🔔</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold">Notifications</Text>
                  <Text className="text-gray-500 text-sm">Get ride updates</Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#e5e7eb', true: '#818cf8' }}
                thumbColor={notifications ? '#4f46e5' : '#f3f4f6'}
              />
            </View>
          </View>

          {/* Location Sharing Toggle */}
          <View className="bg-white px-5 py-5 rounded-2xl mb-3 border border-gray-200">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-xl">📍</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold">Location</Text>
                  <Text className="text-gray-500 text-sm">Share live location</Text>
                </View>
              </View>
              <Switch
                value={locationSharing}
                onValueChange={setLocationSharing}
                trackColor={{ false: '#e5e7eb', true: '#818cf8' }}
                thumbColor={locationSharing ? '#4f46e5' : '#f3f4f6'}
              />
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-5 py-3">
          <Text className="text-xl font-bold text-gray-900 mb-4">Account</Text>
          
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="bg-white px-5 py-5 rounded-2xl mb-3 border border-gray-200"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-xl">{item.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold">{item.title}</Text>
                  <Text className="text-gray-500 text-sm">{item.subtitle}</Text>
                </View>
                <Text className="text-gray-400 text-2xl">›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* About Section */}
        <View className="px-4 py-2">
          <Text className="text-lg font-bold text-gray-900 mb-3">About</Text>
          
          <TouchableOpacity className="bg-white px-4 py-4 rounded-2xl mb-3 shadow-sm">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">ℹ️</Text>
                <Text className="text-gray-900 font-medium">About Ryden</Text>
              </View>
              <Text className="text-gray-400 text-xl">›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white px-4 py-4 rounded-2xl mb-3 shadow-sm">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">📄</Text>
                <Text className="text-gray-900 font-medium">Terms & Privacy</Text>
              </View>
              <Text className="text-gray-400 text-xl">›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View className="px-5 py-5 pb-10">
          <TouchableOpacity 
            className="bg-red-600 py-5 rounded-full"
            onPress={handleLogout}
            disabled={isLoading}
          >
            <Text className="text-white text-center font-bold text-lg">
              {isLoading ? '🔄 Logging out...' : '🚪 Log Out'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <Text className="text-center text-gray-400 text-sm pb-8">
          Ryden Community v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
