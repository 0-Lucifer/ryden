import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter/material.dart';

class FindRideScreen extends StatefulWidget {
  const FindRideScreen({super.key});

  @override
  State<FindRideScreen> createState() => _FindRideScreenState();
}

class _FindRideScreenState extends State<FindRideScreen> {
  final TextEditingController _pickupController = TextEditingController();
  final TextEditingController _dropoffController = TextEditingController();
  List<Map<String, dynamic>> _rides = [];
  List<Map<String, dynamic>> _filteredRides = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _listenToRides();
  }

  void _listenToRides() {
    final ref = FirebaseDatabase.instance.ref('ride-offers');
    ref.onValue.listen((event) {
      final data = event.snapshot.value as Map<dynamic, dynamic>?;
      if (data != null) {
        final List<Map<String, dynamic>> loadedRides = [];
        data.forEach((key, value) {
          final ride = Map<String, dynamic>.from(value as Map);
          ride['id'] = key;
          loadedRides.add(ride);
        });
        setState(() {
          _rides = loadedRides;
          _filteredRides = loadedRides;
          _isLoading = false;
        });
      } else {
        setState(() {
          _isLoading = false;
        });
      }
    }, onError: (error) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error loading rides: $error')));
    });
  }

  void _filterRides() {
    final from = _pickupController.text.toLowerCase();
    final to = _dropoffController.text.toLowerCase();
    setState(() {
      _filteredRides = _rides.where((ride) =>
        (ride['from'] as String? ?? '').toLowerCase().contains(from) &&
        (ride['to'] as String? ?? '').toLowerCase().contains(to)
      ).toList();
    });
  }

Future<void> _bookRide(String rideId, Map<String, dynamic> ride) async {
  final user = FirebaseAuth.instance.currentUser;
  if (user == null) {
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please log in')));
    return;
  }

  final availableSeats = ride['availableSeats'] ?? ride['seats'] ?? 0;
  if (availableSeats <= 0) {
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('No seats available')));
    return;
  }

  setState(() => _isLoading = true);
  try {
    final db = FirebaseDatabase.instance;

    // Create booking request (pending)
    final bookingRef = db.ref('ride-requests').push();
    final bookingId = bookingRef.key!;

    await bookingRef.set({
      'rideId': rideId,
      'bookerId': user.uid,
      'bookerName': user.displayName ?? 'Passenger',
      'status': 'pending',  // Waiting for driver
      'timestamp': ServerValue.timestamp,
      'fare': ride['fare'],
      'from': ride['from'],
      'to': ride['to'],
      'time': ride['time'],
    });

    // Temporarily reserve seat (decrement)
    await db.ref('ride-offers/$rideId').update({
      'availableSeats': ServerValue.increment(-1)
    });

    // Notify driver
    final notifRef = db.ref('notifications/${ride['driverId']}').push();
    await notifRef.set({
      'title': 'New Ride Request',
      'message': '${user.displayName ?? 'Someone'} wants to book your ride from ${ride['from']} to ${ride['to']}',
      'type': 'ride_request',
      'bookingId': bookingId,
      'timestamp': ServerValue.timestamp,
    });

    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Request sent! Waiting for driver...')));
    Navigator.pop(context); // Or go to a "Requests" screen
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
  } finally {
    setState(() => _isLoading = false);
  }
}

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Find Ride')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    TextField(
                      controller: _pickupController,
                      decoration: const InputDecoration(labelText: 'Pickup Location', icon: Icon(Icons.location_on)),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _dropoffController,
                      decoration: const InputDecoration(labelText: 'Drop-off Location', icon: Icon(Icons.flag)),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(onPressed: _filterRides, child: const Text('Search Rides')),
                  ],
                ),
              ),
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredRides.isEmpty
                    ? const Center(child: Text('No rides found'))
                    : ListView.builder(
                        itemCount: _filteredRides.length,
                        itemBuilder: (context, index) {
                          final ride = _filteredRides[index];
                          return Card(
                            child: ListTile(
                              leading: const Icon(Icons.directions_car),
                              title: Text('${ride['from']} → ${ride['to']}'),
                              subtitle: Text('${ride['time']} • ${ride['vehicle']} • ⭐ ${ride['rating']} • Seats: ${ride['availableSeats'] ?? ride['seats']}'),
                              trailing: ElevatedButton(
                                onPressed: () => _bookRide(ride['id'], ride),
                                child: const Text('Book'),
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}