import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter/material.dart';

class RideRequestsScreen extends StatefulWidget {
  const RideRequestsScreen({super.key});

  @override
  State<RideRequestsScreen> createState() => _RideRequestsScreenState();
}

class _RideRequestsScreenState extends State<RideRequestsScreen> {
  List<Map<String, dynamic>> _requests = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _listenToRequests();
  }

  void _listenToRequests() {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      setState(() => _isLoading = false);
      return;
    }

    // Listen to requests for rides offered by this driver
    final requestsRef = FirebaseDatabase.instance.ref('ride-requests');
    requestsRef.onValue.listen((event) async {
      final data = event.snapshot.value as Map<dynamic, dynamic>?;
      if (data == null) {
        setState(() {
          _requests = [];
          _isLoading = false;
        });
        return;
      }

      final List<Map<String, dynamic>> loaded = [];
      for (var entry in data.entries) {
        final req = Map<String, dynamic>.from(entry.value as Map);
        req['bookingId'] = entry.key;

        // Get ride details to check if this driver owns it
        final rideSnapshot = await FirebaseDatabase.instance.ref('ride-offers/${req['rideId']}').get();
        if (rideSnapshot.exists) {
          final ride = rideSnapshot.value as Map<dynamic, dynamic>;
          if (ride['driverId'] == user.uid && req['status'] == 'pending') {
            // Fetch booker name
            final userSnapshot = await FirebaseDatabase.instance.ref('users/${req['bookerId']}').get();
            if (userSnapshot.exists) {
              final userData = userSnapshot.value as Map<dynamic, dynamic>;
              req['bookerName'] = userData['name'] ?? 'Passenger';
            }
            loaded.add(req);
          }
        }
      }

      setState(() {
        _requests = loaded;
        _isLoading = false;
      });
    });
  }

Future<void> _acceptRequest(String bookingId, Map<String, dynamic> request) async {
  try {
    final db = FirebaseDatabase.instance;
    final driverId = FirebaseAuth.instance.currentUser!.uid;

    // Update request status
    await db.ref('ride-requests/$bookingId').update({'status': 'accepted'});

    // Full ride data for active-rides
    final rideData = {
      'rideId': bookingId,
      'from': request['from'],
      'to': request['to'],
      'time': request['time'],
      'fare': request['fare'],
      'driverId': driverId,
      'bookerId': request['bookerId'],
      'status': 'accepted',  // Initial status
      'timestamp': ServerValue.timestamp,
    };

    // Add to both users' active rides
    await db.ref('active-rides/${request['bookerId']}/$bookingId').set(rideData);
    await db.ref('active-rides/$driverId/$bookingId').set(rideData);

    // Notify passenger
    await db.ref('notifications/${request['bookerId']}').push().set({
      'title': 'Ride Accepted!',
      'message': 'Your driver is on the way. You can track the ride now.',
      'timestamp': ServerValue.timestamp,
    });

    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Ride accepted!')));
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
  }
}

  Future<void> _rejectRequest(String bookingId, String rideId) async {
    try {
      final db = FirebaseDatabase.instance;

      await db.ref('ride-requests/$bookingId').update({'status': 'rejected'});

      // Restore seat
      await db.ref('ride-offers/$rideId').update({
        'availableSeats': ServerValue.increment(1)
      });

      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Ride rejected')));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ride Requests')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _requests.isEmpty
              ? const Center(child: Text('No pending requests'))
              : ListView.builder(
                  itemCount: _requests.length,
                  itemBuilder: (context, index) {
                    final req = _requests[index];
                    return Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('From: ${req['from']} → ${req['to']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                            Text('Time: ${req['time']}'),
                            Text('Passenger: ${req['bookerName']}'),
                            Text('Fare: ৳${req['fare']}'),
                            const SizedBox(height: 12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                OutlinedButton(
                                  onPressed: () => _rejectRequest(req['bookingId'], req['rideId']),
                                  child: const Text('Reject'),
                                ),
                                const SizedBox(width: 12),
                                ElevatedButton(
                                  onPressed: () => _acceptRequest(req['bookingId'], req),
                                  child: const Text('Accept'),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}