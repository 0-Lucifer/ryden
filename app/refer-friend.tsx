import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    Modal,
    Platform,
    ScrollView,
    Share,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReferFriendScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Generate a referral code based on user ID (in real app, this would come from backend)
  const referralCode = `RYDEN${user?.id?.slice(-6).toUpperCase() || 'FRIEND'}`;
  const referralLink = `https://ryden.app/invite/${referralCode}`;
  
  const [alertModal, setAlertModal] = useState<{ visible: boolean; title: string; message: string }>({
    visible: false,
    title: '',
    message: '',
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me on Ryden - the community ride-sharing app for students! 🚗\n\nUse my referral code: ${referralCode}\n\nDownload now: ${referralLink}`,
        title: 'Join Ryden',
      });
    } catch (error) {
      console.error('[Refer] Share failed:', error);
    }
  };

  const handleCopyCode = async () => {
    try {
      // Use web clipboard API for web, show code for manual copy on native
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(referralCode);
      }
      setAlertModal({
        visible: true,
        title: 'Copied!',
        message: `Referral code "${referralCode}" has been copied to your clipboard.`,
      });
    } catch (error) {
      console.error('[Refer] Copy failed:', error);
      setAlertModal({
        visible: true,
        title: 'Copy Failed',
        message: 'Could not copy the referral code. Please try again.',
      });
    }
  };

  const rewards = [
    { icon: '🎁', title: 'You Get', description: '৳50 off your next ride' },
    { icon: '🎉', title: 'Friend Gets', description: '৳50 off their first ride' },
    { icon: '🔄', title: 'No Limit', description: 'Refer unlimited friends' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Refer a Friend</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Hero Section */}
        <View className="bg-green-600 px-6 py-10 items-center">
          <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4">
            <Text className="text-5xl">🎁</Text>
          </View>
          <Text className="text-white text-3xl font-bold text-center mb-2">
            Give ৳50, Get ৳50
          </Text>
          <Text className="text-green-100 text-center text-lg">
            Invite friends and earn rewards together!
          </Text>
        </View>

        {/* Referral Code Card */}
        <View className="px-5 -mt-6">
          <View className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <Text className="text-gray-600 text-center mb-2">Your Referral Code</Text>
            <View className="bg-gray-100 rounded-xl py-4 px-6 mb-4">
              <Text className="text-3xl font-bold text-center text-indigo-600 tracking-widest">
                {referralCode}
              </Text>
            </View>
            
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-gray-200 py-3 rounded-xl"
                onPress={handleCopyCode}
              >
                <Text className="text-gray-700 font-bold text-center">📋 Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-green-600 py-3 rounded-xl"
                onPress={handleShare}
              >
                <Text className="text-white font-bold text-center">📤 Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* How It Works */}
        <View className="px-5 py-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">How It Works</Text>
          
          <View className="space-y-4">
            <View className="flex-row items-center bg-white p-4 rounded-xl border border-gray-200">
              <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center mr-4">
                <Text className="text-indigo-600 font-bold">1</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold">Share your code</Text>
                <Text className="text-gray-500 text-sm">Send your referral code to friends</Text>
              </View>
            </View>

            <View className="flex-row items-center bg-white p-4 rounded-xl border border-gray-200 mt-3">
              <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center mr-4">
                <Text className="text-indigo-600 font-bold">2</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold">Friend signs up</Text>
                <Text className="text-gray-500 text-sm">They register using your code</Text>
              </View>
            </View>

            <View className="flex-row items-center bg-white p-4 rounded-xl border border-gray-200 mt-3">
              <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center mr-4">
                <Text className="text-indigo-600 font-bold">3</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold">Both get rewarded</Text>
                <Text className="text-gray-500 text-sm">You both receive ৳50 credit!</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Rewards Summary */}
        <View className="px-5 pb-6">
          <View className="bg-green-50 rounded-2xl p-5 border border-green-200">
            <Text className="text-lg font-bold text-gray-900 mb-4 text-center">Your Rewards</Text>
            <View className="flex-row justify-between">
              {rewards.map((reward, index) => (
                <View key={index} className="items-center flex-1">
                  <Text className="text-3xl mb-2">{reward.icon}</Text>
                  <Text className="text-gray-900 font-semibold text-sm">{reward.title}</Text>
                  <Text className="text-gray-500 text-xs text-center">{reward.description}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Stats (placeholder) */}
        <View className="px-5 pb-8">
          <View className="bg-white rounded-2xl p-5 border border-gray-200">
            <Text className="text-lg font-bold text-gray-900 mb-4">Your Referral Stats</Text>
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-3xl font-bold text-indigo-600">0</Text>
                <Text className="text-gray-500 text-sm">Friends Invited</Text>
              </View>
              <View className="w-px bg-gray-200" />
              <View className="items-center flex-1">
                <Text className="text-3xl font-bold text-green-600">৳0</Text>
                <Text className="text-gray-500 text-sm">Total Earned</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

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
              <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-3">
                <Text className="text-4xl">✅</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900 text-center">
                {alertModal.title}
              </Text>
            </View>

            <Text className="text-gray-600 text-center mb-6">
              {alertModal.message}
            </Text>

            <TouchableOpacity
              className="bg-green-600 rounded-xl py-3"
              onPress={() => setAlertModal({ ...alertModal, visible: false })}
            >
              <Text className="text-white font-bold text-center text-lg">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
