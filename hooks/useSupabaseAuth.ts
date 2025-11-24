import { useState, useEffect, createContext, useContext } from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';
import { supabaseService } from '@/lib/supabase-service';
import type { User } from '@/types/auth';
import type { Session } from '@supabase/supabase-js';

// Complete auth session for web (must be at module scope)
WebBrowser.maybeCompleteAuthSession();

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (value: boolean) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useAuthState(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboardingState] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setHasCompletedOnboardingState(false);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle deep links for OAuth callbacks
  useEffect(() => {
    let isProcessing = false; // Guard against duplicate processing

    const handleDeepLink = async (url: string) => {
      if (!url || !url.includes('auth/callback') || isProcessing) return;

      isProcessing = true;

      try {
        // Parse params from URL (handles both query params and fragments)
        const QueryParams = await import('expo-auth-session/build/QueryParams');
        
        // Try query params first
        let params = QueryParams.getQueryParams(url).params;
        
        // If no params, try fragment
        if ((!params.code && !params.access_token) && url.includes('#')) {
          const fragmentUrl = url.replace('#', '?');
          params = QueryParams.getQueryParams(fragmentUrl).params;
        }

        const { code, access_token, refresh_token, error: errorParam } = params;

        if (errorParam) {
          console.error('[Deep Link] Auth error:', errorParam);
          return;
        }

        // Handle PKCE flow (authorization code)
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('[Deep Link] Code exchange error:', error);
            return;
          }

          if (data.user) {
            await loadUserProfile(data.user.id);
          }
        }
        // Handle implicit flow (direct tokens) - fallback
        else if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (error) {
            console.error('[Deep Link] Session error:', error);
          } else {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              await loadUserProfile(user.id);
            }
          }
        }
        // No code or tokens - log for debugging
        else {
          console.warn('[Deep Link] No authorization code or tokens in URL:', url);
        }
      } catch (error) {
        console.error('[Deep Link] Handler error:', error);
      } finally {
        // Reset guard after a delay to allow retries if needed
        setTimeout(() => {
          isProcessing = false;
        }, 1000);
      }
    };

    // Get initial URL (if app opened via deep link)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await supabaseService.getProfile(userId);
      if (profile) {
        setUser(profile);
        const onboardingComplete = await supabaseService.getOnboardingStatus(userId);
        setHasCompletedOnboardingState(onboardingComplete);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Email ou senha incorretos');
      }
      throw new Error(error.message);
    }

    if (data.user) {
      const profile = await supabaseService.getProfile(data.user.id);
      if (profile) {
        setUser(profile);
      }
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      if (password.length < 6) {
        throw new Error('A senha deve ter no mínimo 6 caracteres');
      }

      if (!name || name.trim().length === 0) {
        throw new Error('Nome é obrigatório');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name.trim(),
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          throw new Error('Este email já está cadastrado');
        }
        throw new Error(error.message);
      }

      if (data.user) {
        await supabaseService.initializeDefaultAchievements(data.user.id);
        
        const profile = await supabaseService.getProfile(data.user.id);
        if (profile) {
          setUser(profile);
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { makeRedirectUri } = await import('expo-auth-session');

      // Generate redirect URI with custom scheme
      const redirectTo = makeRedirectUri({
        scheme: 'fitrankplus',
        path: 'auth/callback',
      });

      // Get OAuth URL from Supabase using PKCE flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true, // We handle redirect manually
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.url) {
        throw new Error('No OAuth URL received from Supabase');
      }

      // Open browser for OAuth
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
        { showInRecents: true }
      );

      // Handle different result types
      if (result.type === 'success') {
        // Deep link handler will process the callback (code exchange or tokens)
        return;
      } else if (result.type === 'cancel') {
        throw new Error('Login cancelado pelo usuário');
      } else if (result.type === 'dismiss') {
        throw new Error('Login cancelado');
      } else {
        console.error('[Google Login] Unexpected result type:', result.type);
        throw new Error('Falha no login com Google');
      }
    } catch (error: any) {
      console.error('[Google Login] Error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setHasCompletedOnboardingState(false);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = await supabaseService.updateProfile(user.id, updates);
    if (updatedUser) {
      setUser(updatedUser);
    }
  };

  const setHasCompletedOnboarding = async (value: boolean) => {
    if (!user) {
      return;
    }
    await supabaseService.setOnboardingComplete(user.id, value);
    setHasCompletedOnboardingState(value);
  };

  return {
    user,
    isLoading,
    session,
    login,
    signup,
    loginWithGoogle,
    logout,
    updateProfile,
    hasCompletedOnboarding,
    setHasCompletedOnboarding,
  };
}
