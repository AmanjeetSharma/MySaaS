import React, { memo } from "react";
import { format, formatDistanceToNowStrict } from "date-fns";
import {
  ArrowRight,
  CalendarClock,
  CircleDollarSign,
  Mail,
  Phone,
  Plus,
  TrendingDown,
  TrendingUp,
  Trophy,
  UserRound,
} from "lucide-react";

import { cn } from "@/lib/utils";

const statusConfig = {
  active: {
    label: "Active",
    icon: TrendingUp,
    className:
      "border-sky-500/30 bg-sky-500/10 text-sky-700 group-hover/row:bg-sky-500/15 dark:text-sky-300",
    dotClassName: "bg-sky-500",
  },
  won: {
    label: "Won",
    icon: Trophy,
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 group-hover/row:bg-emerald-500/15 dark:text-emerald-300",
    dotClassName: "bg-emerald-500",
  },
  lost: {
    label: "Lost",
    icon: TrendingDown,
    className:
      "border-rose-500/30 bg-rose-500/10 text-rose-700 group-hover/row:bg-rose-500/15 dark:text-rose-300",
    dotClassName: "bg-rose-500",
  },
};

// Cached formatter instances to prevent repeated instantiation per row
const formatters = {
  INR: new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }),
  USD: new Intl.NumberFormat("en-IN", { style: "currency", currency: "USD" }),
  EUR: new Intl.NumberFormat("en-IN", { style: "currency", currency: "EUR" }),
};

const getCustomerValue = (customer, field, fallback = "Not available") => {
  if (!customer || typeof customer === "string") return fallback;
  return customer[field] || fallback;
};

const formatAmount = (amount, currency = "INR") => {
  const numericAmount = Number(amount || 0);
  if (!numericAmount) return "No Value";

  const formatter = formatters[currency] || formatters.INR;
  return formatter.format(numericAmount);
};

const formatCompactDate = (date) => {
  if (!date) return "No date";
  try {
    return format(new Date(date), "dd MMM");
  } catch {
    return "No date";
  }
};

const formatRelativeDate = (date) => {
  if (!date) return null;
  try {
    return `${formatDistanceToNowStrict(new Date(date), { addSuffix: true })}`;
  } catch {
    return null;
  }
};

const OrgDealsRow = memo(({ deal, onOpen }) => {
  const status = statusConfig[deal?.status] || statusConfig.active;
  const StatusIcon = status.icon;
  const customerName = getCustomerValue(deal?.customer, "name", "Unknown customer");
  const customerEmail = getCustomerValue(deal?.customer, "email", "No email");
  const customerPhone = getCustomerValue(deal?.customer, "phone", "");
  const hasActivity = Boolean(deal?.latestInteractionAt || deal?.latestActivitySummary);
  const latestRelative = formatRelativeDate(deal?.latestInteractionAt);
  const createdRelative = formatRelativeDate(deal?.createdAt);
  const updatedRelative = formatRelativeDate(deal?.updatedAt);
  const amountLabel = formatAmount(deal?.amount, deal?.currency);

  return (
    <button
      type="button"
      onClick={() => onOpen?.(deal)}
      className={cn(
        "group/row w-full rounded-lg border border-border/70 bg-background text-left shadow-xs transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-primary/20 hover:bg-card hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
      )}
    >
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(260px,1.5fr)_minmax(220px,1fr)_minmax(220px,1.1fr)_150px_32px] lg:items-center">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors", status.className)}>
              <span className={cn("size-1.5 rounded-full", status.dotClassName)} />
              <StatusIcon className="size-3.5" />
              {status.label}
            </span>

            {!hasActivity && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                <Plus className="size-3" />
                No Activity
              </span>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-base">
              {deal?.title || "Untitled Deal"}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <UserRound className="size-3.5 shrink-0" />
              <span className="truncate">{customerName}</span>
            </p>
          </div>
        </div>

        <div className="min-w-0 rounded-md border border-border/60 bg-muted/20 p-2.5 lg:bg-transparent lg:p-0 lg:border-0">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Customer
          </p>
          <div className="space-y-1">
            <p className="flex min-w-0 items-center gap-1.5 text-xs text-foreground">
              <Mail className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{customerEmail}</span>
            </p>
            {customerPhone && (
              <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                <Phone className="size-3.5 shrink-0" />
                <span className="truncate">{customerPhone}</span>
              </p>
            )}
          </div>
        </div>

        <div className="min-w-0 space-y-2">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Latest Activity
            </p>
            {hasActivity ? (
              <div className="space-y-1">
                <p className="line-clamp-2 text-xs font-medium text-foreground">
                  {deal?.latestActivitySummary || "Activity logged"}
                </p>
                {latestRelative && (
                  <p className="text-[11px] text-muted-foreground">{latestRelative}</p>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">No activity yet</p>
                <p className="text-[11px] font-medium text-primary">Open deal to log first interaction</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:block lg:space-y-3 lg:text-right">
          <div>
            <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground lg:justify-end">
              <CircleDollarSign className="size-3" />
              Value
            </p>
            <p className={cn("text-sm font-semibold tabular-nums text-foreground", amountLabel === "No Value" && "font-medium text-muted-foreground")}>
              {amountLabel}
            </p>
          </div>
          <div>
            <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground lg:justify-end">
              <CalendarClock className="size-3" />
              Updated
            </p>
            <p className="text-xs font-medium text-foreground">{formatCompactDate(deal?.updatedAt || deal?.createdAt)}</p>
            <p className="text-[11px] text-muted-foreground">{updatedRelative || createdRelative || "No update"}</p>
          </div>
        </div>

        <div className="hidden justify-end lg:flex">
          <ArrowRight className="size-4 text-muted-foreground transition-transform duration-200 group-hover/row:translate-x-1 group-hover/row:text-foreground" />
        </div>
      </div>
    </button>
  );
});

OrgDealsRow.displayName = "OrgDealsRow";
  
export default OrgDealsRow;