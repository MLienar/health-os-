import { Screen } from "@/components/Screen";
import { Text } from "@/components/ui/text";

export default function TrainScreen() {
  return (
    <Screen name="train" title="Train">
      <Text testID="train.placeholder" className="text-muted-foreground">
        Workouts arrive with #110.
      </Text>
    </Screen>
  );
}
