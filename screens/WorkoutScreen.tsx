import { useState, useCallback } from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { storage, Workout } from "@/utils/storage";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { generateWorkout } from "@/utils/workoutGenerator";
import type { RootStackParamList } from "@/navigation/RootNavigator";

export default function WorkoutScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [canGenerate, setCanGenerate] = useState(true);
  const [remaining, setRemaining] = useState(2);
  const FREE_WEEKLY_LIMIT = 2;

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadDataSafely = async () => {
        const allWorkouts = await storage.getWorkouts();
        const limit = await storage.canGenerateWorkout(user?.isPremium || false);

        if (isMounted) {
          setWorkouts(allWorkouts);
          setCanGenerate(limit.canGenerate);
          setRemaining(limit.remaining);
        }
      };

      loadDataSafely();

      return () => {
        isMounted = false;
      };
    }, [user?.isPremium])
  );

  const handleGenerateWorkout = async () => {
    if (!canGenerate && !user?.isPremium) {
      Alert.alert(
        "Limite Semanal Atingido",
        "Você atingiu o limite de 2 treinos semanais gratuitos. Assine o Premium por R$ 29,90/mês para treinos ilimitados!",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Ver Premium", onPress: () => navigation.navigate("ProfileTab" as never) },
        ]
      );
      return;
    }

    if (!user) return;

    const exercises = generateWorkout(user);
    console.log("[WorkoutScreen] Generated exercises before navigation:", exercises.length, exercises);
    
    navigation.navigate("StartWorkoutModal", {
      exercises,
      isNewWorkout: true,
    });
  };

  return (
    <ScreenScrollView contentContainerStyle={styles.content}>
      <View style={styles.generateCard}>
        <LinearGradient
          colors={["#4CAF50", "#66BB6A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.generateGradient}
        >
          <ThemedText style={styles.generateTitle}>Gerar Novo Treino</ThemedText>
          {!user?.isPremium && (
            <ThemedText style={styles.generateLimit}>
              {remaining} de {FREE_WEEKLY_LIMIT} treinos gratuitos restantes esta semana
            </ThemedText>
          )}
          <Pressable
            style={({ pressed }) => [
              styles.generateButton,
              pressed && styles.buttonPressed,
              !canGenerate && !user?.isPremium && styles.buttonDisabled,
            ]}
            onPress={handleGenerateWorkout}
            disabled={!canGenerate && !user?.isPremium}
          >
            <ThemedText style={styles.generateButtonText}>
              {!canGenerate && !user?.isPremium
                ? "Limite Semanal Atingido - Upgrade para Premium"
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
  const [expanded, setExpanded] = useState(false);
  const date = new Date(workout.date);
  const formattedDate = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    weekday: "short",
  });

  return (
    <Pressable
      style={styles.workoutCard}
      onPress={() => setExpanded(!expanded)}
    >
      <View style={styles.workoutHeader}>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.workoutDate}>{formattedDate}</ThemedText>
          <ThemedText style={styles.workoutDetails}>
            {workout.exercises.length} exercícios • {workout.duration} min • {workout.calories} cal
          </ThemedText>
        </View>
        {workout.completed && (
          <View style={styles.pointsBadge}>
            <Feather name="zap" size={16} color={Colors.dark.primary} />
            <ThemedText style={styles.pointsText}>{workout.points} pts</ThemedText>
          </View>
        )}
      </View>
      
      {expanded && (
        <View style={styles.exercisesExpanded}>
          <ThemedText style={styles.expandedTitle}>Exercícios:</ThemedText>
          {workout.exercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseItem}>
              <ThemedText style={styles.exerciseNumber}>{index + 1}.</ThemedText>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.exerciseItemName}>{exercise.name}</ThemedText>
                <ThemedText style={styles.exerciseItemDetails}>
                  {exercise.sets} × {exercise.reps} reps • {exercise.rest}s descanso
                </ThemedText>
              </View>
              {exercise.completed && (
                <Feather name="check" size={16} color={Colors.dark.success} />
              )}
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.expandIndicator}>
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={Colors.dark.textSecondary}
        />
      </View>
    </Pressable>
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
  exercisesExpanded: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  expandedTitle: {
    ...Typography.caption,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
  },
  exerciseItem: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    alignItems: "flex-start",
  },
  exerciseNumber: {
    ...Typography.caption,
    color: Colors.dark.textTertiary,
    width: 20,
  },
  exerciseItemName: {
    ...Typography.body,
    fontWeight: "500",
    marginBottom: 2,
  },
  exerciseItemDetails: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  expandIndicator: {
    alignItems: "center",
    marginTop: Spacing.sm,
  },
});
