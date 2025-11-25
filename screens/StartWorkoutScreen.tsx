import { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Alert, ScrollView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { storage, Exercise, Workout } from "@/utils/storage";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { generateWorkout, calculateWorkoutPoints, estimateCalories } from "@/utils/workoutGenerator";

export default function StartWorkoutScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as any;
  const insets = useSafeAreaInsets();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    console.log("[StartWorkoutScreen] Received params:", params);
    console.log("[StartWorkoutScreen] Exercises from params:", params?.exercises?.length, params?.exercises);
    if (params?.exercises) {
      setExercises(params.exercises);
    } else if (user) {
      console.log("[StartWorkoutScreen] No exercises in params, generating new workout");
      const generatedExercises = generateWorkout(user);
      setExercises(generatedExercises);
    }
  }, [params, user]);

  useEffect(() => {
    if (exercises.length > 0 && !startTime) {
      setStartTime(new Date());
    }
  }, [exercises]);

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedTime(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleExercise = (id: string) => {
    setExercises(prev =>
      prev.map(ex => (ex.id === id ? { ...ex, completed: !ex.completed } : ex))
    );
  };

  const allCompleted = exercises.every(ex => ex.completed);
  const completedCount = exercises.filter(ex => ex.completed).length;

  const handleFinish = async () => {
    if (!allCompleted) {
      Alert.alert(
        "Treino Incompleto",
        "Complete todos os exercícios antes de finalizar o treino.",
        [{ text: "OK" }]
      );
      return;
    }

    if (!user || !startTime) return;

    const duration = Math.floor(elapsedTime / 60);
    const stats = await storage.getUserStats(user.id);
    const points = calculateWorkoutPoints(
      duration,
      exercises.length,
      stats.currentStreak,
      user.level
    );
    const calories = estimateCalories(duration, user.level, user.weight);

    const workout: Workout = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      startTime: startTime.toISOString(),
      endTime: new Date().toISOString(),
      exercises,
      duration,
      points,
      completed: true,
      calories,
    };

    await storage.completeWorkout(workout, user.id);
    
    const updatedStats = await storage.getUserStats(user.id);
    const newlyUnlocked = await storage.checkAndUnlockAchievements(updatedStats, user.id);

    let message = `Treino completo!\n\nVocê ganhou ${points} pontos\nQueimou ~${calories} calorias\nSequência: ${updatedStats.currentStreak} dias`;
    
    if (newlyUnlocked.length > 0) {
      message += `\n\nNova conquista desbloqueada:\n${newlyUnlocked[0].name}`;
    }

    Alert.alert(
      "Parabéns!",
      message,
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  };

  const handleClose = () => {
    if (completedCount > 0) {
      Alert.alert(
        "Sair do Treino",
        "Você tem exercícios completados. Tem certeza que deseja sair sem finalizar?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Sair", style: "destructive", onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <Feather name="x" size={24} color={Colors.dark.text} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Treino em Andamento</ThemedText>
        <View style={styles.timer}>
          <Feather name="clock" size={16} color={Colors.dark.primary} />
          <ThemedText style={styles.timerText}>{formatTime(elapsedTime)}</ThemedText>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Feather name="target" size={20} color={Colors.dark.primary} />
            <ThemedText style={styles.progressTitle}>Progresso do Treino</ThemedText>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(completedCount / exercises.length) * 100}%` },
              ]}
            />
          </View>
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Feather name="check-circle" size={16} color={Colors.dark.success} />
              <ThemedText style={styles.progressText}>
                {completedCount}/{exercises.length} exercícios
              </ThemedText>
            </View>
            <ThemedText style={styles.progressPercentage}>
              {Math.round((completedCount / exercises.length) * 100)}%
            </ThemedText>
          </View>
        </View>

        <View style={styles.exercisesHeader}>
          <Feather name="list" size={20} color={Colors.dark.primary} />
          <ThemedText style={styles.exercisesTitle}>Exercícios</ThemedText>
        </View>

        <View style={styles.exercisesList}>
          {exercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={index + 1}
              onToggle={toggleExercise}
            />
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.finishButton,
            pressed && styles.buttonPressed,
            !allCompleted && styles.buttonDisabled,
          ]}
          onPress={handleFinish}
          disabled={!allCompleted}
        >
          <LinearGradient
            colors={allCompleted ? ["#00C853", "#00E676"] : [Colors.dark.backgroundSecondary, Colors.dark.backgroundSecondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Feather 
              name={allCompleted ? "check-circle" : "lock"} 
              size={20} 
              color={allCompleted ? Colors.dark.buttonText : Colors.dark.textTertiary} 
              style={{ marginRight: Spacing.sm }} 
            />
            <ThemedText style={[styles.buttonText, !allCompleted && styles.buttonTextDisabled]}>
              {allCompleted ? "Finalizar Treino" : "Complete todos os exercícios"}
            </ThemedText>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function ExerciseCard({
  exercise,
  index,
  onToggle,
}: {
  exercise: Exercise;
  index: number;
  onToggle: (id: string) => void;
}) {
  return (
    <Pressable
      style={[styles.exerciseCard, exercise.completed && styles.exerciseCardCompleted]}
      onPress={() => onToggle(exercise.id)}
    >
      <View style={styles.exerciseHeader}>
        <View style={[styles.checkbox, exercise.completed && styles.checkboxCompleted]}>
          {exercise.completed ? (
            <Feather name="check" size={20} color={Colors.dark.success} />
          ) : (
            <ThemedText style={styles.exerciseNumber}>{index}</ThemedText>
          )}
        </View>
        <View style={styles.exerciseInfo}>
          <ThemedText
            style={[
              styles.exerciseName,
              exercise.completed && styles.exerciseNameCompleted,
            ]}
          >
            {exercise.name}
          </ThemedText>
          <View style={styles.exerciseDetailsRow}>
            <View style={styles.exerciseDetailItem}>
              <Feather name="repeat" size={14} color={Colors.dark.textSecondary} />
              <ThemedText style={styles.exerciseDetails}>
                {exercise.sets} × {exercise.reps}
              </ThemedText>
            </View>
            <View style={styles.exerciseDetailItem}>
              <Feather name="clock" size={14} color={Colors.dark.textSecondary} />
              <ThemedText style={styles.exerciseDetails}>
                {exercise.rest}s
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    ...Typography.h3,
  },
  timer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  timerText: {
    ...Typography.bodyLarge,
    fontWeight: "600",
    color: Colors.dark.primary,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  progressCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  progressTitle: {
    ...Typography.h3,
  },
  progressBar: {
    height: 12,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.dark.primary,
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  progressText: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
    fontWeight: "500",
  },
  progressPercentage: {
    ...Typography.h3,
    color: Colors.dark.primary,
    fontWeight: "700",
  },
  exercisesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  exercisesTitle: {
    ...Typography.h3,
  },
  exercisesList: {
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  exerciseCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 2,
    borderColor: Colors.dark.border,
  },
  exerciseCardCompleted: {
    borderColor: Colors.dark.success,
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  exerciseHeader: {
    flexDirection: "row",
    gap: Spacing.lg,
    alignItems: "flex-start",
  },
  checkbox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxCompleted: {
    borderColor: Colors.dark.success,
    backgroundColor: "rgba(78, 205, 196, 0.15)",
  },
  exerciseNumber: {
    ...Typography.bodyLarge,
    fontWeight: "700",
    color: Colors.dark.textSecondary,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    ...Typography.h3,
    fontSize: 18,
    marginBottom: Spacing.md,
  },
  exerciseNameCompleted: {
    color: Colors.dark.textSecondary,
    textDecorationLine: "line-through",
  },
  exerciseDetailsRow: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  exerciseDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  exerciseDetails: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
  },
  finishButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    marginBottom: Spacing.xl,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    ...Typography.button,
    color: Colors.dark.buttonText,
  },
  buttonTextDisabled: {
    color: Colors.dark.textTertiary,
  },
});
