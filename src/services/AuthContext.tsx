import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  User
} from 'firebase/auth';
import { auth } from './firebase';
import { Alert } from 'react-native';
import { updateProfile } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  resendVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);


export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Send verification email
    await sendEmailVerification(userCredential.user, {
      url: 'https://liberate-me-55fd9.firebaseapp.com',
      handleCodeInApp: false,
    });
    
    Alert.alert(
      '✅ Account Created!',
      `We've sent a verification email to ${email}.\n\n⚠️ Check your SPAM/JUNK folder if you don't see it!\n\nVerify your email before signing in.`,
      [{ text: 'Got It!' }]
    );
    
    // Sign out user until they verify
    await signOut(auth);
  };

  const signIn = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if email is verified
    if (!userCredential.user.emailVerified) {
      await signOut(auth);
      throw new Error('Please verify your email before signing in. Check your inbox and spam folder!');
    }
  };

  const logOut = async () => {
    await signOut(auth);
  };

  const resendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      Alert.alert('Verification Email Sent', 'Check your inbox and spam folder!');
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    logOut,
    resendVerification,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}