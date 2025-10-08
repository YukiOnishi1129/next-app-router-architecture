import * as React from "react";
import { cn } from "@/shared/lib/utils";

const badgeVariants = {
  default:
    "inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground",
  success:
    "inline-flex items-center rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-medium text-white",
  destructive:
    "inline-flex items-center rounded-full bg-destructive px-2.5 py-0.5 text-xs font-medium text-destructive-foreground",
  outline:
    "inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-foreground",
};

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof badgeVariants;
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants[variant], className)}
      {...props}
    />
  ),
);
Badge.displayName = "Badge";

export { Badge };
