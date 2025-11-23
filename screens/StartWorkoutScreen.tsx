import { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { storage, Exercise, Workout } from "@/utils/storage";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { generateWorkout, calculateWorkoutPoints, estimateCalories } from "@/utils/workoutGenerator";

export default function StartWorkoutScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as any;

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (params?.exercises) {
      setExercises(params.exercises);
    } else if (user) {
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
    const stats = await storage.getUserStats();
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
      exercises,
      duration,
      points,
      completed: true,
      calories,
    };

    await storage.saveWorkout(workout);

    const today = new Date().toDateString();
    const lastWorkoutDate = stats.lastWorkoutDate
      ? new Date(stats.lastWorkoutDate).toDateString()
      : null;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();

    let newStreak = stats.currentStreak;
    if (lastWorkoutDate === today) {
      newStreak = stats.currentStreak;
    } else if (lastWorkoutDate === yesterdayString) {
      newStreak = stats.currentStreak + 1;
    } else {
      newStreak = 1;
    }

    await storage.updateUserStats({
      totalWorkouts: stats.totalWorkouts + 1,
      totalPoints: stats.totalPoints + points,
      currentStreak: newStreak,
      bestStreak: Math.max(newStreak, stats.bestStreak),
      weeklyPoints: stats.weeklyPoints + points,
      monthlyPoints: stats.monthlyPoints + points,
      lastWorkoutDate: new Date().toISOString(),
    });

    Alert.alert(
      "Parabéns!",
      `Treino completo!\n\nVocê ganhou ${points} pontos\nQueimou ~${calories} calorias\nSequência: ${newStreak} dias`,
      [{ text: "OK", onPress: () => navigation.navigate("Main" as never) }]
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

      <ScreenScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressCard}>
          <ThemedText style={styles.progressTitle}>Progresso</ThemedText>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(completedCount / exercises.length) * 100}%` },
              ]}
            />
          </View>
          <ThemedText style={styles.progressText}>
            {completedCount} de {exercises.length} exercícios completados
          </ThemedText>
        </View>

        <View style={styles.exercisesList}>
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
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
            colors={allCompleted ? ["#FF6B35", "#F7931E"] : [Colors.dark.backgroundSecondary, Colors.dark.backgroundSecondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <ThemedText style={[styles.buttonText, !allCompleted && styles.buttonTextDisabled]}>
              Finalizar Treino
            </ThemedText>
          </LinearGradient>
        </Pressable>
      </ScreenScrollView>
    </View>
  );
}

function ExerciseCard({
  exercise,
  onToggle,
}: {
  exercise: Exercise;
  onToggle: (id: string) => void;
}) {
  return (
    <Pressable
      style={[styles.exerciseCard, exercise.completed && styles.exerciseCardCompleted]}
      onPress={() => onToggle(exercise.id)}
    >
      <View style={styles.exerciseHeader}>
        <View style={styles.checkbox}>
          {exercise.completed && (
            <Feather name="check" size={18} color={Colors.dark.success} />
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
          <ThemedText style={styles.exerciseDetails}>
            {exercise.sets} séries × {exercise.reps} reps • {exercise.rest}s descanso
          </ThemedText>
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
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  progressTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.dark.primary,
  },
  progressText: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  exercisesList: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  exerciseCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.dark.border,
  },
  exerciseCardCompleted: {
    borderColor: Colors.dark.success,
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  exerciseHeader: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.dark.border,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    ...Typography.h3,
    fontSize: 18,
    marginBottom: Spacing.xs,
  },
  exerciseNameCompleted: {
    color: Colors.dark.textSecondary,
    textDecorationLine: "line-through",
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
