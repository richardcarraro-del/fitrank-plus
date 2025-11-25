import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Pressable, Alert, ActivityIndicator } from 'react-native';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useSupabaseAuth';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { openStripeCheckout, checkPremiumStatus, checkPremiumStatusWithRetry } from '@/lib/stripe';

const PREMIUM_FEATURES = [
  { icon: 'repeat' as const, title: 'Treinos Ilimitados', description: 'Gere quantos treinos quiser, sem limites' },
  { icon: 'zap' as const, title: 'Sem Anuncios', description: 'Experiencia limpa e sem interrupcoes' },
  { icon: 'award' as const, title: 'Treinos Avancados', description: 'Acesso a programas especializados' },
  { icon: 'bar-chart-2' as const, title: 'Estatisticas Detalhadas', description: 'Analise completa do seu progresso' },
  { icon: 'headphones' as const, title: 'Suporte Prioritario', description: 'Atendimento exclusivo e rapido' },
  { icon: 'star' as const, title: 'Recursos Exclusivos', description: 'Acesso antecipado a novidades' },
];

export default function PremiumScreen() {
  const { user, refreshProfile } = useAuth();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        refreshPremiumStatus();
      }
    }, [user?.id])
  );

  const refreshPremiumStatus = async (useRetry: boolean = false): Promise<boolean> => {
    if (!user?.id) return false;
    
    setIsCheckingStatus(true);
    try {
      const isPremium = useRetry 
        ? await checkPremiumStatusWithRetry(user.id, 5, 2000)
        : await checkPremiumStatus(user.id);
        
      if (isPremium && !user.isPremium) {
        await refreshProfile();
        Alert.alert(
          'Parabens!',
          'Sua assinatura Premium foi ativada com sucesso!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return true;
      }
      return isPremium;
    } catch (error) {
      console.error('Error refreshing premium status:', error);
      return false;
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user?.id || !user?.email) {
      Alert.alert('Erro', 'Voce precisa estar logado para assinar.');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await openStripeCheckout(user.id, user.email);
      
      if (result.error) {
        Alert.alert('Aviso', result.error);
        return;
      }
      
      const premiumActivated = await refreshPremiumStatus(true);
      
      if (!premiumActivated) {
        Alert.alert(
          'Verificando pagamento',
          'Se voce completou o pagamento, clique em "Restaurar Compras" para ativar seu Premium. O processamento pode levar alguns segundos.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Subscription error:', error);
      Alert.alert('Erro', 'Nao foi possivel processar sua assinatura. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    if (!user?.id) {
      Alert.alert('Erro', 'Voce precisa estar logado.');
      return;
    }

    setIsCheckingStatus(true);
    try {
      const isPremium = await checkPremiumStatus(user.id);
      if (isPremium) {
        await refreshProfile();
        Alert.alert('Sucesso', 'Sua assinatura Premium foi restaurada!');
      } else {
        Alert.alert('Nenhuma assinatura', 'Nao encontramos uma assinatura ativa para sua conta.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel verificar sua assinatura.');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  if (user?.isPremium) {
    return (
      <ScreenScrollView contentContainerStyle={styles.content}>
        <View style={styles.premiumActiveContainer}>
          <LinearGradient
            colors={[Colors.dark.primary, '#00E676']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.premiumActiveBadge}
          >
            <Feather name="check-circle" size={48} color={Colors.dark.backgroundRoot} />
          </LinearGradient>
          <ThemedText style={styles.premiumActiveTitle}>Voce ja e Premium!</ThemedText>
          <ThemedText style={styles.premiumActiveSubtitle}>
            Aproveite todos os beneficios exclusivos
          </ThemedText>
          
          <View style={styles.activeFeaturesGrid}>
            {PREMIUM_FEATURES.map((feature, index) => (
              <View key={index} style={styles.activeFeatureItem}>
                <Feather name={feature.icon} size={20} color={Colors.dark.primary} />
                <ThemedText style={styles.activeFeatureText}>{feature.title}</ThemedText>
              </View>
            ))}
          </View>

          <Pressable
            style={styles.manageButton}
            onPress={() => Alert.alert('Gerenciar Assinatura', 'Voce pode gerenciar sua assinatura nas configuracoes do seu dispositivo.')}
          >
            <ThemedText style={styles.manageButtonText}>Gerenciar Assinatura</ThemedText>
          </Pressable>
        </View>
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <LinearGradient
          colors={['#FFD700', '#FFA500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.crownBadge}
        >
          <Feather name="award" size={40} color={Colors.dark.backgroundRoot} />
        </LinearGradient>
        <ThemedText style={styles.title}>FitRank+ Premium</ThemedText>
        <ThemedText style={styles.subtitle}>
          Desbloqueie todo o potencial do seu treino
        </ThemedText>
      </View>

      <View style={styles.featuresContainer}>
        {PREMIUM_FEATURES.map((feature, index) => (
          <View key={index} style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Feather name={feature.icon} size={24} color={Colors.dark.primary} />
            </View>
            <View style={styles.featureContent}>
              <ThemedText style={styles.featureTitle}>{feature.title}</ThemedText>
              <ThemedText style={styles.featureDescription}>{feature.description}</ThemedText>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.pricingCard}>
        <View style={styles.pricingHeader}>
          <ThemedText style={styles.pricingLabel}>Assinatura Mensal</ThemedText>
          <View style={styles.priceContainer}>
            <ThemedText style={styles.currency}>R$</ThemedText>
            <ThemedText style={styles.price}>29</ThemedText>
            <ThemedText style={styles.cents}>,90</ThemedText>
            <ThemedText style={styles.period}>/mes</ThemedText>
          </View>
        </View>
        <View style={styles.pricingBenefits}>
          <View style={styles.benefitRow}>
            <Feather name="check" size={16} color={Colors.dark.success} />
            <ThemedText style={styles.benefitText}>Cancele quando quiser</ThemedText>
          </View>
          <View style={styles.benefitRow}>
            <Feather name="check" size={16} color={Colors.dark.success} />
            <ThemedText style={styles.benefitText}>Sem taxas ocultas</ThemedText>
          </View>
          <View style={styles.benefitRow}>
            <Feather name="check" size={16} color={Colors.dark.success} />
            <ThemedText style={styles.benefitText}>Acesso imediato</ThemedText>
          </View>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.subscribeButton,
          pressed && styles.buttonPressed,
          isLoading && styles.buttonDisabled,
        ]}
        onPress={handleSubscribe}
        disabled={isLoading}
      >
        <LinearGradient
          colors={[Colors.dark.primary, '#00E676']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.subscribeGradient}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.dark.backgroundRoot} />
          ) : (
            <>
              <ThemedText style={styles.subscribeText}>Assinar Agora</ThemedText>
              <Feather name="arrow-right" size={20} color={Colors.dark.backgroundRoot} />
            </>
          )}
        </LinearGradient>
      </Pressable>

      <Pressable
        style={styles.restoreButton}
        onPress={handleRestorePurchases}
      >
        <ThemedText style={styles.restoreText}>Restaurar Compras</ThemedText>
      </Pressable>

      <ThemedText style={styles.termsText}>
        Ao assinar, voce concorda com nossos Termos de Uso e Politica de Privacidade.
        A cobranca sera feita mensalmente ate o cancelamento.
      </ThemedText>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  crownBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h1,
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: Spacing.xl,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.dark.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 2,
  },
  featureDescription: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  pricingCard: {
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
  },
  pricingHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  pricingLabel: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  currency: {
    ...Typography.bodyLarge,
    color: Colors.dark.text,
    marginTop: 4,
  },
  price: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  cents: {
    ...Typography.bodyLarge,
    color: Colors.dark.text,
    marginTop: 4,
  },
  period: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
    marginLeft: Spacing.xs,
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  pricingBenefits: {
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: Spacing.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  benefitText: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
    marginLeft: Spacing.sm,
  },
  subscribeButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  subscribeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  subscribeText: {
    ...Typography.button,
    fontWeight: '700',
    color: Colors.dark.backgroundRoot,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  restoreText: {
    ...Typography.caption,
    color: Colors.dark.primary,
  },
  termsText: {
    fontSize: 11,
    color: Colors.dark.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
  premiumActiveContainer: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  premiumActiveBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  premiumActiveTitle: {
    ...Typography.h2,
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  premiumActiveSubtitle: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  activeFeaturesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  activeFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.backgroundSecondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  activeFeatureText: {
    ...Typography.caption,
    color: Colors.dark.text,
  },
  manageButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: BorderRadius.lg,
  },
  manageButtonText: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
  },
});
