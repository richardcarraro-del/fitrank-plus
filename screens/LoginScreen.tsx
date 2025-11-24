import { useState } from "react";
import { View, StyleSheet, Pressable, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, signup, loginWithGoogle, user } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && (!name || !confirmPassword))) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Erro", "Por favor, insira um email válido");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erro", "A senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
      
      if (!isLogin) {
        navigation.navigate("ProfileSetupModal" as never);
      } else {
        navigation.navigate("Main" as never);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Falha ao autenticar";
      Alert.alert("Erro", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigation.navigate("Main" as never);
    } catch (error: any) {
      Alert.alert("Erro", error?.message || "Falha ao fazer login com Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.dark.backgroundRoot, Colors.dark.backgroundDefault]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
            contentFit="contain"
          />
          <ThemedText style={styles.title}>FitRank+</ThemedText>
          <ThemedText style={styles.subtitle}>
            {isLogin ? "Bem-vindo de volta!" : "Crie sua conta"}
          </ThemedText>
        </View>

        <View style={styles.form}>
          {!isLogin && (
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Nome</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Seu nome"
                placeholderTextColor={Colors.dark.textTertiary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor={Colors.dark.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Senha</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.dark.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {!isLogin && (
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Confirmar Senha</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.dark.textTertiary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <LinearGradient
              colors={["#4CAF50", "#66BB6A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <ThemedText style={styles.buttonText}>
                {loading ? "Carregando..." : isLogin ? "Entrar" : "Criar Conta"}
              </ThemedText>
            </LinearGradient>
          </Pressable>

          {isLogin && (
            <>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <ThemedText style={styles.dividerText}>ou</ThemedText>
                <View style={styles.dividerLine} />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.googleButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleGoogleSignIn}
                disabled={loading}
              >
                <Feather name="chrome" size={20} color={Colors.dark.text} />
                <ThemedText style={styles.googleButtonText}>
                  Continuar com Google
                </ThemedText>
              </Pressable>
            </>
          )}

          <Pressable onPress={() => setIsLogin(!isLogin)}>
            <ThemedText style={styles.switchText}>
              {isLogin ? "Não tem uma conta? Criar conta" : "Já tem uma conta? Entrar"}
            </ThemedText>
          </Pressable>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
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
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h1,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodyLarge,
    color: Colors.dark.textSecondary,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: Spacing.lg,
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
  button: {
    width: "100%",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
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
  switchText: {
    ...Typography.body,
    color: Colors.dark.primary,
    textAlign: "center",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.dark.border,
  },
  dividerText: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
    marginHorizontal: Spacing.md,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dark.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: BorderRadius.xl,
    height: Spacing.buttonHeight,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  googleButtonText: {
    ...Typography.button,
    color: Colors.dark.text,
  },
});
