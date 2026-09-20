import * as React from "react";
import { cn } from "~/lib/utils";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-4 rounded-xl border bg-white p-4", className)} {...props} />;
}
