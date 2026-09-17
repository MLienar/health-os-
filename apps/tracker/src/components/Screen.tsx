import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { CONTENT_MAX_WIDTH, useIsWide } from "@/lib/layout";
import { cn } from "@/lib/utils";

type Props = {
  /** Screen name for the root testID: `<name>.root`. */
  name: string;
  title: string;
  children?: ReactNode;
  className?: string;
};

/**
 * Every tab screen renders inside this: safe-area aware, scrollable, and constrained to a centered
 * column on wide web viewports (SPEC §3.4). The root carries `testID="<name>.root"`.
 */
export function Screen({ name, title, children, className }: Props) {
  const insets = useSafeAreaInsets();
  const isWide = useIsWide();
  return (
    <View
      testID={`${name}.root`}
      className="flex-1 bg-background"
      style={{ paddingTop: isWide ? 24 : insets.top }}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View
          className={cn("w-full self-center px-4", className)}
          style={isWide ? { maxWidth: CONTENT_MAX_WIDTH } : undefined}
        >
          <Text testID={`${name}.title`} className="mb-4 mt-2 text-3xl font-bold text-foreground">
            {title}
          </Text>
          {children}
        </View>
      </ScrollView>
    </View>
  );
}
