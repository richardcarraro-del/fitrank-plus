export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  age: number;
  weight: number;
  height: number;
  goal: "hypertrophy" | "weight_loss" | "endurance" | "beginner";
  level: "beginner" | "intermediate" | "advanced";
  timeAvailable: number;
  weeklyFrequency: 2 | 3 | 4 | 5 | 6;
  location: "home" | "gym";
  equipment: string[];
  academy?: {
    id: string;
    name: string;
    address?: string;
  };
  isPremium: boolean;
  selectedPlan?: "ABC" | "ABCD" | "FullBody" | "UpperLower";
};
