import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all outline-none focus-visible:ring-4 focus-visible:ring-berry/30 disabled:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-plum text-white hover:bg-plum/90",
        outline: "border bg-white hover:bg-blush",
      },
      size: { default: "h-9 px-4 py-2 rounded-md", icon: "size-9 rounded-md" },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export function Button({
  className, variant, size, asChild = false, ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
