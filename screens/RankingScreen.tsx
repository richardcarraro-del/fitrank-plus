import { useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { storage, RankingUser } from "@/utils/storage";
import { useFocusEffect } from "@react-navigation/native";

export default function RankingScreen() {
  const { user } = useAuth();
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadRanking();
    }, [user])
  );

  const loadRanking = async () => {
    try {
      setLoading(true);
      if (!user?.id) return;
      
      const academyId = user?.academy?.id || "1";
      const rankingData = await storage.getRanking(academyId, user.id, user.name, user.avatar);
      setRanking(rankingData);
    } catch (error) {
      console.error("Error loading ranking:", error);
    } finally {
      setLoading(false);
    }
  };

  const topThree = ranking.slice(0, 3);
  const [second, first, third] = [topThree[1], topThree[0], topThree[2]].filter(Boolean);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ThemedText>Carregando ranking...</ThemedText>
      </View>
    );
  }

  return (
    <ScreenScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <ThemedText style={styles.academyName}>{user?.academy?.name || "Minha Academia"}</ThemedText>
        <ThemedText style={styles.period}>Ranking do Mês</ThemedText>
      </View>

      {topThree.length >= 2 && (
        <View style={styles.podium}>
          {second && (
            <View style={styles.podiumPosition}>
              <View style={[styles.podiumAvatar, styles.silverAvatar]}>
                <ThemedText style={styles.avatarText}>{second.avatar}</ThemedText>
              </View>
              <ThemedText style={styles.podiumName}>{second.name.split(" ")[0]}</ThemedText>
              <ThemedText style={styles.podiumPoints}>{formatPoints(second.monthlyPoints)}</ThemedText>
              <View style={[styles.podiumRank, { backgroundColor: "#C0C0C0" }]}>
                <ThemedText style={styles.podiumRankText}>2º</ThemedText>
              </View>
            </View>
          )}

          {first && (
            <View style={[styles.podiumPosition, styles.firstPlace]}>
              <View style={[styles.podiumAvatar, styles.goldAvatar]}>
                <ThemedText style={styles.avatarText}>{first.avatar}</ThemedText>
              </View>
              <ThemedText style={styles.podiumName}>{first.name.split(" ")[0]}</ThemedText>
              <ThemedText style={styles.podiumPoints}>{formatPoints(first.monthlyPoints)}</ThemedText>
              <View style={[styles.podiumRank, { backgroundColor: Colors.dark.premium }]}>
                <Feather name="award" size={16} color={Colors.dark.backgroundRoot} />
              </View>
            </View>
          )}

          {third && (
            <View style={styles.podiumPosition}>
              <View style={[styles.podiumAvatar, styles.bronzeAvatar]}>
                <ThemedText style={styles.avatarText}>{third.avatar}</ThemedText>
              </View>
              <ThemedText style={styles.podiumName}>{third.name.split(" ")[0]}</ThemedText>
              <ThemedText style={styles.podiumPoints}>{formatPoints(third.monthlyPoints)}</ThemedText>
              <View style={[styles.podiumRank, { backgroundColor: "#CD7F32" }]}>
                <ThemedText style={styles.podiumRankText}>3º</ThemedText>
              </View>
            </View>
          )}
        </View>
      )}

      <View style={styles.leaderboard}>
        <ThemedText style={styles.leaderboardTitle}>Classificação Completa</ThemedText>
        {ranking.map((rankingUser) => (
          <View
            key={rankingUser.id}
            style={[
              styles.leaderboardItem,
              rankingUser.isCurrentUser && styles.currentUserItem,
            ]}
          >
            <View style={styles.leaderboardLeft}>
              <ThemedText style={styles.rank}>#{rankingUser.rank}</ThemedText>
              <View style={styles.avatar}>
                <ThemedText style={styles.avatarSmallText}>{rankingUser.avatar}</ThemedText>
              </View>
              <ThemedText style={styles.userName}>{rankingUser.name}</ThemedText>
            </View>
            <View style={styles.leaderboardRight}>
              <Feather name="zap" size={16} color={Colors.dark.primary} />
              <ThemedText style={styles.userPoints}>{rankingUser.monthlyPoints.toLocaleString()}</ThemedText>
            </View>
          </View>
        ))}
      </View>
    </ScreenScrollView>
  );
}

function formatPoints(points: number): string {
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}k`;
  }
  return points.toString();
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  academyName: {
    ...Typography.h2,
    marginBottom: Spacing.xs,
  },
  period: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
  },
  podium: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  podiumPosition: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  firstPlace: {
    transform: [{ translateY: -20 }],
  },
  podiumAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },
  goldAvatar: {
    backgroundColor: Colors.dark.premium,
    borderColor: Colors.dark.premium,
  },
  silverAvatar: {
    backgroundColor: "#C0C0C0",
    borderColor: "#C0C0C0",
  },
  bronzeAvatar: {
    backgroundColor: "#CD7F32",
    borderColor: "#CD7F32",
  },
  avatarText: {
    ...Typography.h3,
    color: Colors.dark.backgroundRoot,
  },
  podiumName: {
    ...Typography.caption,
    fontWeight: "600",
  },
  podiumPoints: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  podiumRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xs,
  },
  podiumRankText: {
    ...Typography.caption,
    color: Colors.dark.backgroundRoot,
    fontWeight: "700",
  },
  leaderboard: {
    marginBottom: Spacing.xl,
  },
  leaderboardTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.dark.backgroundDefault,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  currentUserItem: {
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  leaderboardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  rank: {
    ...Typography.bodyLarge,
    fontWeight: "700",
    width: 32,
    color: Colors.dark.textSecondary,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarSmallText: {
    ...Typography.bodyLarge,
    fontWeight: "600",
  },
  userName: {
    ...Typography.bodyLarge,
    fontWeight: "600",
  },
  leaderboardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  userPoints: {
    ...Typography.bodyLarge,
    fontWeight: "600",
    color: Colors.dark.primary,
  },
});
