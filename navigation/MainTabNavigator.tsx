import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import HomeStackNavigator from "@/navigation/HomeStackNavigator";
import ProfileStackNavigator from "@/navigation/ProfileStackNavigator";
import WorkoutStackNavigator from "@/navigation/WorkoutStackNavigator";
import RankingStackNavigator from "@/navigation/RankingStackNavigator";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { Spacing } from "@/constants/theme";
import { generateWorkout } from "@/utils/workoutGenerator";

export type MainTabParamList = {
  HomeTab: undefined;
  WorkoutTab: undefined;
  StartWorkoutTab: undefined;
  RankingTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          height: Spacing.tabBarHeight,
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: "Início",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="WorkoutTab"
        component={WorkoutStackNavigator}
        options={{
          title: "Treinos",
          tabBarIcon: ({ color, size }) => (
            <Feather name="list" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="StartWorkoutTab"
        component={View}
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                position: "absolute",
                bottom: 8,
                width: 64,
                height: 64,
                borderRadius: 32,
                overflow: "hidden",
              }}
            >
              <LinearGradient
                colors={["#4CAF50", "#66BB6A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.fab}
              >
                <Feather name="play" size={28} color="#FFFFFF" />
              </LinearGradient>
            </View>
          ),
          tabBarButton: (props) => <Pressable {...props} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            if (!user) return;
            const exercises = generateWorkout(user);
            navigation.navigate("StartWorkoutModal" as any, {
              exercises,
              isNewWorkout: true,
            });
          },
        })}
      />
      <Tab.Screen
        name="RankingTab"
        component={RankingStackNavigator}
        options={{
          title: "Ranking",
          tabBarIcon: ({ color, size }) => (
            <Feather name="award" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 4,
  },
});
