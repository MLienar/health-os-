import { Slot } from "@rn-primitives/slot";
import { createContext, forwardRef, useContext } from "react";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { cn } from "@/lib/utils";

/**
 * Lets a parent (e.g. Button) set text classes on any Text children without prop drilling.
 * Mirrors react-native-reusables' TextClassContext.
 */
export const TextClassContext = createContext<string | undefined>(undefined);

export type TextProps = RNTextProps & {
  className?: string;
  /** Render into the child element instead of a Text node. */
  asChild?: boolean;
};

export const Text = forwardRef<RNText, TextProps>(({ className, asChild, ...props }, ref) => {
  const inherited = useContext(TextClassContext);
  const Component = asChild ? Slot : RNText;
  return (
    <Component
      ref={ref}
      className={cn("text-base text-foreground web:select-text", inherited, className)}
      {...props}
    />
  );
});
Text.displayName = "Text";
