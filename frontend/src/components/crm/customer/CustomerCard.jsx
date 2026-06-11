import { ArrowRight, Clock3, MoreHorizontal, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "C";

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatInteractionDate = (date) => {
  if (!date) return "No last interactions";
  return `Active ${new Date(date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}`;
};

const CustomerCard = ({ customer, onOpen, onTimeline, onCreateDeal }) => {
  return (
    <Card className="rounded-lg border border-border/60 bg-background transition-shadow duration-200 hover:shadow-sm w-full">
      <CardContent className="p-3 space-y-2">

        {/* Row 1: Profile Block */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="size-6 border border-border/80 shrink-0">
              <AvatarFallback className="bg-muted text-[10px] font-semibold text-muted-foreground select-none">
                {getInitials(customer?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="truncate text-xs font-semibold tracking-tight text-foreground/90">
                {customer?.name || "Unnamed"}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Badge
              variant="outline"
              className="h-4 px-1.5 text-[9px] font-medium tracking-wide capitalize border-border/80 bg-muted/30 text-muted-foreground/90 select-none"
            >
              Source · {customer?.source || "manual"}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 md:h-5 md:w-5 text-muted-foreground/70 cursor-pointer"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 text-xs">
                <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => onOpen(customer)}>
                  Details
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => onTimeline(customer)}>
                  Timeline
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/60" />
                <DropdownMenuItem className="text-xs cursor-pointer text-foreground font-medium" onClick={() => onCreateDeal(customer)}>
                  <Plus className="mr-1.5 size-3.5 text-muted-foreground" /> New Deal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Flat Document List Separator Lines */}
        <div className="divide-y divide-border/40 border-t border-b border-border/40 text-[11px] bg-muted/5 rounded-sm px-1">

          {/* Email Item Row */}
          <div className="flex justify-between items-center py-1.5 gap-4">
            <span className="text-muted-foreground">Email</span>
            <span className="truncate font-medium text-foreground/90 max-w-40 font-sans">
              {customer?.email || "—"}
            </span>
          </div>

          {/* Phone Item Row */}
          <div className="flex justify-between items-center py-1.5">
            <span className="text-muted-foreground">Phone</span>
            <span className="font-medium text-foreground/90 font-mono tracking-tight">
              {customer?.phone || "—"}
            </span>
          </div>

          {/* Created Date Item Row */}
          <div className="flex justify-between items-center py-1.5">
            <span className="text-muted-foreground">Created</span>
            <span className="text-muted-foreground font-sans">{formatDate(customer?.createdAt)}</span>
          </div>
        </div>

        {/* Footer Interaction & Action Row */}
        <div className="flex items-center justify-between text-[11px] pt-0.5 px-0.5">
          <div className="flex items-center gap-1 text-muted-foreground/80 select-none">
            <Clock3 className="size-3 text-muted-foreground/50" />
            <span className="text-muted-foreground/70">{formatInteractionDate(customer?.latestInteractionAt)}</span>
          </div>

          <button
            onClick={() => onOpen(customer)}
            className="flex items-center gap-0.5 font-medium text-muted-foreground transition-colors hover:text-foreground group text-xs cursor-pointer"
          >
            <span>Manage</span>
            <ArrowRight className="size-3 transition-transform duration-150 group-hover:translate-x-0.5" />
          </button>
        </div>

      </CardContent>
    </Card>
  );
};

export default CustomerCard;