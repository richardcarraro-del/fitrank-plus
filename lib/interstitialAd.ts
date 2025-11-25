import { Platform } from 'react-native';

let interstitialReady = false;
let lastAdShown = 0;
const AD_COOLDOWN_MS = 60000;

export async function loadInterstitialAd(): Promise<void> {
  if (Platform.OS === 'web') return;
  
  try {
    interstitialReady = true;
  } catch (error) {
    console.error('Failed to load interstitial ad:', error);
    interstitialReady = false;
  }
}

export async function showInterstitialAd(isPremium: boolean): Promise<boolean> {
  if (isPremium) return false;
  if (Platform.OS === 'web') return false;
  
  const now = Date.now();
  if (now - lastAdShown < AD_COOLDOWN_MS) {
    return false;
  }
  
  if (!interstitialReady) {
    await loadInterstitialAd();
  }
  
  try {
    lastAdShown = now;
    interstitialReady = false;
    
    loadInterstitialAd();
    
    return true;
  } catch (error) {
    console.error('Failed to show interstitial ad:', error);
    return false;
  }
}

export function isInterstitialReady(): boolean {
  return interstitialReady;
}
