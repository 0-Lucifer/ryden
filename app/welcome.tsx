import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-emerald-600">
      <StatusBar style="light" />
      <View className="flex-1 items-center justify-between px-8 py-16">
        {/* Logo/Brand Section */}
        <View className="flex-1 items-center justify-center">
          <View className="w-40 h-40 bg-white rounded-3xl items-center justify-center mb-8">
            <Text className="text-7xl">🚗</Text>
          </View>
          <Text className="text-white text-5xl font-bold mb-3">Ryden</Text>
          <Text className="text-emerald-100 text-xl text-center px-4">
            Welcome back to your campus community
          </Text>
          <View className="flex-row items-center bg-emerald-700 px-6 py-3 rounded-full mt-6">
            <Text className="text-white mr-2">👥</Text>
            <Text className="text-white font-semibold">Join 500+ NSU students</Text>
          </View>
        </View>

        {/* Feature Highlights */}
        <View className="w-full mb-8">
          <View className="flex-row items-center mb-5">
            <View className="w-14 h-14 bg-indigo-500 rounded-full items-center justify-center mr-4">
              <Text className="text-3xl">👥</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-bold">Community First</Text>
              <Text className="text-indigo-100">Connect with neighbors</Text>
            </View>
          </View>

          <View className="flex-row items-center mb-5">
            <View className="w-14 h-14 bg-indigo-500 rounded-full items-center justify-center mr-4">
              <Text className="text-3xl">💰</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-bold">Save Together</Text>
              <Text className="text-indigo-100">Split costs, save money</Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="w-14 h-14 bg-indigo-500 rounded-full items-center justify-center mr-4">
              <Text className="text-3xl">🌍</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-bold">Eco-Friendly</Text>
              <Text className="text-indigo-100">Reduce carbon footprint</Text>
            </View>
          </View>
        </View>

        {/* CTA Buttons */}
        <View className="w-full">
          <TouchableOpacity 
            className="bg-white py-5 rounded-full mb-4 shadow-lg"
            onPress={() => router.push('/signup')}
          >
            <Text className="text-indigo-600 text-center text-lg font-bold">
              Join the Community
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-transparent border-2 border-white py-5 rounded-full"
            onPress={() => router.push('/login')}
          >
            <Text className="text-white text-center text-lg font-bold">
              I Have an Account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
