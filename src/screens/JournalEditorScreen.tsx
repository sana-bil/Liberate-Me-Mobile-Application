import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../services/AuthContext';
import { colors } from '../theme/colors';

export default function JournalEditorScreen({ route, navigation }: any) {
  const { date, index, existingText } = route.params; // index is passed only when editing
  const { user } = useAuth();
  const [text, setText] = useState(existingText || '');
  const [saving, setSaving] = useState(false);

  const saveEntry = async () => {
    if (!user?.uid) return; // TypeScript Fix
    if (!text.trim()) {
      Alert.alert("Empty Entry", "Please write something before saving.");
      return;
    }

    setSaving(true);
    try {
      const docRef = doc(db, 'users', user.uid, 'data', 'logs');
      const docSnap = await getDoc(docRef);
      
      // Get existing data or start fresh
      let dayData = docSnap.exists() ? docSnap.data()[date] || {} : {};
      let journals = dayData.journals || [];

      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (index !== undefined) {
        // UPDATE: Replace the text at the specific index
        journals[index] = { ...journals[index], text: text };
      } else {
        // CREATE: Add a new object to the array
        journals.push({ 
          text: text, 
          time: timestamp,
          id: Math.random().toString(36).substring(7) 
        });
      }

      await setDoc(docRef, {
        [date]: { ...dayData, journals: journals }
      }, { merge: true });

      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not save your journal.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelBtn}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={saveEntry} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.doneBtn}>Done</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{index !== undefined ? "Edit Reflection" : "New Reflection"}</Text>
          <TextInput
            multiline
            autoFocus
            placeholder="What's on your mind?"
            placeholderTextColor="#AAA"
            style={styles.input}
            value={text}
            onChangeText={setText}
            selectionColor={colors.primary}
          />
        </View>
      </KeyboardAvoidingView>
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
    paddingVertical: 15 
  },
  cancelBtn: { fontFamily: 'Raleway_600SemiBold', color: '#999', fontSize: 16 },
  doneBtn: { fontFamily: 'Raleway_700Bold', color: colors.primary, fontSize: 16 },
  inputContainer: { paddingHorizontal: 25, flex: 1 },
  label: { 
    fontFamily: 'Raleway_700Bold', 
    fontSize: 24, 
    color: '#1A1A1A', 
    marginBottom: 20 
  },
  input: { 
    fontFamily: 'Raleway_400Regular', 
    fontSize: 18, 
    color: '#333', 
    lineHeight: 26,
    flex: 1, 
    textAlignVertical: 'top' 
  },
});