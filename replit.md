# FitRank+ - Fitness Tracking & Gamification App

## Overview

FitRank+ is a React Native mobile application built with Expo that gamifies fitness through workout tracking, AI-generated personalized training programs, and academy-based competitive rankings. The app combines fitness coaching with social competition, allowing users to earn points, maintain streaks, and compete with other members of their gym/academy on monthly leaderboards.

The application is designed for iOS, Android, and Web platforms, with a focus on dark mode aesthetics and smooth, animated user experiences. It implements a freemium model where free users get 2 AI-generated workouts per week, while premium subscribers ($29.90/month) receive unlimited workout generation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Platform**
- Built on React Native 0.81.5 with Expo 54
- Supports iOS, Android, and Web through Expo's cross-platform APIs
- Uses React 19.1.0 with experimental React Compiler enabled
- Implements the new React Native architecture (`newArchEnabled: true`)

**Navigation Structure**
- React Navigation v7 with native-stack and bottom-tabs navigators
- 5-tab bottom navigation: Home, Workout, Start Workout (FAB), Ranking, Profile
- Modal-based flows for Onboarding, Login, Profile Setup, and Active Workouts
- Type-safe navigation with TypeScript parameter lists for each stack

**UI/UX Architecture**
- Dark-mode-first design with dynamic theming system
- Animated components using Reanimated 4.1.1 for 60fps interactions
- Custom spring-based press animations on buttons and cards
- Glass morphism effects using expo-blur and expo-glass-effect
- Gradient backgrounds via expo-linear-gradient
- Three-tier elevation system for cards (backgroundDefault, backgroundSecondary, backgroundTertiary)

**State Management**
- Context API for global authentication state (AuthProvider/AuthContext)
- Local component state with React hooks
- AsyncStorage for persistent data (workouts, user stats, rankings)
- No external state management libraries (Redux, MobX, etc.)

**Component Architecture**
- Themed component system (ThemedText, ThemedView) that adapts to light/dark modes
- Reusable layout components (ScreenScrollView, ScreenKeyboardAwareScrollView, ScreenFlatList)
- Safe area handling with react-native-safe-area-context
- Custom hooks for common patterns (useTheme, useAuth, useScreenInsets)

### Authentication & User Flow

**Authentication Strategy**
- Planned SSO integration with Apple Sign-In (iOS) and Google Sign-In
- Currently mocked with local AsyncStorage for prototype phase
- Email/password fallback authentication
- User session persistence via AsyncStorage

**Onboarding Flow**
1. Welcome screen with app features and value proposition
2. Login/Signup with SSO or email
3. 6-step profile setup wizard (Objetivo → Nível → Dados físicos → Tempo → Frequência → Local/Equipamentos)
4. Main app interface

**User Profile Data Model**
- Demographics: name, email, age, weight, height
- Fitness: goal (muscle/lose_weight/endurance/health), level (beginner/intermediate/advanced)
- Preferences: timeAvailable, weeklyFrequency, location (home/gym), equipment array
- Academy affiliation for ranking system
- Premium subscription status

### Data Layer

**Storage Architecture**
- AsyncStorage as the primary data persistence layer
- No backend or database integration in current implementation
- Structured storage utilities in `utils/storage.ts` with typed interfaces
- Data models: User, Workout, Exercise, Achievement, UserStats, Academy, RankingUser

**Key Data Structures**
- Workouts: exercise list, duration, points, calories, completion status
- Exercises: name, sets, reps, rest intervals, muscle groups
- User Stats: streaks, total workouts/points, weekly/monthly aggregates
- Rankings: academy-based leaderboards with position and point totals
- Achievements: unlockable badges with earning criteria

**Workout Generation Logic**
- AI-simulated workout generator in `utils/workoutGenerator.ts`
- Exercise database categorized by user level (beginner/intermediate/advanced) and goal
- Generates 6-10 exercises based on user profile, time available, and equipment
- Calculates points based on duration, intensity, and completion
- Calorie estimation based on exercise type and user metrics

### Business Logic

**Gamification System**
- Points awarded per completed workout based on duration and intensity
- Daily streak tracking with visual indicators (flame icon with glow effect for 7+ days)
- Weekly and monthly point aggregation for rankings
- Achievement system with unlockable badges
- Academy-based competitive leaderboards

**Freemium Model**
- Free tier: 2 AI-generated workouts per week
- Premium tier: Unlimited workout generation, advanced features
- Weekly workout generation counter with reset logic
- Premium upgrade prompts when free limit reached

### Platform-Specific Considerations

**iOS**
- Tab bar uses BlurView for translucent background
- Supports edge-to-edge design with safe area handling
- Apple Sign-In integration (planned)

**Android**
- Adaptive icons with foreground, background, and monochrome variants
- Edge-to-edge enabled with gesture navigation support
- Predictive back gesture disabled for custom navigation control
- Google Sign-In integration (planned)

**Web**
- Single-page application output
- ColorScheme hydration handling to prevent flash of unstyled content
- Keyboard-aware scroll view falls back to standard ScrollView on web
- Tab bar uses solid background instead of blur effect

### Code Quality & Tooling

**Development Tools**
- TypeScript with strict mode for type safety
- ESLint with Expo config and Prettier integration
- Babel module resolver for clean `@/` imports
- Path aliases configured in tsconfig.json

**Error Handling**
- React Error Boundary component wrapping entire app
- Custom ErrorFallback component with dev-mode error details modal
- App restart capability via expo's reloadAppAsync

## Recent Changes

### November 2025 - Critical Bug Fixes & Authentication Flow

**Authentication Gating (RootNavigator)**
- Implemented user authentication verification in RootNavigator
- App now shows LoginModal when no user exists, Main after authentication
- Added loading state during initial user data fetch to prevent flash

**Modal Screen Crashes Fixed**
- Fixed LoginScreen crash: replaced ScreenKeyboardAwareScrollView with ScrollView + KeyboardAvoidingView + useSafeAreaInsets
- Fixed ProfileSetupScreen crash: replaced ScreenScrollView with standard ScrollView + safe area insets
- Both screens now work correctly when shown as modals outside TabNavigator context
- Root cause: ScreenScrollView and ScreenKeyboardAwareScrollView depend on useBottomTabBarHeight which only works inside TabNavigator

**Workout Generation Improvements**
- Added default values (weeklyFrequency=3, goal='beginner') to generateWorkout function to prevent crashes on undefined user fields
- Added same defaults in ProfileScreen update handlers
- All navigation entry points (HomeScreen, WorkoutScreen, MainTabNavigator FAB) now call generateWorkout before navigating to StartWorkoutModal

**UI/UX Fixes**
- Replaced invalid "flame" icon with "trending-up" in HomeScreen streak card
- Removed all debug console.log statements (kept console.error for production error logging)
- Verified complete signup → profile setup → main → start workout flow works end-to-end

**Color Palette**
- Changed app color scheme from orange (#FF6B35) to green (#4CAF50) throughout entire application
- Updated gradients, buttons, badges, and accent colors to use green tones

## External Dependencies

### Core Framework Dependencies
- **expo** (^54.0.23) - Primary development platform and build toolchain
- **react-native** (0.81.5) - Mobile application framework
- **react** (19.1.0) / **react-dom** (19.1.0) - UI rendering

### Navigation
- **@react-navigation/native** (^7.1.8) - Navigation state management
- **@react-navigation/native-stack** (^7.3.16) - Native stack navigator
- **@react-navigation/bottom-tabs** (^7.4.0) - Bottom tab navigation
- **react-native-screens** (~4.16.0) - Native screen optimization
- **react-native-safe-area-context** (~5.6.0) - Safe area handling

### UI & Animation
- **react-native-reanimated** (~4.1.1) - High-performance animations
- **react-native-gesture-handler** (~2.28.0) - Native gesture support
- **expo-linear-gradient** (^15.0.7) - Gradient backgrounds
- **expo-blur** (~15.0.7) - Blur effects for iOS/Android
- **expo-glass-effect** (~0.1.6) - Glass morphism effects
- **expo-haptics** (~15.0.7) - Haptic feedback
- **@expo/vector-icons** (^15.0.2) - Icon library (includes Feather icons)

### Storage & State
- **@react-native-async-storage/async-storage** (^2.2.0) - Local data persistence
- No external state management library (uses React Context)

### Platform APIs
- **expo-web-browser** (~15.0.9) - In-app browser for OAuth flows
- **expo-linking** (~8.0.8) - Deep linking support
- **expo-image** (~3.0.10) - Optimized image component
- **expo-status-bar** (~3.0.8) - Status bar configuration
- **expo-splash-screen** (~31.0.10) - Splash screen management
- **expo-system-ui** (~6.0.8) - System UI controls

### Keyboard & Input
- **react-native-keyboard-controller** (1.18.5) - Keyboard-aware components
- **react-native-worklets** (0.5.1) - JavaScript worklet support

### Planned Integrations
- Apple Sign-In (iOS SSO)
- Google Sign-In (Android SSO)
- Backend API for workout generation, rankings sync, and user management (currently mocked with AsyncStorage)
- Payment processing for premium subscriptions
- Push notifications for workout reminders and streak maintenance