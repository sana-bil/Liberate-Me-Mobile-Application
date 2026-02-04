import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../services/firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../services/AuthContext';
import { format } from 'date-fns';
import { colors } from '../theme/colors';

export default function JournalListScreen({ route, navigation }: any) {
  const { date } = route.params;
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // REAL-TIME LISTENER
  useEffect(() => {
    if (!user?.uid) return; // FIXES: 'user' is possibly 'null'

    const unsub = onSnapshot(doc(db, 'users', user.uid, 'data', 'logs'), (snapshot) => {
      if (snapshot.exists()) {
        const dayData = snapshot.data()[date];
        // Sort entries by time (newest at top)
        const journalArray = dayData?.journals || [];
        setEntries(journalArray);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [date, user?.uid]);

  const deleteEntry = async (index: number) => {
    if (!user?.uid) return;

    Alert.alert("Delete Entry", "Are you sure you want to remove this reflection?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          const updated = [...entries];
          updated.splice(index, 1);
          await setDoc(doc(db, 'users', user.uid, 'data', 'logs'), {
            [date]: { journals: updated }
          }, { merge: true });
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerDate}>{format(new Date(date), 'MMMM d, yyyy')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Reflections</Text>
        
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 50 }} />
        ) : entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>✍️</Text>
            <Text style={styles.emptyText}>No entries for this day yet.</Text>
          </View>
        ) : (
          entries.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.entryCard}
              onPress={() => navigation.navigate('JournalEditor', { date, index, existingText: item.text })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.timeLabel}>{item.time}</Text>
                <TouchableOpacity onPress={() => deleteEntry(index)} hitSlop={10}>
                  <Text style={styles.deleteLink}>Delete</Text>
                </TouchableOpacity>
              </View>
              <Text numberOfLines={4} style={styles.entryText}>{item.text}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* FLOATING ACTION BUTTON */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('JournalEditor', { date })}
      >
        <Text style={styles.fabText}>+ New Entry</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5'
  },
  backBtn: { padding: 5 },
  backBtnText: { color: colors.primary, fontFamily: 'Raleway_700Bold', fontSize: 16 },
  headerDate: { fontFamily: 'Raleway_600SemiBold', fontSize: 14, color: '#666' },
  scrollContent: { padding: 25, paddingBottom: 100 },
  pageTitle: { fontFamily: 'Raleway_700Bold', fontSize: 32, color: '#1A1A1A', marginBottom: 25 },
  entryCard: { 
    backgroundColor: '#FAFAFA', 
    borderRadius: 25, 
    padding: 20, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#EEE',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  timeLabel: { fontSize: 12, color: colors.primary, fontFamily: 'Raleway_700Bold' },
  deleteLink: { fontSize: 12, color: '#FF4B7D', fontFamily: 'Raleway_600SemiBold' },
  entryText: { fontFamily: 'Raleway_400Regular', fontSize: 16, color: '#444', lineHeight: 22 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyEmoji: { fontSize: 50, marginBottom: 10 },
  emptyText: { fontFamily: 'Raleway_400Regular', color: '#AAA', fontSize: 16 },
  fab: { 
    position: 'absolute', 
    bottom: 30, 
    alignSelf: 'center',
    backgroundColor: colors.primary, 
    paddingHorizontal: 40, 
    paddingVertical: 15, 
    borderRadius: 30,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  fabText: { color: '#FFF', fontFamily: 'Raleway_700Bold', fontSize: 16 }
});