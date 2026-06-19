import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import Spacing from '@/constants/spacing';
import Typography from '@/constants/typography';
import { useApp } from '@/context/AppContext';
import { currentUser } from '@/mocks/users';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useApp();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);

    setTimeout(async () => {
      await login(currentUser);
      setIsLoading(false);
      router.replace('/(tabs)/index');
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          <View style={styles.methodToggle}>
            <TouchableOpacity
              style={[
                styles.methodButton,
                loginMethod === 'email' && styles.methodButtonActive,
              ]}
              onPress={() => setLoginMethod('email')}
            >
              <Mail
                size={20}
                color={loginMethod === 'email' ? Colors.white : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.methodText,
                  loginMethod === 'email' && styles.methodTextActive,
                ]}
              >
                Email
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodButton,
                loginMethod === 'phone' && styles.methodButtonActive,
              ]}
              onPress={() => setLoginMethod('phone')}
            >
              <Phone
                size={20}
                color={loginMethod === 'phone' ? Colors.white : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.methodText,
                  loginMethod === 'phone' && styles.methodTextActive,
                ]}
              >
                Phone
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {loginMethod === 'email' ? (
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Mail size={20} color={Colors.textSecondary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="University email (.edu.bd)"
                  placeholderTextColor={Colors.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            ) : (
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Phone size={20} color={Colors.textSecondary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="+880 1XXX-XXXXXX"
                  placeholderTextColor={Colors.textTertiary}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Lock size={20} color={Colors.textSecondary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color={Colors.textSecondary} />
                ) : (
                  <Eye size={20} color={Colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[Colors.gradient.primary[0], Colors.gradient.primary[1]]}
                style={styles.loginGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.googleButton}>
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xxxl,
    marginTop: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body1,
    color: Colors.textSecondary,
  },
  methodToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.xs,
    marginBottom: Spacing.xxl,
    gap: Spacing.xs,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: 10,
    gap: Spacing.sm,
  },
  methodButtonActive: {
    backgroundColor: Colors.primary,
  },
  methodText: {
    ...Typography.button,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  methodTextActive: {
    color: Colors.white,
  },
  form: {
    gap: Spacing.base,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.base,
    height: 56,
  },
  inputIcon: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    ...Typography.body1,
    color: Colors.textPrimary,
  },
  eyeIcon: {
    padding: Spacing.sm,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: Spacing.xs,
  },
  forgotPasswordText: {
    ...Typography.body2,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  loginButton: {
    marginTop: Spacing.lg,
  },
  loginGradient: {
    paddingVertical: Spacing.base,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  loginButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...Typography.body2,
    color: Colors.textTertiary,
    marginHorizontal: Spacing.base,
  },
  googleButton: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  googleButtonText: {
    ...Typography.button,
    color: Colors.textPrimary,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  signupText: {
    ...Typography.body1,
    color: Colors.textSecondary,
  },
  signupLink: {
    ...Typography.body1,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
});
