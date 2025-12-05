import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'rider' | 'driver'>('rider');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    password: '', 
    confirmPassword: '' 
  });

<<<<<<< HEAD
  const handleSignup = async () => {
    console.log('[Signup] Starting signup process');
    
    // Validate inputs
    if (!email || !phone || !name || !password) {
      console.log('[Signup] Validation failed - missing fields');
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Split name into firstName and lastName
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || nameParts[0];

    // Ensure phone has country code
    const formattedPhone = phone.startsWith('+') ? phone : `+880${phone.replace(/^0/, '')}`;

    console.log('[Signup] Prepared data:', { email, phone: formattedPhone, firstName, lastName });

    try {
      console.log('[Signup] Calling register...');
      await register({
        email: email.trim(),
        password,
        phone: formattedPhone,
        firstName,
        lastName,
        role: 'rider'
      });
      console.log('[Signup] Registration successful!');
      // Navigation will be handled by route protection in _layout.tsx
    } catch (error: any) {
      console.error('[Signup] Registration failed:', error);
      Alert.alert('Signup Failed', error.message || 'An error occurred during signup');
=======
  const validateForm = (): boolean => {
    let valid = true;
    const newErrors = { name: '', email: '', phone: '', password: '', confirmPassword: '' };

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Full name is required';
      valid = false;
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      valid = false;
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!email.includes('@')) {
      newErrors.email = 'Please enter a valid email';
      valid = false;
    }

    // Phone validation
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
      valid = false;
    } else if (phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
      valid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      valid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
      valid = false;
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      valid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.replace(/\D/g, ''),
        password,
        role,
        university: 'North South University',
      });
      
      // Navigate to home after successful signup
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('[Signup] Error:', error);
      
      const errorMessage = error?.message || 'Signup failed. Please try again.';
      
      Alert.alert(
        'Signup Failed',
        errorMessage,
        [{ text: 'OK', style: 'default' }]
      );
>>>>>>> 1139c3b (feat: add email verification utility and setup scripts)
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
          <View className="flex-1 justify-center">
            <View className="mb-6">
              <Text className="text-4xl font-bold text-black mb-2">Create Account</Text>
              <Text className="text-gray-600">Join Ryden today</Text>
            </View>

            {/* Name Input */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Full Name</Text>
              <TextInput
                className={`border rounded-lg px-4 py-3 text-gray-900 font-medium ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (text.trim()) setErrors({ ...errors, name: '' });
                }}
                editable={!isLoading}
              />
              {errors.name && <Text className="text-red-500 text-sm mt-1">{errors.name}</Text>}
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Email</Text>
              <TextInput
                className={`border rounded-lg px-4 py-3 text-gray-900 font-medium ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (text.trim()) setErrors({ ...errors, email: '' });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
              {errors.email && <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>}
            </View>

            {/* Phone Input */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Phone Number</Text>
              <TextInput
                className={`border rounded-lg px-4 py-3 text-gray-900 font-medium ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your phone number (10+ digits)"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  if (text.trim()) setErrors({ ...errors, phone: '' });
                }}
                keyboardType="phone-pad"
                editable={!isLoading}
              />
              {errors.phone && <Text className="text-red-500 text-sm mt-1">{errors.phone}</Text>}
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Password</Text>
              <View className={`border rounded-lg px-4 py-3 flex-row items-center justify-between ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}>
                <TextInput
                  className="flex-1 text-gray-900 font-medium"
                  placeholder="Min 8 chars, uppercase, lowercase, number"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (text.trim()) setErrors({ ...errors, password: '' });
                  }}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text className="text-gray-600">{showPassword ? '👁' : '👁‍🗨'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password && <Text className="text-red-500 text-sm mt-1">{errors.password}</Text>}
            </View>

            {/* Confirm Password Input */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Confirm Password</Text>
              <View className={`border rounded-lg px-4 py-3 flex-row items-center justify-between ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}>
                <TextInput
                  className="flex-1 text-gray-900 font-medium"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (text.trim()) setErrors({ ...errors, confirmPassword: '' });
                  }}
                  secureTextEntry={!showConfirmPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Text className="text-gray-600">{showConfirmPassword ? '👁' : '👁‍🗨'}</Text>
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text className="text-red-500 text-sm mt-1">{errors.confirmPassword}</Text>}
            </View>

            {/* Role Selection */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-2">I want to</Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-lg border-2 ${
                    role === 'rider' ? 'bg-blue-50 border-blue-600' : 'bg-white border-gray-300'
                  }`}
                  onPress={() => setRole('rider')}
                  disabled={isLoading}
                >
                  <Text className={`font-semibold text-center ${role === 'rider' ? 'text-blue-600' : 'text-gray-600'}`}>
                    Find Rides
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-lg border-2 ${
                    role === 'driver' ? 'bg-blue-50 border-blue-600' : 'bg-white border-gray-300'
                  }`}
                  onPress={() => setRole('driver')}
                  disabled={isLoading}
                >
                  <Text className={`font-semibold text-center ${role === 'driver' ? 'text-blue-600' : 'text-gray-600'}`}>
                    Offer Rides
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Signup Button */}
            <TouchableOpacity
              className={`rounded-lg py-3 mb-4 flex-row items-center justify-center gap-2 ${
                isLoading ? 'bg-gray-400' : 'bg-blue-600'
              }`}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading && <ActivityIndicator size="small" color="white" />}
              <Text className="text-white font-bold text-center text-lg">Create Account</Text>
            </TouchableOpacity>

<<<<<<< HEAD
          {/* Sign Up Button */}
          <TouchableOpacity 
            className="bg-indigo-600 py-5 rounded-full mt-8 shadow-lg"
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center text-lg font-bold">
                Create Account
              </Text>
            )}
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
=======
            {/* Login Link */}
            <View className="flex-row justify-center">
              <Text className="text-gray-600">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')} disabled={isLoading}>
                <Text className="text-blue-600 font-bold">Login</Text>
>>>>>>> 1139c3b (feat: add email verification utility and setup scripts)
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
