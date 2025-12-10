import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    Linking,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HelpSupportScreen() {
  const router = useRouter();
  
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [alertModal, setAlertModal] = useState<{ visible: boolean; title: string; message: string; type: 'success' | 'error' }>({
    visible: false,
    title: '',
    message: '',
    type: 'success',
  });

  const faqs = [
    {
      question: 'How do I book a ride?',
      answer: 'Go to the "Find Ride" tab, enter your pickup and destination locations, select a time, and browse available rides. Tap on a ride to see details and book it.',
    },
    {
      question: 'How do I offer a ride?',
      answer: 'Go to the "Offer Ride" tab, enter your route details, set the number of available seats and price per seat, then publish your ride for others to join.',
    },
    {
      question: 'How does payment work?',
      answer: 'Payments are handled securely through the app. You can add your preferred payment method in Profile > Payment Methods. Riders pay after the ride is completed.',
    },
    {
      question: "What if my driver doesn't show up?",
      answer: 'If your driver doesn\'t arrive within 15 minutes of the scheduled time, you can cancel the ride for free and report the issue through the app.',
    },
    {
      question: 'How do I contact my driver/rider?',
      answer: 'Once a ride is confirmed, you can use the in-app chat to communicate with your driver or riders. You can also call them directly through the app.',
    },
    {
      question: 'Is Ryden safe?',
      answer: 'Yes! All users are verified students. We have rating systems, emergency contacts, and ride tracking. You can share your ride details with trusted contacts.',
    },
  ];

  const quickHelp = [
    { icon: '🚗', title: 'Ride Issues', subtitle: 'Problems with your ride' },
    { icon: '💳', title: 'Payment Help', subtitle: 'Billing & refunds' },
    { icon: '👤', title: 'Account', subtitle: 'Profile & settings' },
    { icon: '🔒', title: 'Safety', subtitle: 'Report a concern' },
  ];

  const handleContactSubmit = () => {
    if (!contactMessage.trim()) {
      setAlertModal({
        visible: true,
        title: 'Empty Message',
        message: 'Please enter your message before submitting.',
        type: 'error',
      });
      return;
    }

    // In real app, this would submit to backend
    setShowContactModal(false);
    setContactMessage('');
    setAlertModal({
      visible: true,
      title: 'Message Sent!',
      message: 'Our support team will get back to you within 24 hours.',
      type: 'success',
    });
  };

  const handleCall = () => {
    Linking.openURL('tel:+8801700000000');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@ryden.app?subject=Support Request');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Help & Support</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Hero Section */}
        <View className="bg-blue-600 px-6 py-8 items-center">
          <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-4">
            <Text className="text-4xl">💬</Text>
          </View>
          <Text className="text-white text-2xl font-bold text-center mb-2">
            How can we help?
          </Text>
          <Text className="text-blue-100 text-center">
            We're here to assist you 24/7
          </Text>
        </View>

        {/* Quick Help Categories */}
        <View className="px-5 py-5">
          <Text className="text-lg font-bold text-gray-900 mb-4">Quick Help</Text>
          <View className="flex-row flex-wrap">
            {quickHelp.map((item, index) => (
              <TouchableOpacity
                key={index}
                className="w-1/2 p-2"
                onPress={() => setShowContactModal(true)}
              >
                <View className="bg-white p-4 rounded-xl border border-gray-200">
                  <Text className="text-3xl mb-2">{item.icon}</Text>
                  <Text className="text-gray-900 font-semibold">{item.title}</Text>
                  <Text className="text-gray-500 text-sm">{item.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQs */}
        <View className="px-5 py-3">
          <Text className="text-lg font-bold text-gray-900 mb-4">Frequently Asked Questions</Text>
          
          {faqs.map((faq, index) => (
            <TouchableOpacity
              key={index}
              className="bg-white rounded-xl mb-3 border border-gray-200 overflow-hidden"
              onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
            >
              <View className="p-4 flex-row justify-between items-center">
                <Text className="text-gray-900 font-semibold flex-1 pr-4">{faq.question}</Text>
                <Text className="text-gray-400 text-xl">
                  {expandedFaq === index ? '−' : '+'}
                </Text>
              </View>
              {expandedFaq === index && (
                <View className="px-4 pb-4 pt-0">
                  <View className="h-px bg-gray-200 mb-3" />
                  <Text className="text-gray-600 leading-6">{faq.answer}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Options */}
        <View className="px-5 py-5">
          <Text className="text-lg font-bold text-gray-900 mb-4">Contact Us</Text>
          
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-white p-4 rounded-xl border border-gray-200 items-center"
              onPress={() => setShowContactModal(true)}
            >
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-2">
                <Text className="text-2xl">✉️</Text>
              </View>
              <Text className="text-gray-900 font-semibold">Chat</Text>
              <Text className="text-gray-500 text-xs">Send message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-white p-4 rounded-xl border border-gray-200 items-center"
              onPress={handleCall}
            >
              <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-2">
                <Text className="text-2xl">📞</Text>
              </View>
              <Text className="text-gray-900 font-semibold">Call</Text>
              <Text className="text-gray-500 text-xs">Talk to us</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-white p-4 rounded-xl border border-gray-200 items-center"
              onPress={handleEmail}
            >
              <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mb-2">
                <Text className="text-2xl">📧</Text>
              </View>
              <Text className="text-gray-900 font-semibold">Email</Text>
              <Text className="text-gray-500 text-xs">Write to us</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency */}
        <View className="px-5 pb-8">
          <View className="bg-red-50 rounded-2xl p-5 border border-red-200">
            <View className="flex-row items-center mb-3">
              <Text className="text-2xl mr-2">🚨</Text>
              <Text className="text-red-800 font-bold text-lg">Emergency?</Text>
            </View>
            <Text className="text-red-700 mb-3">
              If you're in immediate danger, please contact local emergency services first.
            </Text>
            <TouchableOpacity
              className="bg-red-600 py-3 rounded-xl"
              onPress={() => Linking.openURL('tel:999')}
            >
              <Text className="text-white font-bold text-center">Call Emergency: 999</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Contact Modal */}
      <Modal
        visible={showContactModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowContactModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">Send a Message</Text>
              <TouchableOpacity onPress={() => setShowContactModal(false)}>
                <Text className="text-2xl text-gray-400">✕</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-gray-600 mb-4">
              Describe your issue and we'll get back to you within 24 hours.
            </Text>

            <TextInput
              className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-4 text-gray-900 min-h-[120px]"
              placeholder="Type your message here..."
              value={contactMessage}
              onChangeText={setContactMessage}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity
              className="bg-blue-600 py-4 rounded-xl mt-4"
              onPress={handleContactSubmit}
            >
              <Text className="text-white font-bold text-center text-lg">Send Message</Text>
            </TouchableOpacity>

            <View className="h-6" />
          </View>
        </View>
      </Modal>

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
                alertModal.type === 'success' ? 'bg-blue-600' : 'bg-red-600'
              }`}
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
