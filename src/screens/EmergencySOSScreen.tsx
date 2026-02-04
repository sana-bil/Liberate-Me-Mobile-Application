import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Linking, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const GROUNDING_STEPS = [
  { id: 5, task: "Identify 5 things you SEE", icon: "👁️" },
  { id: 4, task: "Identify 4 things you can TOUCH", icon: "✋" },
  { id: 3, task: "Identify 3 things you HEAR", icon: "👂" },
  { id: 2, task: "Identify 2 things you can SMELL", icon: "👃" },
  { id: 1, task: "Identify 1 thing you can TASTE", icon: "👅" },
];

export default function EmergencySOSScreen({ navigation }: any) {
  const [step, setStep] = useState(0);
  const breathAnim = useRef(new Animated.Value(1)).current;
  const brandPink = colors.primary;

  useEffect(() => {
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1.4,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );
    breathing.start();
    return () => breathing.stop();
  }, []);

  const handleNextStep = () => {
    setStep((prev) => (prev < GROUNDING_STEPS.length - 1 ? prev + 1 : 0));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: brandPink }]}>← Back to Safety</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.mainTitle}>Take a Moment</Text>
        <Text style={styles.subtitle}>You are safe. You are here.</Text>

        {/* SECTION 1: BREATHING ANCHOR (PINK STYLE) */}
        <View style={styles.breathingSection}>
          <Animated.View style={[styles.breathCircle, { transform: [{ scale: breathAnim }], borderColor: brandPink }]}>
            <View style={[styles.innerCircle, { backgroundColor: brandPink }]}>
              <Text style={styles.breathText}>Breathe</Text>
            </View>
          </Animated.View>
        </View>

        {/* SECTION 2: GROUNDING CARDS (MATCHES HOME SCREEN STYLE) */}
        <View style={styles.groundingSection}>
          <TouchableOpacity style={styles.groundingCard} onPress={handleNextStep}>
            <Text style={styles.stepIcon}>{GROUNDING_STEPS[step].icon}</Text>
            <Text style={styles.stepText}>{GROUNDING_STEPS[step].task}</Text>
            <Text style={[styles.tapPrompt, { color: brandPink }]}>Tap to continue →</Text>
          </TouchableOpacity>
        </View>

        {/* SECTION 3: LIFELINES */}
        <View style={styles.lifelineSection}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: brandPink }]} 
            onPress={() => Linking.openURL('tel:988')}
          >
            <Text style={styles.actionBtnText}>CALL CRISIS LINE</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.textBtn} 
            onPress={() => Share.share({ message: "I'm feeling overwhelmed. Could you check in on me?" })}
          >
            <Text style={[styles.textBtnText, { color: brandPink }]}>Text a Trusted Friend</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' }, // BACK TO WHITE
  header: { paddingHorizontal: 10 },
  backBtn: { padding: 20 },
  backText: { fontWeight: '700', fontSize: 16 },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 30, paddingBottom: 30 },
  mainTitle: { fontSize: 28, fontWeight: '700', color: '#1A1A1A', marginTop: 10 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
  breathingSection: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  breathCircle: { 
    width: 160, height: 160, borderRadius: 80, borderWidth: 2, 
    justifyContent: 'center', alignItems: 'center' 
  },
  innerCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', opacity: 0.8 },
  breathText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  groundingSection: { width: '100%', marginBottom: 30 },
  groundingCard: { 
    backgroundColor: '#FDF2F5', // LIGHT PINK LIKE HOME
    padding: 25, borderRadius: 30, alignItems: 'center',
    borderWidth: 1, borderColor: '#FFE4E8'
  },
  stepIcon: { fontSize: 42, marginBottom: 10 },
  stepText: { color: '#1A1A1A', fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  tapPrompt: { fontSize: 13, fontWeight: '600' },
  lifelineSection: { width: '100%', gap: 10 },
  actionBtn: { paddingVertical: 20, borderRadius: 25, alignItems: 'center', elevation: 2 },
  actionBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
  textBtn: { paddingVertical: 15, alignItems: 'center' },
  textBtnText: { fontWeight: '700', fontSize: 15 }
});