import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart' as app_auth;
import 'screens/login_screen.dart';
import 'screens/signup_screen.dart';
import 'screens/tab_screen.dart';
import 'screens/find_ride_screen.dart';
import 'screens/offer_ride_screen.dart';
import 'screens/create_group_ride_screen.dart';
import 'screens/active_ride_screen.dart';
import 'screens/splash_screen.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/ride_requests_screen.dart';
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => app_auth.AuthProvider()),
      ],
      child: MaterialApp(
        title: 'Ryden',
        theme: ThemeData(
          primarySwatch: Colors.indigo,
          useMaterial3: true,
          scaffoldBackgroundColor: Colors.grey[50],
          textTheme: GoogleFonts.poppinsTextTheme(),
          appBarTheme: const AppBarTheme(
            backgroundColor: Colors.transparent,
            elevation: 0,
            foregroundColor: Colors.indigo,
          ),
          cardTheme: CardThemeData(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            elevation: 8,
            shadowColor: Colors.black.withOpacity(0.08),
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              elevation: 4,
            ),
          ),
        ),
        home: const SplashScreen(),
        routes: {
          '/login': (_) => const LoginScreen(),
          '/signup': (_) => const SignupScreen(),
          '/tabs': (_) => const TabScreen(),
          '/find_ride': (_) => const FindRideScreen(),
          '/offer_ride': (_) => const OfferRideScreen(),
          '/create_group_ride': (_) => const CreateGroupRideScreen(),
          '/active_ride': (_) => const ActiveRideScreen(),
          '/ride_requests': (_) => const RideRequestsScreen(),

          
        },
      ),
    );
  }
}