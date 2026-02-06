import { Link } from "react-router-dom";
import { Crown, Sparkles, Zap } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const planConfig = {
  free: {
    label: "Free",
    icon: Zap,
    className: "bg-muted text-muted-foreground hover:bg-muted/80 border-border",
  },
  pro: {
    label: "Pro",
    icon: Sparkles,
    className: "bg-primary/15 text-primary hover:bg-primary/25 border-primary/30",
  },
  enterprise: {
    label: "Enterprise",
    icon: Crown,
    className: "bg-accent/15 text-accent hover:bg-accent/25 border-accent/30",
  },
} as const;

const PlanBadge = () => {
  const { plan, isLoading } = useSubscription();

  if (isLoading) {
    return <Skeleton className="h-6 w-16 rounded-full" />;
  }

  const config = planConfig[plan];
  const Icon = config.icon;

  return (
    <Link to="/pricing">
      <Badge
        variant="outline"
        className={`gap-1 cursor-pointer transition-colors text-xs font-medium px-2.5 py-0.5 ${config.className}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    </Link>
  );
};

export default PlanBadge;
