import { format } from "date-fns";
import {
    MoreHorizontal,
    Pencil,
    Trash2,
} from "lucide-react";

import {
    Card,
    CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Badge } from "@/components/ui/badge";

import {
    getActivityType,
} from "@/config/activityTypes.config";

const DealActivity = ({
    activity,
    onEdit,
    onDelete,
}) => {
    if (!activity) return null;

    const activityType =
        getActivityType(activity.type);

    const Icon =
        activityType?.icon;

    const activityLabel =
        activity.type === "custom"
            ? activity.customType
            : activityType?.label;

    return (
        <Card className="relative overflow-hidden">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    {/* Left Side */}
                    <div className="flex gap-3">
                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-muted">
                            {Icon && (
                                <Icon className="h-4 w-4" />
                            )}
                        </div>

                        <div className="space-y-2">
                            {/* Type */}
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="secondary"
                                    className="font-medium"
                                >
                                    {activityLabel}
                                </Badge>
                            </div>

                            {/* Event */}
                            <div>
                                <p className="text-sm font-medium leading-none">
                                    {activity.event}
                                </p>
                            </div>

                            {/* Description */}
                            {activity.description && (
                                <p className="text-sm text-muted-foreground">
                                    {activity.description}
                                </p>
                            )}

                            {/* Meta */}
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span>
                                    {activity.createdBy?.name ||
                                        "Unknown User"}
                                </span>

                                <span>•</span>

                                <span>
                                    {format(
                                        new Date(
                                            activity.createdAt
                                        ),
                                        "dd MMM yyyy • hh:mm a"
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            asChild
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            align="end"
                        >
                            <DropdownMenuItem
                                onClick={() =>
                                    onEdit?.(activity)
                                }
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Activity
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() =>
                                    onDelete?.(activity)
                                }
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Activity
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    );
};

export default DealActivity;