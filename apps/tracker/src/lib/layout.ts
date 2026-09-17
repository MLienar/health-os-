import { useWindowDimensions } from "react-native";

/** Breakpoint at which the bottom tab bar becomes a side rail (SPEC §3.4). */
export const WIDE_BREAKPOINT = 768;
/** Max content column width on wide viewports. */
export const CONTENT_MAX_WIDTH = 640;

export function useIsWide() {
  const { width } = useWindowDimensions();
  return width >= WIDE_BREAKPOINT;
}
