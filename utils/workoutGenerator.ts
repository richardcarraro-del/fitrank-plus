import { Exercise } from "./storage";
import { User } from "@/hooks/useAuth";

const exerciseDatabase = {
  beginner: {
    muscle: [
      { name: "Supino reto", sets: 3, reps: 12, rest: 60 },
      { name: "Agachamento livre", sets: 3, reps: 15, rest: 60 },
      { name: "Rosca direta", sets: 3, reps: 12, rest: 45 },
      { name: "Tríceps testa", sets: 3, reps: 12, rest: 45 },
      { name: "Desenvolvimento", sets: 3, reps: 12, rest: 60 },
      { name: "Remada baixa", sets: 3, reps: 12, rest: 60 },
      { name: "Leg press", sets: 3, reps: 15, rest: 60 },
      { name: "Panturrilha em pé", sets: 3, reps: 20, rest: 30 },
    ],
    lose_weight: [
      { name: "Burpees", sets: 3, reps: 10, rest: 30 },
      { name: "Jump squats", sets: 3, reps: 15, rest: 30 },
      { name: "Mountain climbers", sets: 3, reps: 20, rest: 30 },
      { name: "Prancha", sets: 3, reps: 30, rest: 30 },
      { name: "Polichinelos", sets: 3, reps: 30, rest: 30 },
      { name: "Corrida estacionária", sets: 3, reps: 60, rest: 30 },
    ],
    endurance: [
      { name: "Flexões", sets: 3, reps: 15, rest: 30 },
      { name: "Agachamento", sets: 3, reps: 20, rest: 30 },
      { name: "Prancha", sets: 3, reps: 45, rest: 30 },
      { name: "Afundo", sets: 3, reps: 12, rest: 30 },
      { name: "Abdominal", sets: 3, reps: 20, rest: 30 },
    ],
    health: [
      { name: "Caminhada rápida", sets: 1, reps: 20, rest: 0 },
      { name: "Alongamento geral", sets: 1, reps: 10, rest: 0 },
      { name: "Agachamento", sets: 2, reps: 15, rest: 45 },
      { name: "Prancha", sets: 2, reps: 30, rest: 45 },
      { name: "Flexões inclinadas", sets: 2, reps: 10, rest: 45 },
    ],
  },
  intermediate: {
    muscle: [
      { name: "Supino inclinado", sets: 4, reps: 10, rest: 75 },
      { name: "Agachamento profundo", sets: 4, reps: 12, rest: 90 },
      { name: "Rosca alternada", sets: 4, reps: 10, rest: 60 },
      { name: "Tríceps francês", sets: 4, reps: 10, rest: 60 },
      { name: "Desenvolvimento Arnold", sets: 4, reps: 10, rest: 75 },
      { name: "Puxada frente", sets: 4, reps: 10, rest: 75 },
      { name: "Levantamento terra", sets: 4, reps: 8, rest: 90 },
      { name: "Stiff", sets: 4, reps: 12, rest: 75 },
    ],
    lose_weight: [
      { name: "Burpees avançado", sets: 4, reps: 12, rest: 30 },
      { name: "Box jump", sets: 4, reps: 12, rest: 30 },
      { name: "Kettlebell swing", sets: 4, reps: 15, rest: 30 },
      { name: "Battle rope", sets: 4, reps: 30, rest: 30 },
      { name: "Sprints", sets: 6, reps: 30, rest: 60 },
    ],
    endurance: [
      { name: "Flexões diamante", sets: 4, reps: 15, rest: 30 },
      { name: "Agachamento búlgaro", sets: 4, reps: 12, rest: 30 },
      { name: "Prancha lateral", sets: 4, reps: 45, rest: 30 },
      { name: "Jump lunges", sets: 4, reps: 20, rest: 30 },
      { name: "V-ups", sets: 4, reps: 15, rest: 30 },
    ],
    health: [
      { name: "Caminhada intervalada", sets: 1, reps: 30, rest: 0 },
      { name: "Yoga flow", sets: 1, reps: 15, rest: 0 },
      { name: "Agachamento goblet", sets: 3, reps: 15, rest: 60 },
      { name: "Prancha com movimento", sets: 3, reps: 40, rest: 60 },
      { name: "Flexões", sets: 3, reps: 12, rest: 60 },
    ],
  },
  advanced: {
    muscle: [
      { name: "Supino declinado", sets: 5, reps: 8, rest: 90 },
      { name: "Agachamento frontal", sets: 5, reps: 8, rest: 120 },
      { name: "Rosca martelo", sets: 5, reps: 8, rest: 75 },
      { name: "Tríceps corda", sets: 5, reps: 12, rest: 60 },
      { name: "Militar com barra", sets: 5, reps: 8, rest: 90 },
      { name: "Remada curvada", sets: 5, reps: 8, rest: 90 },
      { name: "Levantamento terra sumo", sets: 5, reps: 6, rest: 120 },
      { name: "Leg curl", sets: 5, reps: 10, rest: 75 },
    ],
    lose_weight: [
      { name: "Burpees com salto", sets: 5, reps: 15, rest: 30 },
      { name: "Thruster", sets: 5, reps: 15, rest: 45 },
      { name: "Clean and press", sets: 5, reps: 12, rest: 45 },
      { name: "Rowing machine", sets: 5, reps: 60, rest: 60 },
      { name: "Assault bike", sets: 6, reps: 45, rest: 60 },
    ],
    endurance: [
      { name: "Muscle-ups", sets: 5, reps: 8, rest: 60 },
      { name: "Pistol squats", sets: 5, reps: 10, rest: 45 },
      { name: "Prancha RKC", sets: 5, reps: 60, rest: 45 },
      { name: "Handstand push-ups", sets: 5, reps: 8, rest: 60 },
      { name: "Dragon flag", sets: 5, reps: 8, rest: 60 },
    ],
    health: [
      { name: "Corrida moderada", sets: 1, reps: 40, rest: 0 },
      { name: "Mobilidade articular", sets: 1, reps: 15, rest: 0 },
      { name: "Agachamento pistol", sets: 4, reps: 8, rest: 75 },
      { name: "L-sit", sets: 4, reps: 30, rest: 60 },
      { name: "Archer push-ups", sets: 4, reps: 10, rest: 75 },
    ],
  },
};

export function generateWorkout(user: User): Exercise[] {
  const { goal, level, timeAvailable } = user;
  
  const exercises = exerciseDatabase[level][goal] || exerciseDatabase.beginner.health;
  
  let selectedExercises: Exercise[] = [];
  const exerciseCount = timeAvailable >= 60 ? 6 : timeAvailable >= 45 ? 5 : 4;
  
  const shuffled = [...exercises].sort(() => Math.random() - 0.5);
  selectedExercises = shuffled.slice(0, exerciseCount);
  
  return selectedExercises.map((ex, idx) => ({
    ...ex,
    id: `${Date.now()}-${idx}`,
    completed: false,
  }));
}

export function calculateWorkoutPoints(
  duration: number,
  exerciseCount: number,
  streak: number,
  level: "beginner" | "intermediate" | "advanced"
): number {
  const levelMultiplier = level === "beginner" ? 1 : level === "intermediate" ? 1.3 : 1.6;
  const streakMultiplier = 1 + (streak * 0.05);
  
  const basePoints = (duration * levelMultiplier) + (exerciseCount * 50);
  const totalPoints = Math.round(basePoints * streakMultiplier);
  
  return totalPoints;
}

export function estimateCalories(
  duration: number,
  level: "beginner" | "intermediate" | "advanced",
  weight: number
): number {
  const baseRate = level === "beginner" ? 5 : level === "intermediate" ? 7 : 9;
  return Math.round((duration * baseRate * weight) / 70);
}
