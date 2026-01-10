import { motion } from "framer-motion";
import { Crown, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CharacterLimitIndicatorProps {
  currentCount: number;
  plan: "free" | "pro" | "enterprise";
  className?: string;
}

const PLAN_LIMITS = {
  free: 5000,
  pro: 25000,
  enterprise: 100000,
};

const PLAN_LABELS = {
  free: "Free",
  pro: "Pro",
  enterprise: "Enterprise",
};

const CharacterLimitIndicator = ({ 
  currentCount, 
  plan, 
  className 
}: CharacterLimitIndicatorProps) => {
  const limit = PLAN_LIMITS[plan];
  const percentage = Math.min((currentCount / limit) * 100, 100);
  const remaining = Math.max(limit - currentCount, 0);
  const isNearLimit = percentage >= 80;
  const isAtLimit = currentCount >= limit;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Progress Bar */}
      <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-colors",
            isAtLimit 
              ? "bg-destructive" 
              : isNearLimit 
                ? "bg-amber-500" 
                : "bg-primary"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-medium",
            isAtLimit ? "text-destructive" : isNearLimit ? "text-amber-500" : "text-muted-foreground"
          )}>
            {currentCount.toLocaleString()} / {limit.toLocaleString()} characters
          </span>
          
          {isNearLimit && !isAtLimit && (
            <span className="flex items-center gap-1 text-amber-500">
              <AlertTriangle className="w-3 h-3" />
              {remaining.toLocaleString()} remaining
            </span>
          )}
          
          {isAtLimit && (
            <span className="flex items-center gap-1 text-destructive">
              <AlertTriangle className="w-3 h-3" />
              Limit reached
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className={cn(
            "px-2 py-0.5 rounded-full text-xs font-medium",
            plan === "free" 
              ? "bg-secondary text-muted-foreground" 
              : plan === "pro" 
                ? "bg-primary/20 text-primary" 
                : "bg-accent/20 text-accent"
          )}>
            {PLAN_LABELS[plan]}
          </span>
          
          {plan === "free" && (
            <Link to="/pricing">
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1">
                <Crown className="w-3 h-3 text-accent" />
                Upgrade
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export { CharacterLimitIndicator, PLAN_LIMITS };
