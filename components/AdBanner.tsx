import { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { ThemedText } from './ThemedText';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useAuth } from '@/hooks/useSupabaseAuth';

type AdBannerProps = {
  style?: object;
};

export function AdBanner({ style }: AdBannerProps) {
  const { user } = useAuth();
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  if (user?.isPremium) {
    return null;
  }

  if (Platform.OS === 'web') {
    return null;
  }

  if (adError) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.adPlaceholder}>
        <ThemedText style={styles.adText}>Ad Space</ThemedText>
        <ThemedText style={styles.adSubtext}>Upgrade to Premium to remove ads</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  adPlaceholder: {
    width: '100%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.backgroundTertiary,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderStyle: 'dashed',
  },
  adText: {
    fontSize: 12,
    color: Colors.dark.textTertiary,
    fontWeight: '600',
  },
  adSubtext: {
    fontSize: 10,
    color: Colors.dark.textTertiary,
    marginTop: 2,
  },
});
