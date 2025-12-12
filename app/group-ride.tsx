import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Users, TrendingUp, Car, Bike, Plus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';

interface GroupRide {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  creator: string;
  members: number;
  maxSeats: number;
  fareRange: string;
  preferences: string[];
}

export default function GroupRideScreen() {
  const router = useRouter();
  const [pressedCard, setPressedCard] = useState<string | null>(null);
  const [pressedButton, setPressedButton] = useState<string | null>(null);

  const groupRides: GroupRide[] = [
    {
      id: '1',
      from: 'NSU Campus',
      to: 'Bashundhara City',
      date: 'Dec 15, 2024',
      time: '3:00 PM',
      creator: 'Sarah Ahmed',
      members: 3,
      maxSeats: 4,
      fareRange: '70-100',
      preferences: ['CNG', 'Bike'],
    },
    {
      id: '2',
      from: 'Hostel',
      to: 'Jamuna Future Park',
      date: 'Dec 15, 2024',
      time: '5:30 PM',
      creator: 'Karim Hassan',
      members: 2,
      maxSeats: 4,
      fareRange: '50-80',
      preferences: ['Uber/Pathao', 'CNG'],
    },
    {
      id: '3',
      from: 'NSU Main Gate',
      to: 'Gulshan 2',
      date: 'Dec 16, 2024',
      time: '9:00 AM',
      creator: 'Fatima Khan',
      members: 1,
      maxSeats: 3,
      fareRange: '80-120',
      preferences: ['Uber/Pathao'],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.greeting}>Hey there! 👋</Text>
          <Text style={styles.subtitle}>Find your perfect ride</Text>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statBox}>
            <View style={styles.statIconContainer}>
              <TrendingUp size={24} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Active Groups</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <View style={styles.statIconContainer}>
              <Car size={24} color={Colors.secondary} />
            </View>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Rides Today</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Group Rides</Text>

          {groupRides.map((ride) => (
            <Pressable
              key={ride.id}
              onPressIn={() => setPressedCard(ride.id)}
              onPressOut={() => setPressedCard(null)}
              style={[
                styles.rideCard,
                pressedCard === ride.id && styles.rideCardPressed,
              ]}
            >
              <View style={styles.rideHeader}>
                <View style={styles.groupBadge}>
                  <Users size={16} color={Colors.white} />
                  <Text style={styles.groupBadgeText}>
                    {ride.members}/{ride.maxSeats}
                  </Text>
                </View>
                <View style={styles.dateTimeContainer}>
                  <Text style={styles.rideDate}>{ride.date}</Text>
                  <Text style={styles.rideTime}>{ride.time}</Text>
                </View>
              </View>

              <View style={styles.rideRoute}>
                <View style={styles.routePoint}>
                  <View style={styles.routeDot} />
                  <Text style={styles.routeText}>{ride.from}</Text>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, { backgroundColor: Colors.accent }]} />
                  <Text style={styles.routeText}>{ride.to}</Text>
                </View>
              </View>

              <View style={styles.infoSection}>
                <View style={styles.fareRangeContainer}>
                  <Text style={styles.fareRangeLabel}>Approximate Fare:</Text>
                  <Text style={styles.fareRangeValue}>{ride.fareRange} BDT</Text>
                </View>

                <View style={styles.preferencesContainer}>
                  <Text style={styles.preferencesLabel}>Vehicle Preferences:</Text>
                  <View style={styles.preferenceTags}>
                    {ride.preferences.map((pref, index) => (
                      <View key={index} style={styles.preferenceTag}>
                        {pref === 'Bike' ? (
                          <Bike size={12} color={Colors.primary} />
                        ) : (
                          <Car size={12} color={Colors.primary} />
                        )}
                        <Text style={styles.preferenceText}>{pref}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.rideFooter}>
                <View>
                  <Text style={styles.creatorLabel}>Created by</Text>
                  <Text style={styles.creatorName}>{ride.creator}</Text>
                </View>
                <Pressable
                  onPressIn={() => setPressedButton(`join-${ride.id}`)}
                  onPressOut={() => setPressedButton(null)}
                  style={[
                    styles.joinButton,
                    pressedButton === `join-${ride.id}` && styles.joinButtonPressed,
                  ]}
                >
                  <LinearGradient
                    colors={[Colors.primary, Colors.secondary]}
                    style={styles.joinButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.joinButtonText}>Join</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.createSection}>
          <Pressable
            onPressIn={() => setPressedButton('create')}
            onPressOut={() => setPressedButton(null)}
            onPress={() => router.push('/create-group-ride')}
            style={[
              styles.createButton,
              pressedButton === 'create' && styles.createButtonPressed,
            ]}
          >
            <LinearGradient
              colors={[Colors.secondary, Colors.primary]}
              style={styles.createButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Plus size={24} color={Colors.white} />
              <Text style={styles.createButtonText}>Create Group Ride</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.screenBackground,
  },
  content: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 17,
    color: Colors.textLight,
    fontWeight: '500' as const,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: 24,
    marginBottom: 28,
    borderRadius: 24,
    padding: 24,
    ...Colors.shadow,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '600' as const,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 20,
  },
  rideCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...Colors.shadow,
  },
  rideCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  groupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  groupBadgeText: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: Colors.white,
  },
  dateTimeContainer: {
    alignItems: 'flex-end',
  },
  rideDate: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textLight,
    marginBottom: 2,
  },
  rideTime: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.accent,
  },
  rideRoute: {
    marginBottom: 20,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primary,
  },
  routeLine: {
    width: 3,
    height: 24,
    backgroundColor: Colors.border,
    marginLeft: 5.5,
    marginVertical: 6,
    borderRadius: 2,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    flex: 1,
  },
  infoSection: {
    gap: 12,
    marginBottom: 20,
  },
  fareRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  fareRangeLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textLight,
  },
  fareRangeValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  preferencesContainer: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  preferencesLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textLight,
    marginBottom: 10,
  },
  preferenceTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preferenceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  preferenceText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  creatorLabel: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 4,
    fontWeight: '500' as const,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  joinButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  joinButtonPressed: {
    transform: [{ scale: 0.96 }],
  },
  joinButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.white,
    letterSpacing: 0.3,
  },
  createSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  createButton: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Colors.shadowLarge,
  },
  createButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.white,
    letterSpacing: 0.3,
  },
});
