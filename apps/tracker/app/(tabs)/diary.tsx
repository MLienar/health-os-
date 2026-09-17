import { Screen } from "@/components/Screen";
import { Text } from "@/components/ui/text";

export default function DiaryScreen() {
  return (
    <Screen name="diary" title="Diary">
      <Text testID="diary.placeholder" className="text-muted-foreground">
        The food diary arrives with #103.
      </Text>
    </Screen>
  );
}
