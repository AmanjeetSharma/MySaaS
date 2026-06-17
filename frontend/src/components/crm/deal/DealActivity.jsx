import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";

import {
    getActivityType,
    getActivityIcon,
    getActivityLabel,
    getActivityColor
} from "@/config/activityTypes.config";

const DealActivity = ({ activity, onViewDetails, onEdit, onDelete, isLast = false }) => {
    if (!activity) return null;

    const typeConfig = getActivityType(activity.type);
    const Icon = getActivityIcon(activity.type);
    const activityColor = getActivityColor(activity.type);

    const activityLabel = activity.type === "custom" && activity.customType
        ? activity.customType
        : getActivityLabel(activity.type);

    return (
        <div className="group flex gap-2 sm:gap-4 py-1">
            {/* Visual Timeline Connected Rail Layout */}
            <div className="flex flex-col items-center shrink-0 w-8 sm:w-11">
                <div
                    className={`
            flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full shrink-0 border-2 border-background
            transition-all duration-200 group-hover:scale-105 group-hover:shadow-md
            ${activityColor}
          `}
                >
                    {Icon && <Icon className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 shrink-0" />}
                </div>

                {!isLast && (
                    <div className="w-0.5 flex-1 min-h-[24px] sm:min-h-[32px] bg-border/50 group-hover:bg-border/70 transition-colors mt-1.5 mb-1" />
                )}
            </div>

            {/* Activity Informational Card Bubble */}
            <div className={`flex-1 min-w-0 ${!isLast ? "pb-4 sm:pb-5" : ""}`}>
                <Card
                    className="
            rounded-xl border-border/40 shadow-sm bg-card text-card-foreground
            transition-all duration-200
            hover:shadow-md hover:border-border/70 hover:-translate-y-0.5
          "
                >
                    <div className="p-3 sm:p-4">
                        {/* Context Summary Header Section */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <Badge
                                variant="secondary"
                                className="text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase px-2 py-0 h-4.5 sm:h-5 bg-muted/50 text-foreground/80 border-0 truncate max-w-[85%]"
                            >
                                {activityLabel}
                            </Badge>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 sm:h-7 sm:w-7 opacity-100 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity -mt-1 -mr-1.5 cursor-pointer hover:bg-muted/50 rounded-md"
                                    >
                                        <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground/70" />
                                        <span className="sr-only">Open actions</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="text-xs min-w-[140px]">
                                    <DropdownMenuItem onClick={() => onViewDetails?.(activity)} className="cursor-pointer">
                                        <Eye className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                        View details
                                    </DropdownMenuItem>
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
                        <p className="text-xs sm:text-sm font-semibold text-foreground tracking-tight leading-snug mb-1">
                            {activity.event}
                        </p>

                        {/* Detailed Description Sub-Text Block (Line Clamped) */}
                        {/* Detailed Description Sub-Text Block (Line Clamped & Safe Word Break) */}
                        {activity.description && (
                            <div className="space-y-1.5 mb-2.5 min-w-0 w-full overflow-hidden">
                                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap max-w-full line-clamp-3 break-all sm:break-words">
                                    {activity.description}
                                </p>
                                {/* Read More */}
                                <button
                                    onClick={() => onViewDetails?.(activity)}
                                    className="hidden sm:inline-block text-[11px] font-semibold text-primary hover:underline cursor-pointer focus:outline-none"
                                >
                                    Read more
                                </button>
                            </div>
                        )}

                        {/* Operational Context Metadata Line */}
                        <div className="text-[10px] sm:text-[11px] font-medium text-muted-foreground/70 flex flex-wrap items-center gap-x-2 gap-y-0.5 pt-0.5">
                            <span className="truncate max-w-[120px] sm:max-w-[150px]">{activity.createdBy?.name ?? "Unknown user"}</span>
                            <span className="opacity-30">•</span>
                            <time dateTime={activity.createdAt} className="tabular-nums flex items-center gap-1">
                                <span className="opacity-60">
                                    {activity.createdAt ? format(new Date(activity.createdAt), "MMM d") : "—"}
                                </span>
                                <span className="opacity-40">at</span>
                                <span className="font-mono text-[9px] sm:text-[10px]">
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