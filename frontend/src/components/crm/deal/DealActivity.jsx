import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2, Eye, ArrowRight } from "lucide-react";
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
} from "@/constants/activityTypes.constant";

const DealActivity = ({ activity, onViewDetails, onEdit, onDelete, isLast = false }) => {
    if (!activity) return null;

    const typeConfig = getActivityType(activity.type);
    const Icon = getActivityIcon(activity.type);
    const activityColor = getActivityColor(activity.type);

    const activityLabel = activity.type === "custom" && activity.customType
        ? activity.customType
        : getActivityLabel(activity.type);

    return (
        <div className="group/item flex gap-2 sm:gap-3 py-0.5">
            {/* Visual Timeline Connected Rail Layout */}
            <div className="flex flex-col items-center shrink-0 w-7 sm:w-8">
                <div
                    className={`
                        flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full shrink-0 border border-background
                        transition-all duration-200 group-hover/item:scale-105 group-hover/item:shadow-sm
                        ${activityColor}
                    `}
                >
                    {Icon && <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />}
                </div>

                {!isLast && (
                    <div className="w-0.5 flex-1 min-h-[16px] sm:min-h-[20px] bg-border/40 group-hover/item:bg-border/60 transition-colors mt-1 mb-1" />
                )}
            </div>

            {/* Activity Informational Card Bubble */}
            <div className={`flex-1 min-w-0 ${!isLast ? "pb-2 sm:pb-3" : ""}`}>
                <Card
                    className="
                        rounded-lg border-border/40 shadow-none bg-card text-card-foreground
                        transition-all duration-200
                        hover:border-border/70 hover:bg-muted/5
                    "
                >
                    <div className="p-2.5 sm:p-3">
                        {/* Context Summary Header Section */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                            <Badge
                                variant="secondary"
                                className="text-[9px] font-medium tracking-wide px-1.5 h-4 bg-muted/60 text-foreground/70 border-0 truncate max-w-[85%]"
                            >
                                {activityLabel}
                            </Badge>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 sm:h-7 sm:w-7 opacity-100 sm:opacity-0 group-hover/item:opacity-100 focus:opacity-100 transition-opacity -mt-1 -mr-1 cursor-pointer hover:bg-muted/50 rounded-md shrink-0"
                                    >
                                        <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground/70" />
                                        <span className="sr-only">Open actions</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="text-xs min-w-[140px]">
                                    <DropdownMenuItem onClick={() => onViewDetails?.(activity)} className="cursor-pointer">
                                        <Eye className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                        <span>View details</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onEdit?.(activity)} className="cursor-pointer">
                                        <Pencil className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                        <span>Edit</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                                        onClick={() => onDelete?.(activity)}
                                    >
                                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                                        <span>Delete</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Event Header Text */}
                        <p className="text-xs sm:text-sm font-medium text-foreground tracking-tight leading-normal mb-0.5">
                            {activity.event}
                        </p>

                        {/* Detailed Description Sub-Text Block */}
                        {activity.description && (
                            <div className="min-w-0 w-full overflow-hidden mb-0.5">
                                <p className="text-[11px] text-muted-foreground/90 leading-5 whitespace-pre-wrap max-w-full line-clamp-2 break-all sm:break-words">
                                    {activity.description}
                                </p>
                                
                                <button
                                    onClick={() => onViewDetails?.(activity)}
                                    className="group/btn hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/90 hover:underline cursor-pointer focus:outline-none mt-0.5 transition-colors"
                                >
                                    <span>Read more</span>
                                    <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                                </button>
                            </div>
                        )}

                        {/* Operational Context Metadata Line */}
                        <div className="text-[10px] font-normal text-muted-foreground/60 flex items-center flex-wrap gap-x-1.5 mt-1 pt-0">
                            <span className="truncate max-w-[120px] sm:max-w-[150px] font-medium text-muted-foreground/80">
                                {activity.createdBy?.name ?? "Unknown user"}
                            </span>
                            <span className="opacity-40">•</span>
                            <time dateTime={activity.createdAt} className="tabular-nums flex items-center gap-1">
                                <span>
                                    {activity.createdAt ? format(new Date(activity.createdAt), "MMM d") : "—"}
                                </span>
                                <span className="opacity-50">at</span>
                                <span className="font-mono">
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