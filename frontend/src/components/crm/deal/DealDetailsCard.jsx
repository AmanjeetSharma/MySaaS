import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Mail,
  Phone,
  User,
  Clock3,
  Pencil,
  ArrowUpRight,
  Flag,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const STATUS_STYLES = {
  active: {
    variant: "secondary",
    className:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  won: {
    variant: "default",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  lost: {
    variant: "destructive",
    className:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
};

const DealDetailsCard = ({ deal, onEdit, onStatus, onDelete }) => {
  if (!deal) return null;

  const status = deal.status?.toLowerCase() || "active";
  const navigate = useNavigate();
  const statusConfig = STATUS_STYLES[status] || STATUS_STYLES.active;

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch {
      return "—";
    }
  };

  return (
    <Card className="border-muted/80 shadow-lg rounded-xl overflow-hidden bg-gradient-to-b from-card to-background text-card-foreground max-w-none h-full transition-all duration-300 hover:shadow-xl hover:border-muted-foreground/20 flex flex-col">

      {/* Header */}
      <CardHeader className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-3 space-y-0 flex flex-row items-center justify-between gap-2 sm:gap-4 shrink-0">
        <div className="flex flex-col gap-0.5 sm:gap-1 truncate max-w-[65%] sm:max-w-[70%]">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
            Deal Overview
          </span>

          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-foreground/90 truncate">
            {deal.title || "Untitled Deal"}
          </h1>
        </div>

        <Badge
          variant={statusConfig.variant}
          className={`capitalize px-2 sm:px-3 py-0.5 text-[10px] sm:text-[11px] font-medium tracking-wide shadow-sm shrink-0 border border-solid ${statusConfig.className}`}
        >
          {status}
        </Badge>
      </CardHeader>

      {/* Separator */}
      <div className="px-4 sm:px-6">
        <Separator className="bg-muted/60" />
      </div>

      {/* Body */}
      <CardContent className="px-4 pt-3 pb-4 sm:px-6 sm:pt-4 sm:pb-6 space-y-3 sm:space-y-4 text-xs flex-1 overflow-y-auto">

        {/* Customer Profile */}
        <div className="space-y-2">
          <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-muted-foreground/50" />
            Customer Profile
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <div className="font-semibold text-foreground text-sm tracking-tight">
              {deal.customer?.name || "Unknown Customer"}
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              {deal.customer?.email && (
                <div className="flex items-center gap-2.5 text-muted-foreground/90">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                  <a
                    href={`mailto:${deal.customer.email}`}
                    className="group inline-flex items-center hover:text-primary underline-offset-4 hover:underline truncate transition-colors font-medium"
                  >
                    <span className="truncate max-w-[180px] xs:max-w-xs sm:max-w-none">
                      {deal.customer.email}
                    </span>
                    <ArrowUpRight className="h-3 w-3 ml-0.5 text-muted-foreground/40 group-hover:text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              )}

              {deal.customer?.phone && (
                <div className="flex items-center gap-2.5 text-muted-foreground/90">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                  <a
                    href={`tel:${deal.customer.phone}`}
                    className="hover:text-primary transition-colors font-medium"
                  >
                    {deal.customer.phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator className="bg-muted/60" />

        {/* Timeline */}
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-muted-foreground/90">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground/40" />
              <span>Created on</span>
            </div>
            <span className="font-medium text-foreground/80">
              {formatDate(deal.createdAt)}
            </span>
          </div>

          <div className="flex items-center justify-between text-muted-foreground/90">
            <div className="flex items-center gap-2">
              <Clock3 className="h-3.5 w-3.5 text-muted-foreground/40" />
              <span>Latest Interaction</span>
            </div>
            <span className="font-medium text-foreground/80">
              {formatDate(deal.latestInteractionAt)}
            </span>
          </div>

          {deal.closedAt && (
            <div
              className={`flex items-center justify-between p-2 rounded-xl border mt-2 ${
                status === "lost"
                  ? "bg-rose-500/5 text-rose-600 border-rose-500/10 dark:text-rose-400"
                  : status === "won"
                  ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/10 dark:text-emerald-400"
                  : "bg-muted/40 text-muted-foreground border-muted/60"
              }`}
            >
              <div className="flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5 opacity-80" />
                <span className="font-medium capitalize text-[11px] sm:text-xs">
                  Closed ({status})
                </span>
              </div>
              <span className="font-semibold text-[11px] sm:text-xs">
                {formatDate(deal.closedAt)}
              </span>
            </div>
          )}
        </div>

        <Separator className="bg-muted/60" />

        {/* Audit */}
        <div className="space-y-1.5 sm:space-y-2 text-[11px]">
          <div className="flex items-center justify-between text-muted-foreground/90">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-muted-foreground/40" />
              <span>Owner</span>
            </div>
            {deal.createdBy?._id ? (
              <Button
                variant="link"
                className="h-auto p-0 text-[11px] cursor-pointer"
                onClick={() =>
                  navigate(`/members/${deal.createdBy._id}`)
                }
              >
                {deal.createdBy.name}
                <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            ) : (
              <span className="italic text-muted-foreground/60">
                System Base
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-muted-foreground/90">
            <div className="flex items-center gap-2">
              <Clock3 className="h-3.5 w-3.5 text-muted-foreground/40" />
              <span>Updated By</span>
            </div>
            {deal.updatedBy?._id ? (
              <Button
                variant="link"
                className="h-auto p-0 text-[11px] cursor-pointer"
                onClick={() =>
                  navigate(`/members/${deal.updatedBy._id}`)
                }
              >
                {deal.updatedBy.name}
                <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            ) : (
              <span className="italic text-muted-foreground/60">
                System Process
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="h-8 sm:h-9 text-[10px] sm:text-xs rounded-xl px-1 sm:px-2.5"
          >
            <Pencil className="mr-1 sm:mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
            <span className="truncate">Edit Details</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onStatus}
            className="h-8 sm:h-9 text-[10px] sm:text-xs rounded-xl px-1 sm:px-2.5"
          >
            <Flag className="mr-1 sm:mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
            <span className="truncate">Status</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="h-8 sm:h-9 text-[10px] sm:text-xs rounded-xl px-1 sm:px-2.5"
          >
            <Trash2 className="mr-1 sm:mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
            <span className="truncate">Delete</span>
          </Button>
        </div>

      </CardContent>
    </Card>
  );
};

export default DealDetailsCard;