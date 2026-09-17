import { forwardRef } from "react";
import { type Text as RNText, View, type ViewProps } from "react-native";
import { Text, TextClassContext, type TextProps } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type CardProps = ViewProps & { className?: string };

export const Card = forwardRef<View, CardProps>(({ className, ...props }, ref) => (
  <View
    ref={ref}
    className={cn("rounded-lg border border-border bg-card shadow-sm", className)}
    {...props}
  />
));
Card.displayName = "Card";

export const CardHeader = forwardRef<View, CardProps>(({ className, ...props }, ref) => (
  <View ref={ref} className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<RNText, TextProps>(({ className, ...props }, ref) => (
  <Text
    ref={ref}
    role="heading"
    aria-level={3}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight text-card-foreground",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<RNText, TextProps>(({ className, ...props }, ref) => (
  <Text ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<View, CardProps>(({ className, ...props }, ref) => (
  <TextClassContext.Provider value="text-card-foreground">
    <View ref={ref} className={cn("p-4 pt-0", className)} {...props} />
  </TextClassContext.Provider>
));
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<View, CardProps>(({ className, ...props }, ref) => (
  <View ref={ref} className={cn("flex-row items-center p-4 pt-0", className)} {...props} />
));
CardFooter.displayName = "CardFooter";
