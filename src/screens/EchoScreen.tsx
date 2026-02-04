import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  FlatList, KeyboardAvoidingView, Platform, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { getEchoResponse } from '../services/gemini';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../services/AuthContext'; // CRITICAL: Need this for user.uid

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'echo';
  timestamp: Date;
}

export default function EchoScreen({ navigation }: any) {
  const { user } = useAuth(); // Get the logged-in user
  const brandPink = colors.primary;
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm Echo. How are you today?",
      sender: 'echo',
      timestamp: new Date(),
    }
  ]);
  
  const flatListRef = useRef<FlatList>(null);

  // 1. LOAD CHAT FROM PHONE
  useEffect(() => {
    const loadChat = async () => {
      if (!user?.uid) return; // Wait until user is defined
      try {
        const savedChat = await AsyncStorage.getItem(`@echo_messages_${user.uid}`);
        if (savedChat !== null) {
          const parsed = JSON.parse(savedChat);
          setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
        } else {
          // Reset to default greeting if no history exists for this specific UID
          setMessages([{
            id: '1',
            text: "Hi! I'm Echo. How are you today?",
            sender: 'echo',
            timestamp: new Date(),
          }]);
        }
      } catch (e) { console.error("Load Error", e); }
    };
    loadChat();
  }, [user?.uid]); // Update when user changes

  // 2. SAVE CHAT TO PHONE
  useEffect(() => {
    if (user?.uid) {
      AsyncStorage.setItem(`@echo_messages_${user.uid}`, JSON.stringify(messages));
    }
  }, [messages, user?.uid]);

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const currentInput = inputText;
    const userMsg: Message = { 
      id: Date.now().toString(), 
      text: currentInput, 
      sender: 'user', 
      timestamp: new Date() 
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // --- SAVE TO FIREBASE FOR YOUR ANALYSIS ---
    if (user?.uid) {
      try {
        await addDoc(collection(db, 'users', user.uid, 'echo_history'), {
          text: currentInput,
          sender: 'user',
          timestamp: serverTimestamp(),
          dateStr: new Date().toISOString().split('T')[0]
        });
      } catch (e) {
        console.error("Firebase Sync Error:", e);
      }
    }

    // --- GET AI RESPONSE ---
    const history = messages
      .filter(m => m.id !== '1' && m.id !== 'reset') 
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

    try {
      const aiResponse = await getEchoResponse(currentInput, history);
      const echoMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'echo',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, echoMsg]);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    Alert.alert("Reset Chat?", "Ready for a fresh start? ❤", [
      { text: "Cancel" },
      { text: "Reset", onPress: async () => {
          setMessages([{ id: 'reset', text: "The slate is clean.", sender: 'echo', timestamp: new Date() }]);
          if (user?.uid) {
            await AsyncStorage.removeItem(`@echo_messages_${user.uid}`);
          }
      }}
    ]);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageRow, item.sender === 'user' ? styles.userRow : styles.echoRow]}>
      <View style={[styles.bubble, item.sender === 'user' ? [styles.userBubble, { backgroundColor: brandPink }] : styles.echoBubble]}>
        <Text style={[styles.messageText, item.sender === 'user' ? styles.userText : styles.echoText]}>
          {item.text}{item.sender === 'echo' && <Text style={{ color: brandPink }}> ❤</Text>}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{ color: brandPink, fontWeight: '700' }}>← Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Echo AI</Text>
        <TouchableOpacity onPress={handleClearChat}><Text style={styles.clearText}>Clear</Text></TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        
        {isTyping && <View style={styles.typingContainer}><Text style={styles.typingText}>Echo is typing...</Text></View>}

        <View style={styles.inputArea}>
          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.input} 
              placeholder="Message..." 
              value={inputText} 
              onChangeText={setInputText} 
              multiline 
              onFocus={() => setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200)}
            />
            <TouchableOpacity style={[styles.sendBtn, { backgroundColor: brandPink }]} onPress={sendMessage}>
              <Text style={styles.sendBtnText}>↑</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  clearText: { color: '#BBB', fontSize: 13 },
  listContent: { padding: 20 },
  messageRow: { marginBottom: 15, flexDirection: 'row' },
  userRow: { justifyContent: 'flex-end' },
  echoRow: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', padding: 15, borderRadius: 20 },
  userBubble: { borderBottomRightRadius: 4 },
  echoBubble: { backgroundColor: '#F2F2F7', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 16, lineHeight: 22 },
  userText: { color: '#FFF' },
  echoText: { color: '#1C1C1E' },
  typingContainer: { paddingHorizontal: 25, paddingBottom: 10 },
  typingText: { fontSize: 12, color: '#AAA', fontStyle: 'italic' },
  inputArea: { padding: 15, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#F8F9FA', borderRadius: 25, padding: 5 },
  input: { flex: 1, paddingHorizontal: 15, paddingVertical: 10, fontSize: 16, maxHeight: 100 },
  sendBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  sendBtnText: { color: '#FFF', fontSize: 20, fontWeight: '700' }
});