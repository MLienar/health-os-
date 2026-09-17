import { createContext, type ReactNode, useContext } from "react";
import { Pressable, View, type ViewProps } from "react-native";
import { Text, TextClassContext } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type TabsContextValue = { value: string; onValueChange: (v: string) => void };
const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs components must be used within <Tabs>");
  return ctx;
}

export type TabsProps = ViewProps & TabsContextValue & { className?: string };

/** In-screen segmented tabs (not app navigation). Controlled: pass value + onValueChange. */
export function Tabs({ value, onValueChange, className, ...props }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <View className={cn("gap-2", className)} {...props} />
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      role="tablist"
      className={cn("h-10 flex-row items-center justify-center rounded-md bg-muted p-1", className)}
      {...props}
    />
  );
}

export function TabsTrigger({
  value,
  children,
  className,
  testID,
}: {
  value: string;
  children: ReactNode;
  className?: string;
  testID?: string;
}) {
  const { value: current, onValueChange } = useTabs();
  const active = current === value;
  return (
    <TextClassContext.Provider
      value={cn("text-sm font-medium", active ? "text-foreground" : "text-muted-foreground")}
    >
      <Pressable
        role="tab"
        testID={testID}
        aria-selected={active}
        onPress={() => onValueChange(value)}
        className={cn(
          "flex-1 items-center justify-center rounded-sm px-3 py-1.5",
          active && "bg-background shadow-sm",
          className,
        )}
      >
        {typeof children === "string" ? <Text>{children}</Text> : children}
      </Pressable>
    </TextClassContext.Provider>
  );
}

export function TabsContent({
  value,
  children,
  className,
  ...props
}: ViewProps & { value: string; className?: string }) {
  const { value: current } = useTabs();
  if (current !== value) return null;
  return (
    <View role="tabpanel" className={cn("mt-2", className)} {...props}>
      {children}
    </View>
  );
}
