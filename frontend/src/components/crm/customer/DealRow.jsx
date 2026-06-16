import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowRight,
  TrendingUp,
  Trophy,
  TrendingDown,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig = {
  active: {
    label: "Active",
    icon: TrendingUp,
    badgeClass:
      "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },

  won: {
    label: "Won",
    icon: Trophy,
    badgeClass:
      "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400",
  },

  lost: {
    label: "Lost",
    icon: TrendingDown,
    badgeClass:
      "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
  },
};

const formatDate = (date) => {
  if (!date) return "—";

  try {
    return format(new Date(date), "dd MMM yyyy");
  } catch {
    return "—";
  }
};

const DealRow = ({ deal }) => {
  const navigate = useNavigate();

  const status =
    statusConfig[deal?.status] ||
    statusConfig.active;

  const StatusIcon = status.icon;

  const latestActivity =
    deal?.latestActivitySummary ||
    "No activity yet";

  const handleClick = () => {
    navigate(`/deals/${deal._id}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "group w-full rounded-lg border border-border bg-card text-left transition-all",
        "hover:border-primary/30 hover:bg-accent/30",
        "focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
      )}
    >
      {/* MOBILE */}
      <div className="block p-3 lg:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-foreground">
              {deal?.title || "Untitled Deal"}
            </h3>

            <p className="mt-1 truncate text-xs text-muted-foreground">
              {latestActivity}
            </p>
          </div>

          <Badge
            variant="outline"
            className={cn("shrink-0", status.badgeClass)}
          >
            <StatusIcon className="mr-1 size-3" />
            {status.label}
          </Badge>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border/50 pt-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Last
            </p>

            <p className="mt-0.5 text-xs font-medium">
              {deal?.latestInteractionAt
                ? formatDate(deal.latestInteractionAt)
                : "No activity"}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Created
            </p>

            <p className="mt-0.5 text-xs font-medium">
              {formatDate(deal?.createdAt)}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Closed
            </p>

            <p className="mt-0.5 text-xs font-medium">
              {deal?.closedAt
                ? formatDate(deal.closedAt)
                : "—"}
            </p>
          </div>
        </div>

        <div className="mt-2 flex justify-end">
          <ArrowRight
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              "group-hover:translate-x-1"
            )}
          />
        </div>
      </div>

      {/* TABLET + DESKTOP (UNCHANGED LAYOUT) */}
      <div className="hidden lg:flex lg:items-center lg:gap-4 lg:p-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {deal?.title || "Untitled Deal"}
          </h3>

          <p className="mt-1 truncate text-xs text-muted-foreground">
            {latestActivity}
          </p>
        </div>

        <div className="min-w-30 justify-center">
          <Badge
            variant="outline"
            className={status.badgeClass}
          >
            <StatusIcon className="mr-1 size-3" />
            {status.label}
          </Badge>
        </div>

        <div className="min-w-35 text-center">
          <p className="text-xs text-muted-foreground">
            Last Interaction
          </p>

          <p className="text-sm font-medium">
            {deal?.latestInteractionAt
              ? formatDate(deal.latestInteractionAt)
              : "No activity"}
          </p>
        </div>

        <div className="min-w-30 text-center">
          <p className="text-xs text-muted-foreground">
            Created
          </p>

          <p className="text-sm font-medium">
            {formatDate(deal?.createdAt)}
          </p>
        </div>

        <div className="min-w-30 text-center">
          <p className="text-xs text-muted-foreground">
            Closed
          </p>

          <p className="text-sm font-medium">
            {deal?.closedAt
              ? formatDate(deal.closedAt)
              : "—"}
          </p>
        </div>

        <ArrowRight
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            "group-hover:translate-x-1"
          )}
        />
      </div>
    </button>
  );
};

export default DealRow;