import { useState, useCallback } from "react";
import { StyleSheet, View, Alert, Pressable, Modal, FlatList, ScrollView, TextInput } from "react-native";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { storage, UserStats, Academy, Achievement } from "@/utils/storage";
import { selectPlanBasedOnFrequency } from "@/utils/workoutGenerator";

export default function ProfileScreen() {
  const { user, logout, updateProfile } = useAuth();
  const navigation = useNavigation();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showAcademyModal, setShowAcademyModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editAge, setEditAge] = useState(user?.age.toString() || "");
  const [editWeight, setEditWeight] = useState(user?.weight.toString() || "");
  const [editHeight, setEditHeight] = useState(user?.height.toString() || "");

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      
      const loadDataSafely = async () => {
        if (!user?.id) return;
        
        const userStats = await storage.getUserStats(user.id);
        const academyList = await storage.getAcademies();
        const achievementList = await storage.getAchievements(user.id);
        
        if (isMounted) {
          setStats(userStats);
          setAcademies(academyList);
          setAchievements(achievementList);
        }
      };
      
      loadDataSafely();
      
      return () => {
        isMounted = false;
      };
    }, [user?.id])
  );

  const loadData = async () => {
    if (!user?.id) return;
    
    const userStats = await storage.getUserStats(user.id);
    const academyList = await storage.getAcademies();
    const achievementList = await storage.getAchievements(user.id);
    setStats(userStats);
    setAcademies(academyList);
    setAchievements(achievementList);
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
      "Desbloqueie todos os recursos:\n\n• Treinos ilimitados\n• Treinos avançados personalizados\n• Histórico completo de treinos\n• Sem anúncios\n• Suporte prioritário\n\nApenas R$ 29,90/mês",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Assinar Agora",
          onPress: async () => {
            await updateProfile({ isPremium: true });
            await loadData();
            Alert.alert("Sucesso!", "Você agora é Premium! Aproveite seus treinos ilimitados.");
          },
        },
      ]
    );
  };

  const handleSelectAcademy = async (academy: Academy) => {
    await updateProfile({ academy });
    await loadData();
    setShowAcademyModal(false);
    Alert.alert("Academia atualizada", `Agora você faz parte de ${academy.name}!`);
  };

  const handleUpdateGoal = async (newGoal: "hypertrophy" | "weight_loss" | "endurance" | "beginner") => {
    if (!user) return;
    
    const currentFrequency = user.weeklyFrequency || 3;
    const newPlan = selectPlanBasedOnFrequency(currentFrequency, newGoal);
    await updateProfile({ goal: newGoal, selectedPlan: newPlan });
    await loadData();
    setShowGoalModal(false);
    Alert.alert(
      "Objetivo atualizado",
      `Seu plano de treino foi atualizado para ${newPlan}!`
    );
  };

  const handleUpdateFrequency = async (newFrequency: 2 | 3 | 4 | 5 | 6) => {
    if (!user) return;
    
    const currentGoal = user.goal || 'beginner';
    const newPlan = selectPlanBasedOnFrequency(newFrequency, currentGoal);
    await updateProfile({ weeklyFrequency: newFrequency, selectedPlan: newPlan });
    await loadData();
    setShowFrequencyModal(false);
    Alert.alert(
      "Frequência atualizada",
      `Seu plano de treino foi atualizado para ${newPlan}!`
    );
  };

  const getGoalLabel = (goal: "hypertrophy" | "weight_loss" | "endurance" | "beginner") => {
    const labels = {
      hypertrophy: "Hipertrofia",
      weight_loss: "Emagrecimento",
      endurance: "Resistência",
      beginner: "Iniciante",
    };
    return labels[goal];
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert("Erro", "Por favor, preencha seu nome");
      return;
    }

    const age = parseInt(editAge) || 25;
    const weight = parseInt(editWeight) || 70;
    const height = parseInt(editHeight) || 170;

    await updateProfile({
      name: editName,
      age,
      weight,
      height,
    });
    
    setShowEditProfileModal(false);
    Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
  };

  const handleOpenEditProfile = () => {
    setEditName(user?.name || "");
    setEditAge(user?.age.toString() || "");
    setEditWeight(user?.weight.toString() || "");
    setEditHeight(user?.height.toString() || "");
    setShowEditProfileModal(true);
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
        <ThemedText style={styles.sectionTitle}>Estatísticas</ThemedText>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Feather name="zap" size={24} color={Colors.dark.primary} />
            <ThemedText style={styles.statValue}>{stats?.totalPoints.toLocaleString() || "0"}</ThemedText>
            <ThemedText style={styles.statLabel}>Pontos</ThemedText>
          </View>
          <View style={styles.statCard}>
            <Feather name="activity" size={24} color={Colors.dark.primary} />
            <ThemedText style={styles.statValue}>{stats?.totalWorkouts || "0"}</ThemedText>
            <ThemedText style={styles.statLabel}>Treinos</ThemedText>
          </View>
          <View style={styles.statCard}>
            <Feather name="trending-up" size={24} color={Colors.dark.primary} />
            <ThemedText style={styles.statValue}>{stats?.currentStreak || "0"}</ThemedText>
            <ThemedText style={styles.statLabel}>Sequência</ThemedText>
          </View>
          <View style={styles.statCard}>
            <Feather name="award" size={24} color={Colors.dark.primary} />
            <ThemedText style={styles.statValue}>{stats?.bestStreak || "0"}</ThemedText>
            <ThemedText style={styles.statLabel}>Melhor Seq.</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="award" size={24} color={Colors.dark.primary} />
          <ThemedText style={styles.sectionTitle}>Conquistas</ThemedText>
        </View>
        <View style={styles.achievementsGrid}>
          {achievements.slice(0, 6).map((achievement) => (
            <View
              key={achievement.id}
              style={[
                styles.achievementCard,
                !achievement.earned && styles.achievementLocked,
              ]}
            >
              <View style={[
                styles.achievementIcon,
                achievement.earned && styles.achievementIconEarned,
              ]}>
                {achievement.earned ? (
                  <Feather name="award" size={28} color={Colors.dark.premium} />
                ) : (
                  <Feather name="lock" size={24} color={Colors.dark.textTertiary} />
                )}
              </View>
              <ThemedText style={[
                styles.achievementName,
                !achievement.earned && styles.achievementLockedText,
              ]}>
                {achievement.name}
              </ThemedText>
              <ThemedText style={styles.achievementDesc} numberOfLines={2}>
                {achievement.description}
              </ThemedText>
              {achievement.earned && achievement.earnedDate && (
                <View style={styles.achievementDateBadge}>
                  <Feather name="check-circle" size={12} color={Colors.dark.success} />
                  <ThemedText style={styles.achievementDate}>
                    {new Date(achievement.earnedDate).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </ThemedText>
                </View>
              )}
            </View>
          ))}
        </View>
        <View style={styles.achievementsSummaryCard}>
          <Feather name="star" size={20} color={Colors.dark.primary} />
          <ThemedText style={styles.achievementsSummary}>
            {achievements.filter(a => a.earned).length} de {achievements.length} conquistas desbloqueadas
          </ThemedText>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Academia</ThemedText>
        <Pressable
          style={({ pressed }) => [
            styles.academyCard,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => setShowAcademyModal(true)}
        >
          <View style={styles.academyInfo}>
            <Feather name="home" size={20} color={Colors.dark.primary} />
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.academyName}>
                {user.academy?.name || "Selecionar Academia"}
              </ThemedText>
              {user.academy?.address && (
                <ThemedText style={styles.academyAddress}>{user.academy.address}</ThemedText>
              )}
            </View>
          </View>
          <Feather name="chevron-right" size={20} color={Colors.dark.textTertiary} />
        </Pressable>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Preferências de Treino</ThemedText>
        <View style={styles.trainingPreferences}>
          <Pressable
            style={({ pressed }) => [
              styles.preferenceCard,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => setShowGoalModal(true)}
          >
            <View style={styles.preferenceInfo}>
              <Feather name="target" size={20} color={Colors.dark.primary} />
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.preferenceLabel}>Objetivo</ThemedText>
                <ThemedText style={styles.preferenceValue}>
                  {getGoalLabel(user.goal)}
                </ThemedText>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.dark.textTertiary} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.preferenceCard,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => setShowFrequencyModal(true)}
          >
            <View style={styles.preferenceInfo}>
              <Feather name="calendar" size={20} color={Colors.dark.primary} />
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.preferenceLabel}>Frequência Semanal</ThemedText>
                <ThemedText style={styles.preferenceValue}>
                  {user.weeklyFrequency}x por semana
                </ThemedText>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.dark.textTertiary} />
          </Pressable>

          {user.selectedPlan && (
            <View style={styles.planBadge}>
              <Feather name="layers" size={16} color={Colors.dark.success} />
              <ThemedText style={styles.planBadgeText}>
                Plano: {user.selectedPlan}
              </ThemedText>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Configurações</ThemedText>
        <View style={styles.settingsList}>
          <SettingItem icon="user" label="Editar Perfil" onPress={handleOpenEditProfile} />
          <SettingItem 
            icon="bell" 
            label="Notificações" 
            onPress={() => Alert.alert("Notificações", "Em breve você poderá configurar notificações personalizadas!")} 
          />
          <SettingItem 
            icon="shield" 
            label="Privacidade" 
            onPress={() => Alert.alert("Privacidade", "Em breve você poderá gerenciar suas configurações de privacidade!")} 
          />
          <SettingItem 
            icon="help-circle" 
            label="Ajuda" 
            onPress={() => Alert.alert("Ajuda", "Precisa de ajuda?\n\nEntre em contato: suporte@fitrank.com")} 
          />
          <SettingItem
            icon="log-out"
            label="Sair"
            onPress={handleLogout}
            isDestructive
          />
        </View>
      </View>

      <Modal
        visible={showAcademyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAcademyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Selecionar Academia</ThemedText>
              <Pressable onPress={() => setShowAcademyModal(false)}>
                <Feather name="x" size={24} color={Colors.dark.text} />
              </Pressable>
            </View>
            <FlatList
              data={academies}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.academyItem,
                    pressed && styles.buttonPressed,
                    item.id === user.academy?.id && styles.academyItemSelected,
                  ]}
                  onPress={() => handleSelectAcademy(item)}
                >
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.academyItemName}>{item.name}</ThemedText>
                    <ThemedText style={styles.academyItemAddress}>{item.address}</ThemedText>
                    <ThemedText style={styles.academyItemMembers}>
                      {item.memberCount} membros
                    </ThemedText>
                  </View>
                  {item.id === user.academy?.id && (
                    <Feather name="check" size={20} color={Colors.dark.success} />
                  )}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showGoalModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGoalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Selecionar Objetivo</ThemedText>
              <Pressable onPress={() => setShowGoalModal(false)}>
                <Feather name="x" size={24} color={Colors.dark.text} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll}>
              {(["hypertrophy", "weight_loss", "endurance", "beginner"] as const).map((goal) => (
                <Pressable
                  key={goal}
                  style={({ pressed }) => [
                    styles.optionItem,
                    pressed && styles.buttonPressed,
                    user.goal === goal && styles.optionItemSelected,
                  ]}
                  onPress={() => handleUpdateGoal(goal)}
                >
                  <ThemedText style={styles.optionItemText}>
                    {getGoalLabel(goal)}
                  </ThemedText>
                  {user.goal === goal && (
                    <Feather name="check" size={20} color={Colors.dark.success} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showFrequencyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFrequencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Frequência Semanal</ThemedText>
              <Pressable onPress={() => setShowFrequencyModal(false)}>
                <Feather name="x" size={24} color={Colors.dark.text} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll}>
              {([2, 3, 4, 5, 6] as const).map((freq) => (
                <Pressable
                  key={freq}
                  style={({ pressed }) => [
                    styles.optionItem,
                    pressed && styles.buttonPressed,
                    user.weeklyFrequency === freq && styles.optionItemSelected,
                  ]}
                  onPress={() => handleUpdateFrequency(freq)}
                >
                  <ThemedText style={styles.optionItemText}>
                    {freq}x por semana
                  </ThemedText>
                  {user.weeklyFrequency === freq && (
                    <Feather name="check" size={20} color={Colors.dark.success} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showEditProfileModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Editar Perfil</ThemedText>
              <Pressable onPress={() => setShowEditProfileModal(false)}>
                <Feather name="x" size={24} color={Colors.dark.text} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll}>
              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>Nome</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Seu nome"
                  placeholderTextColor={Colors.dark.textTertiary}
                  value={editName}
                  onChangeText={setEditName}
                />
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>Idade</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="25"
                  placeholderTextColor={Colors.dark.textTertiary}
                  value={editAge}
                  onChangeText={setEditAge}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>Peso (kg)</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="70"
                  placeholderTextColor={Colors.dark.textTertiary}
                  value={editWeight}
                  onChangeText={setEditWeight}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>Altura (cm)</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="170"
                  placeholderTextColor={Colors.dark.textTertiary}
                  value={editHeight}
                  onChangeText={setEditHeight}
                  keyboardType="number-pad"
                />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleSaveProfile}
              >
                <LinearGradient
                  colors={["#4CAF50", "#66BB6A"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.saveButtonGradient}
                >
                  <ThemedText style={styles.saveButtonText}>Salvar</ThemedText>
                </LinearGradient>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    marginBottom: Spacing.xxl,
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundDefault,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  statValue: {
    ...Typography.h2,
    color: Colors.dark.primary,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
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
  academyCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.dark.backgroundDefault,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  academyInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  academyName: {
    ...Typography.bodyLarge,
    fontWeight: "600",
    marginBottom: 2,
  },
  academyAddress: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.dark.backgroundRoot,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.lg,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    ...Typography.h2,
  },
  academyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  academyItemSelected: {
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  academyItemName: {
    ...Typography.bodyLarge,
    fontWeight: "600",
    marginBottom: 4,
  },
  academyItemAddress: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
    marginBottom: 2,
  },
  academyItemMembers: {
    ...Typography.caption,
    color: Colors.dark.textTertiary,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  achievementCard: {
    width: "48%",
    backgroundColor: Colors.dark.backgroundDefault,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.dark.premium,
    alignItems: "center",
    gap: Spacing.sm,
  },
  achievementLocked: {
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.backgroundDefault,
    opacity: 0.5,
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  achievementIconEarned: {
    backgroundColor: "rgba(255, 215, 0, 0.15)",
  },
  achievementName: {
    ...Typography.body,
    fontWeight: "700",
    textAlign: "center",
  },
  achievementLockedText: {
    color: Colors.dark.textTertiary,
  },
  achievementDesc: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
    textAlign: "center",
  },
  achievementDateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.dark.backgroundSecondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  achievementDate: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.dark.success,
    fontWeight: "600",
  },
  achievementsSummaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.dark.backgroundSecondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  achievementsSummary: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
    fontWeight: "500",
  },
  trainingPreferences: {
    gap: Spacing.md,
  },
  preferenceCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.dark.backgroundDefault,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  preferenceInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  preferenceLabel: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  preferenceValue: {
    ...Typography.bodyLarge,
    fontWeight: "600",
  },
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.dark.backgroundSecondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.dark.success,
  },
  planBadgeText: {
    ...Typography.caption,
    fontWeight: "600",
    color: Colors.dark.success,
  },
  modalScroll: {
    paddingHorizontal: Spacing.lg,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  optionItemSelected: {
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  optionItemText: {
    ...Typography.bodyLarge,
    fontWeight: "500",
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.dark.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    color: Colors.dark.text,
    ...Typography.bodyLarge,
  },
  saveButton: {
    width: "100%",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  saveButtonGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    ...Typography.button,
    color: Colors.dark.buttonText,
  },
});
