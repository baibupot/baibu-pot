import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium btn-touch focus-ring-modern disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transition-all duration-200 ease-out active:scale-95",
  {
    variants: {
      variant: {
        default: "gradient-primary text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:from-red-600 hover:to-red-700",
        outline:
          "border-2 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-950/20 hover:text-cyan-700 dark:hover:text-cyan-300",
        secondary:
          "bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-900 dark:text-white shadow-md hover:shadow-lg hover:-translate-y-0.5",
        ghost: "hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl",
        link: "text-cyan-600 dark:text-cyan-400 underline-offset-4 hover:underline",
        modern: "bg-white/10 backdrop-blur-md border border-white/20 text-slate-900 dark:text-white shadow-lg hover:bg-white/20 hover:shadow-xl hover:-translate-y-0.5",
        gradient: "bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:from-cyan-600 hover:via-teal-600 hover:to-emerald-600",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-11 w-11",
        touch: "h-12 px-6 py-3 text-base", // Mobil için optimize
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
