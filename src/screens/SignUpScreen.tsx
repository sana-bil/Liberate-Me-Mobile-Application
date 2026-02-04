import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../services/AuthContext';
import { useFonts, Raleway_400Regular, Raleway_600SemiBold, Raleway_700Bold } from '@expo-google-fonts/raleway';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { auth, db } from '../services/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const { height } = Dimensions.get('window');

export default function SignUpScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  let [fontsLoaded] = useFonts({
    Raleway_400Regular,
    Raleway_600SemiBold,
    Raleway_700Bold,
  });

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthday(selectedDate);
    }
  };

  const handleSignUp = async () => {
    if (!email || !username || !password || !confirmPassword || !birthday) {
      Alert.alert('Oops!', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Oops!', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Oops!', 'Password must be at least 6 characters');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Oops!', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // 1. Create User
      await signUp(email, password);

      // 2. Update Profile & Save Data (handled here to avoid AuthContext changes)
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Update Display Name
        await updateProfile(currentUser, {
          displayName: username,
        });

        // Save User Data to Firestore
        await setDoc(doc(db, 'users', currentUser.uid), {
          uid: currentUser.uid,
          email: email.trim(),
          username: username.trim(),
          birthday: birthday.toISOString(),
          createdAt: new Date().toISOString(),
        });
      }

      navigation.navigate('SignIn');
    } catch (error: any) {
      let errorMessage = 'Something went wrong. Please try again.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Make it stronger!';
      } else {
        errorMessage = error.message; // Show specific error for debugging if needed
      }

      Alert.alert('Oops!', errorMessage);
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Back Button - Pinned to Top */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>

        {/* Main Content Centered */}
        <View style={styles.mainContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              {/* Emoji removed as requested */}
              <Text style={styles.title}>Let's get started</Text>
              <Text style={styles.subtitle}>Create your account</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your.email@example.com"
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Choose a username"
                placeholderTextColor={colors.textTertiary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoComplete="username"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password-new"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Same as above"
                placeholderTextColor={colors.textTertiary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete="password-new"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Birthday</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.dateInput}
              >
                <Text style={[styles.inputText, !birthday && { color: colors.textTertiary }]}>
                  {birthday ? birthday.toLocaleDateString() : 'Select your birthday'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={birthday || new Date()}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  maximumDate={new Date()} // Can't be born in the future
                />
              )}
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color={colors.textWhite} />
              ) : (
                <Text style={styles.buttonText}>Create My Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.noteBox}>
              <Text style={styles.noteText}>
                We'll email you a verification link (check spam!)
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    // Removed justifyContent, relying on mainContainer to center
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center', // VERTICALLY CENTER CONTENT
  },
  header: {
    marginBottom: 12, // Reduced from 24
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12, // Restored breathing room
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
  },
  backText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  titleContainer: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 28, // Slightly smaller title
    color: colors.textPrimary,
    marginBottom: 4, // Reduced from 8
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Raleway_400Regular',
    fontSize: 14, // Slightly smaller subtitle
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20, // Reduced line height
  },
  form: {
    gap: 12, // Reduced from 16
  },
  inputGroup: {
    gap: 4, // Reduced from 6
  },
  label: {
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 13, // Slightly smaller label
    color: colors.textPrimary,
    marginBottom: 2, // Reduced from 4
  },
  input: {
    fontFamily: 'Raleway_400Regular',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12, // Reduced from 14
    fontSize: 15, // Slightly smaller input text
    color: colors.textPrimary,
  },
  dateInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12, // Reduced from 14
    justifyContent: 'center',
  },
  inputText: {
    fontFamily: 'Raleway_400Regular',
    fontSize: 15, // Match input font size
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14, // Reduced from 16
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8, // Reduced from 12
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
    backgroundColor: colors.secondary,
  },
  buttonText: {
    fontFamily: 'Raleway_700Bold',
    color: colors.textWhite,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  noteBox: {
    backgroundColor: colors.surface,
    paddingVertical: 10, // Reduced from 12
    paddingHorizontal: 12, // Reduced from 16
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  noteText: {
    fontFamily: 'Raleway_400Regular',
    fontSize: 12, // Slightly smaller note
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingTop: 12, // Reduced from 20
  },
  footerText: {
    fontFamily: 'Raleway_400Regular',
    fontSize: 13, // Slightly smaller footer text
    color: colors.textSecondary,
  },
  footerLink: {
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 13,
    color: colors.primary,
  },
});