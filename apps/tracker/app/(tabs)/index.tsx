import { Screen } from "@/components/Screen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

export default function TodayScreen() {
  return (
    <Screen name="today" title="Today">
      <Card testID="today.placeholder">
        <CardHeader>
          <CardTitle>Nothing here yet</CardTitle>
        </CardHeader>
        <CardContent>
          <Text className="text-muted-foreground">
            Calories remaining, macros, weight quick-log and your workout arrive with milestone M1
            (#115).
          </Text>
        </CardContent>
      </Card>
    </Screen>
  );
}
