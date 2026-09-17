import { forwardRef } from "react";
import { TextInput, type TextInputProps } from "react-native";
import { cn } from "@/lib/utils";

export type InputProps = TextInputProps & { className?: string; placeholderClassName?: string };

export const Input = forwardRef<TextInput, InputProps>(
  ({ className, placeholderClassName, editable = true, ...props }, ref) => (
    <TextInput
      ref={ref}
      editable={editable}
      className={cn(
        "h-11 rounded-md border border-input bg-background px-3 text-base text-foreground web:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring",
        !editable && "opacity-50 web:cursor-not-allowed",
        className,
      )}
      placeholderClassName={cn("text-muted-foreground", placeholderClassName)}
      {...props}
    />
  ),
);
Input.displayName = "Input";
