// lib/screens/active_ride_screen.dart

import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'chat_screen.dart';

class ActiveRideScreen extends StatefulWidget {
  const ActiveRideScreen({super.key});

  @override
  State<ActiveRideScreen> createState() => _ActiveRideScreenState();
}

class _ActiveRideScreenState extends State<ActiveRideScreen> {
  Map<String, dynamic>? _rideData;
  Map<String, dynamic>? _driverData;
  Map<String, dynamic>? _passengerData;
  bool _isLoading = true;
  String? _rideId;
  String? _currentUserRole; // 'driver' or 'passenger'

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;

    if (args == null || args['rideId'] == null || args['rideId'].toString().isEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Unable to open ride. Please try again.')),
        );
        Navigator.pop(context);
      });
      return;
    }

    final String rideId = args['rideId'] as String;

    if (_rideId != rideId) {
      _rideId = rideId;
      _currentUserRole = null;
      _listenToRideUpdates();
    }
  }

  void _listenToRideUpdates() {
    if (_rideId == null) return;

    final userId = FirebaseAuth.instance.currentUser!.uid;
    final ref = FirebaseDatabase.instance.ref('active-rides/$userId/$_rideId');

    ref.onValue.listen((event) async {
      if (!mounted) return;

      if (event.snapshot.exists) {
        final data = Map<String, dynamic>.from(event.snapshot.value as Map);
        setState(() {
          _rideData = data;
          _isLoading = false;
        });

        // Determine role once
        if (_currentUserRole == null) {
          if (data['driverId'] == userId) {
            _currentUserRole = 'driver';
          } else {
            _currentUserRole = 'passenger';
          }
        }

        // Load counterpart info
        final counterpartId = _currentUserRole == 'driver' ? data['bookerId'] : data['driverId'];
        if (counterpartId != null) {
          final counterpartRef = FirebaseDatabase.instance.ref('users/$counterpartId');
          final snapshot = await counterpartRef.get();
          if (snapshot.exists && mounted) {
            setState(() {
              if (_currentUserRole == 'driver') {
                _passengerData = Map<String, dynamic>.from(snapshot.value as Map);
              } else {
                _driverData = Map<String, dynamic>.from(snapshot.value as Map);
              }
            });
          }
        }
      } else {
        if (mounted) {
          setState(() => _isLoading = false);
          WidgetsBinding.instance.addPostFrameCallback((_) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Ride has ended')),
            );
            Navigator.pop(context);
          });
        }
      }
    });
  }

  Future<void> _updateStatus(String newStatus) async {
    final userId = FirebaseAuth.instance.currentUser!.uid;
    final db = FirebaseDatabase.instance;

    await db.ref('active-rides/$userId/$_rideId').update({'status': newStatus});
    final counterpartId = _currentUserRole == 'driver' ? _rideData!['bookerId'] : _rideData!['driverId'];
    if (counterpartId != null) {
      await db.ref('active-rides/$counterpartId/$_rideId').update({'status': newStatus});
    }
  }

  Future<void> _completeRide() async {
    await _updateStatus('completed');

    final passengerId = _rideData!['bookerId'];
    await FirebaseDatabase.instance.ref('notifications/$passengerId').push().set({
      'title': 'Ride Completed',
      'message': 'Please rate your driver!',
      'type': 'rating_request',
      'rideId': _rideId,
      'timestamp': ServerValue.timestamp,
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Ride completed! Thank you.')),
    );

    // Remove ride from both users after 3 seconds
    Future.delayed(const Duration(seconds: 3), () async {
      final db = FirebaseDatabase.instance;
      final currentUserId = FirebaseAuth.instance.currentUser!.uid;
      await db.ref('active-rides/$currentUserId/$_rideId').remove();
      await db.ref('active-rides/$passengerId/$_rideId').remove();
    });
  }

  Future<void> _showRatingDialog() async {
    double rating = 5.0;

    await showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Rate Your Driver'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('How was your ride with ${_driverData!['name']}?'),
            const SizedBox(height: 16),
            Slider(
              value: rating,
              min: 1,
              max: 5,
              divisions: 4,
              label: rating.toStringAsFixed(1),
              onChanged: (val) => setState(() => rating = val),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Skip')),
          ElevatedButton(
            onPressed: () async {
              final driverId = _rideData!['driverId'];
              final ratingsRef = FirebaseDatabase.instance.ref('users/$driverId/ratings');
              await ratingsRef.push().set({
                'rating': rating,
                'from': FirebaseAuth.instance.currentUser!.uid,
                'timestamp': ServerValue.timestamp,
              });

              // Update average rating
              final snapshot = await FirebaseDatabase.instance.ref('users/$driverId').get();
              final userData = snapshot.value as Map<dynamic, dynamic>?;
              final currentRating = (userData?['rating'] ?? 5.0) as double;
              final ratingCount = (userData?['ratingCount'] ?? 0) as int;
              final newAvg = ((currentRating * ratingCount) + rating) / (ratingCount + 1);

              await FirebaseDatabase.instance.ref('users/$driverId').update({
                'rating': newAvg,
                'ratingCount': ratingCount + 1,
              });

              await _updateStatus('rated');

              // Remove ride from both after rating
              final db = FirebaseDatabase.instance;
              final currentUserId = FirebaseAuth.instance.currentUser!.uid;
              await db.ref('active-rides/$currentUserId/$_rideId').remove();
              await db.ref('active-rides/$driverId/$_rideId').remove();

              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Thank you for rating!')),
              );
            },
            child: const Text('Submit'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (_rideData == null) {
      return const Scaffold(body: Center(child: Text('Ride not found')));
    }

    final status = _rideData!['status'] ?? 'accepted';
    final isDriver = _currentUserRole == 'driver';

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0),
      body: Stack(
        children: [
          // Map placeholder
          Container(
            height: MediaQuery.of(context).size.height * 0.45,
            decoration: const BoxDecoration(
              gradient: LinearGradient(colors: [Colors.indigo, Colors.blue]),
            ),
            child: const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.map, size: 80, color: Colors.white),
                  Text('Live Tracking', style: TextStyle(color: Colors.white, fontSize: 20)),
                ],
              ),
            ),
          ),
          // Bottom sheet
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              height: MediaQuery.of(context).size.height * 0.6,
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
              ),
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Text(
                        status.toUpperCase(),
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: status == 'completed' || status == 'rated' ? Colors.green : Colors.indigo,
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text('From: ${_rideData!['from']}', style: const TextStyle(fontSize: 18)),
                    Text('To: ${_rideData!['to']}', style: const TextStyle(fontSize: 18)),
                    Text('Fare: ৳${_rideData!['fare']}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const Divider(height: 40),

                    // Counterpart info
                    if ((isDriver && _passengerData != null) || (!isDriver && _driverData != null)) ...[
                      Text(isDriver ? 'Passenger' : 'Driver', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Text('Name: ${isDriver ? _passengerData!['name'] : _driverData!['name']}'),
                      Text('Rating: ⭐ ${(isDriver ? _passengerData!['rating'] ?? 5.0 : _driverData!['rating'] ?? 5.0).toStringAsFixed(1)}'),
                      if (!isDriver && _driverData?['phone'] != null)
                        ElevatedButton.icon(
                          onPressed: () async {
                            final uri = Uri.parse('tel:${_driverData!['phone']}');
                            if (await canLaunchUrl(uri)) await launchUrl(uri);
                          },
                          icon: const Icon(Icons.call),
                          label: const Text('Call Driver'),
                        ),
                    ],

                    const SizedBox(height: 30),

                    // Chat Button
                    if ((isDriver && _passengerData != null) || (!isDriver && _driverData != null))
                      Center(
                        child: ElevatedButton.icon(
                          onPressed: () {
                            final counterpartName = isDriver
                                ? _passengerData!['name']
                                : _driverData!['name'];
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => ChatScreen(
                                  rideId: _rideId!,
                                  counterpartName: counterpartName,
                                ),
                              ),
                            );
                          },
                          icon: const Icon(Icons.chat_bubble),
                          label: const Text('Chat'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green[600],
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
                          ),
                        ),
                      ),

                    const SizedBox(height: 30),

                    // Driver actions
                    if (isDriver && status == 'accepted')
                      Center(
                        child: ElevatedButton(
                          onPressed: () => _updateStatus('in_progress'),
                          child: const Text('Start Ride'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green,
                            padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
                          ),
                        ),
                      ),

                    if (isDriver && status == 'in_progress')
                      Center(
                        child: ElevatedButton(
                          onPressed: _completeRide,
                          child: const Text('Complete Ride'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.orange,
                            padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
                          ),
                        ),
                      ),

                    // Passenger rating
                    if (!isDriver && status == 'completed')
                      Center(
                        child: ElevatedButton(
                          onPressed: _showRatingDialog,
                          child: const Text('Rate & Pay'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.purple,
                            padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
                          ),
                        ),
                      ),

                    if (status == 'rated')
                      const Center(
                        child: Text(
                          'Thank you for riding with Ryden!',
                          style: TextStyle(fontSize: 18, color: Colors.green),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}