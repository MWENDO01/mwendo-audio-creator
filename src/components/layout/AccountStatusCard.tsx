import { Link } from "react-router-dom";
import { Crown, Sparkles, Zap, ArrowUpRight } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const AccountStatusCard = () => {
  const { plan, isActive, hasPaidPlan, isLoading, subscription } = useSubscription();

  if (isLoading) {
    return <Skeleton className="h-24 w-full rounded-2xl" />;
  }

  const isSubscriber = hasPaidPlan && isActive;
  const Icon = plan === "enterprise" ? Crown : plan === "pro" ? Sparkles : Zap;
  const label = isSubscriber ? "Subscriber" : "Free";
  const planName = plan.charAt(0).toUpperCase() + plan.slice(1);

  return (
    <div
      className="glass rounded-2xl p-4 flex items-center justify-between gap-4"
      role="status"
      aria-live="polite"
      data-account-status={isSubscriber ? "subscriber" : "free"}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isSubscriber
              ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Account status</p>
          <p className="font-semibold leading-tight">
            {label} <span className="text-muted-foreground font-normal">· {planName} plan</span>
          </p>
          {isSubscriber && subscription?.current_period_end && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Renews {new Date(subscription.current_period_end).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      {!isSubscriber && (
        <Link to="/pricing">
          <Button size="sm" variant="gradient" className="gap-1">
            Upgrade <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      )}
    </div>
  );
};

export default AccountStatusCard;