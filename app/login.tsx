import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validateForm = (): boolean => {
    let valid = true;
    const newErrors = { email: '', password: '' };

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!email.includes('@')) {
      newErrors.email = 'Please enter a valid email';
      valid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login({ email: email.trim(), password });
      // Navigation will be handled automatically after successful login
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('[Login] Error:', error);
      
      const errorMessage = error?.message || 'Login failed. Please check your credentials and try again.';
      
      Alert.alert(
        'Login Failed',
        errorMessage,
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-emerald-600">
      <StatusBar style="light" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 py-8">
          {/* Logo Section */}
          <View className="items-center mb-8">
            <View className="w-32 h-32 bg-white rounded-3xl items-center justify-center mb-6">
              <Text className="text-6xl">🚗</Text>
              <View className="absolute top-2 right-2">
                <Text className="text-2xl">✨</Text>
              </View>
            </View>
            <Text className="text-white text-4xl font-bold mb-2">Ryden</Text>
            <Text className="text-emerald-100 text-base">Welcome back to your campus community</Text>
          </View>

          {/* Form Card */}
          <View className="bg-white rounded-3xl px-6 py-8 flex-1">
            <Text className="text-center text-emerald-600 text-2xl font-bold mb-2">Log in</Text>
            <Text className="text-center text-gray-600 text-sm mb-6">Enter your credentials to continue</Text>
            <View className="mb-5">
              <Text className="text-gray-700 mb-2 font-medium text-sm">NSU Email or Student ID</Text>
              <View className={`bg-gray-50 border rounded-xl px-4 py-3 flex-row items-center ${errors.email ? 'border-red-500' : 'border-gray-200'}`}>
                <Text className="text-gray-400 mr-2">✉️</Text>
                <TextInput
                  className="flex-1 text-base"
                  placeholder="student@northsouth.edu"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrors({ ...errors, email: '' });
                  }}
                  editable={!isLoading}
                />
              </View>
              {errors.email ? <Text className="text-red-500 text-xs mt-1">{errors.email}</Text> : null}
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium text-sm">Password</Text>
              <View className={`bg-gray-50 border rounded-xl px-4 py-3 flex-row items-center ${errors.password ? 'border-red-500' : 'border-gray-200'}`}>
                <Text className="text-gray-400 mr-2">🔒</Text>
                <TextInput
                  className="flex-1 text-base"
                  placeholder="Enter your password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrors({ ...errors, password: '' });
                  }}
                  editable={!isLoading}
                />
              </View>
              {errors.password ? <Text className="text-red-500 text-xs mt-1">{errors.password}</Text> : null}
            </View>

            <TouchableOpacity 
              className={`py-4 rounded-full mb-4 ${isLoading ? 'bg-emerald-400' : 'bg-emerald-600'}`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white text-center text-base font-bold">Log In →</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-4">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="px-3 text-gray-500 text-sm">Or continue with</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Social Login */}
            <View className="flex-row">
              <TouchableOpacity className="flex-1 bg-white border border-gray-200 py-3 rounded-xl items-center mr-2">
                <Text className="text-xl">G</Text>
                <Text className="text-gray-700 text-xs font-medium mt-1">Google</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-white border border-gray-200 py-3 rounded-xl items-center">
                <Text className="text-xl">f</Text>
                <Text className="text-gray-700 text-xs font-medium mt-1">Facebook</Text>
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600">Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text className="text-emerald-600 font-bold">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
