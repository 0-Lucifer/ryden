import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = () => {
    // TODO: Implement actual signup logic
    router.push('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6 py-8">
          {/* Header */}
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mb-8"
          >
            <Text className="text-2xl">←</Text>
          </TouchableOpacity>

          {/* Title */}
          <View className="mb-10">
            <Text className="text-4xl font-bold text-gray-900 mb-3">Join Ryden</Text>
            <Text className="text-gray-600 text-lg">Become part of our community</Text>
          </View>

          {/* Form */}
          <View>
            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Full Name</Text>
              <TextInput
                className="bg-gray-100 px-4 py-4 rounded-2xl text-base"
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Email</Text>
              <TextInput
                className="bg-gray-100 px-4 py-4 rounded-2xl text-base"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Phone Number</Text>
              <TextInput
                className="bg-gray-100 px-4 py-4 rounded-2xl text-base"
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2 font-medium">Password</Text>
              <TextInput
                className="bg-gray-100 px-4 py-4 rounded-2xl text-base"
                placeholder="Create a password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          {/* Terms */}
          <View className="flex-row mt-6">
            <Text className="text-gray-600 text-sm">
              By signing up, you agree to our{' '}
            </Text>
            <TouchableOpacity>
              <Text className="text-blue-600 text-sm font-medium">Terms & Privacy</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity 
            className="bg-indigo-600 py-5 rounded-full mt-8 shadow-lg"
            onPress={handleSignup}
          >
            <Text className="text-white text-center text-lg font-bold">
              Create Account
            </Text>
          </TouchableOpacity>

          {/* Sign In Link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600 text-base">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text className="text-indigo-600 font-bold text-base">Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Social Login */}
          <View className="mt-8 mb-8">
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="text-gray-500 mx-4">Or sign up with</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            <View className="flex-row">
              <TouchableOpacity className="flex-1 bg-gray-100 py-4 rounded-2xl items-center mr-3">
                <Text className="text-2xl">G</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-gray-100 py-4 rounded-2xl items-center mr-3">
                <Text className="text-2xl">f</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-gray-100 py-4 rounded-2xl items-center">
                <Text className="text-2xl">🍎</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
