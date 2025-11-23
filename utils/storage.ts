import AsyncStorage from "@react-native-async-storage/async-storage";

export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  rest: number;
  completed?: boolean;
};

export type Workout = {
  id: string;
  date: string;
  exercises: Exercise[];
  duration: number;
  points: number;
  completed: boolean;
  calories: number;
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
};

export type UserStats = {
  totalWorkouts: number;
  totalPoints: number;
  currentStreak: number;
  bestStreak: number;
  weeklyPoints: number;
  monthlyPoints: number;
  lastWorkoutDate?: string;
};

export const storage = {
  async getWorkouts(): Promise<Workout[]> {
    try {
      const data = await AsyncStorage.getItem("@workouts");
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting workouts:", error);
      return [];
    }
  },

  async saveWorkout(workout: Workout): Promise<void> {
    try {
      const workouts = await this.getWorkouts();
      workouts.unshift(workout);
      await AsyncStorage.setItem("@workouts", JSON.stringify(workouts));
    } catch (error) {
      console.error("Error saving workout:", error);
    }
  },

  async getUserStats(): Promise<UserStats> {
    try {
      const data = await AsyncStorage.getItem("@user_stats");
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

  async updateUserStats(updates: Partial<UserStats>): Promise<void> {
    try {
      const stats = await this.getUserStats();
      const updatedStats = { ...stats, ...updates };
      await AsyncStorage.setItem("@user_stats", JSON.stringify(updatedStats));
    } catch (error) {
      console.error("Error updating user stats:", error);
    }
  },

  async getAchievements(): Promise<Achievement[]> {
    try {
      const data = await AsyncStorage.getItem("@achievements");
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

  async saveAchievements(achievements: Achievement[]): Promise<void> {
    try {
      await AsyncStorage.setItem("@achievements", JSON.stringify(achievements));
    } catch (error) {
      console.error("Error saving achievements:", error);
    }
  },

  async getTodayWorkoutCount(): Promise<number> {
    try {
      const count = await AsyncStorage.getItem("@today_workout_count");
      return count ? parseInt(count) : 0;
    } catch (error) {
      return 0;
    }
  },

  async incrementTodayWorkoutCount(): Promise<void> {
    try {
      const count = await this.getTodayWorkoutCount();
      await AsyncStorage.setItem("@today_workout_count", (count + 1).toString());
    } catch (error) {
      console.error("Error incrementing workout count:", error);
    }
  },

  async resetTodayWorkoutCount(): Promise<void> {
    try {
      await AsyncStorage.setItem("@today_workout_count", "0");
    } catch (error) {
      console.error("Error resetting workout count:", error);
    }
  },
};
