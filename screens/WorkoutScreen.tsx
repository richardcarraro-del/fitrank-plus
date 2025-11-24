import { useState, useCallback } from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/hooks/useSupabaseAuth";
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
        if (!user?.id) return;
        
        const allWorkouts = await storage.getWorkouts(user.id);
        const limit = await storage.canGenerateWorkout(user?.isPremium || false, user.id);

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
    }, [user?.id, user?.isPremium])
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

    if (!user) {
      return;
    }

    const exercises = generateWorkout(user);
    
    navigation.navigate("StartWorkoutModal" as never, {
      exercises,
      isNewWorkout: true,
    } as never);
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
          <View style={styles.generateHeader}>
            <View style={styles.generateIconContainer}>
              <Feather name="plus-circle" size={32} color={Colors.dark.text} />
            </View>
            <View style={styles.generateInfo}>
              <ThemedText style={styles.generateTitle}>Gerar Novo Treino</ThemedText>
              {!user?.isPremium ? (
                <View style={styles.limitBadge}>
                  <Feather name="zap" size={14} color={Colors.dark.text} />
                  <ThemedText style={styles.generateLimit}>
                    {remaining} de {FREE_WEEKLY_LIMIT} restantes
                  </ThemedText>
                </View>
              ) : (
                <View style={styles.premiumBadge}>
                  <Feather name="award" size={14} color={Colors.dark.premium} />
                  <ThemedText style={styles.premiumText}>Ilimitado</ThemedText>
                </View>
              )}
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.generateButton,
              pressed && styles.buttonPressed,
              !canGenerate && !user?.isPremium && styles.buttonDisabled,
            ]}
            onPress={handleGenerateWorkout}
            disabled={!canGenerate && !user?.isPremium}
          >
            <Feather 
              name={!canGenerate && !user?.isPremium ? "lock" : "play"} 
              size={18} 
              color={Colors.dark.buttonText} 
              style={{ marginRight: Spacing.sm }} 
            />
            <ThemedText style={styles.generateButtonText}>
              {!canGenerate && !user?.isPremium
                ? "Upgrade para Premium"
                : "Gerar Treino Personalizado"}
            </ThemedText>
          </Pressable>
        </LinearGradient>
      </View>

      <View style={styles.sectionHeader}>
        <Feather name="clock" size={20} color={Colors.dark.primary} />
        <ThemedText style={styles.sectionTitle}>Histórico de Treinos</ThemedText>
      </View>

      {workouts.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Feather name="activity" size={40} color={Colors.dark.textTertiary} />
          </View>
          <ThemedText style={styles.emptyText}>Nenhum treino realizado ainda</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Gere e complete seu primeiro treino para começar!
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
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    elevation: 4,
  },
  generateGradient: {
    padding: Spacing.xl,
  },
  generateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  generateIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  generateInfo: {
    flex: 1,
  },
  generateTitle: {
    ...Typography.h2,
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  limitBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
    alignSelf: "flex-start",
  },
  generateLimit: {
    ...Typography.caption,
    color: Colors.dark.text,
    fontWeight: "600",
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
    alignSelf: "flex-start",
  },
  premiumText: {
    ...Typography.caption,
    color: Colors.dark.premium,
    fontWeight: "600",
  },
  generateButton: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  generateButtonText: {
    ...Typography.button,
    color: Colors.dark.buttonText,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: Spacing.lg,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    ...Typography.h3,
    textAlign: "center",
  },
  emptySubtext: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
    textAlign: "center",
  },
  workoutsList: {
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  workoutCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  workoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
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
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  expandedTitle: {
    ...Typography.caption,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.md,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  exerciseItem: {
    flexDirection: "row",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: "flex-start",
    backgroundColor: Colors.dark.backgroundSecondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  exerciseNumber: {
    ...Typography.body,
    color: Colors.dark.primary,
    fontWeight: "600",
    width: 24,
  },
  exerciseItemName: {
    ...Typography.bodyLarge,
    fontWeight: "600",
    marginBottom: 4,
  },
  exerciseItemDetails: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  expandIndicator: {
    alignItems: "center",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
});
