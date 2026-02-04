# Liberate Me - Mental Wellness Mobile App

A comprehensive mental health and wellness mobile application built with React Native and Expo, designed to help users track their emotional well-being, practice mindfulness, and maintain a healthy mental state through various therapeutic tools and AI-powered support.

## 📱 Features

### 🏠 Core Features

- **Mood Tracking**: Log your daily emotional state with an intuitive emoji-based mood tracker
- **Journal**: Write and reflect on your thoughts with a beautiful, date-based journaling system
- **Calendar View**: Visualize your emotional journey over time with mood indicators on a calendar
- **AI Companion (Echo)**: Chat with an empathetic AI assistant powered by Google's Gemini AI for emotional support and guidance

### 🧘 Wellness Tools

- **Box Breathing Exercise**: Guided breathing exercises to reduce stress and anxiety
- **Daily Affirmations**: Positive affirmations to boost your mental well-being
- **Meditation Sessions**: Guided meditation experiences for mindfulness
- **Focus Music**: Ambient soundscapes to enhance concentration and relaxation
- **Emergency SOS**: Quick access to calming techniques during moments of crisis

### 📊 Analytics & Insights

- **Mood Analytics**: Visualize your emotional patterns with beautiful charts and graphs
- **Journal Insights**: Track your journaling habits and streaks
- **Wellness Statistics**: Monitor your engagement with various wellness activities

## 🛠️ Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Navigation**: React Navigation (Native Stack)
- **Backend**: [Firebase](https://firebase.google.com/)
  - Authentication (Email/Password)
  - Firestore Database
  - Real-time data synchronization
- **AI Integration**: Google Generative AI (Gemini)
- **Local Storage**: AsyncStorage for offline data persistence
- **UI Components**:
  - React Native Calendars
  - React Native Gifted Charts
  - React Native SVG
  - Custom-designed components with modern aesthetics

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Android Studio](https://developer.android.com/studio) (for Android development)
- [Xcode](https://developer.apple.com/xcode/) (for iOS development, macOS only)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mobile-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Firebase

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Email/Password authentication
3. Create a Firestore database
4. Create a `src/services/firebase.ts` file with your Firebase configuration:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### 4. Configure Google Gemini AI

1. Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a `src/services/gemini.ts` file with your configuration:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('YOUR_GEMINI_API_KEY');

export const getEchoResponse = async (userMessage: string, history: any[]) => {
  // Implementation
};
```

### 5. Run the Application

#### Development Mode

```bash
npm start
```

#### Run on Android

```bash
npm run android
```

#### Run on iOS

```bash
npm run ios
```

#### Run on Web

```bash
npm run web
```

## 📁 Project Structure

```
mobile-app/
├── src/
│   ├── components/         # Reusable UI components
│   ├── screens/           # Application screens
│   │   ├── WelcomeScreen.tsx
│   │   ├── SignInScreen.tsx
│   │   ├── SignUpScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── JournalDetailScreen.tsx
│   │   ├── JournalEditorScreen.tsx
│   │   ├── BreathingScreen.tsx
│   │   ├── AffirmationScreen.tsx
│   │   ├── MeditationScreen.tsx
│   │   ├── FocusMusicScreen.tsx
│   │   ├── EmergencySOSScreen.tsx
│   │   ├── EchoScreen.tsx
│   │   ├── InsightsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/          # Backend services and API integrations
│   │   ├── firebase.ts    # Firebase configuration
│   │   ├── gemini.ts      # Google Gemini AI integration
│   │   └── AuthContext.tsx # Authentication context provider
│   ├── theme/             # Theme configuration and colors
│   └── types/             # TypeScript type definitions
├── assets/                # Images, fonts, and other static assets
├── App.tsx               # Main application component
├── app.json              # Expo configuration
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## 🎨 Key Screens

### Authentication Flow
- **Welcome Screen**: Onboarding experience with app introduction
- **Sign Up**: Create a new account with email/password
- **Sign In**: Login to existing account

### Main Application
- **Home**: Dashboard with mood tracking, journal preview, and wellness tools
- **Echo AI**: Conversational AI companion for emotional support
- **Insights**: Analytics and visualizations of your wellness journey
- **Settings**: Account management and app preferences

### Wellness Activities
- **Breathing**: Guided box breathing exercises
- **Affirmation**: Daily positive affirmations
- **Meditation**: Calming meditation sessions
- **Focus**: Ambient music for concentration
- **Emergency SOS**: Quick access to crisis support tools

## 🔐 Security & Privacy

- User authentication via Firebase Auth
- Secure data storage in Firestore with user-specific collections
- Local data caching with AsyncStorage
- All sensitive data is encrypted in transit
- User data is isolated per account

## 🎯 Firebase Data Structure

```
users/
  {userId}/
    data/
      logs/
        {date}: {
          mood: string,
          journals: [{
            text: string,
            timestamp: timestamp
          }]
        }
    echo_history/
      {messageId}: {
        text: string,
        sender: string,
        timestamp: timestamp,
        dateStr: string
      }
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 🐛 Known Issues

- Ensure Firebase configuration is properly set up before running
- Some features require network connectivity
- Audio features require appropriate device permissions

## 📞 Support

For support, please open an issue in the repository or contact the development team.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- AI powered by [Google Gemini](https://deepmind.google/technologies/gemini/)
- Backend by [Firebase](https://firebase.google.com/)
- Icons and emojis for enhanced user experience

---

**Made with ❤️ for mental wellness**
