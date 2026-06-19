import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Search, Car, Users, PlusCircle, Bell, User, Settings, MapPin, Clock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/context/AppContext';

export default function Home() {
  const router = useRouter();
  const { user, notifications } = useApp();

  const unreadCount = notifications.filter(n => !n.read).length;

  const quickActions = [
    {
      id: '1',
      title: 'Find a Ride',
      icon: <Search size={28} color={Colors.white} strokeWidth={2} />,
      color: Colors.primary,
      route: '/find-ride',
    },
    {
      id: '2',
      title: 'Offer a Ride',
      icon: <PlusCircle size={28} color={Colors.white} strokeWidth={2} />,
      color: Colors.secondary,
      route: '/offer-ride',
    },
    {
      id: '3',
      title: 'Group Rides',
      icon: <Users size={28} color={Colors.white} strokeWidth={2} />,
      color: Colors.accent,
      route: '/driver-requests',
    },
  ];

  const upcomingRides = [
    {
      id: '1',
      pickup: 'NSU Campus Gate',
      dropoff: 'Bashundhara City',
      time: '2:30 PM',
      driver: 'Sarah Ahmed',
      rating: 4.9,
      vehicle: 'Car',
    },
    {
      id: '2',
      pickup: 'Hostel Building',
      dropoff: 'Jamuna Future Park',
      time: '5:00 PM',
      driver: 'Karim Hassan',
      rating: 4.7,
      vehicle: 'Bike',
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello,</Text>
              <Text style={styles.userName}>{user?.name || 'Guest'}!</Text>
            </View>

            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push('/notifications')}
                activeOpacity={0.7}
              >
                <Bell size={24} color={Colors.white} />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push('/settings')}
                activeOpacity={0.7}
              >
                <Settings size={24} color={Colors.white} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.avatarButton}
                onPress={() => router.push('/profile')}
                activeOpacity={0.7}
              >
                <User size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.gray} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Where to?"
              placeholderTextColor={Colors.gray}
              onFocus={() => router.push('/find-ride')}
            />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() => router.push(action.route as any)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[action.color, action.color + 'CC']}
                  style={styles.actionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.actionIcon}>
                    {action.icon}
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Rides</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {upcomingRides.map((ride) => (
            <TouchableOpacity
              key={ride.id}
              style={styles.rideCard}
              onPress={() => router.push('/booking-confirm')}
              activeOpacity={0.8}
            >
              <View style={styles.rideHeader}>
                <View style={styles.vehicleBadge}>
                  <Car size={16} color={Colors.primary} />
                  <Text style={styles.vehicleText}>{ride.vehicle}</Text>
                </View>
                <View style={styles.timeBadge}>
                  <Clock size={14} color={Colors.accent} />
                  <Text style={styles.timeText}>{ride.time}</Text>
                </View>
              </View>

              <View style={styles.rideLocations}>
                <View style={styles.locationRow}>
                  <View style={styles.locationDot} />
                  <Text style={styles.locationText} numberOfLines={1}>{ride.pickup}</Text>
                </View>
                <View style={styles.locationLine} />
                <View style={styles.locationRow}>
                  <MapPin size={16} color={Colors.accent} />
                  <Text style={styles.locationText} numberOfLines={1}>{ride.dropoff}</Text>
                </View>
              </View>

              <View style={styles.rideFooter}>
                <Text style={styles.driverText}>{ride.driver}</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingText}>★ {ride.rating}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.emergencyCard}
            onPress={() => router.push('/emergency')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF5A5F', '#FF7B7F']}
              style={styles.emergencyGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.emergencyTitle}>Emergency & Safety</Text>
              <Text style={styles.emergencySubtitle}>Quick access to emergency tools</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.screenBackground,
  },
  headerGradient: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 24,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    ...Colors.shadow,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  actionIcon: {
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.white,
    textAlign: 'center',
  },
  rideCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Colors.shadow,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  vehicleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  vehicleText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  rideLocations: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  locationLine: {
    width: 2,
    height: 20,
    backgroundColor: Colors.border,
    marginLeft: 5,
    marginVertical: 4,
  },
  locationText: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  driverText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  ratingContainer: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  emergencyCard: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Colors.shadow,
  },
  emergencyGradient: {
    padding: 24,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  emergencySubtitle: {
    fontSize: 13,
    color: Colors.white,
    opacity: 0.9,
  },
});
