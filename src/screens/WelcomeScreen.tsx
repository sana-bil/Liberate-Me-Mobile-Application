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
      <StatusBar barStyle="light-content" />
      
      <ImageBackground
        source={require('../../assets/images/welcome-image.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.centerContent}>
              
              {/* BRANDING SECTION - NOW PUSHED DOWN */}
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
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)', 
  },
  safeArea: {
    flex: 1,
    zIndex: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    // INCREASED padding from 0.1 to 0.18 to push it down
    paddingTop: height * 0.18, 
    paddingBottom: 40,
  },
  brandingSection: {
    alignItems: 'center',
    width: '100%',
  },
  brandName: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 30, 
    color: '#FFFFFF',
    letterSpacing: 12, 
    textAlign: 'center',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
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
    color: '#FFFFFF',
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
    marginBottom: 12,
  },
  primaryButtonText: {
    fontFamily: 'Raleway_600SemiBold',
    color: '#FFFFFF',
    fontSize: 18,
    letterSpacing: 1,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 25,
  },
  secondaryButtonText: {
    fontFamily: 'Raleway_600SemiBold',
    color: '#FFFFFF',
    fontSize: 18,
  },
  securityBadge: {
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 2,
  },
});