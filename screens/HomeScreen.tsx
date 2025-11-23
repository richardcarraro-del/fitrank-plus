import { useState, useCallback } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { storage, Workout, UserStats } from "@/utils/storage";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { ScreenScrollView } from "@/components/ScreenScrollView";

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
        const userStats = await storage.getUserStats();
        const workouts = await storage.getWorkouts();
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
    }, [])
  );

  const handleStartWorkout = () => {
    navigation.navigate("StartWorkoutModal" as never);
  };

  const handleViewWorkouts = () => {
    navigation.navigate("WorkoutTab" as never);
  };

  return (
    <ScreenScrollView contentContainerStyle={styles.content}>
      <View style={styles.streakCard}>
        <LinearGradient
          colors={stats.currentStreak >= 7 ? ["#4CAF50", "#66BB6A"] : [Colors.dark.backgroundDefault, Colors.dark.backgroundDefault]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.streakGradient}
        >
          <Feather name="zap" size={32} color={Colors.dark.text} />
          <View style={styles.streakContent}>
            <ThemedText style={styles.streakNumber}>{stats.currentStreak}</ThemedText>
            <ThemedText style={styles.streakLabel}>dias seguidos</ThemedText>
          </View>
        </LinearGradient>
      </View>

      {todayWorkout && todayWorkout.completed ? (
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Treino de Hoje Completo!</ThemedText>
          <View style={styles.completedInfo}>
            <Feather name="check-circle" size={48} color={Colors.dark.success} />
            <ThemedText style={styles.completedText}>
              Você ganhou {todayWorkout.points} pontos!
            </ThemedText>
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Treino do Dia</ThemedText>
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
              <ThemedText style={styles.buttonText}>Iniciar Treino</ThemedText>
            </LinearGradient>
          </Pressable>
        </View>
      )}

      <View style={styles.card}>
        <ThemedText style={styles.cardTitle}>Resumo de Pontos</ThemedText>
        <View style={styles.statsGrid}>
          <StatCard label="Pontos Semanais" value={stats.weeklyPoints.toString()} />
          <StatCard label="Total de Pontos" value={stats.totalPoints.toString()} />
        </View>
      </View>

      <View style={styles.card}>
        <ThemedText style={styles.cardTitle}>Estatísticas Rápidas</ThemedText>
        <View style={styles.quickStats}>
          <QuickStat icon="activity" label="Treinos Totais" value={stats.totalWorkouts.toString()} />
          <QuickStat icon="award" label="Pontos Totais" value={stats.totalPoints.toString()} />
          <QuickStat icon="trending-up" label="Sequência" value={`${stats.currentStreak} dias`} />
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.secondaryButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleViewWorkouts}
      >
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
}

function QuickStat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.quickStat}>
      <Feather name={icon as any} size={24} color={Colors.dark.primary} />
      <ThemedText style={styles.quickStatLabel}>{label}</ThemedText>
      <ThemedText style={styles.quickStatValue}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.lg,
  },
  streakCard: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  streakGradient: {
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  streakContent: {
    flex: 1,
  },
  streakNumber: {
    ...Typography.h1,
    fontSize: 36,
  },
  streakLabel: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
  },
  card: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  cardTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  completedInfo: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  completedText: {
    ...Typography.bodyLarge,
    color: Colors.dark.success,
  },
  workoutInfo: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
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
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  statValue: {
    ...Typography.h2,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
    textAlign: "center",
  },
  quickStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: Spacing.md,
  },
  quickStat: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  quickStatLabel: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  quickStatValue: {
    ...Typography.bodyLarge,
    fontWeight: "600",
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
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  secondaryButtonText: {
    ...Typography.button,
    color: Colors.dark.textSecondary,
  },
});
