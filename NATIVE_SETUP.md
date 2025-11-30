# Ryden Native App Setup Guide

## ✅ Configuration Complete

Your project now supports **Android** and **iOS** native builds with all necessary configurations.

## What's Been Configured

### 1. App Configuration (`app.json`)
- **Bundle Identifiers**:
  - iOS: `com.nsu.ryden`
  - Android: `com.nsu.ryden`
- **Permissions**:
  - Location (for ride tracking and nearby drivers)
  - Camera & Photo Library (for profile pictures)
  - Microphone (for voice chat)
- **Google Maps API** placeholders for both platforms

### 2. EAS Build Configuration (`eas.json`)
- **Development builds**: For local testing with dev client
- **Preview builds**: For internal distribution (APK/TestFlight)
- **Production builds**: For App Store & Play Store submission

### 3. Native Dependencies
All required packages are installed:
- `react-native-maps` (1.20.1)
- `react-native-gesture-handler` (2.28.0)
- `react-native-reanimated` (4.1.1)
- `react-native-safe-area-context` (5.6.0)
- `react-native-screens` (4.16.0)
- `@react-native-firebase/app` (23.5.0)
- `@react-native-firebase/messaging` (23.5.0)

---

## Running on Native Devices

### Option 1: Expo Go (Quick Testing)
**No setup required** - just install Expo Go and scan the QR code.

```powershell
# Start the dev server
npm start

# Then scan the QR code with:
# - Android: Expo Go app
# - iOS: Camera app
```

**Limitations**: Some native modules (Firebase, Maps) may not work in Expo Go.

---

### Option 2: Development Build (Recommended)

#### Prerequisites
1. **Install EAS CLI**:
```powershell
npm install -g eas-cli
eas login
```

2. **Create Expo account** at https://expo.dev

#### Build & Install

**For Android:**
```powershell
# Build development APK
eas build --profile development --platform android

# After build completes, download and install the APK on your device
# Or scan the QR code in the build output
```

**For iOS:**
```powershell
# Build development app (requires Apple Developer account)
eas build --profile development --platform ios

# Follow the instructions to install on device via TestFlight or direct install
```

#### Run with Development Build
```powershell
npm start --dev-client
# Then open the app on your device
```

---

### Option 3: Local Android Build (Advanced)

#### 1. Install Android Studio
```powershell
winget install -e --id Google.AndroidStudio
```

#### 2. Configure Android SDK
After installation, open Android Studio and:
- Go to **Tools → SDK Manager**
- Install:
  - Android 14.0 (API 34)
  - Android SDK Build-Tools 34.x
  - Android Emulator
  - Intel x86 Emulator Accelerator (HAXM)

#### 3. Set Environment Variables
```powershell
# Set Android SDK path
$androidSdk = "$env:LOCALAPPDATA\Android\Sdk"
setx ANDROID_HOME "$androidSdk"
setx ANDROID_SDK_ROOT "$androidSdk"

# Add to PATH
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
$newPath = "$currentPath;$androidSdk\platform-tools;$androidSdk\emulator;$androidSdk\tools;$androidSdk\tools\bin"
[Environment]::SetEnvironmentVariable("Path", $newPath, "User")

# Restart your terminal after this
```

#### 4. Verify Setup
```powershell
# Open a NEW terminal and check:
adb version
# Should show Android Debug Bridge version
```

#### 5. Create & Run Emulator
```powershell
# List available emulators
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -list-avds

# Start an emulator (replace with your AVD name)
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd Pixel_8_API_34

# In another terminal, start Expo
npm start

# Press 'a' to open on Android emulator
```

---

### Option 4: Local iOS Build (macOS only)

#### Prerequisites
- macOS with Xcode installed
- Apple Developer account

#### Setup
```bash
# Install CocoaPods
sudo gem install cocoapods

# Generate native projects
npx expo prebuild

# Install iOS dependencies
cd ios && pod install && cd ..

# Run on iOS simulator
npm run ios
```

---

## Google Maps Setup (Required for Maps)

### 1. Get API Keys
Go to [Google Cloud Console](https://console.cloud.google.com/):
1. Create a new project or select existing
2. Enable **Maps SDK for Android** and **Maps SDK for iOS**
3. Create API keys (one for Android, one for iOS)
4. Restrict keys by bundle ID/package name

### 2. Update Configuration
Edit `app.json` and replace:
```json
"YOUR_ANDROID_GOOGLE_MAPS_API_KEY" → your Android key
"YOUR_IOS_GOOGLE_MAPS_API_KEY" → your iOS key
```

### 3. Rebuild
After adding keys, rebuild your app:
```powershell
eas build --profile development --platform all
```

---

## Firebase Setup (For Push Notifications)

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add Android app with package `com.nsu.ryden`
4. Add iOS app with bundle ID `com.nsu.ryden`
5. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)

### 2. Add Config Files
```powershell
# Place downloaded files in your project root
# Expo will automatically pick them up during build
```

### 3. Rebuild with Firebase
```powershell
eas build --profile development --platform all
```

---

## Testing Options

### 1. Physical Device (Easiest)
- **Android**: Use Expo Go or install development build APK
- **iOS**: Use Expo Go or TestFlight

### 2. Android Emulator
- Requires Android Studio setup (see Option 3 above)
- Best performance with Intel HAXM or Windows Hypervisor

### 3. iOS Simulator (macOS only)
- Requires Xcode
- Run with `npm run ios`

---

## Production Builds

### Preview Build (Internal Testing)
```powershell
# Build APK for Android
eas build --profile preview --platform android

# Build for iOS TestFlight
eas build --profile preview --platform ios
```

### Production Build (App Store & Play Store)
```powershell
# Build production-ready apps
eas build --profile production --platform all

# Submit to stores (requires credentials)
eas submit --platform android
eas submit --platform ios
```

---

## Quick Commands Reference

```powershell
# Start dev server (Expo Go)
npm start

# Start with development build
npm start --dev-client

# Run on specific platform
npm run android  # Requires Android SDK
npm run ios      # Requires macOS + Xcode
npm run web

# Build with EAS
eas build --profile development --platform android
eas build --profile development --platform ios
eas build --profile production --platform all

# Check configuration health
npx expo-doctor

# Clear cache if issues occur
npx expo start -c
```

---

## Troubleshooting

### Android SDK Not Found
```powershell
# Verify ANDROID_HOME is set
echo $env:ANDROID_HOME
# Should show: C:\Users\User\AppData\Local\Android\Sdk

# If not set, run the environment setup commands in Option 3
```

### ADB Not Recognized
```powershell
# Check if platform-tools is in PATH
adb version

# If fails, add to PATH manually:
$env:PATH += ";$env:LOCALAPPDATA\Android\Sdk\platform-tools"
```

### Build Errors
```powershell
# Clear Expo cache
npx expo start -c

# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
npm install

# Check configuration
npx expo-doctor
```

### Maps Not Showing
- Verify API keys are added to `app.json`
- Ensure APIs are enabled in Google Cloud Console
- Rebuild the app after adding keys

---

## Next Steps

1. **For Quick Testing**: Use Expo Go
   ```powershell
   npm start
   # Scan QR with Expo Go app
   ```

2. **For Full Features**: Build development client
   ```powershell
   eas build --profile development --platform android
   npm start --dev-client
   ```

3. **For Production**: Configure Google Maps & Firebase, then build
   ```powershell
   # Add API keys to app.json
   # Add Firebase config files
   eas build --profile production --platform all
   ```

---

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Guide](https://docs.expo.dev/build/introduction/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [Firebase Setup](https://rnfirebase.io/)
- [Android Studio Download](https://developer.android.com/studio)
