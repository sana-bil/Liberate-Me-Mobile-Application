import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, Alert, Modal, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { colors } from '../theme/colors';
import { useAuth } from '../services/AuthContext';
import { db } from '../services/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { format, isAfter, startOfDay } from 'date-fns';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [journalText, setJournalText] = useState('');
  const [allData, setAllData] = useState<any>({});
  const [showMoodModal, setShowMoodModal] = useState(false);

  const isFutureDate = isAfter(startOfDay(new Date(selectedDate)), startOfDay(new Date()));

  const dailyZenContent = [
    { id: '1', title: 'Box Breathing', type: 'EXERCISE', icon: '🌬️', color: '#E3F2FD', duration: '4 min' },
    { id: '2', title: 'I am enough', type: 'AFFIRMATION', icon: '✨', color: '#F3E5F5', duration: 'Daily' },
    { id: '3', title: 'Morning Calm', type: 'MEDITATION', icon: '🧘', color: '#FFF3E0', duration: '10 min' },
    { id: '4', title: 'Focus Music', type: 'AUDIO', icon: '🎧', color: '#E8F5E9', duration: 'Infinity' },
    { id: '5', title: 'Quick Calm', type: 'EMERGENCY', icon: '🆘', color: '#FFEBEE', duration: '1 min' },
  ];

  const moodOptions = [
    { emoji: '☀️', label: 'Great' }, { emoji: '😊', label: 'Good' },
    { emoji: '😐', label: 'Okay' }, { emoji: '😔', label: 'Sad' }, { emoji: '😠', label: 'Angry' }
  ];

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid, 'data', 'logs'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setAllData(data);
        const dayJournals = data[selectedDate]?.journals || [];
        setJournalText(dayJournals.length > 0 ? dayJournals[dayJournals.length - 1].text : '');
      }
    });
    return () => unsub();
  }, [user?.uid, selectedDate]);

  const saveMood = async (emoji: string) => {
    if (!user?.uid) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'data', 'logs'), {
        [selectedDate]: { ...allData[selectedDate], mood: emoji }
      }, { merge: true });
      setShowMoodModal(false);
    } catch (e) { console.error(e); }
  };

  const handleAction = (type: 'mood' | 'journal') => {
    if (isFutureDate) {
      Alert.alert("Locked", "Live in the moment! ✨");
      return;
    }
    if (type === 'mood') setShowMoodModal(true);
    if (type === 'journal') navigation.navigate('JournalDetail', { date: selectedDate });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* PERFECTLY CENTERED HEADER */}
      <View style={styles.header}>
        <View style={styles.headerStatus}>
          <Text style={styles.greetingText}>Hi, {user?.email?.split('@')[0] || 'Soul'}</Text>
          <Text style={styles.statusEmoji}>✨</Text>
        </View>

        <View style={styles.centerTitleWrapper}>
          <Text style={styles.headerTitle}>
            {format(new Date(selectedDate), 'MMMM d')}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.topIcon}
          onPress={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
        >
          <Text style={{ fontSize: 18 }}>📅</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={styles.calendarCard}>
          <View style={styles.calendarInner}>
            <Calendar
              current={selectedDate}
              onDayPress={(day: any) => setSelectedDate(day.dateString)}
              dayComponent={({ date, state }: any) => {
                const dayMood = allData[date?.dateString]?.mood;
                const isSelected = selectedDate === date?.dateString;
                return (
                  <TouchableOpacity onPress={() => setSelectedDate(date.dateString)} style={[styles.customDay, isSelected && styles.selectedDay]}>
                    <Text style={[styles.dayText, state === 'disabled' && { color: '#ccc' }]}>{date.day}</Text>
                    {dayMood ? <Text style={styles.calendarEmoji}>{dayMood}</Text> : <View style={{ height: 12 }} />}
                  </TouchableOpacity>
                );
              }}
              theme={{ calendarBackground: '#FFF', textMonthFontSize: 16 }}
            />
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Daily Insights</Text>
          <View style={styles.insightsRow}>
            <TouchableOpacity style={[styles.moodBox, isFutureDate && styles.lockedBox]} onPress={() => handleAction('mood')}>
              <Text style={styles.boxEmoji}>{allData[selectedDate]?.mood || (isFutureDate ? '🔒' : '＋')}</Text>
              <Text style={styles.boxLabel}>Log Mood</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.journalBox, isFutureDate && styles.lockedBox]} onPress={() => handleAction('journal')}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.boxLabel}>Journal {isFutureDate && '🔒'}</Text>
                {!isFutureDate && <Text style={{ fontSize: 12, color: colors.primary }}>View All ↗</Text>}
              </View>
              <Text numberOfLines={3} style={[styles.journalPlaceholder, journalText ? { color: '#333' } : { color: '#AAA' }]}>
                {journalText || (isFutureDate ? "Available on this date" : "How was your day? Tap to write...")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Daily Zen</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 15 }}>
            {dailyZenContent.map((item) => (
              <TouchableOpacity key={item.id} style={[styles.zenCard, { backgroundColor: item.color }]}
                onPress={() => {
                  if (item.title === 'Box Breathing') navigation.navigate('Breathing');
                  if (item.type === 'AFFIRMATION') navigation.navigate('Affirmation');
                  if (item.title === 'Morning Calm') navigation.navigate('Meditation');
                  if (item.title === 'Focus Music') navigation.navigate('Focus');
                  if (item.title === 'Quick Calm') navigation.navigate('EmergencySOS');
                }}
              >
                <View style={styles.zenHeader}>
                  <Text style={styles.zenType}>{item.type}</Text>
                  <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                </View>
                <View>
                  <Text style={styles.zenTitle}>{item.title}</Text>
                  <Text style={styles.zenDuration}>{item.duration}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* TAB BAR WITH SETTINGS */}
      <View style={styles.tabBar}>
        <TabItem icon="🏠" label="Home" active onPress={() => { }} />
        <TabItem icon="💭" label="Echo" onPress={() => navigation.navigate('Echo')} />
        <TabItem icon="📊" label="Insights" onPress={() => navigation.navigate('Insights')} />
        <TabItem icon="⚙️" label="Settings" onPress={() => navigation.navigate('Settings')} />
      </View>

      <Modal visible={showMoodModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Today's Spectrum</Text>
            <View style={styles.emojiRow}>
              {moodOptions.map(m => (
                <TouchableOpacity key={m.label} onPress={() => saveMood(m.emoji)} style={styles.moodBtn}>
                  <Text style={styles.bigEmoji}>{m.emoji}</Text>
                  <Text style={styles.moodLabel}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => setShowMoodModal(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const TabItem = ({ icon, label, active, onPress }: any) => (
  <TouchableOpacity style={styles.tabButton} onPress={onPress} activeOpacity={0.7}>
    <Text style={{ fontSize: 22, opacity: active ? 1 : 0.3 }}>{icon}</Text>
    <Text style={[styles.tabLabel, active && { color: colors.primary, opacity: 1 }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    height: 60
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF2F5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20
  },
  greetingText: { fontWeight: '700', fontSize: 12, color: colors.primary, marginRight: 4 },
  statusEmoji: { fontSize: 14 },
  centerTitleWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: -1,
  },
  headerTitle: { fontWeight: '700', fontSize: 18, color: '#1A1A1A' },
  topIcon: { padding: 10, borderRadius: 15, backgroundColor: '#F8F9FA' },
  // "In a title [tile] whose color is faded"
  calendarCard: {
    backgroundColor: '#FDF2F5', // Faded Pink (color of the "title"/status)
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 15,
    borderWidth: 1,
    borderColor: '#FFE4E8' // Matching border for the faded tile
  },
  calendarInner: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    overflow: 'hidden',
    padding: 5 // Optional: internal padding for spacing
  },
  customDay: { alignItems: 'center', justifyContent: 'center', width: 35, height: 42, borderRadius: 10 },
  selectedDay: { backgroundColor: '#F0F7FF' },
  dayText: { fontWeight: '600', fontSize: 13 },
  calendarEmoji: { fontSize: 12, marginTop: 2 },
  sectionContainer: { marginTop: 25, paddingHorizontal: 20 },
  sectionTitle: { fontWeight: '700', fontSize: 20, color: '#1A1A1A' },
  insightsRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  moodBox: { width: 100, height: 140, backgroundColor: '#FDF2F5', borderRadius: 25, padding: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFE4E8' },
  lockedBox: { opacity: 0.5, backgroundColor: '#F5F5F5', borderColor: '#EEE' },
  boxEmoji: { fontSize: 32, marginBottom: 5 },
  boxLabel: { fontWeight: '700', fontSize: 12, color: '#333' },
  journalBox: { flex: 1, height: 140, backgroundColor: '#F8F9FA', borderRadius: 25, padding: 15, borderWidth: 1, borderColor: '#EEE' },
  journalPlaceholder: { fontSize: 13, marginTop: 8, lineHeight: 18 },
  zenCard: { width: 160, height: 160, borderRadius: 30, padding: 20, marginRight: 15, justifyContent: 'space-between' },
  zenHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  zenType: { fontWeight: '700', fontSize: 10, color: '#666', opacity: 0.6 },
  zenTitle: { fontWeight: '700', fontSize: 16, color: '#222' },
  zenDuration: { fontSize: 11, color: '#666', marginTop: 2 },
  tabBar: { position: 'absolute', bottom: 0, width: '100%', height: 90, backgroundColor: '#FFF', flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingBottom: 15 },
  tabButton: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 11, fontWeight: '600', color: '#333', marginTop: 4, opacity: 0.4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 30, alignItems: 'center' },
  modalHandle: { width: 40, height: 5, backgroundColor: '#EEE', borderRadius: 10, marginBottom: 20 },
  modalTitle: { fontWeight: '700', fontSize: 22, marginBottom: 30 },
  emojiRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 30 },
  moodBtn: { alignItems: 'center', flex: 1 },
  bigEmoji: { fontSize: 38 },
  moodLabel: { fontWeight: '600', fontSize: 11, marginTop: 8, color: '#666' },
  cancelBtn: { padding: 10 },
  cancelText: { color: colors.primary, fontWeight: '700' }
});