import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-muted-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-red-600 text-white font-semibold hover:bg-red-700 shadow-md shadow-red-600/20 focus-visible:ring-red-500",
        destructive:
          "bg-red-900/80 text-red-100 hover:bg-red-800 border border-red-700/50",
        outline:
          "border border-white/15 text-slate-200 hover:border-red-500/50 hover:text-white hover:bg-red-600/10 bg-transparent",
        secondary:
          "bg-[#191e2e] text-slate-200 hover:bg-[#20273c] border border-white/[0.08]",
        ghost:
          "text-slate-300 hover:text-white hover:bg-white/5",
        link:
          "text-red-500 underline-offset-4 hover:underline p-0 h-auto",
        gold:
          "bg-red-600 text-white font-semibold hover:bg-red-700 shadow-md shadow-red-600/20",
        goldGlow:
          "bg-red-600 text-white font-bold shadow-lg shadow-red-600/30 hover:bg-red-700 hover:brightness-105",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-6 text-base tracking-wide",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
