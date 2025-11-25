import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { supabase } from './supabase';

const STRIPE_PAYMENT_LINK = Constants.expoConfig?.extra?.stripePaymentLink || '';

export async function openStripeCheckout(userId: string, userEmail: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!STRIPE_PAYMENT_LINK) {
      return { 
        success: false, 
        error: 'Link de pagamento não configurado. Configure EXPO_PUBLIC_STRIPE_PAYMENT_LINK.' 
      };
    }

    const returnUrl = Linking.createURL('premium-success');
    
    const checkoutUrl = new URL(STRIPE_PAYMENT_LINK);
    checkoutUrl.searchParams.set('prefilled_email', userEmail);
    checkoutUrl.searchParams.set('client_reference_id', userId);
    
    const result = await WebBrowser.openAuthSessionAsync(
      checkoutUrl.toString(),
      returnUrl
    );

    if (result.type === 'success') {
      return { success: true };
    } else if (result.type === 'cancel') {
      return { success: false, error: 'Pagamento cancelado' };
    }

    return { success: false, error: 'Erro ao processar pagamento' };
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return { success: false, error: 'Erro ao abrir checkout' };
  }
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
