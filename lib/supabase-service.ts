import { supabase } from './supabase';
import type { User } from '@/types/auth';
import type { Workout, UserStats, Achievement, Academy, RankingUser } from '@/utils/storage';

export type SupabaseProfile = {
  id: string;
  email: string;
  name: string;
  avatar: string;
  age: number;
  weight: number;
  height: number;
  goal: 'hypertrophy' | 'weight_loss' | 'endurance' | 'beginner';
  level: 'beginner' | 'intermediate' | 'advanced';
  time_available: number;
  weekly_frequency: 2 | 3 | 4 | 5 | 6;
  location: 'home' | 'gym';
  equipment: string[];
  academy_id?: string;
  is_premium: boolean;
  selected_plan?: 'ABC' | 'ABCD' | 'FullBody' | 'UpperLower';
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
};

function snakeToCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = snakeToCamel(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}

function camelToSnake(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(camelToSnake);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      acc[snakeKey] = camelToSnake(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}

function profileToUser(profile: SupabaseProfile): User {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatar: profile.avatar,
    age: profile.age,
    weight: profile.weight,
    height: profile.height,
    goal: profile.goal,
    level: profile.level,
    timeAvailable: profile.time_available,
    weeklyFrequency: profile.weekly_frequency,
    location: profile.location,
    equipment: profile.equipment,
    academy: profile.academy_id ? {
      id: profile.academy_id,
      name: '',
    } : undefined,
    isPremium: profile.is_premium,
    selectedPlan: profile.selected_plan,
  };
}

export const supabaseService = {
  async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data ? profileToUser(data as SupabaseProfile) : null;
  },

  async createProfile(profile: Partial<User>): Promise<User | null> {
    const snakeProfile = camelToSnake(profile);
    
    // Set default values
    const profileData = {
      ...snakeProfile,
      is_premium: false,
      onboarding_complete: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      throw new Error('Falha ao criar perfil');
    }

    return data ? profileToUser(data as SupabaseProfile) : null;
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    const snakeUpdates = camelToSnake(updates);
    
    const { data, error } = await supabase
      .from('profiles')
      .update(snakeUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw new Error('Falha ao atualizar perfil');
    }

    return data ? profileToUser(data as SupabaseProfile) : null;
  },

  async getOnboardingStatus(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('profiles')
      .select('onboarding_complete')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching onboarding status:', error);
      return false;
    }

    return data?.onboarding_complete || false;
  },

  async setOnboardingComplete(userId: string, complete: boolean): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ onboarding_complete: complete })
      .eq('id', userId);

    if (error) {
      console.error('Error updating onboarding status:', error);
      throw new Error('Falha ao atualizar status do onboarding');
    }
  },

  async getWorkouts(userId: string): Promise<Workout[]> {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching workouts:', error);
      return [];
    }

    return (data || []).map(w => ({
      id: w.id,
      date: w.date,
      exercises: w.exercises,
      duration: w.duration,
      points: w.points,
      calories: w.calories,
      completed: w.completed,
      startTime: w.start_time,
      endTime: w.end_time,
    }));
  },

  async saveWorkout(workout: Workout, userId: string): Promise<void> {
    const { error } = await supabase
      .from('workouts')
      .insert({
        user_id: userId,
        date: workout.date,
        exercises: workout.exercises,
        duration: workout.duration,
        points: workout.points,
        calories: workout.calories,
        completed: workout.completed,
        start_time: workout.startTime,
        end_time: workout.endTime,
      });

    if (error) {
      console.error('Error saving workout:', error);
      throw new Error('Falha ao salvar treino');
    }
  },

  async getUserStats(userId: string): Promise<UserStats> {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user stats:', error);
      return {
        totalWorkouts: 0,
        totalPoints: 0,
        currentStreak: 0,
        bestStreak: 0,
        weeklyPoints: 0,
        monthlyPoints: 0,
      };
    }

    return {
      totalWorkouts: data.total_workouts || 0,
      totalPoints: data.total_points || 0,
      currentStreak: data.current_streak || 0,
      bestStreak: data.best_streak || 0,
      weeklyPoints: data.weekly_points || 0,
      monthlyPoints: data.monthly_points || 0,
      lastWorkoutDate: data.last_workout_date,
      weeklyWorkoutsCount: data.weekly_workouts_count || 0,
      weekStartDate: data.week_start_date,
    };
  },

  async updateUserStats(userId: string, updates: Partial<UserStats>): Promise<void> {
    const snakeUpdates = camelToSnake(updates);
    
    const { error } = await supabase
      .from('user_stats')
      .update(snakeUpdates)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating user stats:', error);
      throw new Error('Falha ao atualizar estatísticas');
    }
  },

  async getAchievements(userId: string): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }

    return (data || []).map(a => ({
      id: a.achievement_id,
      name: a.name,
      description: a.description,
      icon: a.icon,
      earned: a.earned,
      earnedDate: a.earned_date,
      points: a.points,
    }));
  },

  async initializeDefaultAchievements(userId: string): Promise<void> {
    const defaultAchievements = [
      { id: 'first-workout', name: 'Primeiro Treino', description: 'Complete seu primeiro treino', icon: 'first-workout' },
      { id: 'streak-7', name: 'Semana Completa', description: 'Treine por 7 dias seguidos', icon: 'streak-7' },
      { id: 'workouts-30', name: '30 Treinos', description: 'Complete 30 treinos', icon: 'workouts-30' },
      { id: 'top-3', name: 'Top 3', description: 'Fique entre os 3 primeiros da sua academia', icon: 'top-3' },
      { id: 'points-5000', name: '5000 Pontos', description: 'Acumule 5000 pontos', icon: 'points-5000' },
      { id: 'workouts-100', name: '100 Treinos', description: 'Complete 100 treinos', icon: 'workouts-100' },
      { id: 'streak-30', name: 'Mês Perfeito', description: 'Treine por 30 dias seguidos', icon: 'streak-30' },
      { id: 'perfect-week', name: 'Semana Perfeita', description: 'Complete todos os treinos planejados em uma semana', icon: 'perfect-week' },
      { id: 'champion', name: 'Campeão', description: 'Seja o primeiro colocado da sua academia', icon: 'champion' },
      { id: 'premium', name: 'Premium', description: 'Assine o plano Premium', icon: 'premium' },
    ];

    const achievementsToInsert = defaultAchievements.map(a => ({
      user_id: userId,
      achievement_id: a.id,
      name: a.name,
      description: a.description,
      icon: a.icon,
      earned: false,
    }));

    const { error } = await supabase
      .from('achievements')
      .insert(achievementsToInsert);

    if (error && !error.message.includes('duplicate')) {
      console.error('Error initializing achievements:', error);
    }
  },

  async unlockAchievement(userId: string, achievementId: string): Promise<void> {
    const { error } = await supabase
      .from('achievements')
      .update({
        earned: true,
        earned_date: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('achievement_id', achievementId);

    if (error) {
      console.error('Error unlocking achievement:', error);
    }
  },

  async getAcademies(): Promise<Academy[]> {
    const { data, error } = await supabase
      .from('academies')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching academies:', error);
      return [];
    }

    return (data || []).map(a => ({
      id: a.id,
      name: a.name,
      address: a.address || '',
      memberCount: a.member_count || 0,
    }));
  },

  async getAcademyRanking(academyId: string, currentUserId: string): Promise<RankingUser[]> {
    const { data, error } = await supabase
      .rpc('get_academy_ranking', { academy_uuid: academyId });

    if (error) {
      console.error('Error fetching ranking:', error);
      return [];
    }

    return (data || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      avatar: r.avatar,
      points: r.points,
      weeklyPoints: r.weekly_points,
      monthlyPoints: r.monthly_points,
      rank: r.rank,
      isCurrentUser: r.id === currentUserId,
    }));
  },

  async completeWorkout(workout: Workout, userId: string): Promise<Achievement[]> {
    await this.saveWorkout(workout, userId);
    
    const stats = await this.getUserStats(userId);
    const updatedStats: Partial<UserStats> = {
      totalWorkouts: stats.totalWorkouts + 1,
      totalPoints: stats.totalPoints + workout.points,
      weeklyPoints: stats.weeklyPoints + workout.points,
      monthlyPoints: stats.monthlyPoints + workout.points,
      lastWorkoutDate: workout.date,
      weeklyWorkoutsCount: (stats.weeklyWorkoutsCount || 0) + 1,
    };

    const lastWorkout = stats.lastWorkoutDate ? new Date(stats.lastWorkoutDate) : null;
    const today = new Date(workout.date);
    
    if (lastWorkout) {
      const diffDays = Math.floor((today.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        updatedStats.currentStreak = stats.currentStreak + 1;
        updatedStats.bestStreak = Math.max(stats.bestStreak, updatedStats.currentStreak);
      } else if (diffDays > 1) {
        updatedStats.currentStreak = 1;
      }
    } else {
      updatedStats.currentStreak = 1;
      updatedStats.bestStreak = 1;
    }

    await this.updateUserStats(userId, updatedStats);

    const newlyUnlocked = await this.checkAndUnlockAchievements(updatedStats as UserStats, userId);
    return newlyUnlocked;
  },

  async checkAndUnlockAchievements(stats: UserStats, userId: string): Promise<Achievement[]> {
    const achievements = await this.getAchievements(userId);
    const newlyUnlocked: Achievement[] = [];

    for (const achievement of achievements) {
      if (!achievement.earned) {
        let shouldUnlock = false;

        switch (achievement.id) {
          case 'first-workout':
            shouldUnlock = stats.totalWorkouts >= 1;
            break;
          case 'streak-7':
            shouldUnlock = stats.currentStreak >= 7;
            break;
          case 'workouts-30':
            shouldUnlock = stats.totalWorkouts >= 30;
            break;
          case 'points-5000':
            shouldUnlock = stats.totalPoints >= 5000;
            break;
          case 'workouts-100':
            shouldUnlock = stats.totalWorkouts >= 100;
            break;
          case 'streak-30':
            shouldUnlock = stats.currentStreak >= 30;
            break;
          case 'perfect-week':
            shouldUnlock = (stats.weeklyWorkoutsCount || 0) >= 7;
            break;
        }

        if (shouldUnlock) {
          await this.unlockAchievement(userId, achievement.id);
          newlyUnlocked.push(achievement);
        }
      }
    }

    return newlyUnlocked;
  },

  async canGenerateWorkout(userId: string, isPremium: boolean): Promise<{ canGenerate: boolean; remaining: number }> {
    if (isPremium) {
      return { canGenerate: true, remaining: -1 };
    }

    const stats = await this.getUserStats(userId);
    const weeklyWorkouts = stats.weeklyWorkoutsCount || 0;
    const FREE_WEEKLY_LIMIT = 2;

    return {
      canGenerate: weeklyWorkouts < FREE_WEEKLY_LIMIT,
      remaining: FREE_WEEKLY_LIMIT - weeklyWorkouts,
    };
  },
};
