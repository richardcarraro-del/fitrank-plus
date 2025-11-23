import AsyncStorage from "@react-native-async-storage/async-storage";

export type StoredUser = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
};

export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  rest: number;
  completed?: boolean;
  muscleGroup?: string;
};

export type Workout = {
  id: string;
  date: string;
  exercises: Exercise[];
  duration: number;
  points: number;
  completed: boolean;
  calories: number;
  startTime?: string;
  endTime?: string;
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  points?: number;
};

export type UserStats = {
  totalWorkouts: number;
  totalPoints: number;
  currentStreak: number;
  bestStreak: number;
  weeklyPoints: number;
  monthlyPoints: number;
  lastWorkoutDate?: string;
  weeklyWorkoutsCount?: number;
  weekStartDate?: string;
};

export type Academy = {
  id: string;
  name: string;
  address: string;
  memberCount: number;
};

export type RankingUser = {
  id: string;
  name: string;
  avatar: string;
  points: number;
  rank: number;
  weeklyPoints: number;
  monthlyPoints: number;
  isCurrentUser?: boolean;
};

const STORAGE_KEYS = {
  USERS: '@fitrank:users',
  CURRENT_USER_ID: '@fitrank:currentUserId',
};

const hashPassword = (password: string): string => {
  return btoa(password);
};

const verifyPassword = (password: string, hash: string): boolean => {
  try {
    return btoa(password) === hash;
  } catch {
    return false;
  }
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const getUserStorageKey = (userId: string, key: string): string => {
  return `@fitrank:user_${userId}:${key}`;
};

const authRepository = {
  async getUsers(): Promise<StoredUser[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting users:", error);
      return [];
    }
  },

  async saveUser(user: StoredUser): Promise<void> {
    try {
      const users = await this.getUsers();
      users.push(user);
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (error) {
      console.error("Error saving user:", error);
      throw new Error("Falha ao salvar usuário");
    }
  },

  async getUserByEmail(email: string): Promise<StoredUser | null> {
    try {
      const users = await this.getUsers();
      return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    } catch (error) {
      console.error("Error getting user by email:", error);
      return null;
    }
  },

  async registerUser(email: string, password: string, name: string): Promise<StoredUser> {
    if (!validateEmail(email)) {
      throw new Error("Email inválido");
    }

    if (password.length < 6) {
      throw new Error("A senha deve ter no mínimo 6 caracteres");
    }

    if (!name || name.trim().length === 0) {
      throw new Error("Nome é obrigatório");
    }

    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      throw new Error("Este email já está cadastrado");
    }

    const newUser: StoredUser = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };

    await this.saveUser(newUser);
    return newUser;
  },

  async validateCredentials(email: string, password: string): Promise<StoredUser | null> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      return null;
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return null;
    }

    return user;
  },

  async getCurrentUserId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    } catch (error) {
      console.error("Error getting current user ID:", error);
      return null;
    }
  },

  async setCurrentUserId(userId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    } catch (error) {
      console.error("Error setting current user ID:", error);
      throw new Error("Falha ao salvar sessão");
    }
  },

  async clearCurrentUserId(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    } catch (error) {
      console.error("Error clearing current user ID:", error);
    }
  },
};

export { authRepository };

export const storage = {
  async getWorkouts(userId: string): Promise<Workout[]> {
    try {
      const key = getUserStorageKey(userId, 'workouts');
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting workouts:", error);
      return [];
    }
  },

  async saveWorkout(workout: Workout, userId: string): Promise<void> {
    try {
      const workouts = await this.getWorkouts(userId);
      workouts.unshift(workout);
      const key = getUserStorageKey(userId, 'workouts');
      await AsyncStorage.setItem(key, JSON.stringify(workouts));
    } catch (error) {
      console.error("Error saving workout:", error);
    }
  },

  async getUserStats(userId: string): Promise<UserStats> {
    try {
      const key = getUserStorageKey(userId, 'stats');
      const data = await AsyncStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
      return {
        totalWorkouts: 0,
        totalPoints: 0,
        currentStreak: 0,
        bestStreak: 0,
        weeklyPoints: 0,
        monthlyPoints: 0,
      };
    } catch (error) {
      console.error("Error getting user stats:", error);
      return {
        totalWorkouts: 0,
        totalPoints: 0,
        currentStreak: 0,
        bestStreak: 0,
        weeklyPoints: 0,
        monthlyPoints: 0,
      };
    }
  },

  async updateUserStats(updates: Partial<UserStats>, userId: string): Promise<void> {
    try {
      const stats = await this.getUserStats(userId);
      const updatedStats = { ...stats, ...updates };
      const key = getUserStorageKey(userId, 'stats');
      await AsyncStorage.setItem(key, JSON.stringify(updatedStats));
    } catch (error) {
      console.error("Error updating user stats:", error);
    }
  },

  async getAchievements(userId: string): Promise<Achievement[]> {
    try {
      const key = getUserStorageKey(userId, 'achievements');
      const data = await AsyncStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
      return this.getDefaultAchievements();
    } catch (error) {
      console.error("Error getting achievements:", error);
      return this.getDefaultAchievements();
    }
  },

  getDefaultAchievements(): Achievement[] {
    return [
      {
        id: "first-workout",
        name: "Primeiro Treino",
        description: "Complete seu primeiro treino",
        icon: "first-workout",
        earned: false,
      },
      {
        id: "streak-7",
        name: "Semana Completa",
        description: "Treine por 7 dias seguidos",
        icon: "streak-7",
        earned: false,
      },
      {
        id: "workouts-30",
        name: "30 Treinos",
        description: "Complete 30 treinos",
        icon: "workouts-30",
        earned: false,
      },
      {
        id: "top-3",
        name: "Top 3",
        description: "Fique entre os 3 primeiros da sua academia",
        icon: "top-3",
        earned: false,
      },
      {
        id: "points-5000",
        name: "5000 Pontos",
        description: "Acumule 5000 pontos",
        icon: "points-5000",
        earned: false,
      },
      {
        id: "workouts-100",
        name: "100 Treinos",
        description: "Complete 100 treinos",
        icon: "workouts-100",
        earned: false,
      },
      {
        id: "streak-30",
        name: "Mês Perfeito",
        description: "Treine por 30 dias seguidos",
        icon: "streak-30",
        earned: false,
      },
      {
        id: "perfect-week",
        name: "Semana Perfeita",
        description: "Complete todos os treinos planejados em uma semana",
        icon: "perfect-week",
        earned: false,
      },
      {
        id: "champion",
        name: "Campeão",
        description: "Seja o primeiro colocado da sua academia",
        icon: "champion",
        earned: false,
      },
      {
        id: "premium",
        name: "Premium",
        description: "Assine o plano Premium",
        icon: "premium",
        earned: false,
      },
    ];
  },

  async saveAchievements(achievements: Achievement[], userId: string): Promise<void> {
    try {
      const key = getUserStorageKey(userId, 'achievements');
      await AsyncStorage.setItem(key, JSON.stringify(achievements));
    } catch (error) {
      console.error("Error saving achievements:", error);
    }
  },

  async getTodayWorkoutCount(userId: string): Promise<number> {
    try {
      const key = getUserStorageKey(userId, 'todayWorkoutCount');
      const count = await AsyncStorage.getItem(key);
      return count ? parseInt(count) : 0;
    } catch (error) {
      return 0;
    }
  },

  async incrementTodayWorkoutCount(userId: string): Promise<void> {
    try {
      const count = await this.getTodayWorkoutCount(userId);
      const key = getUserStorageKey(userId, 'todayWorkoutCount');
      await AsyncStorage.setItem(key, (count + 1).toString());
    } catch (error) {
      console.error("Error incrementing workout count:", error);
    }
  },

  async resetTodayWorkoutCount(userId: string): Promise<void> {
    try {
      const key = getUserStorageKey(userId, 'todayWorkoutCount');
      await AsyncStorage.setItem(key, "0");
    } catch (error) {
      console.error("Error resetting workout count:", error);
    }
  },

  async getAcademies(): Promise<Academy[]> {
    try {
      const data = await AsyncStorage.getItem("@academies");
      if (data) {
        return JSON.parse(data);
      }
      return this.getDefaultAcademies();
    } catch (error) {
      console.error("Error getting academies:", error);
      return this.getDefaultAcademies();
    }
  },

  getDefaultAcademies(): Academy[] {
    return [
      { id: "1", name: "SmartFit Centro", address: "Av. Paulista, 1000", memberCount: 250 },
      { id: "2", name: "SmartFit Jardins", address: "Rua Augusta, 500", memberCount: 180 },
      { id: "3", name: "Bio Ritmo Vila Olímpia", address: "Av. Faria Lima, 2000", memberCount: 320 },
      { id: "4", name: "Bodytech Moema", address: "Av. Ibirapuera, 1500", memberCount: 290 },
      { id: "5", name: "Academia Cia Athletica", address: "Av. Brasil, 800", memberCount: 210 },
    ];
  },

  async saveAcademy(academy: Academy): Promise<void> {
    try {
      const academies = await this.getAcademies();
      academies.push(academy);
      await AsyncStorage.setItem("@academies", JSON.stringify(academies));
    } catch (error) {
      console.error("Error saving academy:", error);
    }
  },

  async getRanking(academyId: string, userId: string, userName: string, userAvatar: string): Promise<RankingUser[]> {
    try {
      const stats = await this.getUserStats(userId);
      
      const defaultRanking = this.getDefaultRanking(academyId);
      
      const userRankingEntry: RankingUser = {
        id: userId,
        name: userName,
        avatar: userAvatar || "1",
        points: stats.totalPoints,
        weeklyPoints: stats.weeklyPoints,
        monthlyPoints: stats.monthlyPoints,
        rank: 0,
        isCurrentUser: true,
      };
      
      const allUsers = [...defaultRanking.filter(u => u.id !== userId), userRankingEntry];
      allUsers.sort((a, b) => b.monthlyPoints - a.monthlyPoints);
      
      allUsers.forEach((u, index) => {
        u.rank = index + 1;
      });
      
      return allUsers.slice(0, 50);
    } catch (error) {
      console.error("Error getting ranking:", error);
      return this.getDefaultRanking(academyId);
    }
  },

  getDefaultRanking(academyId: string): RankingUser[] {
    const names = [
      "João Silva", "Maria Santos", "Pedro Oliveira", "Ana Costa", "Carlos Souza",
      "Juliana Lima", "Rafael Martins", "Beatriz Ferreira", "Lucas Almeida", "Fernanda Rocha",
      "Rodrigo Nascimento", "Camila Ribeiro", "Diego Carvalho", "Patricia Gomes", "Bruno Cardoso",
      "Amanda Dias", "Felipe Moreira", "Larissa Pinto", "Gustavo Freitas", "Isabela Mendes"
    ];
    
    return names.map((name, index) => ({
      id: `mock-${index + 1}`,
      name,
      avatar: ((index % 5) + 1).toString(),
      points: 12500 - (index * 450),
      weeklyPoints: 850 - (index * 35),
      monthlyPoints: 3200 - (index * 120),
      rank: index + 1,
    }));
  },

  async completeWorkout(workout: Workout, userId: string): Promise<void> {
    try {
      await this.saveWorkout(workout, userId);
      const stats = await this.ensureWeeklyCountersAreFresh(userId);
      
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
      
      await this.updateUserStats(updatedStats, userId);
      await this.checkAndUnlockAchievements(updatedStats as UserStats, userId);
    } catch (error) {
      console.error("Error completing workout:", error);
    }
  },

  getWeekStart(): Date {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    const weekStart = new Date(today);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  },

  isSameWeek(date1: Date, date2: Date): boolean {
    const week1 = this.getWeekStart();
    const week2 = this.getWeekStart();
    week1.setTime(date1.getTime());
    week2.setTime(date2.getTime());
    return week1.getTime() === week2.getTime();
  },

  async ensureWeeklyCountersAreFresh(userId: string): Promise<UserStats> {
    const stats = await this.getUserStats(userId);
    const currentWeekStart = this.getWeekStart();
    const savedWeekStart = stats.weekStartDate ? new Date(stats.weekStartDate) : null;
    
    const isNewWeek = !savedWeekStart || savedWeekStart.getTime() < currentWeekStart.getTime();
    
    if (isNewWeek) {
      const updatedStats = {
        ...stats,
        weeklyWorkoutsCount: 0,
        weekStartDate: currentWeekStart.toISOString(),
        weeklyPoints: 0,
      };
      await this.updateUserStats({
        weeklyWorkoutsCount: 0,
        weekStartDate: currentWeekStart.toISOString(),
        weeklyPoints: 0,
      }, userId);
      return updatedStats;
    }
    
    return stats;
  },

  async checkAndUnlockAchievements(stats: UserStats, userId: string): Promise<Achievement[]> {
    try {
      const achievements = await this.getAchievements(userId);
      let hasChanges = false;
      const newlyUnlocked: Achievement[] = [];
      
      achievements.forEach(achievement => {
        if (!achievement.earned) {
          let shouldUnlock = false;
          
          switch (achievement.id) {
            case "first-workout":
              shouldUnlock = stats.totalWorkouts >= 1;
              break;
            case "streak-7":
              shouldUnlock = stats.currentStreak >= 7;
              break;
            case "workouts-30":
              shouldUnlock = stats.totalWorkouts >= 30;
              break;
            case "points-5000":
              shouldUnlock = stats.totalPoints >= 5000;
              break;
            case "workouts-100":
              shouldUnlock = stats.totalWorkouts >= 100;
              break;
            case "streak-30":
              shouldUnlock = stats.currentStreak >= 30;
              break;
            case "perfect-week":
              shouldUnlock = (stats.weeklyWorkoutsCount || 0) >= 7;
              break;
          }
          
          if (shouldUnlock) {
            achievement.earned = true;
            achievement.earnedDate = new Date().toISOString();
            hasChanges = true;
            newlyUnlocked.push(achievement);
          }
        }
      });
      
      if (hasChanges) {
        await this.saveAchievements(achievements, userId);
      }
      
      return newlyUnlocked;
    } catch (error) {
      console.error("Error checking achievements:", error);
      return [];
    }
  },

  async canGenerateWorkout(isPremium: boolean, userId: string): Promise<{ canGenerate: boolean; remaining: number }> {
    try {
      if (isPremium) {
        return { canGenerate: true, remaining: -1 };
      }
      
      const stats = await this.ensureWeeklyCountersAreFresh(userId);
      const weeklyWorkouts = stats.weeklyWorkoutsCount || 0;
      const FREE_WEEKLY_LIMIT = 2;
      
      return {
        canGenerate: weeklyWorkouts < FREE_WEEKLY_LIMIT,
        remaining: FREE_WEEKLY_LIMIT - weeklyWorkouts,
      };
    } catch (error) {
      console.error("Error checking workout limit:", error);
      return { canGenerate: true, remaining: 2 };
    }
  },
};
