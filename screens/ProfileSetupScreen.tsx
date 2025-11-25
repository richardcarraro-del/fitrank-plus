import { useState } from "react";
import { View, StyleSheet, Pressable, TextInput, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileSetupScreen() {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<"hypertrophy" | "weight_loss" | "endurance" | "beginner">("hypertrophy");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [timeAvailable, setTimeAvailable] = useState(30);
  const [weeklyFrequency, setWeeklyFrequency] = useState<2 | 3 | 4 | 5 | 6>(3);
  const [location, setLocation] = useState<"home" | "gym">("gym");

  const { updateProfile, setHasCompletedOnboarding } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    const selectedPlan = selectPlan(weeklyFrequency, goal);
    
    await updateProfile({
      goal,
      level,
      age: parseInt(age) || 25,
      weight: parseFloat(weight) || 70,
      height: parseFloat(height) || 170,
      timeAvailable,
      weeklyFrequency,
      location,
      selectedPlan,
    });
    
    await setHasCompletedOnboarding(true);
  };

  const selectPlan = (
    frequency: 2 | 3 | 4 | 5 | 6,
    userGoal: "hypertrophy" | "weight_loss" | "endurance" | "beginner"
  ): "ABC" | "ABCD" | "FullBody" | "UpperLower" => {
    switch (frequency) {
      case 2:
        return "FullBody";
      case 3:
        return "ABC";
      case 4:
        if (userGoal === "hypertrophy" || userGoal === "beginner") {
          return "ABCD";
        }
        return "UpperLower";
      case 5:
        return "ABCD";
      case 6:
        return "UpperLower";
      default:
        return "FullBody";
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <ThemedText style={styles.stepTitle}>Qual é seu objetivo?</ThemedText>
            <View style={styles.optionsContainer}>
              <OptionButton
                label="Hipertrofia"
                selected={goal === "hypertrophy"}
                onPress={() => setGoal("hypertrophy")}
              />
              <OptionButton
                label="Emagrecimento"
                selected={goal === "weight_loss"}
                onPress={() => setGoal("weight_loss")}
              />
              <OptionButton
                label="Resistência"
                selected={goal === "endurance"}
                onPress={() => setGoal("endurance")}
              />
              <OptionButton
                label="Iniciante"
                selected={goal === "beginner"}
                onPress={() => setGoal("beginner")}
              />
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <ThemedText style={styles.stepTitle}>Qual seu nível?</ThemedText>
            <View style={styles.optionsContainer}>
              <OptionButton
                label="Iniciante"
                selected={level === "beginner"}
                onPress={() => setLevel("beginner")}
              />
              <OptionButton
                label="Intermediário"
                selected={level === "intermediate"}
                onPress={() => setLevel("intermediate")}
              />
              <OptionButton
                label="Avançado"
                selected={level === "advanced"}
                onPress={() => setLevel("advanced")}
              />
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <ThemedText style={styles.stepTitle}>Dados Físicos</ThemedText>
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Idade</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="25"
                  placeholderTextColor={Colors.dark.textTertiary}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Peso (kg)</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="70"
                  placeholderTextColor={Colors.dark.textTertiary}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Altura (cm)</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="170"
                  placeholderTextColor={Colors.dark.textTertiary}
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContainer}>
            <ThemedText style={styles.stepTitle}>Tempo disponível por dia</ThemedText>
            <View style={styles.optionsContainer}>
              <OptionButton
                label="30 min"
                selected={timeAvailable === 30}
                onPress={() => setTimeAvailable(30)}
              />
              <OptionButton
                label="45 min"
                selected={timeAvailable === 45}
                onPress={() => setTimeAvailable(45)}
              />
              <OptionButton
                label="60 min"
                selected={timeAvailable === 60}
                onPress={() => setTimeAvailable(60)}
              />
            </View>
          </View>
        );
      case 5:
        return (
          <View style={styles.stepContainer}>
            <ThemedText style={styles.stepTitle}>Frequência semanal</ThemedText>
            <View style={styles.optionsContainer}>
              <OptionButton
                label="2x por semana"
                selected={weeklyFrequency === 2}
                onPress={() => setWeeklyFrequency(2)}
              />
              <OptionButton
                label="3x por semana"
                selected={weeklyFrequency === 3}
                onPress={() => setWeeklyFrequency(3)}
              />
              <OptionButton
                label="4x por semana"
                selected={weeklyFrequency === 4}
                onPress={() => setWeeklyFrequency(4)}
              />
              <OptionButton
                label="5x por semana"
                selected={weeklyFrequency === 5}
                onPress={() => setWeeklyFrequency(5)}
              />
              <OptionButton
                label="6x por semana"
                selected={weeklyFrequency === 6}
                onPress={() => setWeeklyFrequency(6)}
              />
            </View>
          </View>
        );
      case 6:
        return (
          <View style={styles.stepContainer}>
            <ThemedText style={styles.stepTitle}>Onde você treina?</ThemedText>
            <View style={styles.optionsContainer}>
              <OptionButton
                label="Em Casa"
                selected={location === "home"}
                onPress={() => setLocation("home")}
              />
              <OptionButton
                label="Na Academia"
                selected={location === "gym"}
                onPress={() => setLocation("gym")}
              />
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <LinearGradient
      colors={[Colors.dark.backgroundRoot, Colors.dark.backgroundDefault]}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <ThemedText style={styles.title}>Configure seu Perfil</ThemedText>
          <ThemedText style={styles.subtitle}>Passo {step} de 6</ThemedText>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / 6) * 100}%` }]} />
          </View>
        </View>

        {renderStep()}

        <View style={styles.buttonsContainer}>
          {step > 1 && (
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleBack}
            >
              <ThemedText style={styles.secondaryButtonText}>Voltar</ThemedText>
            </Pressable>
          )}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              step === 1 && styles.buttonFull,
            ]}
            onPress={handleNext}
          >
            <LinearGradient
              colors={["#00C853", "#00E676"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <ThemedText style={styles.buttonText}>
                {step === 6 ? "Finalizar" : "Próximo"}
              </ThemedText>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function OptionButton({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.optionButton,
        selected && styles.optionButtonSelected,
        pressed && styles.buttonPressed,
      ]}
      onPress={onPress}
    >
      <ThemedText style={[styles.optionButtonText, selected && styles.optionButtonTextSelected]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
  },
  progressContainer: {
    marginBottom: Spacing.xl,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.dark.primary,
  },
  stepContainer: {
    marginBottom: Spacing.xl,
  },
  stepTitle: {
    ...Typography.h2,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  optionsContainer: {
    gap: Spacing.md,
  },
  optionButton: {
    backgroundColor: Colors.dark.backgroundSecondary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionButtonSelected: {
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.backgroundDefault,
  },
  optionButtonText: {
    ...Typography.bodyLarge,
    textAlign: "center",
    color: Colors.dark.textSecondary,
  },
  optionButtonTextSelected: {
    color: Colors.dark.primary,
    fontWeight: "600",
  },
  inputGroup: {
    gap: Spacing.md,
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.dark.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: BorderRadius.sm,
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.md,
    color: Colors.dark.text,
    ...Typography.bodyLarge,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  button: {
    flex: 1,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  buttonFull: {
    flex: 1,
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
    flex: 1,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    ...Typography.button,
    color: Colors.dark.textSecondary,
  },
});
