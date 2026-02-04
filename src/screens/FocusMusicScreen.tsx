import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { colors } from '../theme/colors';

// 1. IMPORT LOCAL ASSETS (Filenames matched to: forest.mp3 and rain.mp3)
const forestSound = require('../../assets/sounds/AmbienceofBrecklandForest15.mp3');
const rainSound = require('../../assets/sounds/Relaxing Rain and Loud Thunder (Free Field Recording of Nature Sounds for Sleep or Meditation Mp3).mp3');

const SOUNDS = [
  { id: '1', name: 'Heavy Rainfall', source: rainSound, icon: '🌧️' },
  { id: '2', name: 'Forest Birds', source: forestSound, icon: '🌲' },
];

export default function FocusMusicScreen({ navigation }: any) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeId, setActiveId] = useState('1'); 
  const [loading, setLoading] = useState(false);
  const brandPink = colors.primary;

  useEffect(() => {
    // FORCE AUDIO CONFIGURATION
    async function initAudio() {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true, // Forces sound even if mute switch is ON
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false, // Forces speaker, not earpiece
        });
      } catch (e) {
        console.log("Audio Config Error:", e);
      }
    }
    initAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  async function handleSoundSelect(item: typeof SOUNDS[0]) {
    try {
      setLoading(true);
      setActiveId(item.id);

      // Clean up old sound
      if (sound) {
        await sound.unloadAsync();
      }

      console.log("Loading sound:", item.name);
      const { sound: newSound } = await Audio.Sound.createAsync(
        item.source,
        { shouldPlay: true, isLooping: true, volume: 1.0 },
        (status) => {
           if (status.isLoaded) setIsPlaying(status.isPlaying);
        }
      );

      setSound(newSound);
      setIsPlaying(true);
      setLoading(false);
    } catch (error) {
      console.log("Playback Error:", error);
      setLoading(false);
    }
  }

  const togglePlay = async () => {
    if (!sound) {
      const current = SOUNDS.find(s => s.id === activeId);
      if (current) handleSoundSelect(current);
      return;
    }

    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        onPress={async () => {
          if (sound) await sound.stopAsync();
          navigation.goBack();
        }} 
        style={styles.backBtn}
      >
        <Text style={[styles.backText, { color: brandPink }]}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.header}>Focus Environment</Text>
        <Text style={styles.subtitle}>Pure nature backgrounds</Text>
        
        <View style={styles.mainDisplay}>
          <View style={[styles.iconCircle, { borderColor: brandPink }]}>
            {loading ? (
                <ActivityIndicator size="large" color={brandPink} />
            ) : (
                <Text style={{ fontSize: 80 }}>
                    {SOUNDS.find(s => s.id === activeId)?.icon}
                </Text>
            )}
          </View>
          <Text style={styles.activeTitle}>
            {SOUNDS.find(s => s.id === activeId)?.name}
          </Text>
        </View>

        <TouchableOpacity 
            style={[styles.playBtn, { backgroundColor: brandPink, opacity: loading ? 0.6 : 1 }]} 
            onPress={togglePlay}
            disabled={loading}
        >
          <Text style={styles.playBtnText}>{isPlaying ? 'PAUSE' : 'START FOCUS'}</Text>
        </TouchableOpacity>

        <View style={styles.listContainer}>
          {SOUNDS.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              onPress={() => handleSoundSelect(item)}
              style={[
                styles.soundCard, 
                activeId === item.id && { borderColor: brandPink, backgroundColor: '#FDF2F5', borderWidth: 2 }
              ]}
            >
              <Text style={styles.itemIcon}>{item.icon}</Text>
              <Text style={[styles.itemText, activeId === item.id && { color: brandPink, fontWeight: '700' }]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  backBtn: { padding: 25 },
  backText: { fontWeight: '700', fontSize: 16 },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 30 },
  header: { fontSize: 28, fontWeight: '700', color: '#1A1A1A' },
  subtitle: { fontSize: 14, color: '#AAA', marginBottom: 30 },
  mainDisplay: { alignItems: 'center', marginBottom: 30 },
  iconCircle: { width: 170, height: 170, borderRadius: 85, borderWidth: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FDF2F5', marginBottom: 20 },
  activeTitle: { fontSize: 22, fontWeight: '700', color: '#1A1A1A' },
  playBtn: { paddingHorizontal: 60, paddingVertical: 18, borderRadius: 35, elevation: 4, marginBottom: 40 },
  playBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  listContainer: { width: '100%' },
  soundCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#EEE' },
  itemIcon: { fontSize: 24, marginRight: 15 },
  itemText: { fontSize: 16, color: '#444' }
});