import type { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export type TabDef = {
  /** Expo Router route name inside app/(tabs). */
  name: "index" | "diary" | "train" | "trends" | "settings";
  /** URL path used for deep links and Playwright navigation. */
  href: "/" | "/diary" | "/train" | "/trends" | "/settings";
  title: string;
  icon: IoniconName;
  iconActive: IoniconName;
  testID: string;
};

/** Single source of truth for the five tabs, used by both the bottom bar and the side rail. */
export const TABS: readonly TabDef[] = [
  {
    name: "index",
    href: "/",
    title: "Today",
    icon: "today-outline",
    iconActive: "today",
    testID: "tabs.today",
  },
  {
    name: "diary",
    href: "/diary",
    title: "Diary",
    icon: "restaurant-outline",
    iconActive: "restaurant",
    testID: "tabs.diary",
  },
  {
    name: "train",
    href: "/train",
    title: "Train",
    icon: "barbell-outline",
    iconActive: "barbell",
    testID: "tabs.train",
  },
  {
    name: "trends",
    href: "/trends",
    title: "Trends",
    icon: "trending-up-outline",
    iconActive: "trending-up",
    testID: "tabs.trends",
  },
  {
    name: "settings",
    href: "/settings",
    title: "Settings",
    icon: "settings-outline",
    iconActive: "settings",
    testID: "tabs.settings",
  },
] as const;
