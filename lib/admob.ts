import { Platform } from 'react-native';

export type AdConfig = {
  appId: string;
  bannerId: string;
  interstitialId: string;
};

const TEST_IDS: AdConfig = {
  appId: 'ca-app-pub-3940256099942544~3347511713',
  bannerId: 'ca-app-pub-3940256099942544/6300978111',
  interstitialId: 'ca-app-pub-3940256099942544/1033173712',
};

const PRODUCTION_IDS: AdConfig = {
  appId: process.env.EXPO_PUBLIC_ADMOB_APP_ID || TEST_IDS.appId,
  bannerId: process.env.EXPO_PUBLIC_ADMOB_BANNER_ID || TEST_IDS.bannerId,
  interstitialId: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID || TEST_IDS.interstitialId,
};

export const getAdConfig = (): AdConfig => {
  if (__DEV__) {
    return TEST_IDS;
  }
  return PRODUCTION_IDS;
};

export const isAdMobAvailable = (): boolean => {
  return Platform.OS !== 'web';
};
