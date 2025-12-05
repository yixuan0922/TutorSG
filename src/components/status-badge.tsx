import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
  variant?: "sm" | "default";
}

export function StatusBadge({ status, variant = "default" }: StatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
      case "active":
        return "bg-chart-2 text-white border-chart-2";
      case "pending":
      case "under review":
        return "bg-chart-3 text-white border-chart-3";
      case "filled":
      case "suspended":
      case "closed":
        return "bg-muted text-muted-foreground border-muted";
      case "applied":
        return "bg-primary text-primary-foreground border-primary";
      default:
        return "bg-secondary text-secondary-foreground border-secondary";
    }
  };

  return (
    <Badge
      className={`${getStatusColor(status)} ${variant === "sm" ? "text-xs px-2 py-0.5" : ""}`}
      data-testid={`badge-status-${status.toLowerCase().replace(/\s+/g, "-")}`}
    >
      {status}
    </Badge>
  );
}
