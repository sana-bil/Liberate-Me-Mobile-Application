import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/services/AuthContext';

// Screens - Authentication
import WelcomeScreen from './src/screens/WelcomeScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import SignInScreen from './src/screens/SignInScreen';

// Screens - Main Application
import HomeScreen from './src/screens/HomeScreen';
import JournalDetailScreen from './src/screens/JournalDetailScreen';
import JournalEditorScreen from './src/screens/JournalEditorScreen';
import BreathingScreen from './src/screens/BreathingScreen';
import AffirmationScreen from './src/screens/AffirmationScreen';
import MeditationScreen from './src/screens/MeditationScreen';
import FocusMusicScreen from './src/screens/FocusMusicScreen';
import EmergencySOSScreen from './src/screens/EmergencySOSScreen';
import EchoScreen from './src/screens/EchoScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import InsightsScreen from './src/screens/InsightsScreen';

const Stack = createNativeStackNavigator();

/**
 * AuthStack: Handles Login, Sign Up, and Welcome flow.
 */
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
    </Stack.Navigator>
  );
}

/**
 * AppStack: The main authenticated area of the app.
 * Using 'fade' for EmergencySOS to provide a calming transition.
 */
function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="JournalDetail" component={JournalDetailScreen} />
      <Stack.Screen name="JournalEditor" component={JournalEditorScreen} />
      <Stack.Screen name="Breathing" component={BreathingScreen} />
      <Stack.Screen name="Affirmation" component={AffirmationScreen} />
      <Stack.Screen name="Meditation" component={MeditationScreen} />
      <Stack.Screen name="Focus" component={FocusMusicScreen} />
      <Stack.Screen 
        name="EmergencySOS" 
        component={EmergencySOSScreen} 
        options={{ animation: 'fade' }} 
      />
      <Stack.Screen name="Echo" component={EchoScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Insights" component={InsightsScreen} />
    </Stack.Navigator>
    
  );
}

/**
 * RootNavigator: Swaps between stacks based on Firebase user state.
 */
function RootNavigator() {
  const { user } = useAuth();
  
  // If user is logged in, show AppStack; otherwise, show AuthStack.
  return user ? <AppStack /> : <AuthStack />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}