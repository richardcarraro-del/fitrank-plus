import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import OnboardingScreen from "@/screens/OnboardingScreen";
import LoginScreen from "@/screens/LoginScreen";
import ProfileSetupScreen from "@/screens/ProfileSetupScreen";
import StartWorkoutScreen from "@/screens/StartWorkoutScreen";
import { Exercise } from "@/utils/storage";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { Colors } from "@/constants/theme";

export type RootStackParamList = {
  Main: undefined;
  OnboardingModal: undefined;
  LoginModal: undefined;
  ProfileSetupModal: undefined;
  StartWorkoutModal: { exercises: Exercise[]; isNewWorkout: boolean };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, isLoading, hasCompletedOnboarding } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.dark.backgroundRoot }}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Group screenOptions={{ presentation: "modal" }}>
          <Stack.Screen name="LoginModal" component={LoginScreen} />
        </Stack.Group>
      </Stack.Navigator>
    );
  }

  if (!hasCompletedOnboarding) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Group screenOptions={{ presentation: "modal" }}>
          <Stack.Screen name="ProfileSetupModal" component={ProfileSetupScreen} />
        </Stack.Group>
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Group screenOptions={{ presentation: "modal" }}>
        <Stack.Screen name="OnboardingModal" component={OnboardingScreen} />
        <Stack.Screen name="StartWorkoutModal" component={StartWorkoutScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
}
