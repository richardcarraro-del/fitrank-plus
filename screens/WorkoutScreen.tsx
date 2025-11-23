import { useState, useCallback } from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { storage, Workout } from "@/utils/storage";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { generateWorkout } from "@/utils/workoutGenerator";

export default function WorkoutScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [todayWorkoutCount, setTodayWorkoutCount] = useState(0);
  const FREE_LIMIT = 3;

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [])
  );

  const loadWorkouts = async () => {
    const allWorkouts = await storage.getWorkouts();
    setWorkouts(allWorkouts);
    const count = await storage.getTodayWorkoutCount();
    setTodayWorkoutCount(count);
  };

  const handleGenerateWorkout = async () => {
    if (!user?.isPremium && todayWorkoutCount >= FREE_LIMIT) {
      Alert.alert(
        "Limite Atingido",
        "Você atingiu o limite de treinos gratuitos de hoje. Assine o Premium para treinos ilimitados!",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Ver Premium", onPress: () => navigation.navigate("ProfileTab" as never) },
        ]
      );
      return;
    }

    if (!user) return;

    const exercises = generateWorkout(user);
    await storage.incrementTodayWorkoutCount();
    
    navigation.navigate("StartWorkoutModal" as never, {
      exercises,
      isNewWorkout: true,
    });
  };

  return (
    <ScreenScrollView contentContainerStyle={styles.content}>
      <View style={styles.generateCard}>
        <LinearGradient
          colors={["#FF6B35", "#F7931E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.generateGradient}
        >
          <ThemedText style={styles.generateTitle}>Gerar Novo Treino</ThemedText>
          {!user?.isPremium && (
            <ThemedText style={styles.generateLimit}>
              {todayWorkoutCount}/{FREE_LIMIT} treinos gratuitos hoje
            </ThemedText>
          )}
          <Pressable
            style={({ pressed }) => [
              styles.generateButton,
              pressed && styles.buttonPressed,
              !user?.isPremium && todayWorkoutCount >= FREE_LIMIT && styles.buttonDisabled,
            ]}
            onPress={handleGenerateWorkout}
            disabled={!user?.isPremium && todayWorkoutCount >= FREE_LIMIT}
          >
            <ThemedText style={styles.generateButtonText}>
              {!user?.isPremium && todayWorkoutCount >= FREE_LIMIT
                ? "Limite Atingido - Upgrade para Premium"
                : "Gerar Treino"}
            </ThemedText>
          </Pressable>
        </LinearGradient>
      </View>

      <ThemedText style={styles.sectionTitle}>Histórico de Treinos</ThemedText>

      {workouts.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="activity" size={48} color={Colors.dark.textTertiary} />
          <ThemedText style={styles.emptyText}>Nenhum treino realizado ainda</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Gere e complete seu primeiro treino!
          </ThemedText>
        </View>
      ) : (
        <View style={styles.workoutsList}>
          {workouts.map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))}
        </View>
      )}
    </ScreenScrollView>
  );
}

function WorkoutCard({ workout }: { workout: Workout }) {
  const date = new Date(workout.date);
  const formattedDate = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });

  return (
    <View style={styles.workoutCard}>
      <View style={styles.workoutHeader}>
        <View>
          <ThemedText style={styles.workoutDate}>{formattedDate}</ThemedText>
          <ThemedText style={styles.workoutDetails}>
            {workout.exercises.length} exercícios • {workout.duration} min
          </ThemedText>
        </View>
        {workout.completed && (
          <View style={styles.pointsBadge}>
            <Feather name="zap" size={16} color={Colors.dark.primary} />
            <ThemedText style={styles.pointsText}>{workout.points} pts</ThemedText>
          </View>
        )}
      </View>
      {workout.completed && (
        <View style={styles.completedBadge}>
          <Feather name="check-circle" size={16} color={Colors.dark.success} />
          <ThemedText style={styles.completedText}>Completo</ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.lg,
  },
  generateCard: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  generateGradient: {
    padding: Spacing.lg,
  },
  generateTitle: {
    ...Typography.h3,
    marginBottom: Spacing.sm,
    color: Colors.dark.text,
  },
  generateLimit: {
    ...Typography.caption,
    marginBottom: Spacing.md,
    color: Colors.dark.text,
    opacity: 0.8,
  },
  generateButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  generateButtonText: {
    ...Typography.button,
    color: Colors.dark.buttonText,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  emptyText: {
    ...Typography.bodyLarge,
    fontWeight: "600",
  },
  emptySubtext: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
  },
  workoutsList: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  workoutCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  workoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  workoutDate: {
    ...Typography.h3,
    fontSize: 18,
    marginBottom: Spacing.xs,
  },
  workoutDetails: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundSecondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    gap: Spacing.xs,
  },
  pointsText: {
    ...Typography.caption,
    fontWeight: "600",
    color: Colors.dark.primary,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  completedText: {
    ...Typography.caption,
    color: Colors.dark.success,
  },
});
