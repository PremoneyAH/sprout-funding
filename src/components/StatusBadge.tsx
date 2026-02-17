import { cn } from "@/lib/utils";
import type { CriterionResult } from "@/lib/types";

export function StatusBadge({ result }: { result: CriterionResult }) {
  const base = "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-semibold min-w-[100px] font-mono";

  const classes = {
    ok: "status-ok",
    fail: "status-fail",
    warning: "status-warning",
    value: "status-value",
    info: "bg-muted text-muted-foreground",
  };

  return (
    <span className={cn(base, classes[result.type])}>
      {result.status}
    </span>
  );
}
