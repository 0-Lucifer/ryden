import { Location, LOCATIONS_BY_AREA, POPULAR_LOCATIONS, searchLocations } from '@/constants/locations';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface LocationPickerProps {
  value: string;
  onSelect: (location: Location | { name: string }) => void;
  placeholder?: string;
  label?: string;
}

export default function LocationPicker({ value, onSelect, placeholder, label }: LocationPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocations = useMemo(() => {
    if (searchQuery.trim()) {
      return searchLocations(searchQuery);
    }
    return [];
  }, [searchQuery]);

  const handleSelectLocation = (location: Location) => {
    onSelect(location);
    setModalVisible(false);
    setSearchQuery('');
  };

  const handleCustomLocation = () => {
    if (searchQuery.trim()) {
      onSelect({ name: searchQuery.trim() });
      setModalVisible(false);
      setSearchQuery('');
    }
  };

  const areas = Object.keys(LOCATIONS_BY_AREA);

  return (
    <View>
      {label && <Text className="text-gray-600 mb-1">{label}</Text>}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="border border-gray-300 rounded-lg px-3 py-3 flex-row items-center justify-between bg-white"
      >
        <View className="flex-row items-center flex-1">
          <Ionicons name="location-outline" size={20} color="#059669" />
          <Text className={`ml-2 flex-1 ${value ? 'text-gray-800' : 'text-gray-400'}`} numberOfLines={1}>
            {value || placeholder || 'Select location'}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-white">
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold">Select Location</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Search Input */}
          <View className="px-4 py-3">
            <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search or enter custom location..."
                className="flex-1 ml-2 text-gray-800"
                autoFocus
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
            {/* Search Results */}
            {searchQuery.trim() ? (
              <View className="px-4">
                {filteredLocations.length > 0 ? (
                  <>
                    <Text className="text-gray-500 text-xs uppercase mb-2">Matching Locations</Text>
                    {filteredLocations.map((loc) => (
                      <TouchableOpacity
                        key={loc.id}
                        onPress={() => handleSelectLocation(loc)}
                        className="flex-row items-center py-3 border-b border-gray-100"
                      >
                        <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center">
                          <Ionicons name="location" size={20} color="#059669" />
                        </View>
                        <View className="ml-3 flex-1">
                          <Text className="text-gray-800 font-medium">{loc.name}</Text>
                          <Text className="text-gray-500 text-sm">{loc.area}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </>
                ) : null}

                {/* Custom location option */}
                <TouchableOpacity
                  onPress={handleCustomLocation}
                  className="flex-row items-center py-3 border-b border-gray-100 mt-2"
                >
                  <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                    <Ionicons name="add" size={20} color="#2563EB" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-blue-600 font-medium">Use "{searchQuery}"</Text>
                    <Text className="text-gray-500 text-sm">Custom location</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              /* Popular Locations by Area */
              <View className="px-4">
                {/* Quick picks - Universities */}
                <View className="mb-4">
                  <Text className="text-gray-500 text-xs uppercase mb-2">Universities</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    {POPULAR_LOCATIONS.filter(l => ['NSU', 'IUB', 'BRAC U', 'DU', 'BUET'].includes(l.shortName)).map((loc) => (
                      <TouchableOpacity
                        key={loc.id}
                        onPress={() => handleSelectLocation(loc)}
                        className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 mr-2"
                      >
                        <Text className="text-emerald-700 font-medium">{loc.shortName}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* All areas */}
                {areas.map((area) => (
                  <View key={area} className="mb-4">
                    <Text className="text-gray-500 text-xs uppercase mb-2">{area}</Text>
                    {LOCATIONS_BY_AREA[area].map((loc) => (
                      <TouchableOpacity
                        key={loc.id}
                        onPress={() => handleSelectLocation(loc)}
                        className="flex-row items-center py-3 border-b border-gray-100"
                      >
                        <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                          <Ionicons name="location-outline" size={20} color="#6B7280" />
                        </View>
                        <View className="ml-3 flex-1">
                          <Text className="text-gray-800">{loc.name}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
