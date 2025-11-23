import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RankingScreen from "@/screens/RankingScreen";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type RankingStackParamList = {
  Ranking: undefined;
};

const Stack = createNativeStackNavigator<RankingStackParamList>();

export default function RankingStackNavigator() {
  return (
    <Stack.Navigator screenOptions={getCommonScreenOptions}>
      <Stack.Screen
        name="Ranking"
        component={RankingScreen}
        options={{
          title: "Ranking",
        }}
      />
    </Stack.Navigator>
  );
}
