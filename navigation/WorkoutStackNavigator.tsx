import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WorkoutScreen from "@/screens/WorkoutScreen";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type WorkoutStackParamList = {
  Workout: undefined;
};

const Stack = createNativeStackNavigator<WorkoutStackParamList>();

export default function WorkoutStackNavigator() {
  return (
    <Stack.Navigator screenOptions={getCommonScreenOptions}>
      <Stack.Screen
        name="Workout"
        component={WorkoutScreen}
        options={{
          title: "Treinos",
        }}
      />
    </Stack.Navigator>
  );
}
