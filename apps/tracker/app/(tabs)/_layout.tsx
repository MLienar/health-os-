import { Ionicons } from "@expo/vector-icons";
import { Link, Tabs, usePathname } from "expo-router";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { useIsWide } from "@/lib/layout";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { TABS } from "@/navigation/tabs";

const palette = {
  light: { active: "#0f172a", inactive: "#64748b", bar: "#ffffff", border: "#e2e8f0" },
  dark: { active: "#f8fafc", inactive: "#94a3b8", bar: "#0b0f14", border: "#1e293b" },
};

type Palette = (typeof palette)[keyof typeof palette];

/** Side rail for wide web viewports: same five destinations as the bottom bar. */
function SideRail({ colors }: { colors: Palette }) {
  const pathname = usePathname();
  return (
    <View
      testID="tabs.rail"
      className="w-56 border-r border-border bg-card px-3 py-6"
      accessibilityRole="tablist"
    >
      <Text className="mb-6 px-3 text-lg font-bold text-foreground">health-os</Text>
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link key={tab.name} href={tab.href} asChild>
            <Pressable
              testID={tab.testID}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              className={cn(
                "mb-1 flex-row items-center gap-3 rounded-lg px-3 py-2",
                active ? "bg-accent" : "hover:bg-accent/60",
              )}
            >
              <Ionicons
                name={active ? tab.iconActive : tab.icon}
                size={20}
                color={active ? colors.active : colors.inactive}
              />
              <Text
                className={cn(
                  "text-base",
                  active ? "font-semibold text-foreground" : "text-muted-foreground",
                )}
              >
                {tab.title}
              </Text>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  const isWide = useIsWide();
  const { scheme } = useTheme();
  const colors = palette[scheme];

  const tabs = (
    <Tabs
      // On wide viewports the side rail is the only tab bar: drop the bottom bar from the tree
      // entirely (a hidden bar would still render duplicate testIDs into the DOM).
      tabBar={isWide ? () => null : undefined}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.active,
        tabBarInactiveTintColor: colors.inactive,
        tabBarStyle: { backgroundColor: colors.bar, borderTopColor: colors.border },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarButtonTestID: tab.testID,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? tab.iconActive : tab.icon} size={22} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );

  if (!isWide) return tabs;

  return (
    <View className="flex-1 flex-row bg-background">
      <SideRail colors={colors} />
      <View className="flex-1">{tabs}</View>
    </View>
  );
}
