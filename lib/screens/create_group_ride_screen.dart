import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter/material.dart';

class CreateGroupRideScreen extends StatefulWidget {
  const CreateGroupRideScreen({super.key});

  @override
  State<CreateGroupRideScreen> createState() => _CreateGroupRideScreenState();
}

class _CreateGroupRideScreenState extends State<CreateGroupRideScreen> {
  final _fromController = TextEditingController();
  final _toController = TextEditingController();
  final _timeController = TextEditingController();
  final _membersController = TextEditingController();  // Comma-separated emails
  bool _isLoading = false;
  String? _error;

  Future<void> _createGroup() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      setState(() => _error = 'Not logged in');
      return;
    }

    setState(() => _isLoading = true);
    try {
      final ref = FirebaseDatabase.instance.ref('group-rides').push();
      await ref.set({
        'from': _fromController.text,
        'to': _toController.text,
        'time': _timeController.text,
        'creatorId': user.uid,
        'members': _membersController.text.split(',').map((e) => e.trim()).toList(),
      });
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Group ride created!')));
      Navigator.pop(context);
    } catch (e) {
      setState(() => _error = e.toString());
    }
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create Group Ride')),
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
            TextField(controller: _membersController, decoration: const InputDecoration(labelText: 'Member Emails (comma-separated)', border: OutlineInputBorder())),
            if (_error != null) ...[
              const SizedBox(height: 16),
              Text(_error!, style: const TextStyle(color: Colors.red)),
            ],
            const SizedBox(height: 24),
            _isLoading
                ? const CircularProgressIndicator()
                : ElevatedButton(
                    onPressed: _createGroup,
                    child: const Text('Create Group Ride'),
                  ),
          ],
        ),
      ),
    );
  }
}