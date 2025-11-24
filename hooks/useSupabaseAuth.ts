import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { supabaseService } from '@/lib/supabase-service';
import type { User } from '@/types/auth';
import type { Session } from '@supabase/supabase-js';

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
      console.log('[Signup] Starting signup process', { email, name });
      
      if (password.length < 6) {
        throw new Error('A senha deve ter no mínimo 6 caracteres');
      }

      if (!name || name.trim().length === 0) {
        throw new Error('Nome é obrigatório');
      }

      console.log('[Signup] Calling Supabase auth.signUp');
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
        console.error('[Signup] Supabase auth.signUp error:', error);
        if (error.message.includes('already registered')) {
          throw new Error('Este email já está cadastrado');
        }
        throw new Error(error.message);
      }

      console.log('[Signup] Auth user created successfully', data.user?.id);

      if (data.user) {
        console.log('[Signup] Initializing default achievements');
        await supabaseService.initializeDefaultAchievements(data.user.id);
        
        console.log('[Signup] Loading user profile');
        const profile = await supabaseService.getProfile(data.user.id);
        if (profile) {
          console.log('[Signup] Profile loaded successfully');
          setUser(profile);
        } else {
          console.warn('[Signup] Profile not found after signup');
        }
      }
      
      console.log('[Signup] Signup process completed successfully');
    } catch (error) {
      console.error('[Signup] Signup failed with error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    throw new Error('Google Sign-In não configurado. Adicione as credenciais do Google Cloud Console.');
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
    if (!user) return;
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
