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
      "border-accent/30 bg-transparent text-accent",
  },

  won: {
    label: "Won",
    icon: Trophy,
    badgeClass:
      "border-success/30 bg-transparent text-success",
  },

  lost: {
    label: "Lost",
    icon: TrendingDown,
    badgeClass:
      "border-destructive/30 bg-transparent text-destructive",
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
        "group w-full rounded-2xl border border-border-subtle bg-surface text-left transition-all duration-150 p-3 sm:p-4",
        "hover:border-accent/40 hover:bg-surface-sunken hover:shadow-xs",
        "focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
      )}
    >
      {/* MOBILE (< lg breakpoint) */}
      <div className="block lg:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-heading truncate text-sm font-bold text-foreground group-hover:text-accent transition-colors">
              {deal?.title || "Untitled Deal"}
            </h3>

            <p className="mt-1 truncate text-xs text-subtle-foreground">
              {latestActivity}
            </p>
          </div>

          <Badge
            variant="outline"
            className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider", status.badgeClass)}
          >
            <StatusIcon className="mr-1 size-3" />
            {status.label}
          </Badge>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border-subtle pt-3 text-subtle-foreground">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle-foreground/80">
              Last
            </p>

            <p className="mt-0.5 text-xs font-medium text-foreground">
              {deal?.latestInteractionAt
                ? formatDate(deal.latestInteractionAt)
                : "No activity"}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle-foreground/80">
              Created
            </p>

            <p className="mt-0.5 text-xs font-medium text-foreground">
              {formatDate(deal?.createdAt)}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle-foreground/80">
              Closed
            </p>

            <p className="mt-0.5 text-xs font-medium text-foreground">
              {deal?.closedAt
                ? formatDate(deal.closedAt)
                : "—"}
            </p>
          </div>
        </div>

        <div className="mt-2 flex justify-end">
          <ArrowRight
            className={cn(
              "size-4 text-subtle-foreground/50 transition-transform duration-150",
              "group-hover:translate-x-1 group-hover:text-foreground"
            )}
          />
        </div>
      </div>

      {/* TABLET + DESKTOP (≥ lg breakpoint) */}
      <div className="hidden lg:flex lg:items-center lg:gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-heading truncate text-sm font-bold text-foreground group-hover:text-accent transition-colors">
            {deal?.title || "Untitled Deal"}
          </h3>

          <p className="mt-1 truncate text-xs text-subtle-foreground">
            {latestActivity}
          </p>
        </div>

        <div className="min-w-30 flex justify-center">
          <Badge
            variant="outline"
            className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider", status.badgeClass)}
          >
            <StatusIcon className="mr-1 size-3" />
            {status.label}
          </Badge>
        </div>

        <div className="min-w-35 text-center">
          <p className="text-xs text-subtle-foreground">
            Last Interaction
          </p>

          <p className="text-sm font-semibold text-foreground">
            {deal?.latestInteractionAt
              ? formatDate(deal.latestInteractionAt)
              : "No activity"}
          </p>
        </div>

        <div className="min-w-30 text-center">
          <p className="text-xs text-subtle-foreground">
            Created
          </p>

          <p className="text-sm font-semibold text-foreground">
            {formatDate(deal?.createdAt)}
          </p>
        </div>

        <div className="min-w-30 text-center">
          <p className="text-xs text-subtle-foreground">
            Closed
          </p>

          <p className="text-sm font-semibold text-foreground">
            {deal?.closedAt
              ? formatDate(deal.closedAt)
              : "—"}
          </p>
        </div>

        <ArrowRight
          className={cn(
            "size-4 text-subtle-foreground/50 transition-transform duration-150",
            "group-hover:translate-x-1 group-hover:text-foreground"
          )}
        />
      </div>
    </button>
  );
};

export default DealRow;