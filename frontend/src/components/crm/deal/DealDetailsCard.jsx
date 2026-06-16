import {
    CalendarDays,
    Mail,
    Phone,
    User,
    Clock3,
    Pencil,
    Flag,
    Trash2,
} from "lucide-react";

import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";

const STATUS_VARIANTS = {
    active: "default",
    won: "success",
    lost: "destructive",
};

const DealDetailsCard = ({
    deal,
    onEdit,
    onStatus,
    onDelete,
}) => {
    if (!deal) return null;

    const status =
        deal.status?.toLowerCase() || "active";

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {deal.title}
                        </h1>

                        <Badge
                            variant={
                                STATUS_VARIANTS[status] || "secondary"
                            }
                        >
                            {status}
                        </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        Deal created and managed inside CRM.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onEdit}
                    >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onStatus}
                    >
                        <Flag className="mr-2 h-4 w-4" />
                        Status
                    </Button>

                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={onDelete}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Customer Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Customer
                        </h3>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-muted-foreground" />

                                <div>
                                    <p className="text-sm font-medium">
                                        {deal.customer?.name || "Unknown"}
                                    </p>
                                </div>
                            </div>

                            {deal.customer?.email && (
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />

                                    <p className="text-sm">
                                        {deal.customer.email}
                                    </p>
                                </div>
                            )}

                            {deal.customer?.phone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />

                                    <p className="text-sm">
                                        {deal.customer.phone}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Deal Metadata */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Deal Information
                        </h3>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <CalendarDays className="h-4 w-4 text-muted-foreground" />

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Created
                                    </p>

                                    <p className="text-sm">
                                        {deal.createdAt
                                            ? format(
                                                new Date(deal.createdAt),
                                                "dd MMM yyyy"
                                            )
                                            : "-"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Clock3 className="h-4 w-4 text-muted-foreground" />

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Latest Interaction
                                    </p>

                                    <p className="text-sm">
                                        {deal.latestInteractionAt
                                            ? format(
                                                new Date(
                                                    deal.latestInteractionAt
                                                ),
                                                "dd MMM yyyy"
                                            )
                                            : "No interaction yet"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-muted-foreground" />

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Created By
                                    </p>

                                    <p className="text-sm">
                                        {deal.createdBy?.name ||
                                            "Unknown User"}
                                    </p>
                                </div>
                            </div>

                            {deal.closedAt && (
                                <div className="flex items-center gap-3">
                                    <CalendarDays className="h-4 w-4 text-muted-foreground" />

                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Closed At
                                        </p>

                                        <p className="text-sm">
                                            {format(
                                                new Date(deal.closedAt),
                                                "dd MMM yyyy"
                                            )}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default DealDetailsCard;