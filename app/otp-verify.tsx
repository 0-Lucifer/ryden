import { useAuth } from '@/context/AuthContext';
import AuthService from '@/services/auth.service';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OTPVerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  
  const phone = (params.phone as string) || user?.phone || '';
  const email = (params.email as string) || user?.email || '';
  
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [showResend, setShowResend] = useState(false);
  const [error, setError] = useState('');

  // Timer for resend button
  useEffect(() => {
    if (timeLeft <= 0) {
      setShowResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    if (otp.length < 4) {
      setError('OTP must be at least 4 digits');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await AuthService.verifyOTP({
        phone,
        otp,
      });

      Alert.alert('Success', 'Phone verified successfully!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (error: any) {
      console.error('[OTP Verify] Error:', error);
      const errorMessage = error?.message || 'Failed to verify OTP. Please try again.';
      setError(errorMessage);
      Alert.alert('Verification Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError('');

    try {
      await AuthService.sendOTP(phone);
      setOtp('');
      setTimeLeft(120);
      setShowResend(false);
      Alert.alert('Success', 'OTP sent to your phone');
    } catch (error: any) {
      console.error('[Resend OTP] Error:', error);
      const errorMessage = error?.message || 'Failed to resend OTP';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Verification?',
      'You can verify your phone number later in your profile settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Skip', 
          style: 'destructive',
          onPress: () => router.replace('/(tabs)'),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-4">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-4xl font-bold text-black mb-2">Verify Your Phone</Text>
            <Text className="text-gray-600">
              We sent a code to {phone}
            </Text>
          </View>

          {/* OTP Input */}
          <View className="mb-6">
            <Text className="text-gray-700 font-semibold mb-2">Enter Code</Text>
            <TextInput
              className={`border rounded-lg px-4 py-4 text-gray-900 font-bold text-center text-2xl tracking-widest ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="000000"
              value={otp}
              onChangeText={(text) => {
                setOtp(text.replace(/\D/g, '').slice(0, 6));
                setError('');
              }}
              keyboardType="number-pad"
              maxLength={6}
              editable={!isLoading}
              selectTextOnFocus
            />
            {error && <Text className="text-red-500 text-sm mt-2">{error}</Text>}
          </View>

          {/* Resend section */}
          {showResend ? (
            <TouchableOpacity
              className="mb-6 py-3 px-4 bg-blue-50 rounded-lg"
              onPress={handleResendOTP}
              disabled={isResending}
            >
              <Text className="text-blue-600 font-semibold text-center">
                {isResending ? 'Sending...' : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="mb-6 py-3 px-4 bg-gray-50 rounded-lg">
              <Text className="text-gray-600 text-center">
                Resend code in {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </Text>
            </View>
          )}

          {/* Verify Button */}
          <TouchableOpacity
            className={`rounded-lg py-3 mb-4 flex-row items-center justify-center gap-2 ${
              isLoading ? 'bg-gray-400' : 'bg-blue-600'
            }`}
            onPress={handleVerifyOTP}
            disabled={isLoading}
          >
            {isLoading && <ActivityIndicator size="small" color="white" />}
            <Text className="text-white font-bold text-center text-lg">Verify Code</Text>
          </TouchableOpacity>

          {/* Skip Button */}
          <TouchableOpacity
            className="rounded-lg py-3 border border-gray-300"
            onPress={handleSkip}
            disabled={isLoading}
          >
            <Text className="text-gray-600 font-semibold text-center">Skip for Now</Text>
          </TouchableOpacity>

          {/* Info */}
          <View className="mt-8 p-4 bg-blue-50 rounded-lg">
            <Text className="text-blue-700 text-sm text-center">
              The verification code expires in 10 minutes. If you don't receive the code, check your spam folder.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
