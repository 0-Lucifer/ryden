// lib/screens/ride_history_screen.dart

import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class RideHistoryScreen extends StatefulWidget {
  const RideHistoryScreen({super.key});

  @override
  State<RideHistoryScreen> createState() => _RideHistoryScreenState();
}

class _RideHistoryScreenState extends State<RideHistoryScreen> {
  List<Map<String, dynamic>> _completedRides = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadRideHistory();
  }

  Future<void> _loadRideHistory() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      setState(() => _isLoading = false);
      return;
    }

    try {
      // We will store completed rides in a separate node for history
      final historyRef = FirebaseDatabase.instance.ref('ride-history/${user.uid}');
      final snapshot = await historyRef.get();

      if (snapshot.exists) {
        final data = snapshot.value as Map<dynamic, dynamic>;
        final List<Map<String, dynamic>> loaded = [];

        for (var entry in data.entries) {
          final ride = Map<String, dynamic>.from(entry.value as Map);
          ride['historyId'] = entry.key;
          loaded.add(ride);
        }

        // Sort by timestamp descending (newest first)
        loaded.sort((a, b) => (b['completedAt'] ?? 0).compareTo(a['completedAt'] ?? 0));

        setState(() {
          _completedRides = loaded;
          _isLoading = false;
        });
      } else {
        setState(() {
          _completedRides = [];
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading history: $e')),
      );
    }
  }

  String _formatDate(int timestamp) {
    final date = DateTime.fromMillisecondsSinceEpoch(timestamp);
    return DateFormat('MMM dd, yyyy • hh:mm a').format(date);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ride History'),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _completedRides.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.history, size: 80, color: Colors.grey[400]),
                      const SizedBox(height: 16),
                      Text(
                        'No rides yet',
                        style: TextStyle(fontSize: 20, color: Colors.grey[600]),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Your completed rides will appear here',
                        style: TextStyle(color: Colors.grey[500]),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _completedRides.length,
                  itemBuilder: (context, index) {
                    final ride = _completedRides[index];
                    final isDriver = ride['driverId'] == FirebaseAuth.instance.currentUser!.uid;

                    return Card(
                      margin: const EdgeInsets.only(bottom: 16),
                      elevation: 4,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  isDriver ? 'You drove' : 'You rode with',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: isDriver ? Colors.green[700] : Colors.indigo[700],
                                  ),
                                ),
                                Chip(
                                  label: Text(
                                    '৳${ride['fare']}',
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                                  ),
                                  backgroundColor: Colors.indigo,
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              '${ride['from']} → ${ride['to']}',
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _formatDate(ride['completedAt']),
                              style: TextStyle(color: Colors.grey[600]),
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Icon(Icons.star, color: Colors.amber, size: 20),
                                const SizedBox(width: 4),
                                Text(
                                  'Rating: ${ride['ratingGiven'] != null ? ride['ratingGiven'].toStringAsFixed(1) : 'Not rated'}',
                                  style: const TextStyle(fontSize: 16),
                                ),
                              ],
                            ),
                            if (ride['counterpartName'] != null) ...[
                              const SizedBox(height: 8),
                              Text(
                                '${isDriver ? 'Passenger' : 'Driver'}: ${ride['counterpartName']}',
                                style: TextStyle(color: Colors.grey[700]),
                              ),
                            ],
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}