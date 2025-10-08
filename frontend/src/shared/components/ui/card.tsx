import * as React from "react";
import { cn } from "@/shared/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-border bg-background text-foreground shadow-sm",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

export { Card };
