import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Switch, Alert, Image, ActivityIndicator, Modal, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useAuth } from '../services/AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { useFonts, Raleway_400Regular, Raleway_600SemiBold, Raleway_700Bold } from '@expo-google-fonts/raleway';

type ModalType = 'privacy' | 'terms' | 'help' | null;

export default function SettingsScreen({ navigation }: any) {
  const { user, logOut } = useAuth();

  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [activeModal, setActiveModal] = useState<ModalType>(null);

  let [fontsLoaded] = useFonts({
    Raleway_400Regular,
    Raleway_600SemiBold,
    Raleway_700Bold,
  });

  useEffect(() => {
    fetchUserData();
  }, [user?.uid]);

  const fetchUserData = async () => {
    if (!user?.uid) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfileImage(data.profileImage || null);
        setDisplayName(data.displayName || user.email?.split('@')[0] || 'Soul');
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Error', 'Need gallery access');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Allow cropping for perfect circles
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);
      await setDoc(doc(db, 'users', user?.uid || ''), { profileImage: uri }, { merge: true });
    }
  };

  const NavItem = ({ label, icon, onPress, type = 'link', value, onValueChange }: any) => (
    <TouchableOpacity style={styles.navItem} onPress={onPress} disabled={type === 'switch'} activeOpacity={0.7}>
      <View style={styles.navLeft}>
        <Text style={styles.navIcon}>{icon}</Text>
        <Text style={styles.navLabel}>{label}</Text>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ true: colors.primary, false: '#E0E0E0' }}
          thumbColor={'#FFFFFF'}
        />
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
    </TouchableOpacity>
  );

  const renderModalContent = () => {
    switch (activeModal) {
      case 'privacy':
        return (
          <>
            <Text style={styles.privacySectionHeader}>1. Introduction</Text>
            <Text style={styles.privacyText}>
              Your privacy is critically important to us. At Liberate Me, we have a few fundamental principles:{'\n'}
              • We don't ask you for personal information unless we truly need it.{'\n'}
              • We don't share your personal information with anyone except to comply with the law, develop our products, or protect our rights.{'\n'}
              • We store personal information only as long as we have a reason to keep it.
            </Text>

            <Text style={styles.privacySectionHeader}>2. Information We Collect</Text>
            <Text style={styles.privacyText}>
              We collect information to provide better services to all our users. This includes:{'\n'}
              • <Text style={{ fontWeight: 'bold' }}>Account Information:</Text> Email address and username provided during signup.{'\n'}
              • <Text style={{ fontWeight: 'bold' }}>Journal Entries:</Text> The content you create within the app. This is encrypted securely.
            </Text>

            <Text style={styles.privacySectionHeader}>3. Security</Text>
            <Text style={styles.privacyText}>
              We take security seriously. All data is transferred over secure HTTPS connections. Your personal journal entries are encrypted using industry-standard AES-256 encryption protocols before being stored in our secure database.
            </Text>

            <Text style={styles.privacySectionHeader}>4. Your Rights</Text>
            <Text style={styles.privacyText}>
              You have the right to access, edit, or delete your personal data at any time. If you wish to delete your account, you can do so from within the app or by contacting support.
            </Text>

            <Text style={{ fontStyle: 'italic', color: colors.textSecondary, marginTop: 20 }}>Last Updated: February 2026</Text>
          </>
        );
      case 'terms':
        return (
          <>
            <Text style={styles.privacySectionHeader}>1. Agreement to Terms</Text>
            <Text style={styles.privacyText}>
              By accessing our app, you agree to be bound by these Terms of Service and to comply with all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this app.
            </Text>

            <Text style={styles.privacySectionHeader}>2. Use License</Text>
            <Text style={styles.privacyText}>
              Permission is granted to temporarily download one copy of the materials (information or software) on Liberate Me for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
            </Text>

            <Text style={styles.privacySectionHeader}>3. Disclaimer</Text>
            <Text style={styles.privacyText}>
              The materials on Liberate Me are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </Text>

            <Text style={styles.privacySectionHeader}>4. Limitations</Text>
            <Text style={styles.privacyText}>
              In no event shall Liberate Me or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our app.
            </Text>

            <Text style={{ fontStyle: 'italic', color: colors.textSecondary, marginTop: 20 }}>Last Updated: February 2026</Text>
          </>
        );
      case 'help':
        return (
          <>
            <Text style={styles.privacySectionHeader}>Frequently Asked Questions</Text>

            <Text style={styles.helpQuestion}>How do I reset my password?</Text>
            <Text style={styles.privacyText}>
              You can reset your password by logging out and tapping calling "Forgot Password?" on the login screen. We'll send you an email with instructions.
            </Text>

            <Text style={styles.helpQuestion}>Is my data private?</Text>
            <Text style={styles.privacyText}>
              Absolutely. We use end-to-end encryption for your journal entries. Not even our team can read your personal thoughts.
            </Text>

            <Text style={styles.helpQuestion}>Can I export my data?</Text>
            <Text style={styles.privacyText}>
              Currently, we don't have a direct export feature, but we are working on it for a future update!
            </Text>

            <Text style={styles.privacySectionHeader}>Contact Support</Text>
            <Text style={styles.privacyText}>
              Need more help? Our support team is available M-F 9am-5pm EST.
            </Text>
            <TouchableOpacity onPress={() => Alert.alert("Email Support", "Opening email client...")}>
              <Text style={{ color: colors.primary, fontFamily: 'Raleway_700Bold', marginTop: 5 }}>support@liberateme.com</Text>
            </TouchableOpacity>

            <Text style={styles.privacySectionHeader}>Resources</Text>
            <Text style={styles.privacyText}>
              If you are in crisis, please contact your local emergency services or a mental health professional immediately. This app is a tool for self-reflection, not professional medical advice.
            </Text>
          </>
        );
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (activeModal) {
      case 'privacy': return 'Privacy Policy';
      case 'terms': return 'Terms of Service';
      case 'help': return 'Help & Support';
      default: return '';
    }
  }

  if (!fontsLoaded || loading) return (
    <View style={styles.loaderContainer}><ActivityIndicator size="large" color={colors.primary} /></View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Profile Card */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarLetter}>{displayName.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.editIcon}><Text style={styles.editIconText}>✎</Text></View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>

        {/* Setting Groups */}
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>GENERAL</Text>
        </View>
        <View style={styles.card}>
          <NavItem label="Graphs & reports" icon="📈" onPress={() => navigation.navigate('Insights')} />
        </View>

        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>SUPPORT & LEGAL</Text>
        </View>
        <View style={styles.card}>
          <NavItem label="Privacy Policy" icon="🛡️" onPress={() => setActiveModal('privacy')} />
          <NavItem label="Terms of Service" icon="📄" onPress={() => setActiveModal('terms')} />
          <NavItem label="Get Help" icon="❓" onPress={() => setActiveModal('help')} />
        </View>

        {/* Data Protection Badge */}
        <View style={styles.trustCard}>
          <Text style={styles.trustIcon}>🔒</Text>
          <View style={styles.trustContent}>
            <Text style={styles.trustTitle}>Your Data is Protected</Text>
            <Text style={styles.trustText}>
              We use bank-grade AES-256 encryption. Your journals are private and only accessible by you.
            </Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logOut}>
          <Text style={styles.logoutBtnText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.4</Text>
      </ScrollView>

      {/* Unified Modal */}
      <Modal
        visible={activeModal !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{getModalTitle()}</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {renderModalContent()}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    alignItems: 'center',
    backgroundColor: colors.background
  },
  headerTitle: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 18,
    color: colors.textPrimary
  },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  // Profile
  profileSection: { alignItems: 'center', paddingVertical: 30 },
  avatarWrapper: { position: 'relative', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarImg: { width: 100, height: 100, borderRadius: 50 },
  avatarLetter: { fontFamily: 'Raleway_700Bold', color: '#FFF', fontSize: 40 },
  editIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#FFF', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border, elevation: 2 },
  editIconText: { fontSize: 14, color: colors.primary },
  profileName: { fontFamily: 'Raleway_700Bold', fontSize: 22, color: colors.textPrimary },
  profileEmail: { fontFamily: 'Raleway_400Regular', fontSize: 14, color: colors.textSecondary, marginTop: 4 },

  // Settings
  sectionTitleContainer: { marginTop: 20, marginBottom: 8, marginLeft: 4 },
  sectionTitle: { fontFamily: 'Raleway_700Bold', fontSize: 13, color: colors.textSecondary, letterSpacing: 1 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },

  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight
  },
  navLeft: { flexDirection: 'row', alignItems: 'center' },
  navIcon: { fontSize: 20, marginRight: 16 },
  navLabel: { fontFamily: 'Raleway_600SemiBold', fontSize: 16, color: colors.textPrimary },
  chevron: { fontSize: 20, color: colors.textTertiary, fontFamily: 'Raleway_600SemiBold' },

  // Trust Badge
  trustCard: {
    marginTop: 30,
    marginBottom: 10,
    padding: 20,
    backgroundColor: '#F0FDF4', // Very light green background
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#DCFCE7'
  },
  trustIcon: { fontSize: 24, marginRight: 15, marginTop: 2 },
  trustContent: { flex: 1 },
  trustTitle: { fontFamily: 'Raleway_700Bold', fontSize: 15, color: '#166534', marginBottom: 4 },
  trustText: { fontFamily: 'Raleway_400Regular', fontSize: 13, color: '#15803D', lineHeight: 18 },

  // Actions
  logoutBtn: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutBtnText: { fontFamily: 'Raleway_700Bold', color: '#FFF', fontSize: 16 },
  versionText: { textAlign: 'center', fontFamily: 'Raleway_400Regular', color: colors.textTertiary, fontSize: 12, marginTop: 24 },

  // Modal
  modalContainer: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  modalTitle: { fontFamily: 'Raleway_700Bold', fontSize: 20, color: colors.textPrimary },
  closeBtn: { padding: 8 },
  closeBtnText: { fontFamily: 'Raleway_600SemiBold', fontSize: 16, color: colors.primary },
  modalContent: { padding: 24 },
  privacyText: { fontFamily: 'Raleway_400Regular', fontSize: 15, color: colors.textPrimary, lineHeight: 24, marginBottom: 16 },
  privacySectionHeader: { fontFamily: 'Raleway_700Bold', fontSize: 17, color: colors.textPrimary, marginTop: 10, marginBottom: 8 },
  helpQuestion: { fontFamily: 'Raleway_700Bold', fontSize: 16, color: colors.textPrimary, marginTop: 16, marginBottom: 4 },
});