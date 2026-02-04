import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  ActivityIndicator, Share, Animated 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

// Local backup list so the app never "breaks" when API limits are hit
const backupAffirmations = [
  { text: "I am exactly where I need to be.", author: "Self" },
  { text: "My peace is my power.", author: "Self" },
  { text: "I choose to be kind to myself today.", author: "Self" },
  { text: "I am worthy of all the good things coming my way.", author: "Self" },
  { text: "I breathe in calm, I breathe out stress.", author: "Self" },
  { text: "Every day is a fresh start.", author: "Self" },
  { text: "I have the power to create change.", author: "Self" },
  { text: "I trust the timing of my life.", author: "Self" }
];

export default function AffirmationScreen({ navigation }: any) {
  const [quote, setQuote] = useState({ text: '', author: '' });
  const [loading, setLoading] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const brandPink = colors.primary;

  const fetchAffirmation = async () => {
    setLoading(true);
    fadeAnim.setValue(0);
    
    try {
      const response = await fetch('https://zenquotes.io/api/random');
      const data = await response.json();
      
      // Check if API sent a 'Too many requests' message
      if (data[0] && data[0].q && data[0].q.includes("Too many requests")) {
        throw new Error("API Limit");
      }

      setQuote({ text: data[0].q, author: data[0].a });
    } catch (error) {
      // Fallback to local list if API fails or throttles
      const randomBackup = backupAffirmations[Math.floor(Math.random() * backupAffirmations.length)];
      setQuote(randomBackup);
    } finally {
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  };

  useEffect(() => {
    fetchAffirmation();
  }, []);

  const onShare = async () => {
    try {
      await Share.share({
        message: `"${quote.text}" - ${quote.author} | Found on Liberate Me ✨`,
      });
    } catch (error) { console.error(error); }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backText, { color: brandPink }]}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onShare}>
          <Text style={[styles.shareText, { color: brandPink }]}>Share ✨</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Today's Intention</Text>
        
        {/* MAIN CARD */}
        <View style={styles.quoteCard}>
          {loading ? (
            <ActivityIndicator size="large" color={brandPink} />
          ) : (
            <Animated.View style={{ opacity: fadeAnim }}>
              <Text style={styles.quoteText}>"{quote.text}"</Text>
              <Text style={[styles.authorText, { color: brandPink }]}>— {quote.author}</Text>
            </Animated.View>
          )}
        </View>

        {/* REFRESH BUTTON */}
        <TouchableOpacity 
          style={[styles.refreshBtn, { backgroundColor: brandPink }]} 
          onPress={fetchAffirmation}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.refreshText}>New Affirmation</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.footerNote}>Repeat this to yourself 3 times slowly.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  backText: { fontFamily: 'Raleway_700Bold', fontSize: 16 },
  shareText: { fontFamily: 'Raleway_700Bold', fontSize: 16 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30, marginBottom: 50 },
  label: { 
    fontFamily: 'Raleway_700Bold', 
    fontSize: 14, 
    color: '#AAA', 
    letterSpacing: 2, 
    marginBottom: 20, 
    textTransform: 'uppercase' 
  },
  quoteCard: { 
    width: '100%', 
    minHeight: 280, 
    backgroundColor: '#FDF2F5', // Soft Pink Background
    borderRadius: 40, 
    padding: 35, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE4E8',
    // Shadow for depth
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2
  },
  quoteText: { 
    fontFamily: 'Raleway_700Bold', 
    fontSize: 26, 
    color: '#1A1A1A', 
    textAlign: 'center', 
    lineHeight: 36 
  },
  authorText: { 
    fontFamily: 'Raleway_600SemiBold', 
    fontSize: 16, 
    marginTop: 25, 
    textAlign: 'center',
    fontStyle: 'italic'
  },
  refreshBtn: { 
    marginTop: 40, 
    paddingHorizontal: 45, 
    paddingVertical: 18, 
    borderRadius: 35,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4
  },
  refreshText: { fontFamily: 'Raleway_700Bold', fontSize: 17, color: '#FFF' },
  footerNote: { 
    textAlign: 'center', 
    fontFamily: 'Raleway_400Regular', 
    color: '#CCC', 
    marginBottom: 30,
    fontSize: 13 
  }
});