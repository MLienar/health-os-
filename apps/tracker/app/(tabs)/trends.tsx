import { Screen } from "@/components/Screen";
import { Text } from "@/components/ui/text";

export default function TrendsScreen() {
  return (
    <Screen name="trends" title="Trends">
      <Text testID="trends.placeholder" className="text-muted-foreground">
        Weight trend arrives with #114.
      </Text>
    </Screen>
  );
}
