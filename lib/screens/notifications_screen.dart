import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter/material.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<Map<String, dynamic>> _notifications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _listenToNotifications();
  }

  void _listenToNotifications() {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      setState(() => _isLoading = false);
      return;
    }

    final ref = FirebaseDatabase.instance.ref('notifications/${user.uid}');
    ref.onValue.listen((event) {
      final data = event.snapshot.value as Map<dynamic, dynamic>?;
      if (data != null) {
        final List<Map<String, dynamic>> loaded = [];
        data.forEach((key, value) {
          loaded.add(Map<String, dynamic>.from(value as Map));
        });
        setState(() {
          _notifications = loaded;
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    }, onError: (error) {
      setState(() => _isLoading = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Notifications')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _notifications.isEmpty
              ? const Center(child: Text('No notifications yet'))
              : ListView.builder(
                  itemCount: _notifications.length,
                  itemBuilder: (context, index) {
                    final notif = _notifications[index];
                    return Card(
                      child: ListTile(
                        leading: const Icon(Icons.notification_important),
                        title: Text(notif['title'] ?? 'Notification'),
                        subtitle: Text(notif['message'] ?? ''),
                      ),
                    );
                  },
                ),
    );
  }
}