import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter/material.dart';

class OfferRideScreen extends StatefulWidget {
  const OfferRideScreen({super.key});

  @override
  State<OfferRideScreen> createState() => _OfferRideScreenState();
}

class _OfferRideScreenState extends State<OfferRideScreen> {
  final _fromController = TextEditingController();
  final _toController = TextEditingController();
  final _timeController = TextEditingController();
  final _seatsController = TextEditingController();
  final _fareController = TextEditingController();
  final _vehicleController = TextEditingController();
  bool _isLoading = false;
  String? _error;

  Future<void> _offerRide() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      setState(() => _error = 'Not logged in');
      return;
    }

    setState(() => _isLoading = true);
    try {
      final ref = FirebaseDatabase.instance.ref('ride-offers').push();
      await ref.set({
        'from': _fromController.text,
        'to': _toController.text,
        'time': _timeController.text,
        'availableSeats': int.tryParse(_seatsController.text) ?? 0,  // Use availableSeats
        'fare': int.tryParse(_fareController.text) ?? 0,
        'vehicle': _vehicleController.text,
        'driverId': user.uid,
        'driverName': user.displayName ?? 'Anonymous',
        'rating': 4.5,
      });
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Ride offered!')));
      Navigator.pop(context);
    } catch (e) {
      setState(() => _error = e.toString());
    }
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Offer Ride')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(controller: _fromController, decoration: const InputDecoration(labelText: 'From', border: OutlineInputBorder())),
            const SizedBox(height: 16),
            TextField(controller: _toController, decoration: const InputDecoration(labelText: 'To', border: OutlineInputBorder())),
            const SizedBox(height: 16),
            TextField(controller: _timeController, decoration: const InputDecoration(labelText: 'Departure Time', border: OutlineInputBorder())),
            const SizedBox(height: 16),
            TextField(controller: _seatsController, decoration: const InputDecoration(labelText: 'Available Seats', border: OutlineInputBorder()), keyboardType: TextInputType.number),
            const SizedBox(height: 16),
            TextField(controller: _fareController, decoration: const InputDecoration(labelText: 'Fare per Seat (৳)', border: OutlineInputBorder()), keyboardType: TextInputType.number),
            const SizedBox(height: 16),
            TextField(controller: _vehicleController, decoration: const InputDecoration(labelText: 'Vehicle Model', border: OutlineInputBorder())),
            if (_error != null) ...[
              const SizedBox(height: 16),
              Text(_error!, style: const TextStyle(color: Colors.red)),
            ],
            const SizedBox(height: 24),
            _isLoading
                ? const CircularProgressIndicator()
                : ElevatedButton(
                    onPressed: _offerRide,
                    child: const Text('Offer Ride'),
                  ),
          ],
        ),
      ),
    );
  }
}