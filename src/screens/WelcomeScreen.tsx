import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import { useFonts, Raleway_400Regular, Raleway_600SemiBold, Raleway_700Bold } from '@expo-google-fonts/raleway';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: any) {
  let [fontsLoaded] = useFonts({
    Raleway_400Regular,
    Raleway_600SemiBold,
    Raleway_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ImageBackground
        source={require('../../assets/images/welcome-image.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Overlay removed for clean white background */}

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.centerContent}>

              {/* BRANDING SECTION */}
              <View style={styles.brandingSection}>
                <Text style={styles.brandName} numberOfLines={1}>
                  LIBERATE ME
                </Text>
                <View style={styles.minimalDivider} />
                <Text style={styles.subtitle}>Mental Wellness</Text>
              </View>

              {/* CTA Section */}
              <View style={styles.ctaSection}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => navigation.navigate('SignUp')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryButtonText}>Get Started</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => navigation.navigate('SignIn')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.secondaryButtonText}>Sign In</Text>
                </TouchableOpacity>

                <Text style={styles.securityBadge}>
                  SECURE • PRIVATE • ENCRYPTED
                </Text>
              </View>

            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Ensure fallback white
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  safeArea: {
    flex: 1,
    zIndex: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: height * 0.15,
    paddingBottom: 40,
  },
  brandingSection: {
    alignItems: 'center',
    width: '100%',
  },
  brandEmoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  brandName: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 30,
    color: colors.textPrimary, // Keeping dark because BG is white
    letterSpacing: 12, // RESTORED original wide spacing
    textAlign: 'center',
    marginBottom: 0,
    textTransform: 'uppercase',
  },
  minimalDivider: {
    width: 50,
    height: 2,
    backgroundColor: colors.primary,
    marginVertical: 20,
    borderRadius: 2,
  },
  subtitle: {
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 14,
    color: colors.textSecondary,
    letterSpacing: 6,
    textTransform: 'uppercase',
  },
  ctaSection: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontFamily: 'Raleway_700Bold',
    color: '#FFFFFF',
    fontSize: 18,
    letterSpacing: 1,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    borderWidth: 2, // Added border back for visibility
    borderColor: '#FFFFFF', // Fixed: White border for visibility
  },
  secondaryButtonText: {
    fontFamily: 'Raleway_700Bold',
    color: '#FFFFFF', // Requested White Text
    fontSize: 18,
    letterSpacing: 1,
  },
  badges: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    opacity: 0.6,
  },
  securityBadge: {
    marginTop: 24,
    fontFamily: 'Raleway_700Bold', // Bold for better visibility
    fontSize: 11, // Slightly larger
    color: colors.textPrimary, // Darker color
    letterSpacing: 2,
    opacity: 1, // Full opacity
  },
});