import { Exercise } from "./storage";
import { User } from "@/hooks/useAuth";

type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'biceps' | 'triceps' | 'abs';

interface GymExercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  sets: number;
  reps: string;
  rest: number;
}

interface WorkoutPlan {
  name: string;
  type: 'ABC' | 'ABCD' | 'FullBody' | 'UpperLower';
  daysPerWeek: number;
  workouts: {
    day: string;
    exercises: GymExercise[];
  }[];
}

const gymExerciseDatabase: Record<MuscleGroup, GymExercise[]> = {
  chest: [
    { id: 'chest-1', name: 'Supino Reto', muscleGroup: 'chest', sets: 4, reps: '8-12', rest: 90 },
    { id: 'chest-2', name: 'Supino Inclinado', muscleGroup: 'chest', sets: 4, reps: '8-12', rest: 90 },
    { id: 'chest-3', name: 'Supino Declinado', muscleGroup: 'chest', sets: 3, reps: '10-12', rest: 75 },
    { id: 'chest-4', name: 'Crucifixo Reto', muscleGroup: 'chest', sets: 3, reps: '12-15', rest: 60 },
    { id: 'chest-5', name: 'Crucifixo Inclinado', muscleGroup: 'chest', sets: 3, reps: '12-15', rest: 60 },
    { id: 'chest-6', name: 'Voador (Peck Deck)', muscleGroup: 'chest', sets: 3, reps: '12-15', rest: 60 },
    { id: 'chest-7', name: 'Flexão de Braço', muscleGroup: 'chest', sets: 3, reps: '15-20', rest: 45 },
    { id: 'chest-8', name: 'Cross Over', muscleGroup: 'chest', sets: 3, reps: '12-15', rest: 60 },
  ],
  back: [
    { id: 'back-1', name: 'Remada Curvada', muscleGroup: 'back', sets: 4, reps: '8-12', rest: 90 },
    { id: 'back-2', name: 'Pulldown Frente', muscleGroup: 'back', sets: 4, reps: '10-12', rest: 75 },
    { id: 'back-3', name: 'Remada Sentada', muscleGroup: 'back', sets: 4, reps: '10-12', rest: 75 },
    { id: 'back-4', name: 'Levantamento Terra', muscleGroup: 'back', sets: 4, reps: '6-10', rest: 120 },
    { id: 'back-5', name: 'Pulley Frente', muscleGroup: 'back', sets: 3, reps: '12-15', rest: 60 },
    { id: 'back-6', name: 'Remada Unilateral', muscleGroup: 'back', sets: 3, reps: '10-12', rest: 60 },
    { id: 'back-7', name: 'Barra Fixa', muscleGroup: 'back', sets: 3, reps: '8-12', rest: 90 },
    { id: 'back-8', name: 'Pulldown Triângulo', muscleGroup: 'back', sets: 3, reps: '10-12', rest: 75 },
  ],
  legs: [
    { id: 'legs-1', name: 'Agachamento Livre', muscleGroup: 'legs', sets: 4, reps: '8-12', rest: 120 },
    { id: 'legs-2', name: 'Leg Press 45°', muscleGroup: 'legs', sets: 4, reps: '10-15', rest: 90 },
    { id: 'legs-3', name: 'Cadeira Extensora', muscleGroup: 'legs', sets: 3, reps: '12-15', rest: 60 },
    { id: 'legs-4', name: 'Cadeira Flexora', muscleGroup: 'legs', sets: 3, reps: '12-15', rest: 60 },
    { id: 'legs-5', name: 'Stiff', muscleGroup: 'legs', sets: 4, reps: '10-12', rest: 90 },
    { id: 'legs-6', name: 'Afundo', muscleGroup: 'legs', sets: 3, reps: '12-15', rest: 60 },
    { id: 'legs-7', name: 'Agachamento Búlgaro', muscleGroup: 'legs', sets: 3, reps: '10-12', rest: 75 },
    { id: 'legs-8', name: 'Panturrilha em Pé', muscleGroup: 'legs', sets: 4, reps: '15-20', rest: 45 },
    { id: 'legs-9', name: 'Panturrilha Sentado', muscleGroup: 'legs', sets: 3, reps: '15-20', rest: 45 },
  ],
  shoulders: [
    { id: 'shoulders-1', name: 'Desenvolvimento Barra', muscleGroup: 'shoulders', sets: 4, reps: '8-12', rest: 90 },
    { id: 'shoulders-2', name: 'Desenvolvimento Halteres', muscleGroup: 'shoulders', sets: 4, reps: '10-12', rest: 90 },
    { id: 'shoulders-3', name: 'Elevação Lateral', muscleGroup: 'shoulders', sets: 3, reps: '12-15', rest: 60 },
    { id: 'shoulders-4', name: 'Elevação Frontal', muscleGroup: 'shoulders', sets: 3, reps: '12-15', rest: 60 },
    { id: 'shoulders-5', name: 'Remada Alta', muscleGroup: 'shoulders', sets: 3, reps: '12-15', rest: 60 },
    { id: 'shoulders-6', name: 'Crucifixo Inverso', muscleGroup: 'shoulders', sets: 3, reps: '12-15', rest: 60 },
    { id: 'shoulders-7', name: 'Desenvolvimento Arnold', muscleGroup: 'shoulders', sets: 3, reps: '10-12', rest: 75 },
  ],
  biceps: [
    { id: 'biceps-1', name: 'Rosca Direta', muscleGroup: 'biceps', sets: 3, reps: '10-12', rest: 60 },
    { id: 'biceps-2', name: 'Rosca Alternada', muscleGroup: 'biceps', sets: 3, reps: '10-12', rest: 60 },
    { id: 'biceps-3', name: 'Rosca Scott', muscleGroup: 'biceps', sets: 3, reps: '10-12', rest: 60 },
    { id: 'biceps-4', name: 'Rosca Martelo', muscleGroup: 'biceps', sets: 3, reps: '10-12', rest: 60 },
    { id: 'biceps-5', name: 'Rosca Concentrada', muscleGroup: 'biceps', sets: 3, reps: '12-15', rest: 45 },
    { id: 'biceps-6', name: 'Rosca 21', muscleGroup: 'biceps', sets: 2, reps: '21', rest: 60 },
  ],
  triceps: [
    { id: 'triceps-1', name: 'Tríceps Testa', muscleGroup: 'triceps', sets: 3, reps: '10-12', rest: 60 },
    { id: 'triceps-2', name: 'Tríceps Corda', muscleGroup: 'triceps', sets: 3, reps: '12-15', rest: 60 },
    { id: 'triceps-3', name: 'Tríceps Francês', muscleGroup: 'triceps', sets: 3, reps: '10-12', rest: 60 },
    { id: 'triceps-4', name: 'Mergulho', muscleGroup: 'triceps', sets: 3, reps: '10-15', rest: 75 },
    { id: 'triceps-5', name: 'Tríceps Barra', muscleGroup: 'triceps', sets: 3, reps: '12-15', rest: 60 },
    { id: 'triceps-6', name: 'Tríceps Coice', muscleGroup: 'triceps', sets: 3, reps: '12-15', rest: 45 },
  ],
  abs: [
    { id: 'abs-1', name: 'Abdominal Supra', muscleGroup: 'abs', sets: 3, reps: '15-20', rest: 45 },
    { id: 'abs-2', name: 'Prancha Isométrica', muscleGroup: 'abs', sets: 3, reps: '30-60s', rest: 45 },
    { id: 'abs-3', name: 'Elevação de Pernas', muscleGroup: 'abs', sets: 3, reps: '12-15', rest: 45 },
    { id: 'abs-4', name: 'Abdominal Infra', muscleGroup: 'abs', sets: 3, reps: '15-20', rest: 45 },
    { id: 'abs-5', name: 'Prancha Lateral', muscleGroup: 'abs', sets: 3, reps: '30-45s', rest: 45 },
    { id: 'abs-6', name: 'Abdominal Bicicleta', muscleGroup: 'abs', sets: 3, reps: '20-30', rest: 45 },
    { id: 'abs-7', name: 'Abdominal Oblíquo', muscleGroup: 'abs', sets: 3, reps: '15-20', rest: 45 },
  ],
};

const workoutPlans: WorkoutPlan[] = [
  {
    name: 'Treino ABC',
    type: 'ABC',
    daysPerWeek: 3,
    workouts: [
      {
        day: 'A',
        exercises: [
          gymExerciseDatabase.chest[0],
          gymExerciseDatabase.chest[1],
          gymExerciseDatabase.chest[3],
          gymExerciseDatabase.triceps[0],
          gymExerciseDatabase.triceps[1],
          gymExerciseDatabase.triceps[3],
        ],
      },
      {
        day: 'B',
        exercises: [
          gymExerciseDatabase.back[0],
          gymExerciseDatabase.back[1],
          gymExerciseDatabase.back[2],
          gymExerciseDatabase.back[6],
          gymExerciseDatabase.biceps[0],
          gymExerciseDatabase.biceps[1],
        ],
      },
      {
        day: 'C',
        exercises: [
          gymExerciseDatabase.legs[0],
          gymExerciseDatabase.legs[1],
          gymExerciseDatabase.legs[2],
          gymExerciseDatabase.legs[3],
          gymExerciseDatabase.shoulders[0],
          gymExerciseDatabase.shoulders[2],
        ],
      },
    ],
  },
  {
    name: 'Treino ABCD',
    type: 'ABCD',
    daysPerWeek: 4,
    workouts: [
      {
        day: 'A',
        exercises: [
          gymExerciseDatabase.chest[0],
          gymExerciseDatabase.chest[1],
          gymExerciseDatabase.chest[3],
          gymExerciseDatabase.chest[4],
          gymExerciseDatabase.chest[5],
        ],
      },
      {
        day: 'B',
        exercises: [
          gymExerciseDatabase.back[0],
          gymExerciseDatabase.back[1],
          gymExerciseDatabase.back[3],
          gymExerciseDatabase.back[2],
          gymExerciseDatabase.back[6],
        ],
      },
      {
        day: 'C',
        exercises: [
          gymExerciseDatabase.legs[0],
          gymExerciseDatabase.legs[1],
          gymExerciseDatabase.legs[2],
          gymExerciseDatabase.legs[3],
          gymExerciseDatabase.legs[4],
        ],
      },
      {
        day: 'D',
        exercises: [
          gymExerciseDatabase.shoulders[0],
          gymExerciseDatabase.shoulders[2],
          gymExerciseDatabase.shoulders[3],
          gymExerciseDatabase.biceps[0],
          gymExerciseDatabase.biceps[2],
          gymExerciseDatabase.triceps[0],
          gymExerciseDatabase.triceps[1],
        ],
      },
    ],
  },
  {
    name: 'Treino Full Body',
    type: 'FullBody',
    daysPerWeek: 3,
    workouts: [
      {
        day: 'FullBody',
        exercises: [
          gymExerciseDatabase.chest[0],
          gymExerciseDatabase.back[1],
          gymExerciseDatabase.legs[0],
          gymExerciseDatabase.shoulders[0],
          gymExerciseDatabase.biceps[0],
          gymExerciseDatabase.triceps[0],
          gymExerciseDatabase.abs[0],
          gymExerciseDatabase.abs[1],
        ],
      },
    ],
  },
  {
    name: 'Treino Upper/Lower',
    type: 'UpperLower',
    daysPerWeek: 4,
    workouts: [
      {
        day: 'Upper',
        exercises: [
          gymExerciseDatabase.chest[0],
          gymExerciseDatabase.chest[1],
          gymExerciseDatabase.back[0],
          gymExerciseDatabase.back[1],
          gymExerciseDatabase.shoulders[0],
          gymExerciseDatabase.biceps[0],
          gymExerciseDatabase.triceps[0],
        ],
      },
      {
        day: 'Lower',
        exercises: [
          gymExerciseDatabase.legs[0],
          gymExerciseDatabase.legs[1],
          gymExerciseDatabase.legs[2],
          gymExerciseDatabase.legs[3],
          gymExerciseDatabase.legs[4],
          gymExerciseDatabase.abs[0],
          gymExerciseDatabase.abs[1],
        ],
      },
    ],
  },
];

export function generateWorkout(user: User): Exercise[] {
  const fullBodyWorkout = workoutPlans.find(plan => plan.type === 'FullBody');
  
  if (!fullBodyWorkout || !fullBodyWorkout.workouts[0]) {
    return [];
  }

  const gymExercises = fullBodyWorkout.workouts[0].exercises;
  
  return gymExercises.map((ex, idx) => ({
    id: `${Date.now()}-${idx}`,
    name: ex.name,
    sets: ex.sets,
    reps: typeof ex.reps === 'string' ? parseInt(ex.reps.split('-')[0]) : ex.reps,
    rest: ex.rest,
    completed: false,
    muscleGroup: getMuscleGroupLabel(ex.muscleGroup),
  }));
}

function getMuscleGroupLabel(muscleGroup: MuscleGroup): string {
  const labels: Record<MuscleGroup, string> = {
    chest: 'Peito',
    back: 'Costas',
    legs: 'Pernas',
    shoulders: 'Ombros',
    biceps: 'Bíceps',
    triceps: 'Tríceps',
    abs: 'Abdômen',
  };
  return labels[muscleGroup] || 'Geral';
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

export { gymExerciseDatabase, workoutPlans };
export type { GymExercise, WorkoutPlan, MuscleGroup };
