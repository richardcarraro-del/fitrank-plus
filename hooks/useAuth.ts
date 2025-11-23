import { useState, useEffect, createContext, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  age: number;
  weight: number;
  height: number;
  goal: "muscle" | "lose_weight" | "endurance" | "health";
  level: "beginner" | "intermediate" | "advanced";
  timeAvailable: number;
  weeklyFrequency: number;
  location: "home" | "gym";
  equipment: string[];
  academy?: {
    id: string;
    name: string;
  };
  isPremium: boolean;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
      const userData = await AsyncStorage.getItem("@user");
      const onboardingComplete = await AsyncStorage.getItem("@onboarding_complete");
      if (userData) {
        setUser(JSON.parse(userData));
      }
      setHasCompletedOnboardingState(onboardingComplete === "true");
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const mockUser: User = {
      id: "1",
      name: "Usuário Demo",
      email,
      avatar: "1",
      age: 25,
      weight: 70,
      height: 175,
      goal: "muscle",
      level: "intermediate",
      timeAvailable: 60,
      weeklyFrequency: 4,
      location: "gym",
      equipment: ["dumbbells", "barbell", "bench"],
      academy: {
        id: "1",
        name: "SmartFit Centro",
      },
      isPremium: false,
    };
    await AsyncStorage.setItem("@user", JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const signup = async (email: string, password: string, name: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      avatar: "1",
      age: 0,
      weight: 0,
      height: 0,
      goal: "muscle",
      level: "beginner",
      timeAvailable: 30,
      weeklyFrequency: 3,
      location: "gym",
      equipment: [],
      isPremium: false,
    };
    await AsyncStorage.setItem("@user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["@user", "@onboarding_complete", "@workouts", "@user_stats"]);
    setUser(null);
    setHasCompletedOnboardingState(false);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    await AsyncStorage.setItem("@user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const setHasCompletedOnboarding = async (value: boolean) => {
    await AsyncStorage.setItem("@onboarding_complete", value.toString());
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
