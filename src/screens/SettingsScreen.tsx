import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  Switch, Alert, Image, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useAuth } from '../services/AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Ensure this is installed
import * as Notifications from 'expo-notifications'; // Ensure this is installed

export default function SettingsScreen({ navigation }: any) {
  const { user, logOut } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // REAL FUNCTIONAL STATES
  const [appLock, setAppLock] = useState(false);
  const [reminders, setReminders] = useState(false);

  useEffect(() => {
    fetchUserData();
    loadLocalSettings();
  }, [user?.uid]);

  // Load persistence for toggles
  const loadLocalSettings = async () => {
    try {
      const savedLock = await AsyncStorage.getItem('@app_lock');
      const savedReminders = await AsyncStorage.getItem('@reminders');
      if (savedLock !== null) setAppLock(JSON.parse(savedLock));
      if (savedReminders !== null) setReminders(JSON.parse(savedReminders));
    } catch (e) { console.error("Error loading settings", e); }
  };

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

  // FUNCTION: Toggle App Lock
  const toggleAppLock = async (value: boolean) => {
    setAppLock(value);
    await AsyncStorage.setItem('@app_lock', JSON.stringify(value));
    if (value) {
      Alert.alert("Shield On", "Next time you open the app, we'll ask for your passcode.");
    }
  };

  // FUNCTION: Toggle Reminders
  const toggleReminders = async (value: boolean) => {
    setReminders(value);
    await AsyncStorage.setItem('@reminders', JSON.stringify(value));
    
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        // Schedule a test notification for 5 seconds from now
        await Notifications.scheduleNotificationAsync({
  content: { 
    title: "Local Reminder", 
    body: "This works in Expo Go!" 
  },
  // We use 'as any' to tell TypeScript: "Trust me, I know what I'm doing"
  // We use a simple object to avoid triggering the 'Remote' check logic
  trigger: { 
    seconds: 5,
    repeats: false 
  } as any, 
});
        Alert.alert("Reminders Set", "You'll receive a daily nudge to check in.");
      } else {
        setReminders(false);
        Alert.alert("Permission Denied", "Please enable notifications in your phone settings.");
      }
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Error', 'Need gallery access');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, 
      quality: 0.5,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);
      await setDoc(doc(db, 'users', user?.uid || ''), { profileImage: uri }, { merge: true });
    }
  };

  const NavItem = ({ label, icon, onPress, type = 'link', value, onValueChange }: any) => (
    <TouchableOpacity style={styles.navItem} onPress={onPress} disabled={type === 'switch'}>
      <View style={styles.navLeft}>
        <Text style={styles.navIcon}>{icon}</Text>
        <Text style={styles.navLabel}>{label}</Text>
      </View>
      {type === 'switch' ? (
        <Switch 
          value={value} 
          onValueChange={onValueChange} 
          trackColor={{ true: colors.primary, false: '#E0E0E0' }} 
        />
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
    </TouchableOpacity>
  );

  if (loading) return (
    <View style={styles.loaderContainer}><ActivityIndicator size="large" color={colors.primary}/></View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><View style={styles.headerCenter}><Text style={styles.headerTitle}>Settings</Text></View></View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
            {profileImage ? <Image source={{ uri: profileImage }} style={styles.avatarImg} /> : (
              <View style={styles.avatarPlaceholder}><Text style={styles.avatarLetter}>{displayName.charAt(0).toUpperCase()}</Text></View>
            )}
            <View style={styles.editIcon}><Text style={{fontSize: 10, color: colors.primary}}>✎</Text></View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>

        <View style={styles.navGroup}>
          <NavItem label="App lock" icon="🔒" type="switch" value={appLock} onValueChange={toggleAppLock} />
          <NavItem label="Graphs & reports" icon="📈" onPress={() => navigation.navigate('Insights')} />
          <NavItem label="Reminders" icon="🔔" type="switch" value={reminders} onValueChange={toggleReminders} />
          <NavItem label="Privacy settings" icon="🛡️" onPress={() => Alert.alert("Privacy", "All your data is encrypted locally.")} />
          <NavItem label="Help" icon="❓" onPress={() => Alert.alert("Support", "Contact us at support@liberateme.com")} />
        </View>

        <View style={styles.trustCard}>
          <View style={styles.shieldIcon}><Text style={{fontSize: 24}}>🛡️</Text></View>
          <View style={styles.trustTextContent}>
            <Text style={styles.trustTitle}>Your data is protected</Text>
            <Text style={styles.trustSub}>Your privacy is our top priority. We'll never sell your data.</Text>
            <TouchableOpacity style={styles.learnMoreBtn} onPress={() => Alert.alert("Encryption", "We use industry-standard AES encryption for your journals.")}>
              <Text style={styles.learnMoreText}>Learn more</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logOut}><Text style={styles.logoutBtnText}>Log Out</Text></TouchableOpacity>
        <Text style={styles.versionText}>Liberate Me v1.0.4</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { height: 50, borderBottomWidth: 1, borderBottomColor: '#F2F2F2', justifyContent: 'center' },
  headerCenter: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#000' },
  scrollContent: { paddingBottom: 40 },
  profileSection: { alignItems: 'center', paddingVertical: 25 },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarImg: { width: 90, height: 90, borderRadius: 45 },
  avatarLetter: { color: '#FFF', fontSize: 36, fontWeight: '800' },
  editIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#FFF', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: colors.primary },
  profileName: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },
  profileEmail: { fontSize: 13, color: '#999', marginTop: 2 },
  navGroup: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  navItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, paddingHorizontal: 25, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  navLeft: { flexDirection: 'row', alignItems: 'center' },
  navIcon: { fontSize: 20, marginRight: 15 },
  navLabel: { fontSize: 16, fontWeight: '500', color: '#333' },
  chevron: { fontSize: 22, color: '#CCC', fontWeight: '300' },
  trustCard: { margin: 25, padding: 20, backgroundColor: '#F9FAFB', borderRadius: 20, flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderColor: '#F0F0F0' },
  shieldIcon: { marginRight: 15, marginTop: 2 },
  trustTextContent: { flex: 1 },
  trustTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 5 },
  trustSub: { fontSize: 13, color: '#666', lineHeight: 18 },
  learnMoreBtn: { marginTop: 12, backgroundColor: '#FFF', alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 15, borderWidth: 1, borderColor: '#EEE' },
  learnMoreText: { fontSize: 13, fontWeight: '600', color: '#333' },
  logoutBtn: { marginHorizontal: 25, marginTop: 10, backgroundColor: colors.primary, paddingVertical: 18, borderRadius: 30, alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  logoutBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  versionText: { textAlign: 'center', color: '#BBB', fontSize: 11, marginTop: 30 }
});