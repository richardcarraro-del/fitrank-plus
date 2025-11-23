import { View, StyleSheet, Pressable, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { ScreenScrollView } from "@/components/ScreenScrollView";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
  const { setHasCompletedOnboarding } = useAuth();
  const navigation = useNavigation();

  const handleGetStarted = async () => {
    await setHasCompletedOnboarding(true);
    navigation.navigate("LoginModal" as never);
  };

  return (
    <LinearGradient
      colors={[Colors.dark.backgroundRoot, Colors.dark.backgroundDefault]}
      style={styles.container}
    >
      <ScreenScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
            contentFit="contain"
          />
          <ThemedText style={styles.title}>FitRank+</ThemedText>
          <ThemedText style={styles.tagline}>Treine. Compita. Evolua.</ThemedText>
        </View>

        <View style={styles.featuresContainer}>
          <FeatureCard
            icon="💪"
            title="Treinos Personalizados"
            description="IA cria treinos exclusivos baseados no seu perfil e objetivos"
          />
          <FeatureCard
            icon="🏆"
            title="Sistema de Ranking"
            description="Compita com outros atletas da sua academia e ganhe pontos"
          />
          <FeatureCard
            icon="📊"
            title="Acompanhe seu Progresso"
            description="Veja sua evolução com gráficos detalhados e conquistas"
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleGetStarted}
        >
          <LinearGradient
            colors={["#4CAF50", "#66BB6A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <ThemedText style={styles.buttonText}>Começar Agora</ThemedText>
          </LinearGradient>
        </Pressable>
      </ScreenScrollView>
    </LinearGradient>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureIconContainer}>
        <ThemedText style={styles.featureIcon}>{icon}</ThemedText>
      </View>
      <ThemedText style={styles.featureTitle}>{title}</ThemedText>
      <ThemedText style={styles.featureDescription}>{description}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xxl,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    marginBottom: Spacing.sm,
  },
  tagline: {
    ...Typography.bodyLarge,
    color: Colors.dark.textSecondary,
  },
  featuresContainer: {
    width: "100%",
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  featureCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTitle: {
    ...Typography.h3,
    marginBottom: Spacing.sm,
  },
  featureDescription: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
  },
  button: {
    width: "100%",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    marginBottom: Spacing.xl,
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
});
