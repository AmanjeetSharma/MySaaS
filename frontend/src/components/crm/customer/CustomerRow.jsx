import React from "react";
import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const EMPTY = "—";

const getInitials = (name = "") =>
    name.split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join("") || "C";

const formatDate = (date) => {
    if (!date) return EMPTY;
    return new Date(date).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const formatInteractionDate = (date) => {
    if (!date) return "No interactions";
    return `Active ${new Date(date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}`;
};

const CustomerRow = React.memo(({ customer, onOpen }) => {
    return (
        <tr
            onClick={() => onOpen(customer)}
            className="group border-b border-border/50 hover:bg-muted/40 transition-colors duration-150 cursor-pointer text-xs align-middle"
        >
            {/* Primary Column: Handles Stacked Mobile View OR Desktop Name Column */}
            <td className="py-2.5 pl-4 pr-3 font-medium text-foreground max-w-55 sm:max-w-none">

                {/* MOBILE LAYOUT (< sm breakpoint ONLY)*/}
                <div className="flex items-center gap-3 sm:hidden my-0.5">
                    <Avatar className="size-7 border border-border/80 shrink-0 select-none">
                        <AvatarFallback className="bg-muted text-[10px] font-semibold text-muted-foreground">
                            {getInitials(customer?.name)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col min-w-0 space-y-0.5">
                        {/* Row 1: Name + Optional Source Badge */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground/90 text-sm group-hover:text-primary transition-colors truncate">
                                {customer?.name || "Unnamed"}
                            </span>
                            {customer?.source && (
                                <Badge
                                    variant="outline"
                                    className="h-3.5 px-1 text-[8px] font-medium uppercase tracking-wider bg-muted/20 border-border/60 text-muted-foreground select-none"
                                >
                                    {customer.source}
                                </Badge>
                            )}
                        </div>
                                        
                        {/* Row 2: Inline Email & Phone metadata */}
                        <div className="flex items-center gap-1.5 text-muted-foreground/90 text-[11px] truncate">
                            <span className="truncate">{customer?.email || EMPTY}</span>
                            {(customer?.email && customer?.phone) && <span className="text-muted-foreground/40 font-normal select-none">•</span>}
                            <span className="font-medium tracking-tight shrink-0">{customer?.phone || EMPTY}</span>
                        </div>

                        {/* Row 3: Interaction Anchor */}
                        <div className="text-[10px] text-muted-foreground/70 font-medium">
                            {formatInteractionDate(customer?.latestInteractionAt)}
                        </div>
                    </div>
                </div>

                {/* DESKTOP/TABLET LAYOUT (≥ sm breakpoint ONLY)*/}
                <div className="hidden sm:flex items-center gap-2.5">
                    <Avatar className="size-6 border border-border/80 shrink-0 select-none">
                        <AvatarFallback className="bg-muted text-[10px] font-semibold text-muted-foreground">
                            {getInitials(customer?.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 sm:flex-row sm:items-center sm:gap-2">
                        <span className="truncate font-semibold text-foreground/90 group-hover:text-primary transition-colors">
                            {customer?.name || "Unnamed"}
                        </span>
                        {customer?.source && (
                            <Badge
                                variant="outline"
                                className="w-fit h-3.5 px-1 text-[8px] font-medium uppercase tracking-wider bg-muted/20 border-border/60 text-muted-foreground select-none mt-0.5 sm:mt-0"
                            >
                                {customer.source}
                            </Badge>
                        )}
                    </div>
                </div>

            </td>

            {/* Email Column - Desktop/Tablet layout preserved exactly */}
            <td className="py-2.5 px-3 text-muted-foreground max-w-50 truncate hidden sm:table-cell">
                {customer?.email || EMPTY}
            </td>

            {/* Phone Column */}
            <td className="py-2.5 px-3 text-muted-foreground font-medium tracking-tight hidden sm:table-cell">
                {customer?.phone || EMPTY}
            </td>

            {/* Last Active Column */}
            <td className="py-2.5 px-3 text-muted-foreground hidden md:table-cell">
                {customer?.latestInteractionAt ? new Date(customer.latestInteractionAt).toLocaleDateString(undefined, { day: "numeric", month: "short" }) : "No interactions"}
            </td>

            {/* Created Column */}
            <td className="py-2.5 px-3 text-muted-foreground/80 hidden lg:table-cell">
                {formatDate(customer?.createdAt)}
            </td>

            {/* Actions Column (Chevron indicator right-aligned perfectly) */}
            <td className="py-2.5 pl-3 pr-4 text-right align-middle w-10">
                <div className="flex justify-end">
                    <ChevronRight className="size-4 text-muted-foreground/40 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
                </div>
            </td>
        </tr>
    );
});

CustomerRow.displayName = "CustomerRow";

export default CustomerRow;