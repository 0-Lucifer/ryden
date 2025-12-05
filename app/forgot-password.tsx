import AuthService from '@/services/auth.service';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', otp: '', password: '', confirmPassword: '' });

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
      // Call API to send password reset email
      await AuthService.sendPasswordResetEmail(email);
      setErrors({ ...errors, email: '' });
      setStep('otp');
      Alert.alert('Success', `Reset code sent to ${email}`);
    } catch (error: any) {
      console.error('[Forgot Password] Error:', error);
      const errorMessage = error?.message || 'Failed to send reset email';
      setErrors({ ...errors, email: errorMessage });
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setErrors({ ...errors, otp: 'Reset code is required' });
      return;
    }

    setIsLoading(true);
    try {
      // Call API to verify reset code
      await AuthService.verifyPasswordResetCode(email, otp);
      setErrors({ ...errors, otp: '' });
      setStep('password');
    } catch (error: any) {
      console.error('[Verify Reset Code] Error:', error);
      const errorMessage = error?.message || 'Invalid reset code';
      setErrors({ ...errors, otp: errorMessage });
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    let valid = true;
    const newErrors = { email: '', otp: '', password: '', confirmPassword: '' };

    if (!newPassword) {
      newErrors.password = 'New password is required';
      valid = false;
    } else if (newPassword.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      valid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
      valid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      valid = false;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    if (!valid) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.resetPassword(email, otp, newPassword);
      Alert.alert('Success', 'Password reset successfully!', [
        { text: 'OK', onPress: () => router.replace('/login') },
      ]);
    } catch (error: any) {
      console.error('[Reset Password] Error:', error);
      const errorMessage = error?.message || 'Failed to reset password';
      setErrors({ ...errors, password: errorMessage });
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
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
            {/* Back Button */}
            <TouchableOpacity onPress={() => router.back()} className="mb-6">
              <Text className="text-blue-600 font-semibold">← Back</Text>
            </TouchableOpacity>

            {/* Header */}
            <View className="mb-8">
              <Text className="text-4xl font-bold text-black mb-2">Reset Password</Text>
              <Text className="text-gray-600">
                {step === 'email' && 'Enter your email to receive a reset code'}
                {step === 'otp' && 'Enter the code sent to your email'}
                {step === 'password' && 'Create your new password'}
              </Text>
            </View>

            {/* Step 1: Email */}
            {step === 'email' && (
              <>
                <View className="mb-6">
                  <Text className="text-gray-700 font-semibold mb-2">Email Address</Text>
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

                <TouchableOpacity
                  className={`rounded-lg py-3 mb-4 flex-row items-center justify-center gap-2 ${
                    isLoading ? 'bg-gray-400' : 'bg-blue-600'
                  }`}
                  onPress={handleSendResetEmail}
                  disabled={isLoading}
                >
                  {isLoading && <ActivityIndicator size="small" color="white" />}
                  <Text className="text-white font-bold text-lg">Send Reset Code</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Step 2: OTP */}
            {step === 'otp' && (
              <>
                <View className="mb-6">
                  <Text className="text-gray-700 font-semibold mb-2">Reset Code</Text>
                  <TextInput
                    className={`border rounded-lg px-4 py-3 text-gray-900 font-bold text-center text-2xl tracking-widest ${
                      errors.otp ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="000000"
                    value={otp}
                    onChangeText={(text) => {
                      setOtp(text.replace(/\D/g, '').slice(0, 6));
                      if (text.trim()) setErrors({ ...errors, otp: '' });
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!isLoading}
                  />
                  {errors.otp && <Text className="text-red-500 text-sm mt-1">{errors.otp}</Text>}
                </View>

                <TouchableOpacity
                  className={`rounded-lg py-3 mb-4 flex-row items-center justify-center gap-2 ${
                    isLoading ? 'bg-gray-400' : 'bg-blue-600'
                  }`}
                  onPress={handleVerifyOTP}
                  disabled={isLoading}
                >
                  {isLoading && <ActivityIndicator size="small" color="white" />}
                  <Text className="text-white font-bold text-lg">Verify Code</Text>
                </TouchableOpacity>

                <View className="text-center">
                  <TouchableOpacity
                    onPress={() => {
                      setStep('email');
                      setOtp('');
                    }}
                    disabled={isLoading}
                  >
                    <Text className="text-blue-600 font-semibold">Didn't receive code? Send again</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Step 3: New Password */}
            {step === 'password' && (
              <>
                <View className="mb-4">
                  <Text className="text-gray-700 font-semibold mb-2">New Password</Text>
                  <View className={`border rounded-lg px-4 py-3 flex-row items-center justify-between ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}>
                    <TextInput
                      className="flex-1 text-gray-900 font-medium"
                      placeholder="Min 8 chars, uppercase, lowercase, number"
                      value={newPassword}
                      onChangeText={(text) => {
                        setNewPassword(text);
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

                <View className="mb-6">
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

                <TouchableOpacity
                  className={`rounded-lg py-3 mb-4 flex-row items-center justify-center gap-2 ${
                    isLoading ? 'bg-gray-400' : 'bg-blue-600'
                  }`}
                  onPress={handleResetPassword}
                  disabled={isLoading}
                >
                  {isLoading && <ActivityIndicator size="small" color="white" />}
                  <Text className="text-white font-bold text-lg">Reset Password</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
