import { useState, useCallback } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { storage, Workout, UserStats } from "@/utils/storage";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { generateWorkout } from "@/utils/workoutGenerator";

type HomeStats = Pick<UserStats, 'currentStreak' | 'totalWorkouts' | 'totalPoints' | 'weeklyPoints'>;

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [stats, setStats] = useState<HomeStats>({
    currentStreak: 0,
    totalWorkouts: 0,
    totalPoints: 0,
    weeklyPoints: 0,
  });
  const [todayWorkout, setTodayWorkout] = useState<Workout | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadDataSafely = async () => {
        if (!user?.id) return;
        
        const userStats = await storage.getUserStats(user.id);
        const workouts = await storage.getWorkouts(user.id);
        const today = new Date().toDateString();
        const todaysWorkout = workouts.find(w => new Date(w.date).toDateString() === today);

        if (isMounted) {
          setStats(userStats);
          setTodayWorkout(todaysWorkout || null);
        }
      };

      loadDataSafely();

      return () => {
        isMounted = false;
      };
    }, [user?.id])
  );

  const handleStartWorkout = () => {
    if (!user) {
      return;
    }
    const exercises = generateWorkout(user);
    navigation.navigate("StartWorkoutModal" as never, {
      exercises,
      isNewWorkout: true,
    } as never);
  };

  const handleViewWorkouts = () => {
    navigation.navigate("WorkoutTab" as never);
  };

  return (
    <ScreenScrollView contentContainerStyle={styles.content}>
      <View style={styles.streakCard}>
        <LinearGradient
          colors={stats.currentStreak >= 7 ? ["#4CAF50", "#66BB6A"] : [Colors.dark.backgroundSecondary, Colors.dark.backgroundSecondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.streakGradient}
        >
          <View style={styles.streakIconContainer}>
            <Feather name="zap" size={28} color={Colors.dark.text} />
          </View>
          <View style={styles.streakContent}>
            <ThemedText style={styles.streakNumber}>{stats.currentStreak}</ThemedText>
            <ThemedText style={styles.streakLabel}>dias de sequência</ThemedText>
          </View>
          {stats.currentStreak >= 7 && (
            <View style={styles.streakBadge}>
              <Feather name="award" size={16} color={Colors.dark.text} />
            </View>
          )}
        </LinearGradient>
      </View>

      {todayWorkout && todayWorkout.completed ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="check-circle" size={24} color={Colors.dark.success} />
            <ThemedText style={styles.cardTitle}>Treino de Hoje Completo!</ThemedText>
          </View>
          <View style={styles.completedInfo}>
            <View style={styles.completedStats}>
              <View style={styles.completedStat}>
                <Feather name="zap" size={20} color={Colors.dark.primary} />
                <ThemedText style={styles.completedStatValue}>{todayWorkout.points}</ThemedText>
                <ThemedText style={styles.completedStatLabel}>pontos</ThemedText>
              </View>
              <View style={styles.completedStat}>
                <Feather name="activity" size={20} color={Colors.dark.primary} />
                <ThemedText style={styles.completedStatValue}>{todayWorkout.exercises.length}</ThemedText>
                <ThemedText style={styles.completedStatLabel}>exercícios</ThemedText>
              </View>
              <View style={styles.completedStat}>
                <Feather name="clock" size={20} color={Colors.dark.primary} />
                <ThemedText style={styles.completedStatValue}>{todayWorkout.duration}</ThemedText>
                <ThemedText style={styles.completedStatLabel}>minutos</ThemedText>
              </View>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="calendar" size={24} color={Colors.dark.primary} />
            <ThemedText style={styles.cardTitle}>Treino do Dia</ThemedText>
          </View>
          <View style={styles.workoutInfo}>
            <InfoRow icon="activity" label="Exercícios" value="6" />
            <InfoRow icon="clock" label="Tempo" value={`${user?.timeAvailable || 30} min`} />
            <InfoRow icon="trending-up" label="Dificuldade" value={user?.level === "beginner" ? "Iniciante" : user?.level === "intermediate" ? "Intermediário" : "Avançado"} />
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleStartWorkout}
          >
            <LinearGradient
              colors={["#4CAF50", "#66BB6A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Feather name="play" size={20} color={Colors.dark.buttonText} style={{ marginRight: Spacing.sm }} />
              <ThemedText style={styles.buttonText}>Iniciar Treino</ThemedText>
            </LinearGradient>
          </Pressable>
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="bar-chart-2" size={24} color={Colors.dark.primary} />
          <ThemedText style={styles.cardTitle}>Resumo de Pontos</ThemedText>
        </View>
        <View style={styles.statsGrid}>
          <StatCard icon="calendar" label="Pontos Semanais" value={stats.weeklyPoints.toString()} />
          <StatCard icon="award" label="Total de Pontos" value={stats.totalPoints.toString()} />
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="trending-up" size={24} color={Colors.dark.primary} />
          <ThemedText style={styles.cardTitle}>Estatísticas</ThemedText>
        </View>
        <View style={styles.quickStats}>
          <QuickStat icon="activity" label="Treinos" value={stats.totalWorkouts.toString()} />
          <QuickStat icon="zap" label="Pontos" value={stats.totalPoints.toString()} />
          <QuickStat icon="trending-up" label="Sequência" value={`${stats.currentStreak}`} />
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.secondaryButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleViewWorkouts}
      >
        <Feather name="list" size={18} color={Colors.dark.primary} style={{ marginRight: Spacing.sm }} />
        <ThemedText style={styles.secondaryButtonText}>Ver Histórico de Treinos</ThemedText>
      </Pressable>
    </ScreenScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Feather name={icon as any} size={20} color={Colors.dark.textSecondary} />
      <View style={styles.infoContent}>
        <ThemedText style={styles.infoLabel}>{label}</ThemedText>
        <ThemedText style={styles.infoValue}>{value}</ThemedText>
      </View>
    </View>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIconContainer}>
        <Feather name={icon as any} size={20} color={Colors.dark.primary} />
      </View>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
}

function QuickStat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.quickStat}>
      <View style={styles.quickStatIconContainer}>
        <Feather name={icon as any} size={24} color={Colors.dark.primary} />
      </View>
      <ThemedText style={styles.quickStatValue}>{value}</ThemedText>
      <ThemedText style={styles.quickStatLabel}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.lg,
  },
  streakCard: {
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  streakGradient: {
    padding: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  streakIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  streakContent: {
    flex: 1,
  },
  streakNumber: {
    ...Typography.h1,
    fontSize: 40,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  streakLabel: {
    ...Typography.body,
    color: Colors.dark.text,
    opacity: 0.9,
  },
  streakBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    ...Typography.h3,
    flex: 1,
  },
  completedInfo: {
    paddingVertical: Spacing.md,
  },
  completedStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: Spacing.md,
  },
  completedStat: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundSecondary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  completedStatValue: {
    ...Typography.h2,
    color: Colors.dark.primary,
  },
  completedStatLabel: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  workoutInfo: {
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.dark.backgroundSecondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  infoContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoLabel: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
  },
  infoValue: {
    ...Typography.bodyLarge,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundSecondary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    gap: Spacing.sm,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.backgroundTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    ...Typography.h2,
    color: Colors.dark.primary,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
    textAlign: "center",
  },
  quickStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: Spacing.md,
  },
  quickStat: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundSecondary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  quickStatIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.backgroundTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  quickStatValue: {
    ...Typography.h3,
    fontWeight: "700",
    color: Colors.dark.text,
  },
  quickStatLabel: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  primaryButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  buttonPressed: {
    opacity: 0.8,
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
  secondaryButton: {
    backgroundColor: Colors.dark.backgroundSecondary,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  secondaryButtonText: {
    ...Typography.button,
    color: Colors.dark.primary,
  },
});
