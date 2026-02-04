import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av'; // Using AV for stability in this SDK
import * as Speech from 'expo-speech';
import { colors } from '../theme/colors';

export default function MeditationScreen({ navigation }: any) {
  const brandPink = colors.primary;
  
  const [secondsLeft, setSecondsLeft] = useState(600); 
  const [isActive, setIsActive] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // 1. Setup Audio with a RELIABLE link
  useEffect(() => {
    async function loadOceanWaves() {
      try {
        console.log("Attempting to load verified audio...");
        // This is a more stable nature sound link
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'https://cdn.pixabay.com/audio/2022/03/09/audio_c8c8a73456.mp3' }, // Forest/Nature Sounds
          { shouldPlay: false, isLooping: true, volume: 0.3 }
        );
        setSound(sound);
        console.log("✅ Audio Ready");
      } catch (e) {
        console.log("❌ Audio failed, but session will continue with voice only.");
      }
    }
    loadOceanWaves();

    return () => {
      sound?.unloadAsync();
      Speech.stop();
    };
  }, []);

  // 2. Timer & Guidance
  useEffect(() => {
    let interval: any = null;

    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          const nextValue = prev - 1;
          
          // Guidance triggers
          if (nextValue === 598) Speech.speak("Welcome. Breathe in deeply.", { rate: 0.8 });
          if (nextValue === 580) Speech.speak("Exhale slowly. Let your body relax.", { rate: 0.8 });
          
          return nextValue;
        });
      }, 1000);

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 2500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 2500, useNativeDriver: true })
        ])
      ).start();

    } else {
      clearInterval(interval);
      pulseAnim.stopAnimation();
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const toggleSession = async () => {
    setIsActive(!isActive); // Start timer immediately regardless of audio status
    
    if (sound) {
      if (!isActive) {
        await sound.playAsync().catch(e => console.log("Play error", e));
      } else {
        await sound.pauseAsync().catch(e => console.log("Pause error", e));
        Speech.stop();
      }
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => { Speech.stop(); navigation.goBack(); }} style={styles.backBtn}>
        <Text style={[styles.backText, { color: brandPink }]}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Guided Calm</Text>
        <Text style={styles.subtitle}>Nature Sounds • 10:00</Text>

        <View style={styles.timerWrapper}>
          <Animated.View style={[
            styles.pulseRing, 
            { borderColor: brandPink, transform: [{ scale: pulseAnim }], opacity: isActive ? 0.3 : 0.1 }
          ]} />
          <View style={[styles.centerCircle, { backgroundColor: '#FDF2F5' }]}>
            <Text style={styles.timerNum}>{formatTime(secondsLeft)}</Text>
            <Text style={{ fontSize: 45, marginTop: 10 }}>🧘‍♂️</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.playBtn, { backgroundColor: brandPink }]} 
          onPress={toggleSession}
        >
          <Text style={styles.playBtnText}>{isActive ? 'PAUSE' : 'BEGIN SESSION'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  backBtn: { padding: 25 },
  backText: { fontFamily: 'Raleway_700Bold', fontSize: 16 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'Raleway_700Bold', fontSize: 28, color: '#1A1A1A' },
  subtitle: { fontFamily: 'Raleway_400Regular', fontSize: 14, color: '#AAA', marginBottom: 40 },
  timerWrapper: { width: 300, height: 300, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  pulseRing: { position: 'absolute', width: 260, height: 260, borderRadius: 130, borderWidth: 3 },
  centerCircle: { width: 200, height: 200, borderRadius: 100, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  timerNum: { fontFamily: 'Raleway_700Bold', fontSize: 48, color: '#1A1A1A' },
  playBtn: { paddingHorizontal: 50, paddingVertical: 18, borderRadius: 35, elevation: 5 },
  playBtnText: { color: '#FFF', fontFamily: 'Raleway_700Bold', fontSize: 16, letterSpacing: 1.5 }
});