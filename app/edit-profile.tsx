import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [university, setUniversity] = useState(user?.university || '');
  const [studentId, setStudentId] = useState(user?.studentId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [alertModal, setAlertModal] = useState<{ visible: boolean; title: string; message: string; type: 'success' | 'error' }>({
    visible: false,
    title: '',
    message: '',
    type: 'success',
  });

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setAlertModal({
        visible: true,
        title: 'Validation Error',
        message: 'First name and last name are required.',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        university: university.trim() || undefined,
        studentId: studentId.trim() || undefined,
      });

      setAlertModal({
        visible: true,
        title: 'Success',
        message: 'Your profile has been updated successfully!',
        type: 'success',
      });
    } catch (error: any) {
      console.error('[EditProfile] Update failed:', error);
      setAlertModal({
        visible: true,
        title: 'Update Failed',
        message: error?.message || 'Failed to update profile. Please try again.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Edit Profile</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-5 py-6">
          {/* Profile Picture Section */}
          <View className="items-center mb-8">
            <View className="w-28 h-28 bg-indigo-600 rounded-full items-center justify-center mb-4">
              <Text className="text-white text-4xl font-bold">
                {firstName?.[0]?.toUpperCase()}{lastName?.[0]?.toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity className="bg-indigo-100 px-4 py-2 rounded-full">
              <Text className="text-indigo-600 font-semibold">Change Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View className="space-y-4">
            {/* First Name */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">First Name *</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-xl px-4 py-4 text-gray-900"
                placeholder="Enter your first name"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>

            {/* Last Name */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Last Name *</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-xl px-4 py-4 text-gray-900"
                placeholder="Enter your last name"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>

            {/* Email (Read-only) */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Email</Text>
              <View className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-4">
                <Text className="text-gray-500">{user?.email}</Text>
              </View>
              <Text className="text-gray-400 text-xs mt-1">Email cannot be changed</Text>
            </View>

            {/* Phone (Read-only) */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Phone</Text>
              <View className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-4">
                <Text className="text-gray-500">{user?.phone}</Text>
              </View>
              <Text className="text-gray-400 text-xs mt-1">Phone cannot be changed</Text>
            </View>

            {/* University */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">University</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-xl px-4 py-4 text-gray-900"
                placeholder="Enter your university"
                value={university}
                onChangeText={setUniversity}
                autoCapitalize="words"
              />
            </View>

            {/* Student ID */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Student ID</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-xl px-4 py-4 text-gray-900"
                placeholder="Enter your student ID"
                value={studentId}
                onChangeText={setStudentId}
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            className={`mt-6 py-4 rounded-xl flex-row items-center justify-center ${
              isLoading ? 'bg-gray-400' : 'bg-indigo-600'
            }`}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading && <ActivityIndicator size="small" color="white" className="mr-2" />}
            <Text className="text-white font-bold text-lg">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>

          {/* Spacer for scroll */}
          <View className="h-10" />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Alert Modal */}
      <Modal
        visible={alertModal.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAlertModal({ ...alertModal, visible: false })}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <View className="items-center mb-4">
              <View className={`w-16 h-16 rounded-full items-center justify-center mb-3 ${
                alertModal.type === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <Text className="text-4xl">
                  {alertModal.type === 'success' ? '✅' : '❌'}
                </Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900 text-center">
                {alertModal.title}
              </Text>
            </View>

            <Text className="text-gray-600 text-center mb-6">
              {alertModal.message}
            </Text>

            <TouchableOpacity
              className={`rounded-xl py-3 ${
                alertModal.type === 'success' ? 'bg-green-600' : 'bg-red-600'
              }`}
              onPress={() => {
                setAlertModal({ ...alertModal, visible: false });
                if (alertModal.type === 'success') {
                  router.back();
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
