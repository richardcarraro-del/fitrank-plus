import { useCallback } from "react";
import { StyleSheet, View, Alert, Pressable } from "react-native";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/hooks/useAuth";
import { storage } from "@/utils/storage";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useState } from "react";

export default function ProfileScreen() {
  const { user, logout, updateProfile } = useAuth();
  const navigation = useNavigation();
  const [achievements, setAchievements] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadAchievements();
    }, [])
  );

  const loadAchievements = async () => {
    const userAchievements = await storage.getAchievements();
    setAchievements(userAchievements);
  };

  const handleLogout = () => {
    Alert.alert("Sair", "Tem certeza que deseja sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await logout();
          navigation.navigate("LoginModal" as never);
        },
      },
    ]);
  };

  const handleUpgradeToPremium = () => {
    Alert.alert(
      "FitRank+ Premium",
      "Desbloqueie todos os recursos:\n\n• Treinos ilimitados\n• Treinos avançados\n• Dietas automatizadas\n• Histórico completo\n• Sem anúncios\n\nApenas R$ 29,90/mês",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Assinar Agora",
          onPress: async () => {
            await updateProfile({ isPremium: true });
            Alert.alert("Sucesso!", "Você agora é Premium!");
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.loading}>
        <ThemedText>Carregando...</ThemedText>
      </View>
    );
  }

  return (
    <ScreenScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <ThemedText style={styles.avatar}>{user.avatar}</ThemedText>
        </View>
        <ThemedText style={styles.name}>{user.name}</ThemedText>
        <ThemedText style={styles.details}>
          {user.age} anos • {user.academy?.name || "Sem academia"}
        </ThemedText>
      </View>

      {!user.isPremium && (
        <Pressable
          style={({ pressed }) => [
            styles.premiumCard,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleUpgradeToPremium}
        >
          <LinearGradient
            colors={["#FFD700", "#FFA500"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.premiumGradient}
          >
            <Feather name="zap" size={24} color={Colors.dark.backgroundRoot} />
            <View style={styles.premiumContent}>
              <ThemedText style={styles.premiumTitle}>Upgrade para Premium</ThemedText>
              <ThemedText style={styles.premiumSubtitle}>
                Treinos ilimitados, sem anúncios e muito mais
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={24} color={Colors.dark.backgroundRoot} />
          </LinearGradient>
        </Pressable>
      )}

      {user.isPremium && (
        <View style={styles.premiumBadge}>
          <Feather name="award" size={20} color={Colors.dark.premium} />
          <ThemedText style={styles.premiumBadgeText}>Membro Premium</ThemedText>
        </View>
      )}

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Conquistas</ThemedText>
        <View style={styles.achievementsGrid}>
          {achievements.slice(0, 6).map((achievement) => (
            <View key={achievement.id} style={styles.achievementItem}>
              <Image
                source={require(`@/assets/images/badges/${achievement.icon}.png`)}
                style={[
                  styles.achievementIcon,
                  !achievement.earned && styles.achievementIconLocked,
                ]}
              />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Configurações</ThemedText>
        <View style={styles.settingsList}>
          <SettingItem icon="user" label="Editar Perfil" onPress={() => {}} />
          <SettingItem icon="bell" label="Notificações" onPress={() => {}} />
          <SettingItem icon="shield" label="Privacidade" onPress={() => {}} />
          <SettingItem icon="help-circle" label="Ajuda" onPress={() => {}} />
          <SettingItem
            icon="log-out"
            label="Sair"
            onPress={handleLogout}
            isDestructive
          />
        </View>
      </View>
    </ScreenScrollView>
  );
}

function SettingItem({
  icon,
  label,
  onPress,
  isDestructive,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  isDestructive?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingItem,
        pressed && styles.buttonPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.settingLeft}>
        <Feather
          name={icon as any}
          size={20}
          color={isDestructive ? Colors.dark.error : Colors.dark.textSecondary}
        />
        <ThemedText
          style={[styles.settingLabel, isDestructive && styles.destructiveText]}
        >
          {label}
        </ThemedText>
      </View>
      <Feather name="chevron-right" size={20} color={Colors.dark.textTertiary} />
    </Pressable>
  );
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
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  avatar: {
    ...Typography.h1,
  },
  name: {
    ...Typography.h2,
    marginBottom: Spacing.xs,
  },
  details: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
  },
  premiumCard: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  premiumGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  premiumContent: {
    flex: 1,
  },
  premiumTitle: {
    ...Typography.h3,
    color: Colors.dark.backgroundRoot,
    marginBottom: Spacing.xs,
  },
  premiumSubtitle: {
    ...Typography.caption,
    color: Colors.dark.backgroundRoot,
    opacity: 0.8,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.dark.backgroundSecondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  premiumBadgeText: {
    ...Typography.bodyLarge,
    fontWeight: "600",
    color: Colors.dark.premium,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  achievementItem: {
    width: (100 - Spacing.lg * 2 - Spacing.md * 2) / 3,
  },
  achievementIcon: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: BorderRadius.sm,
  },
  achievementIconLocked: {
    opacity: 0.3,
  },
  settingsList: {
    gap: Spacing.xs,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.dark.backgroundDefault,
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  settingLabel: {
    ...Typography.bodyLarge,
  },
  destructiveText: {
    color: Colors.dark.error,
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
