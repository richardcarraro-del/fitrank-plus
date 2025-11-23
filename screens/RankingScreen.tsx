import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { ScreenScrollView } from "@/components/ScreenScrollView";

const mockRankingData = [
  { rank: 1, name: "João Silva", points: 12500, avatar: "1" },
  { rank: 2, name: "Maria Santos", points: 11200, avatar: "2" },
  { rank: 3, name: "Pedro Oliveira", points: 10800, avatar: "3" },
  { rank: 4, name: "Ana Costa", points: 9500, avatar: "4" },
  { rank: 5, name: "Carlos Souza", points: 8700, avatar: "5" },
  { rank: 6, name: "Juliana Lima", points: 7900, avatar: "6" },
  { rank: 7, name: "Rafael Martins", points: 7200, avatar: "7" },
  { rank: 8, name: "Você", points: 6800, avatar: "1", isCurrentUser: true },
];

export default function RankingScreen() {
  return (
    <ScreenScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <ThemedText style={styles.academyName}>SmartFit Centro</ThemedText>
        <ThemedText style={styles.period}>Ranking do Mês</ThemedText>
      </View>

      <View style={styles.podium}>
        <View style={styles.podiumPosition}>
          <View style={[styles.podiumAvatar, styles.silverAvatar]}>
            <ThemedText style={styles.avatarText}>2</ThemedText>
          </View>
          <ThemedText style={styles.podiumName}>Maria S.</ThemedText>
          <ThemedText style={styles.podiumPoints}>11.2k</ThemedText>
          <View style={[styles.podiumRank, { backgroundColor: "#C0C0C0" }]}>
            <ThemedText style={styles.podiumRankText}>2º</ThemedText>
          </View>
        </View>

        <View style={[styles.podiumPosition, styles.firstPlace]}>
          <View style={[styles.podiumAvatar, styles.goldAvatar]}>
            <ThemedText style={styles.avatarText}>1</ThemedText>
          </View>
          <ThemedText style={styles.podiumName}>João S.</ThemedText>
          <ThemedText style={styles.podiumPoints}>12.5k</ThemedText>
          <View style={[styles.podiumRank, { backgroundColor: Colors.dark.premium }]}>
            <Feather name="award" size={16} color={Colors.dark.backgroundRoot} />
          </View>
        </View>

        <View style={styles.podiumPosition}>
          <View style={[styles.podiumAvatar, styles.bronzeAvatar]}>
            <ThemedText style={styles.avatarText}>3</ThemedText>
          </View>
          <ThemedText style={styles.podiumName}>Pedro O.</ThemedText>
          <ThemedText style={styles.podiumPoints}>10.8k</ThemedText>
          <View style={[styles.podiumRank, { backgroundColor: "#CD7F32" }]}>
            <ThemedText style={styles.podiumRankText}>3º</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.leaderboard}>
        <ThemedText style={styles.leaderboardTitle}>Classificação Completa</ThemedText>
        {mockRankingData.map((user) => (
          <View
            key={user.rank}
            style={[
              styles.leaderboardItem,
              user.isCurrentUser && styles.currentUserItem,
            ]}
          >
            <View style={styles.leaderboardLeft}>
              <ThemedText style={styles.rank}>#{user.rank}</ThemedText>
              <View style={styles.avatar}>
                <ThemedText style={styles.avatarSmallText}>{user.avatar}</ThemedText>
              </View>
              <ThemedText style={styles.userName}>{user.name}</ThemedText>
            </View>
            <View style={styles.leaderboardRight}>
              <Feather name="zap" size={16} color={Colors.dark.primary} />
              <ThemedText style={styles.userPoints}>{user.points.toLocaleString()}</ThemedText>
            </View>
          </View>
        ))}
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
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
