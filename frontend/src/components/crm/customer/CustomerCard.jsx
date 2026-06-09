import { ArrowRight, CalendarDays, Mail, MoreHorizontal, Phone, Plus, Clock3 } from "lucide-react";
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
    <Card className="rounded-lg border border-border/80 bg-background transition-shadow duration-150 hover:shadow-sm">
      <CardContent className="p-3.5 space-y-2.5">
        
        {/* Row 1: Profile Block */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="size-7 border border-border">
              <AvatarFallback className="bg-muted text-[11px] font-medium text-foreground">
                {getInitials(customer?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="truncate text-xs font-medium text-foreground">
                {customer?.name || "Unnamed"}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant="outline" className="h-4 px-1.5 text-[9px] font-normal tracking-wide capitalize text-muted-foreground">
              {customer?.source || "manual"}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-6 text-muted-foreground/80 hover:text-foreground">
                  <MoreHorizontal className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 text-xs">
                <DropdownMenuItem onClick={() => onOpen(customer)}>Details</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTimeline(customer)}>Timeline</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onCreateDeal(customer)}>
                  <Plus className="mr-1.5 size-3.5 text-muted-foreground" /> New Deal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Flat Document List Separator Lines */}
        <div className="divide-y divide-border/50 border-t border-b border-border/50 text-[11px]">
          
          {/* Email Item Row */}
          <div className="flex justify-between py-1.5 gap-4">
            <span className="text-muted-foreground">Email</span>
            <span className="truncate font-medium text-foreground/90 max-w-45">
              {customer?.email || "—"}
            </span>
          </div>

          {/* Phone Item Row */}
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground">Phone</span>
            <span className="font-medium text-foreground/90">{customer?.phone || "—"}</span>
          </div>

          {/* Created Date Item Row */}
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground">Created</span>
            <span className="text-foreground/80">{formatDate(customer?.createdAt)}</span>
          </div>
        </div>

        {/* Footer Interaction & Action Row */}
        <div className="flex items-center justify-between text-[11px] pt-0.5">
          <div className="flex items-center gap-1 text-muted-foreground/80">
            <Clock3 className="size-3 text-muted-foreground/60" />
            <span>{formatInteractionDate(customer?.latestInteractionAt)}</span>
          </div>

          <button
            onClick={() => onOpen(customer)}
            className="flex items-center gap-1 font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            <span>Manage</span>
            <ArrowRight className="size-3" />
          </button>
        </div>

      </CardContent>
    </Card>
  );
};

export default CustomerCard;