import type { ReactNode } from "react";
import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { CONTENT_MAX_WIDTH, useIsWide } from "@/lib/layout";
import { cn } from "@/lib/utils";

export type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: ReactNode;
  /** testID for the sheet content root. */
  testID?: string;
  className?: string;
};

/**
 * Bottom sheet on phones, centered dialog on wide viewports. Built on RN Modal so it works
 * identically on web and native without a gesture library. Swipe-to-dismiss can come later.
 */
export function Sheet({ open, onOpenChange, title, children, testID, className }: SheetProps) {
  const insets = useSafeAreaInsets();
  const isWide = useIsWide();
  return (
    <Modal
      visible={open}
      transparent
      animationType={isWide ? "fade" : "slide"}
      onRequestClose={() => onOpenChange(false)}
    >
      <View
        className={cn("flex-1 bg-black/50", isWide ? "items-center justify-center" : "justify-end")}
      >
        <Pressable
          testID={testID ? `${testID}.backdrop` : undefined}
          className="absolute inset-0"
          onPress={() => onOpenChange(false)}
          accessibilityLabel="Close"
        />
        <View
          testID={testID}
          className={cn(
            "w-full bg-background p-4",
            isWide ? "rounded-lg border border-border" : "rounded-t-2xl",
            className,
          )}
          style={[
            isWide ? { maxWidth: CONTENT_MAX_WIDTH, maxHeight: "85%" } : { maxHeight: "92%" },
            !isWide && { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          {!isWide && <View className="mb-3 h-1.5 w-10 self-center rounded-full bg-muted" />}
          {title ? (
            <Text role="heading" aria-level={2} className="mb-3 text-xl font-semibold">
              {title}
            </Text>
          ) : null}
          {children}
        </View>
      </View>
    </Modal>
  );
}
