import { firebaseAuth } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import AuthService from '@/services/auth.service';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const router = useRouter();
  const { register, isLoading, clearPendingVerification, pendingVerification, user } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'rider' | 'driver'>('rider');
  const [studentId, setStudentId] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const [alertModal, setAlertModal] = useState<{ visible: boolean; title: string; message: string; type: 'success' | 'error' | 'info' }>({ visible: false, title: '', message: '', type: 'info' });
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    studentId: '',
    password: '',
    confirmPassword: ''
  });

  // Show verification modal if user is authenticated but pending verification
  useEffect(() => {
    if (pendingVerification && user?.email) {
      console.log('[Signup] User has pending verification, showing modal');
      setRegisteredEmail(user.email);
      setShowVerificationModal(true);
    }
  }, [pendingVerification, user]);

  const validateForm = (): boolean => {
    let valid = true;
    const newErrors = { firstName: '', lastName: '', email: '', phone: '', studentId: '', password: '', confirmPassword: '' };

    // First name validation
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
      valid = false;
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
      valid = false;
    }

    // Last name validation
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
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

    // Student ID validation
    if (!studentId.trim()) {
      newErrors.studentId = 'Student ID is required';
      valid = false;
    } else if (studentId.trim().length < 5) {
      newErrors.studentId = 'Please enter a valid student ID';
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
      // First check if email and phone are available
      const availability = await AuthService.checkAvailability(
        email.trim(),
        phone.replace(/\D/g, '')
      );

      if (!availability.available && availability.errors) {
        const newErrors = { ...errors };
        const errorMessages: string[] = [];
        
        if (availability.errors.email) {
          newErrors.email = availability.errors.email;
          errorMessages.push(availability.errors.email);
        }
        if (availability.errors.phone) {
          newErrors.phone = availability.errors.phone;
          errorMessages.push(availability.errors.phone);
        }
        setErrors(newErrors);
        
        // Show popup alert
        const alertMessage = errorMessages.join('\n');
        setAlertModal({ visible: true, title: 'Registration Error', message: alertMessage, type: 'error' });
        return;
      }

      // Step 1: Create user in Firebase Auth
      console.log('[Signup] Creating Firebase user...');
      const userCredential = await firebaseAuth.createUser(email.trim(), password);
      const firebaseUser = userCredential.user;
      
      // Step 2: Send verification email via Firebase
      console.log('[Signup] Sending verification email via Firebase...');
      await firebaseAuth.sendVerificationEmail(firebaseUser);
      
      // Step 3: Get Firebase ID token
      const firebaseToken = await firebaseUser.getIdToken();
      
      // Step 4: Register with backend using Firebase token
      console.log('[Signup] Registering with backend...');
      const response = await AuthService.firebaseRegister({
        firebaseToken,
        phone: phone.replace(/\D/g, ''),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        studentId: studentId.trim().toUpperCase(),
        university: 'North South University',
        referralCode: referralCode.trim().toUpperCase() || undefined,
      });

      if (response.success) {
        // Show verification modal
        setRegisteredEmail(email.trim());
        setShowVerificationModal(true);
      }
    } catch (error: any) {
      console.error('[Signup] Error:', error);

      // Handle Firebase specific errors
      if (error?.code) {
        let errorMessage = 'Signup failed. Please try again.';
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already registered. Please login instead.';
            setErrors({ ...errors, email: errorMessage });
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            setErrors({ ...errors, email: errorMessage });
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak. Please use a stronger password.';
            setErrors({ ...errors, password: errorMessage });
            break;
          default:
            errorMessage = error.message || 'Signup failed. Please try again.';
        }
        setAlertModal({ visible: true, title: 'Signup Failed', message: errorMessage, type: 'error' });
        return;
      }

      // Handle specific field errors from backend
      if (error?.field) {
        const newErrors = { ...errors };
        if (error.field === 'email') {
          newErrors.email = error.error || 'Email already registered';
        } else if (error.field === 'phone') {
          newErrors.phone = error.error || 'Phone number already registered';
        }
        setErrors(newErrors);
        return;
      }

      const errorMessage = error?.message || error?.error || 'Signup failed. Please try again.';
      setAlertModal({ visible: true, title: 'Signup Failed', message: errorMessage, type: 'error' });
    }
  };

  const handleVerifyOTP = async () => {
    // With Firebase, we check if email is verified by reloading the user
    setIsCheckingVerification(true);
    try {
      // Reload the Firebase user to get updated verification status
      const firebaseUser = await firebaseAuth.reloadUser();
      
      if (firebaseUser?.emailVerified) {
        // Email is verified - get fresh token and update backend
        const firebaseToken = await firebaseAuth.getIdToken(true);
        
        if (firebaseToken) {
          // Update verification status in backend
          await AuthService.checkFirebaseVerification(firebaseToken);
          
          // Login with the verified token
          const response = await AuthService.firebaseLogin(firebaseToken);
          
          if (response.success) {
            await clearPendingVerification();
            setShowVerificationModal(false);
            
            setAlertModal({ 
              visible: true, 
              title: 'Success', 
              message: 'Email verified successfully! Welcome to Ryden.', 
              type: 'success' 
            });
          }
        }
      } else {
        setAlertModal({ 
          visible: true, 
          title: 'Not Verified Yet', 
          message: 'Please click the verification link in your email first, then tap "I\'ve Verified" again.', 
          type: 'info' 
        });
      }
    } catch (error: any) {
      console.error('[Signup] Verification Check Error:', error);
      const errorMessage = error?.message || error?.error || 'Verification check failed. Please try again.';
      setAlertModal({ visible: true, title: 'Verification Failed', message: errorMessage, type: 'error' });
    } finally {
      setIsCheckingVerification(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const currentUser = firebaseAuth.getCurrentUser();
      if (currentUser) {
        await firebaseAuth.sendVerificationEmail(currentUser);
        setAlertModal({ 
          visible: true, 
          title: 'Email Sent', 
          message: 'A new verification email has been sent. Please check your inbox.', 
          type: 'success' 
        });
      } else {
        // User needs to sign in again to resend
        setAlertModal({ 
          visible: true, 
          title: 'Session Expired', 
          message: 'Please sign up again to receive a new verification email.', 
          type: 'error' 
        });
      }
    } catch (error: any) {
      console.error('[Signup] Resend verification error:', error);
      setAlertModal({ 
        visible: true, 
        title: 'Error', 
        message: 'Failed to resend verification email. Please try again.', 
        type: 'error' 
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
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

            {/* First Name Input */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">First Name</Text>
              <TextInput
                className={`border rounded-lg px-4 py-3 text-gray-900 font-medium ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your first name"
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text);
                  if (text.trim()) setErrors({ ...errors, firstName: '' });
                }}
                editable={!isLoading}
              />
              {errors.firstName ? <Text className="text-red-500 text-sm mt-1">{errors.firstName}</Text> : null}
            </View>

            {/* Last Name Input */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Last Name</Text>
              <TextInput
                className={`border rounded-lg px-4 py-3 text-gray-900 font-medium ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your last name"
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text);
                  if (text.trim()) setErrors({ ...errors, lastName: '' });
                }}
                editable={!isLoading}
              />
              {errors.lastName ? <Text className="text-red-500 text-sm mt-1">{errors.lastName}</Text> : null}
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
                autoComplete="email"
                textContentType="emailAddress"
                editable={!isLoading}
              />
              {errors.email ? <Text className="text-red-500 text-sm mt-1">{errors.email}</Text> : null}
            </View>

            {/* Phone Input */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Phone Number</Text>
              <TextInput
                className={`border rounded-lg px-4 py-3 text-gray-900 font-medium ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g. 01712345678"
                value={phone}
                onChangeText={(text) => {
                  // Only allow numbers and common phone characters
                  const cleaned = text.replace(/[^0-9+\-\s()]/g, '');
                  setPhone(cleaned);
                  if (cleaned.trim()) setErrors({ ...errors, phone: '' });
                }}
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                inputMode="tel"
                editable={!isLoading}
              />
              {errors.phone ? <Text className="text-red-500 text-sm mt-1">{errors.phone}</Text> : null}
            </View>

            {/* Student ID Input */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Student ID *</Text>
              <TextInput
                className={`border rounded-lg px-4 py-3 text-gray-900 font-medium ${
                  errors.studentId ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g. 2012345678"
                value={studentId}
                onChangeText={(text) => {
                  setStudentId(text.toUpperCase());
                  if (text.trim()) setErrors({ ...errors, studentId: '' });
                }}
                autoCapitalize="characters"
                editable={!isLoading}
              />
              {errors.studentId ? <Text className="text-red-500 text-sm mt-1">{errors.studentId}</Text> : null}
            </View>

            {/* Referral Code Input (Optional) */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Referral Code <Text className="text-gray-400 font-normal">(optional)</Text></Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 font-medium"
                placeholder="Enter referral code if you have one"
                value={referralCode}
                onChangeText={(text) => setReferralCode(text.toUpperCase())}
                autoCapitalize="characters"
                editable={!isLoading}
              />
              <Text className="text-gray-400 text-xs mt-1">Get ৳50 off your first ride!</Text>
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
              {errors.password ? <Text className="text-red-500 text-sm mt-1">{errors.password}</Text> : null}
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
              {errors.confirmPassword ? <Text className="text-red-500 text-sm mt-1">{errors.confirmPassword}</Text> : null}
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
              {isLoading ? <ActivityIndicator size="small" color="white" /> : null}
              <Text className="text-white font-bold text-center text-lg">Create Account</Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View className="flex-row justify-center">
              <Text className="text-gray-600">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')} disabled={isLoading}>
                <Text className="text-blue-600 font-bold">Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Email Verification Modal */}
      <Modal
        visible={showVerificationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            {/* Success Icon */}
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-3">
                <Text className="text-4xl">✉️</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900 text-center">
                Verify Your Email
              </Text>
            </View>

            {/* Message */}
            <View className="mb-6">
              <Text className="text-gray-600 text-center mb-3">
                We've sent a verification link to:
              </Text>
              <Text className="text-blue-600 font-semibold text-center mb-3">
                {registeredEmail}
              </Text>
              <Text className="text-gray-500 text-center text-sm mb-4">
                Please check your inbox and click the link to verify your account. Then tap the button below.
              </Text>
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              className={`rounded-lg py-3 mb-3 flex-row justify-center items-center gap-2 ${
                isCheckingVerification ? 'bg-gray-400' : 'bg-blue-600'
              }`}
              onPress={handleVerifyOTP}
              disabled={isCheckingVerification}
            >
              {isCheckingVerification ? <ActivityIndicator size="small" color="white" /> : null}
              <Text className="text-white font-bold text-center text-lg">
                I've Verified My Email
              </Text>
            </TouchableOpacity>

            {/* Resend Link */}
            <TouchableOpacity
              className="py-2"
              onPress={handleResendVerification}
            >
              <Text className="text-blue-600 text-center">
                Didn't receive the email? <Text className="font-bold">Resend</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Alert Modal */}
      <Modal
        visible={alertModal.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            {/* Icon */}
            <View className="items-center mb-4">
              <View className={`w-16 h-16 rounded-full items-center justify-center mb-3 ${
                alertModal.type === 'success' ? 'bg-green-100' : 
                alertModal.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                <Text className="text-4xl">
                  {alertModal.type === 'success' ? '✅' : alertModal.type === 'error' ? '❌' : 'ℹ️'}
                </Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900 text-center">
                {alertModal.title}
              </Text>
            </View>

            {/* Message */}
            <Text className="text-gray-600 text-center mb-6">
              {alertModal.message}
            </Text>

            {/* OK Button */}
            <TouchableOpacity
              className={`rounded-lg py-3 ${
                alertModal.type === 'success' ? 'bg-green-600' : 
                alertModal.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
              }`}
              onPress={() => {
                setAlertModal({ ...alertModal, visible: false });
                // Navigate to main app after success
                if (alertModal.type === 'success' && alertModal.title === 'Success') {
                  router.replace('/(tabs)');
                }
              }}
            >
              <Text className="text-white font-bold text-center text-lg">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
