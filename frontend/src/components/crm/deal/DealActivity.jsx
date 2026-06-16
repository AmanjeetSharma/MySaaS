import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";

// Import your existing helpers directly
import {
    getActivityType,
    getActivityIcon,
    getActivityLabel,
    getActivityColor
} from "@/config/activityTypes.config";

const DealActivity = ({ activity, onEdit, onDelete, isLast = false }) => {
    if (!activity) return null;

    // Use your helper functions directly
    const typeConfig = getActivityType(activity.type);
    const Icon = getActivityIcon(activity.type);
    const activityColor = getActivityColor(activity.type);

    const activityLabel = activity.type === "custom" && activity.customType
        ? activity.customType
        : getActivityLabel(activity.type);

    return (
        <div className="group flex gap-4 py-1">
            {/* Visual Timeline Connected Rail Layout */}
            <div className="flex flex-col items-center shrink-0 w-11">
                <div
                    className={`
            flex h-10 w-10 items-center justify-center rounded-full shrink-0 border-2 border-background
            transition-all duration-200 group-hover:scale-105 group-hover:shadow-md
            ${activityColor}
          `}
                >
                    {Icon && <Icon className="h-4.5 w-4.5 shrink-0" />}
                </div>

                {!isLast && (
                    <div className="w-0.5 flex-1 min-h-[32px] bg-border/50 group-hover:bg-border/70 transition-colors mt-2 mb-1.5" />
                )}
            </div>

            {/* Activity Informational Card Bubble */}
            <div className={`flex-1 ${!isLast ? "pb-5" : ""}`}>
                <Card
                    className="
            rounded-xl border-border/40 shadow-sm bg-card text-card-foreground
            transition-all duration-200
            hover:shadow-md hover:border-border/70 hover:-translate-y-0.5
          "
                >
                    <div className="p-4">
                        {/* Context Summary Header Section */}
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                            <Badge
                                variant="secondary"
                                className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0 h-5 bg-muted/50 text-foreground/80 border-0"
                            >
                                {activityLabel}
                            </Badge>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity -mt-1 -mr-1.5 cursor-pointer hover:bg-muted/50 rounded-md"
                                    >
                                        <MoreHorizontal className="h-4 w-4 text-muted-foreground/70" />
                                        <span className="sr-only">Open actions</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="text-xs min-w-[140px]">
                                    <DropdownMenuItem onClick={() => onEdit?.(activity)} className="cursor-pointer">
                                        <Pencil className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                        Edit activity
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                                        onClick={() => onDelete?.(activity)}
                                    >
                                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                                        Delete activity
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Event Header Text */}
                        <p className="text-sm font-semibold text-foreground tracking-tight leading-snug mb-1.5">
                            {activity.event}
                        </p>

                        {/* Detailed Description Sub-Text Block */}
                        {activity.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap mb-3 max-w-3xl">
                                {activity.description}
                            </p>
                        )}

                        {/* Operational Context Metadata Line */}
                        <div className="text-[11px] font-medium text-muted-foreground/70 flex items-center gap-2 pt-0.5">
                            <span className="truncate max-w-[150px]">{activity.createdBy?.name ?? "Unknown user"}</span>
                            <span className="opacity-30">•</span>
                            <time dateTime={activity.createdAt} className="tabular-nums flex items-center gap-1.5">
                                <span className="opacity-60">
                                    {activity.createdAt ? format(new Date(activity.createdAt), "MMM d") : "—"}
                                </span>
                                <span className="opacity-40">at</span>
                                <span className="font-mono text-[10px]">
                                    {activity.createdAt ? format(new Date(activity.createdAt), "hh:mm a") : "—"}
                                </span>
                            </time>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DealActivity;