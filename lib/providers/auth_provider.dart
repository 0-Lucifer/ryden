// Updated lib/providers/auth_provider.dart - Safe casting for Realtime DB

import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter/material.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  Map<String, dynamic>? _userData;

  User? get user => _user;
  Map<String, dynamic>? get userData => _userData;

  Future<void> signup(String email, String password, String name, String phone, String studentId, String department) async {
    if (!email.endsWith('@northsouth.edu')) throw Exception('Use university email');
    UserCredential cred = await FirebaseAuth.instance.createUserWithEmailAndPassword(email: email, password: password);
    _user = cred.user;
    await FirebaseDatabase.instance.ref('users/${_user!.uid}').set({
      'name': name, 'email': email, 'phone': phone, 'studentId': studentId, 'department': department, 'rating': 4.9,
    });
    _userData = await getUserData();
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    UserCredential cred = await FirebaseAuth.instance.signInWithEmailAndPassword(email: email, password: password);
    _user = cred.user;
    try {
      _userData = await getUserData();
    } catch (e) {
      _userData = null;
      print('Error fetching user data: $e');
    }
    notifyListeners();
  }

  Future<void> logout() async {
    await FirebaseAuth.instance.signOut();
    _user = null;
    _userData = null;
    notifyListeners();
  }

  Future<Map<String, dynamic>?> getUserData() async {
    if (_user == null) return null;
    DataSnapshot snapshot = await FirebaseDatabase.instance.ref('users/${_user!.uid}').get();
    final data = snapshot.value;
    if (data == null) return null;
    // Safe casting: Convert Object? map to String, dynamic
    if (data is Map) {
      return Map<String, dynamic>.from(data.map((key, value) => MapEntry(key.toString(), value)));
    }
    return null;  // Fallback if not a map
  }
}