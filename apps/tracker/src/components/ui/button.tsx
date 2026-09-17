import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { Pressable, type PressableProps, type View } from "react-native";
import { TextClassContext } from "@/components/ui/text";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group flex-row items-center justify-center rounded-md web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring",
  {
    variants: {
      variant: {
        default: "bg-primary active:opacity-90 web:hover:opacity-90",
        destructive: "bg-destructive active:opacity-90 web:hover:opacity-90",
        outline: "border border-input bg-background active:bg-accent web:hover:bg-accent",
        secondary: "bg-secondary active:opacity-80 web:hover:opacity-80",
        ghost: "active:bg-accent web:hover:bg-accent",
        link: "",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-3",
        lg: "h-12 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

const buttonTextVariants = cva("text-sm font-medium web:whitespace-nowrap", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      destructive: "text-destructive-foreground",
      outline: "text-foreground group-active:text-accent-foreground",
      secondary: "text-secondary-foreground",
      ghost: "text-foreground group-active:text-accent-foreground",
      link: "text-primary underline",
    },
    size: {
      default: "text-base",
      sm: "text-sm",
      lg: "text-lg",
      icon: "",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});

export type ButtonProps = PressableProps &
  VariantProps<typeof buttonVariants> & {
    className?: string;
  };

export const Button = forwardRef<View, ButtonProps>(
  ({ className, variant, size, disabled, ...props }, ref) => (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        ref={ref}
        role="button"
        disabled={disabled}
        className={cn(disabled && "opacity-50", buttonVariants({ variant, size }), className)}
        {...props}
      />
    </TextClassContext.Provider>
  ),
);
Button.displayName = "Button";

export { buttonTextVariants, buttonVariants };
