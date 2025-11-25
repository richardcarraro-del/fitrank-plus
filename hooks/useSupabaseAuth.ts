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
      console.log('[Deep Link] Received URL:', url);
      
      if (!url || !url.includes('auth/callback') || isProcessing) {
        console.log('[Deep Link] Skipping:', { hasUrl: !!url, hasCallback: url?.includes('auth/callback'), isProcessing });
        return;
      }

      isProcessing = true;
      console.log('[Deep Link] Processing callback...');

      try {
        // Parse params from URL (handles both query params and fragments)
        const QueryParams = await import('expo-auth-session/build/QueryParams');
        
        // Try query params first
        let params = QueryParams.getQueryParams(url).params;
        console.log('[Deep Link] Query params:', params);
        
        // If no params, try fragment
        if ((!params.code && !params.access_token) && url.includes('#')) {
          const fragmentUrl = url.replace('#', '?');
          params = QueryParams.getQueryParams(fragmentUrl).params;
          console.log('[Deep Link] Fragment params:', params);
        }

        const { code, access_token, refresh_token, error: errorParam } = params;

        if (errorParam) {
          console.error('[Deep Link] Auth error:', errorParam);
          return;
        }

        // Handle PKCE flow (authorization code)
        if (code) {
          console.log('[Deep Link] Exchanging code for session...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('[Deep Link] Code exchange error:', error);
            return;
          }

          console.log('[Deep Link] Session established, loading profile...');
          if (data.user) {
            await loadUserProfile(data.user.id);
          }
        }
        // Handle implicit flow (direct tokens) - fallback
        else if (access_token && refresh_token) {
          console.log('[Deep Link] Setting session with tokens...');
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
    // Prevent concurrent calls
    if (loadingProfileRef.current) {
      console.log('[Profile] Already loading profile, skipping duplicate call');
      return;
    }
    
    loadingProfileRef.current = true;
    
    try {
      console.log('[Profile] Loading profile for user:', userId);
      let profile = await supabaseService.getProfile(userId);
      console.log('[Profile] getProfile result:', profile);
      
      // If profile doesn't exist (e.g., first Google login), create it
      if (!profile) {
        console.log('[Profile] Profile not found, creating new profile for user:', userId);
        
        // Get user data from Supabase Auth
        const { data: { user: authUser } } = await supabase.auth.getUser();
        console.log('[Profile] Auth user data:', authUser);
        
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
          
          console.log('[Profile] Creating profile with data:', newProfile);
          try {
            profile = await supabaseService.createProfile(newProfile);
            console.log('[Profile] New profile created successfully:', profile);
          } catch (createError) {
            console.error('[Profile] Error creating profile:', createError);
            throw createError;
          }
        } else {
          console.error('[Profile] No auth user found, cannot create profile');
        }
      } else {
        console.log('[Profile] Profile found, loading onboarding status');
      }
      
      if (profile) {
        setUser(profile);
        const onboardingComplete = await supabaseService.getOnboardingStatus(userId);
        setHasCompletedOnboardingState(onboardingComplete);
        console.log('[Profile] User profile loaded successfully');
      } else {
        console.error('[Profile] Failed to load or create profile');
      }
    } catch (error) {
      console.error('[Profile] Error in loadUserProfile:', error);
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
      // Generate redirect URI based on platform
      // Mobile (iOS/Android): Always use custom fitrankplus:// scheme
      //   - Works in: Development Builds, Standalone Builds
      //   - Fails in: Expo Go (not supported - user must use Dev Build)
      // Web: Uses current origin with callback path
      const { makeRedirectUri } = await import('expo-auth-session');
      
      console.log('[Google Login] Platform.OS:', Platform.OS);
      
      let redirectTo: string;
      
      if (Platform.OS === 'web') {
        // On web, use makeRedirectUri to get the correct web origin
        redirectTo = makeRedirectUri({
          path: 'auth/callback',
        });
        console.log('[Google Login] Web redirectTo:', redirectTo);
      } else {
        // On mobile (iOS/Android), always use custom fitrankplus:// scheme
        // This works in Development Builds and Standalone Builds
        // Note: Will NOT work in Expo Go (use Development Build instead)
        redirectTo = 'fitrankplus://auth/callback';
        console.log('[Google Login] Mobile redirectTo:', redirectTo);
      }

      // Get OAuth URL from Supabase using PKCE flow
      console.log('[Google Login] Requesting OAuth URL from Supabase...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true, // We handle redirect manually
        },
      });

      if (error) {
        console.error('[Google Login] Supabase error:', error);
        throw new Error(error.message);
      }

      if (!data?.url) {
        throw new Error('No OAuth URL received from Supabase');
      }

      console.log('[Google Login] OAuth URL received, opening browser...');
      console.log('[Google Login] OAuth URL:', data.url);

      // Open browser for OAuth
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
        { showInRecents: true }
      );

      console.log('[Google Login] WebBrowser result:', result);

      // Handle different result types
      if (result.type === 'success') {
        console.log('[Google Login] Success! Processing callback...');
        
        // On web, process the URL directly instead of relying on deep link handler
        if (Platform.OS === 'web' && result.url) {
          console.log('[Google Login] Processing web callback URL:', result.url);
          
          // Parse tokens from URL
          const QueryParams = await import('expo-auth-session/build/QueryParams');
          let params = QueryParams.getQueryParams(result.url).params;
          
          // If no params in query, try fragment
          if ((!params.code && !params.access_token) && result.url.includes('#')) {
            const fragmentUrl = result.url.replace('#', '?');
            params = QueryParams.getQueryParams(fragmentUrl).params;
          }
          
          const { code, access_token, refresh_token } = params;
          
          // Handle PKCE flow (authorization code)
          if (code) {
            console.log('[Google Login] Exchanging code for session...');
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
              console.error('[Google Login] Code exchange error:', error);
              throw new Error('Erro ao completar login com Google');
            }
            
            if (data.user) {
              await loadUserProfile(data.user.id);
            }
          }
          // Handle implicit flow (direct tokens)
          else if (access_token && refresh_token) {
            console.log('[Google Login] Setting session with tokens...');
            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            
            if (error) {
              console.error('[Google Login] Session error:', error);
              throw new Error('Erro ao completar login com Google');
            }
            
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              await loadUserProfile(user.id);
            }
          } else {
            console.warn('[Google Login] No code or tokens in URL');
            throw new Error('Erro ao processar autenticação');
          }
        } else {
          // On mobile, deep link handler will process the callback
          console.log('[Google Login] Mobile: Deep link handler will process callback');
        }
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
