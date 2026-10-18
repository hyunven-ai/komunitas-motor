import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border border-indigo-500/30 bg-indigo-500/15 text-indigo-300",
        secondary:
          "border border-white/10 bg-[#161a29] text-slate-300",
        destructive:
          "border border-rose-500/30 bg-rose-950/60 text-rose-300",
        success:
          "border border-emerald-500/30 bg-emerald-950/60 text-emerald-300",
        outline:
          "border border-white/20 text-slate-200",
        gold:
          "border border-indigo-500/35 bg-indigo-500/20 text-indigo-300 font-bold",
        warning:
          "border border-amber-500/30 bg-amber-950/60 text-amber-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
