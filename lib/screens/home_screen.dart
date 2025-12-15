import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart' as app_auth;

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Map<String, dynamic>> _upcomingRides = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _listenToUpcomingRides();
  }

  void _listenToUpcomingRides() {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      setState(() => _isLoading = false);
      return;
    }

    final ref = FirebaseDatabase.instance.ref('active-rides/${user.uid}');
    ref.onValue.listen((event) {
      final data = event.snapshot.value as Map<dynamic, dynamic>?;
      setState(() {
        if (data != null) {
          _upcomingRides = data.entries.map((e) {
            final ride = Map<String, dynamic>.from(e.value as Map);
            ride['rideId'] = e.key;
            return ride;
          }).toList();
        } else {
          _upcomingRides = [];
        }
        _isLoading = false;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final name =
        Provider.of<app_auth.AuthProvider>(context).userData?['name'] ?? 'User';

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 200,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.indigo, Colors.blue],
                  ),
                ),
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Text(
                          'Welcome back,',
                          style: TextStyle(color: Colors.white70, fontSize: 18),
                        ),
                        Text(
                          name,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Where to?',
                  prefixIcon: Icon(Icons.search),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  filled: true,
                  fillColor: Colors.white,
                ),
                onTap: () => Navigator.pushNamed(context, '/find_ride'),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                'Quick Actions',
                style: Theme.of(context).textTheme.titleLarge,
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: GridView.count(
              crossAxisCount: 2,
              childAspectRatio: 1.2,
              padding: const EdgeInsets.all(16),
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              children: [
                _actionCard(
                  'Find Ride',
                  Icons.search,
                  () => Navigator.pushNamed(context, '/find_ride'),
                ),
                _actionCard(
                  'Offer Ride',
                  Icons.local_taxi,
                  () => Navigator.pushNamed(context, '/offer_ride'),
                ),
                _actionCard(
                  'Group Ride',
                  Icons.group,
                  () => Navigator.pushNamed(context, '/create_group_ride'),
                ),
                _actionCard(
                  'Ride Requests',
                  Icons.request_page,
                  () => Navigator.pushNamed(context, '/ride_requests'),
                ),
                _actionCard(
                  'Ride History',
                  Icons.history,
                  () => Navigator.pushNamed(context, '/ride_history'),
                ),
              ],
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                'Upcoming Rides',
                style: Theme.of(context).textTheme.titleLarge,
              ),
            ),
          ),
          _isLoading
              ? SliverToBoxAdapter(
                  child: Center(child: CircularProgressIndicator()),
                )
              : _upcomingRides.isEmpty
              ? SliverToBoxAdapter(
                  child: Center(child: Text('No upcoming rides')),
                )
              : SliverList(
                  delegate: SliverChildBuilderDelegate((context, i) {
                    final ride = _upcomingRides[i];
                    return Card(
                      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: ListTile(
                        title: Text('${ride['from']} → ${ride['to']}'),
                        subtitle: Text(ride['time'] ?? ''),
                        trailing: Text('৳${ride['fare']}'),
                        onTap: () => Navigator.pushNamed(
                          context,
                          '/active_ride',
                          arguments: {'rideId': ride['rideId']},
                        ),
                      ),
                    );
                  }, childCount: _upcomingRides.length),
                ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: ElevatedButton(
                onPressed: () => ScaffoldMessenger.of(
                  context,
                ).showSnackBar(SnackBar(content: Text('Emergency contacted'))),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  padding: EdgeInsets.symmetric(vertical: 20),
                ),
                child: Text(
                  'Emergency & Safety',
                  style: TextStyle(color: Colors.white, fontSize: 18),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _actionCard(String title, IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Card(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 40, color: Colors.indigo),
            SizedBox(height: 8),
            Text(title, style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
