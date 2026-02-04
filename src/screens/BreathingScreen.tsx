import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Animated, Easing 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { colors } from '../theme/colors';

export default function BreathingScreen({ navigation }: any) {
  const [phase, setPhase] = useState('Get Ready');
  const [counter, setCounter] = useState(4);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const scaleValue = useRef(new Animated.Value(1)).current;

  // Use your theme primary pink for consistency
  const brandPink = colors.primary; 

  const phases = [
    { name: 'Inhale', color: '#FDF2F5' },
    { name: 'Hold', color: '#FFF' },
    { name: 'Exhale', color: '#FDF2F5' },
    { name: 'Hold', color: '#FFF' }
  ];

  const speak = (text: string) => {
    Speech.speak(text, {
      rate: 0.85,
      pitch: 1.0,
      language: 'en-US'
    });
  };

  useEffect(() => {
    let interval: any;
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setCounter((prev) => {
          if (prev === 1) {
            const currentIndex = phases.findIndex(p => p.name === phase);
            const nextIndex = (currentIndex + 1) % phases.length;
            const nextPhase = phases[nextIndex].name;
            
            setPhase(nextPhase);
            speak(nextPhase);

            Animated.timing(scaleValue, {
              toValue: nextPhase === 'Inhale' ? 1.5 : 1,
              duration: 4000,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }).start();

            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
      Speech.stop();
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused, phase]);

  const startBreathing = () => {
    setIsActive(true);
    setIsPaused(false);
    setPhase('Inhale');
    setCounter(4);
    speak('Inhale');
    Animated.timing(scaleValue, {
      toValue: 1.5,
      duration: 4000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      scaleValue.stopAnimation();
    } else {
      Animated.timing(scaleValue, {
        toValue: phase === 'Inhale' ? 1.5 : 1,
        duration: counter * 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* CLOSE BUTTON - NOW USING BRAND PINK */}
      <TouchableOpacity 
        style={styles.closeBtn} 
        onPress={() => { Speech.stop(); navigation.goBack(); }}
      >
        <Text style={[styles.closeText, { color: brandPink }]}>✕ Close</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* ANIMATED CIRCLE */}
        <Animated.View style={[
          styles.circle, 
          { 
            transform: [{ scale: scaleValue }], 
            opacity: isPaused ? 0.6 : 1,
            borderColor: brandPink 
          }
        ]}>
          <Text style={[styles.phaseText, { color: brandPink }]}>{isPaused ? 'Paused' : phase}</Text>
          {!isPaused && <Text style={[styles.counterText, { color: brandPink }]}>{counter}</Text>}
        </Animated.View>

        <View style={styles.textContainer}>
          <Text style={styles.instruction}>
            {isActive ? "Let the breath flow" : "Box Breathing"}
          </Text>
          <Text style={styles.subText}>4s Inhale • 4s Hold • 4s Exhale • 4s Hold</Text>
        </View>

        <View style={styles.controlsRow}>
          {!isActive ? (
            <TouchableOpacity 
                style={[styles.mainBtn, { backgroundColor: brandPink }]} 
                onPress={startBreathing}
            >
              <Text style={styles.mainBtnText}>Begin Session</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
                style={[styles.mainBtn, { backgroundColor: isPaused ? '#A5D6A7' : '#FFD54F' }]} 
                onPress={togglePause}
            >
              <Text style={styles.mainBtnText}>{isPaused ? 'Resume' : 'Pause'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  closeBtn: { padding: 25, alignSelf: 'flex-end' },
  closeText: { fontFamily: 'Raleway_700Bold', fontSize: 16 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  circle: { 
    width: 200, 
    height: 200, 
    borderRadius: 100, 
    backgroundColor: '#FFF', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 60, 
    borderWidth: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3
  },
  phaseText: { fontFamily: 'Raleway_700Bold', fontSize: 26, marginBottom: 5 },
  counterText: { fontFamily: 'Raleway_700Bold', fontSize: 52 },
  textContainer: { alignItems: 'center', marginBottom: 50 },
  instruction: { fontFamily: 'Raleway_700Bold', fontSize: 20, color: '#1A1A1A' },
  subText: { fontFamily: 'Raleway_400Regular', fontSize: 14, color: '#AAA', marginTop: 10 },
  controlsRow: { flexDirection: 'row' },
  mainBtn: { 
    paddingHorizontal: 60, 
    paddingVertical: 20, 
    borderRadius: 40, 
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  mainBtnText: { color: '#FFF', fontFamily: 'Raleway_700Bold', fontSize: 18 }
});