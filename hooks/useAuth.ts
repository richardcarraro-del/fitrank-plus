import { useState, useEffect, createContext, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authRepository } from "@/utils/storage";

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  age: number;
  weight: number;
  height: number;
  goal: "hypertrophy" | "weight_loss" | "endurance" | "beginner";
  level: "beginner" | "intermediate" | "advanced";
  timeAvailable: number;
  weeklyFrequency: 2 | 3 | 4 | 5 | 6;
  location: "home" | "gym";
  equipment: string[];
  academy?: {
    id: string;
    name: string;
    address?: string;
  };
  isPremium: boolean;
  selectedPlan?: "ABC" | "ABCD" | "FullBody" | "UpperLower";
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (value: boolean) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}


export function useAuthState(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboardingState] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUserId = await authRepository.getCurrentUserId();
      
      if (currentUserId) {
        const userKey = `@fitrank:user_${currentUserId}:profile`;
        const userData = await AsyncStorage.getItem(userKey);
        const onboardingKey = `@fitrank:user_${currentUserId}:onboarding_complete`;
        const onboardingComplete = await AsyncStorage.getItem(onboardingKey);
        
        if (userData) {
          setUser(JSON.parse(userData));
        }
        setHasCompletedOnboardingState(onboardingComplete === "true");
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const storedUser = await authRepository.validateCredentials(email, password);
    
    if (!storedUser) {
      throw new Error("Email ou senha incorretos");
    }

    await authRepository.setCurrentUserId(storedUser.id);

    const userKey = `@fitrank:user_${storedUser.id}:profile`;
    const existingUserData = await AsyncStorage.getItem(userKey);

    let fullUser: User;
    
    if (existingUserData) {
      fullUser = JSON.parse(existingUserData);
    } else {
      fullUser = {
        id: storedUser.id,
        name: storedUser.name,
        email: storedUser.email,
        avatar: "1",
        age: 0,
        weight: 0,
        height: 0,
        goal: "beginner",
        level: "beginner",
        timeAvailable: 30,
        weeklyFrequency: 3,
        location: "gym",
        equipment: [],
        isPremium: false,
      };
      await AsyncStorage.setItem(userKey, JSON.stringify(fullUser));
    }

    setUser(fullUser);
  };

  const signup = async (email: string, password: string, name: string) => {
    const storedUser = await authRepository.registerUser(email, password, name);

    await authRepository.setCurrentUserId(storedUser.id);

    const newUser: User = {
      id: storedUser.id,
      name: storedUser.name,
      email: storedUser.email,
      avatar: "1",
      age: 0,
      weight: 0,
      height: 0,
      goal: "beginner",
      level: "beginner",
      timeAvailable: 30,
      weeklyFrequency: 3,
      location: "gym",
      equipment: [],
      isPremium: false,
    };

    const userKey = `@fitrank:user_${storedUser.id}:profile`;
    await AsyncStorage.setItem(userKey, JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = async () => {
    await authRepository.clearCurrentUserId();
    setUser(null);
    setHasCompletedOnboardingState(false);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    const userKey = `@fitrank:user_${user.id}:profile`;
    await AsyncStorage.setItem(userKey, JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const setHasCompletedOnboarding = async (value: boolean) => {
    if (!user) return;
    const onboardingKey = `@fitrank:user_${user.id}:onboarding_complete`;
    await AsyncStorage.setItem(onboardingKey, value.toString());
    setHasCompletedOnboardingState(value);
  };

  return {
    user,
    isLoading,
    login,
    signup,
    logout,
    updateProfile,
    hasCompletedOnboarding,
    setHasCompletedOnboarding,
  };
}
