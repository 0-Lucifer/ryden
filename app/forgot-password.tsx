import { firebaseAuth } from '@/config/firebase';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'email-sent'>('email');
  const [errors, setErrors] = useState({ email: '' });

  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setErrors({ ...errors, email: 'Email is required' });
      return false;
    }
    if (!email.includes('@')) {
      setErrors({ ...errors, email: 'Please enter a valid email' });
      return false;
    }
    return true;
  };

  const handleSendResetEmail = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      // Use Firebase password reset flow
      await firebaseAuth.sendPasswordResetEmail(email.trim());
      setErrors({ ...errors, email: '' });
      setStep('email-sent');
      Alert.alert('Success', `If an account exists for ${email}, a reset link has been sent.`);
    } catch (error: any) {
      console.error('[Forgot Password] Error:', error);
      const errorMessage = error?.message || 'Failed to send reset email';
      setErrors({ ...errors, email: errorMessage });
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // No OTP verification - using Firebase reset email flow
  // No client reset flow - user should follow email link to reset password

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
          <View className="flex-1 justify-center">
            {/* Back Button */}
            <TouchableOpacity onPress={() => router.back()} className="mb-6">
              <Text className="text-blue-600 font-semibold">← Back</Text>
            </TouchableOpacity>

            {/* Header */}
            <View className="mb-8">
              <Text className="text-4xl font-bold text-black mb-2">Reset Password</Text>
              <Text className="text-gray-600">
                {step === 'email' && 'Enter your email to receive a reset link'}
                {step === 'email-sent' && 'Check your email for the reset link'}
              </Text>
            </View>

            {/* Step 1: Email */}
            {step === 'email' && (
              <View className="mb-6">
                <TextInput
                  className="border rounded-lg px-4 py-3 text-gray-900"
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
                <TouchableOpacity
                  className={`rounded-lg py-3 mb-4 flex-row items-center justify-center gap-2 ${isLoading ? 'bg-gray-400' : 'bg-blue-600'}`}
                  onPress={handleSendResetEmail}
                  disabled={isLoading}
                >
                  {isLoading && <ActivityIndicator size="small" color="white" />}
                  <Text className="text-white font-bold text-lg">Send Reset Code</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Email sent confirmation */}
            {step === 'email-sent' && (
              <>
                <View className="mb-6">
                  <Text className="text-gray-700 font-semibold mb-2">Check your email</Text>
                  <Text className="text-gray-600">We have sent a password reset link to your email. Click the link to reset your password.</Text>
                </View>

                <TouchableOpacity
                  className={`rounded-lg py-3 mb-4 flex-row items-center justify-center gap-2 ${isLoading ? 'bg-gray-400' : 'bg-blue-600'}`}
                  onPress={() => router.replace('/login')}
                  disabled={isLoading}
                >
                  <Text className="text-white font-bold text-lg">Back to Login</Text>
                </TouchableOpacity>
              </>
            )}
            {/* Step 2: OTP and Step 3: New Password removed (not used in Firebase reset flow) */}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
