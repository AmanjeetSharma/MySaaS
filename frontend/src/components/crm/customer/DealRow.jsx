import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
    ArrowRight,
    Clock3,
    CheckCircle2,
    Trophy,
    XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig = {
    active: {
        label: "Active",
        icon: Clock3,
        badgeClass:
            "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },

    won: {
        label: "Won",
        icon: Trophy,
        badgeClass:
            "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400",
    },

    lost: {
        label: "Lost",
        icon: XCircle,
        badgeClass:
            "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
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
                "group w-full rounded-lg border border-border bg-card text-left transition-all",
                "hover:border-primary/30 hover:bg-accent/30",
                "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
        >
            <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
                {/* Deal Title */}
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-foreground">
                        {deal?.title || "Untitled Deal"}
                    </h3>

                    <p className="mt-1 truncate text-xs text-muted-foreground">
                        {latestActivity}
                    </p>
                </div>

                {/* Status */}
                <div className="flex min-w-[120px] justify-start lg:justify-center">
                    <Badge
                        variant="outline"
                        className={status.badgeClass}
                    >
                        <StatusIcon className="mr-1 size-3" />
                        {status.label}
                    </Badge>
                </div>

                {/* Latest Interaction */}
                <div className="min-w-[140px] text-left lg:text-center">
                    <p className="text-xs text-muted-foreground">
                        Last Interaction
                    </p>

                    <p className="text-sm font-medium">
                        {deal?.latestInteractionAt
                            ? formatDate(
                                deal.latestInteractionAt
                            )
                            : "No activity"}
                    </p>
                </div>

                {/* Created Date */}
                <div className="min-w-[120px] text-left lg:text-center">
                    <p className="text-xs text-muted-foreground">
                        Created
                    </p>

                    <p className="text-sm font-medium">
                        {formatDate(deal?.createdAt)}
                    </p>
                </div>

                {/* Closed Date */}
                <div className="min-w-[120px] text-left lg:text-center">
                    <p className="text-xs text-muted-foreground">
                        Closed
                    </p>

                    <p className="text-sm font-medium">
                        {deal?.closedAt
                            ? formatDate(deal.closedAt)
                            : "—"}
                    </p>
                </div>

                {/* Action */}
                <div className="flex justify-end">
                    <ArrowRight
                        className={cn(
                            "size-4 text-muted-foreground transition-transform",
                            "group-hover:translate-x-1"
                        )}
                    />
                </div>
            </div>
        </button>
    );
};

export default DealRow;