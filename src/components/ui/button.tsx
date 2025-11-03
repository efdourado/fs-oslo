import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 cursor-pointer select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:brightness-93 hover:scale-101", {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br bg-blue-300 dark:bg-blue-800 text-white shadow-xs hover:from-blue-600 hover:to-indigo-900 hover:shadow-md active:scale-[0.98]",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 hover:shadow-md active:scale-[0.98]",
        outline:
          "border border-gray-300 bg-background shadow-xs hover:bg-gray-50 hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 hover:shadow-sm active:scale-[0.98]",
        secondary:
          "bg-gray-100 text-gray-900 shadow-xs hover:bg-gray-200/80 dark:bg-gray-800 dark:text-gray-100 hover:shadow-sm active:scale-[0.98]",
        ghost:
          "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100 active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-5.5 has-[>svg]:px-4.5",
        lg: "h-10 px-10 has-[>svg]:px-8",
        icon: "size-10",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
      },
      radius: {
        default: "rounded-lg",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      radius: "default",
}, } )

function Button({
  className,
  variant,
  size,
  radius,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, radius }), className)}
      {...props}
    />
) }

export { Button, buttonVariants }