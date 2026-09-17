import { View } from "react-native";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { type ThemePreference, useTheme } from "@/lib/theme";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export default function SettingsScreen() {
  const { preference, scheme, setPreference } = useTheme();
  return (
    <Screen name="settings" title="Settings">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <View className="flex-row gap-2" accessibilityRole="radiogroup">
            {OPTIONS.map((o) => (
              <Button
                key={o.value}
                testID={`settings.theme.${o.value}`}
                variant={preference === o.value ? "default" : "outline"}
                size="sm"
                accessibilityRole="radio"
                accessibilityState={{ checked: preference === o.value }}
                onPress={() => setPreference(o.value)}
              >
                <Text>{o.label}</Text>
              </Button>
            ))}
          </View>
          <Text testID="settings.theme.resolved" className="mt-3 text-sm text-muted-foreground">
            Currently {scheme}. Other settings arrive with #116.
          </Text>
        </CardContent>
      </Card>
    </Screen>
  );
}
