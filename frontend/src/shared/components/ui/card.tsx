"use client";

import * as React from "react";

import { cn } from "@/shared/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "border-border bg-background text-foreground rounded-lg border shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export { Card };
