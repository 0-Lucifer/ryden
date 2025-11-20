import { RideOffer } from '@/services/ride.service';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  offer: RideOffer;
  onPress?: (offer: RideOffer) => void;
  badge?: string;
}

const Badge = ({ label }: { label: string }) => (
  <View className="px-2 py-0.5 rounded-full bg-emerald-100">
    <Text className="text-emerald-700 text-xs">{label}</Text>
  </View>
);

const Tag = ({ label }: { label: string }) => (
  <View className="px-2 py-0.5 rounded-full bg-gray-100">
    <Text className="text-gray-700 text-xs">{label}</Text>
  </View>
);

export default function RideCard({ offer, onPress, badge }: Props) {
  const date = new Date(offer.when.dateTime);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <TouchableOpacity
      onPress={() => onPress?.(offer)}
      activeOpacity={0.8}
      className="border border-gray-200 rounded-xl p-3 mb-3 bg-white"
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-emerald-200 items-center justify-center mr-3">
            {offer.driver.avatarUrl ? (
              <Image source={{ uri: offer.driver.avatarUrl }} className="w-10 h-10 rounded-full" />
            ) : (
              <Text className="text-emerald-800 font-semibold">{offer.driver.name?.charAt(0)}</Text>
            )}
          </View>
          <View>
            <View className="flex-row items-center">
              <Text className="text-gray-900 font-semibold mr-2">{offer.driver.name}</Text>
              {offer.driver.isInstant ? <Badge label="Instant" /> : null}
            </View>
            <Text className="text-gray-500 text-xs">⭐ {offer.driver.rating.toFixed(2)} ({offer.driver.reviews} reviews)</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-emerald-600 font-bold">{offer.currency}{offer.pricePerSeat}</Text>
          <Text className="text-gray-500 text-xs">per seat</Text>
        </View>
      </View>

      <View className="mb-2">
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
          <Text className="text-gray-800" numberOfLines={1}>{offer.route.from}</Text>
        </View>
        <View className="flex-row items-center mt-1">
          <View className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
          <Text className="text-gray-800" numberOfLines={1}>{offer.route.to}</Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-gray-600 text-xs">{timeStr}</Text>
        <Text className="text-gray-600 text-xs">{offer.availableSeats} seats left</Text>
        <Text className="text-gray-600 text-xs">{offer.when.durationMinutes ?? 45} min</Text>
      </View>

      <View className="flex-row flex-wrap mt-2">
        {offer.driver.isFemaleDriver ? <Tag label="Female Driver" /> : null}
        {offer.tags?.slice(0, 3).map((t) => (
          <View key={t} className="mr-2 mt-1">
            <Tag label={t} />
          </View>
        ))}
      </View>

      {badge ? (
        <View className="absolute right-2 top-2">
          <Badge label={badge} />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}
