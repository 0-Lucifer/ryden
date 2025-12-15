import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart' as app_auth;

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  // Local state to force rebuild on retry
  Map<String, dynamic>? userData;
  bool isLoading = true;
  String? errorMessage;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      final authProvider = Provider.of<app_auth.AuthProvider>(context, listen: false);
      userData = await authProvider.getUserData();
      if (userData == null) {
        errorMessage = 'No profile data found. Please log in again.';
      }
    } catch (e) {
      errorMessage = 'Error loading profile: $e';
    } finally {
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<app_auth.AuthProvider>(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : errorMessage != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.error_outline, size: 80, color: Colors.red[300]),
                        const SizedBox(height: 16),
                        Text(
                          errorMessage!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 16, color: Colors.red),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton.icon(
                          onPressed: _loadUserData, // Now works with setState
                          icon: const Icon(Icons.refresh),
                          label: const Text('Retry'),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: () async {
                            await authProvider.logout();
                            Navigator.pushReplacementNamed(context, '/login');
                          },
                          icon: const Icon(Icons.logout),
                          label: const Text('Logout & Login Again'),
                          style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                        ),
                      ],
                    ),
                  ),
                )
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    CircleAvatar(
                      radius: 60,
                      backgroundColor: Colors.indigo,
                      child: Text(
                        userData!['name'][0].toUpperCase(),
                        style: const TextStyle(fontSize: 48, color: Colors.white),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      userData!['name'],
                      style: Theme.of(context).textTheme.headlineMedium,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(userData!['email'], textAlign: TextAlign.center, style: const TextStyle(color: Colors.grey)),
                    Text(userData!['phone'], textAlign: TextAlign.center, style: const TextStyle(color: Colors.grey)),
                    const SizedBox(height: 32),
                    Card(
                      child: ListTile(
                        leading: const Icon(Icons.star, color: Colors.amber),
                        title: const Text('Rating'),
                        trailing: Text('${userData!['rating'] ?? 4.9} ⭐'),
                      ),
                    ),
                    Card(
                      child: ListTile(
                        leading: const Icon(Icons.school),
                        title: const Text('Student ID'),
                        trailing: Text(userData!['studentId']),
                      ),
                    ),
                    Card(
                      child: ListTile(
                        leading: const Icon(Icons.business),
                        title: const Text('Department'),
                        trailing: Text(userData!['department']),
                      ),
                    ),
                    const SizedBox(height: 32),
                    Center(
                      child: ElevatedButton.icon(
                        onPressed: () async {
                          await authProvider.logout();
                          Navigator.pushReplacementNamed(context, '/login');
                        },
                        icon: const Icon(Icons.logout),
                        label: const Text('Logout'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }
}