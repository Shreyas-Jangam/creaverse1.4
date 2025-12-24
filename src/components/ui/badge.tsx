import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "border-border text-foreground",
        // Custom DAO variants
        success: "border-transparent bg-success text-success-foreground",
        warning: "border-transparent bg-warning text-warning-foreground",
        accent: "border-transparent bg-accent text-accent-foreground",
        glow: "border-primary/50 bg-primary/20 text-primary shadow-sm shadow-primary/20",
        "glow-accent": "border-accent/50 bg-accent/20 text-accent shadow-sm shadow-accent/20",
        "glow-secondary": "border-secondary/50 bg-secondary/20 text-secondary shadow-sm shadow-secondary/20",
        glass: "glass border-border/50 text-foreground",
        gradient: "border-0 bg-gradient-primary text-primary-foreground",
        // Status badges
        active: "border-success/50 bg-success/20 text-success",
        pending: "border-warning/50 bg-warning/20 text-warning",
        passed: "border-primary/50 bg-primary/20 text-primary",
        rejected: "border-destructive/50 bg-destructive/20 text-destructive",
        draft: "border-muted-foreground/50 bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
