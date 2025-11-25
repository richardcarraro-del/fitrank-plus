import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { supabase } from './supabase';

const STRIPE_PAYMENT_LINK = Constants.expoConfig?.extra?.stripePaymentLink || '';

export async function openStripeCheckout(userId: string, userEmail: string): Promise<{ error?: string }> {
  try {
    if (!STRIPE_PAYMENT_LINK) {
      return { error: 'Link de pagamento nao configurado.' };
    }
    
    const checkoutUrl = new URL(STRIPE_PAYMENT_LINK);
    checkoutUrl.searchParams.set('prefilled_email', userEmail);
    checkoutUrl.searchParams.set('client_reference_id', userId);
    
    await WebBrowser.openBrowserAsync(checkoutUrl.toString());
    
    return {};
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return { error: 'Erro ao abrir checkout' };
  }
}

export async function checkPremiumStatusWithRetry(userId: string, maxRetries: number = 3, delayMs: number = 2000): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    const isPremium = await checkPremiumStatus(userId);
    if (isPremium) {
      return true;
    }
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  return false;
}

export async function checkPremiumStatus(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking premium status:', error);
      return false;
    }

    return data?.is_premium || false;
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
}

export async function activatePremium(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ is_premium: true })
      .eq('id', userId);

    if (error) {
      console.error('Error activating premium:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error activating premium:', error);
    return false;
  }
}
