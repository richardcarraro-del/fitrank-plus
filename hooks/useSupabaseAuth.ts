import { useState, useEffect, createContext, useContext } from 'react';
import { Platform } from 'react-native';
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
  refreshProfile: () => Promise<void>;
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
  
  // Guard against concurrent loadUserProfile calls
  const loadingProfileRef = { current: false };

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
      if (!url || !url.includes('auth/callback') || isProcessing) {
        return;
      }

      isProcessing = true;

      try {
        const QueryParams = await import('expo-auth-session/build/QueryParams');
        
        let params = QueryParams.getQueryParams(url).params;
        
        if ((!params.code && !params.access_token) && url.includes('#')) {
          const fragmentUrl = url.replace('#', '?');
          params = QueryParams.getQueryParams(fragmentUrl).params;
        }

        const { code, access_token, refresh_token, error: errorParam } = params;

        if (errorParam) {
          console.error('[Auth] Deep link error:', errorParam);
          return;
        }

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('[Auth] Code exchange error:', error);
            return;
          }

          if (data.user) {
            await loadUserProfile(data.user.id);
          }
        }
        else if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (error) {
            console.error('[Auth] Session error:', error);
          } else {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              await loadUserProfile(user.id);
            }
          }
        }
      } catch (error) {
        console.error('[Auth] Deep link handler error:', error);
      } finally {
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
    if (loadingProfileRef.current) {
      return;
    }
    
    loadingProfileRef.current = true;
    
    try {
      let profile = await supabaseService.getProfile(userId);
      
      if (!profile) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          const newProfile: Partial<User> = {
            id: userId,
            name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuário',
            email: authUser.email || '',
            avatar: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || '',
            age: 0,
            weight: 0,
            height: 0,
            goal: 'beginner',
            level: 'beginner',
            timeAvailable: 60,
            weeklyFrequency: 3,
            location: 'gym',
            equipment: [],
            isPremium: false,
          };
          
          try {
            profile = await supabaseService.createProfile(newProfile);
          } catch (createError) {
            console.error('[Auth] Error creating profile:', createError);
            throw createError;
          }
        } else {
          console.error('[Auth] No auth user found');
        }
      }
      
      if (profile) {
        setUser(profile);
        const onboardingComplete = await supabaseService.getOnboardingStatus(userId);
        setHasCompletedOnboardingState(onboardingComplete);
      } else {
        console.error('[Auth] Failed to load profile');
      }
    } catch (error) {
      console.error('[Auth] Error loading profile:', error);
    } finally {
      setIsLoading(false);
      loadingProfileRef.current = false;
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
      
      let redirectTo: string;
      
      if (Platform.OS === 'web') {
        redirectTo = makeRedirectUri({
          path: 'auth/callback',
        });
      } else {
        redirectTo = 'fitrankplus://auth/callback';
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        console.error('[Auth] Google OAuth error:', error);
        throw new Error(error.message);
      }

      if (!data?.url) {
        throw new Error('No OAuth URL received');
      }

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
        { showInRecents: true }
      );

      if (result.type === 'success') {
        if (Platform.OS === 'web' && result.url) {
          const QueryParams = await import('expo-auth-session/build/QueryParams');
          let params = QueryParams.getQueryParams(result.url).params;
          
          if ((!params.code && !params.access_token) && result.url.includes('#')) {
            const fragmentUrl = result.url.replace('#', '?');
            params = QueryParams.getQueryParams(fragmentUrl).params;
          }
          
          const { code, access_token, refresh_token } = params;
          
          if (code) {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
              console.error('[Auth] Code exchange error:', error);
              throw new Error('Erro ao completar login com Google');
            }
            
            if (data.user) {
              await loadUserProfile(data.user.id);
            }
          }
          else if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            
            if (error) {
              console.error('[Auth] Session error:', error);
              throw new Error('Erro ao completar login com Google');
            }
            
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              await loadUserProfile(user.id);
            }
          } else {
            throw new Error('Erro ao processar autenticação');
          }
        }
        return;
      } else if (result.type === 'cancel' || result.type === 'dismiss') {
        throw new Error('Login cancelado pelo usuário');
      } else {
        throw new Error('Falha no login com Google');
      }
    } catch (error: any) {
      console.error('[Auth] Google login error:', error);
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

  const refreshProfile = async () => {
    if (session?.user?.id) {
      await loadUserProfile(session.user.id);
    }
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
    refreshProfile,
    hasCompletedOnboarding,
    setHasCompletedOnboarding,
  };
}
