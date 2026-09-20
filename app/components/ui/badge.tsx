import * as React from "react";
import { cn } from "~/lib/utils";

export function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full bg-plum px-3 py-1 text-xs font-semibold text-white [&_svg]:size-3.5", className)}
      {...props}
    />
  );
}
