import { format } from "date-fns";
import {
    Mail,
    Phone,
    Calendar,
    Pencil,
    Trash2,
    Plus,
    User,
    ArrowUpRight,
    Waypoints,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const formatDate = (date) => {
    if (!date) return "—";
    try {
        return format(new Date(date), "dd MMM yyyy");
    } catch {
        return "—";
    }
};

const CustomerDetailsCard = ({
    customer,
    onEdit,
    onDelete,
    onCreateDeal,
}) => {
    if (!customer) return null;

    return (
        <Card className="overflow-hidden border-border bg-gradient-to-b from-background to-muted/20 shadow-sm">
            <CardContent className="p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

                    {/* Base Workspace Information Block */}
                    <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-2">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                                        {customer.name}
                                    </h1>
                                    {customer.source && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-primary uppercase">
                                            <Waypoints  className="size-3" /> {customer.source}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground font-mono tracking-tight opacity-80">
                                    ID: {customer._id}
                                </p>
                            </div>
                        </div>

                        {/* Micro Grid for Contact Meta */}
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Mail className="size-4 text-muted-foreground/70" />
                                <span className="text-foreground/90 select-all">{customer.email || "No email register"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="size-4 text-muted-foreground/70" />
                                <span className="text-foreground/90 select-all">{customer.phone || "No valid contact"}</span>
                            </div>
                        </div>

                        {/* Dynamic System Action Tracking Nodes */}
                        <div className="grid gap-3 pt-4 border-t border-border/40 text-xs text-muted-foreground sm:grid-cols-2">
                            {/* Creator Metadata Context Block */}
                            <div className="space-y-1 bg-muted/30 rounded-lg p-2 border border-border/30">
                                <div className="flex items-center gap-1.5 font-medium">
                                    <Calendar className="size-3.5 text-muted-foreground/80" />
                                    <span>Onboarded:</span>
                                    <span className="text-foreground font-normal">{formatDate(customer.createdAt)}</span>
                                </div>
                                {customer.createdBy?._id && (
                                    <div className="flex items-center gap-1 pl-5">
                                        <User className="size-3 opacity-60" />
                                        <span>by</span>
                                        <a
                                            href={`/members/${customer.createdBy._id}`}
                                            className="inline-flex items-center gap-0.5 font-semibold text-foreground hover:text-primary transition-colors hover:underline"
                                        >
                                            {customer.createdBy.name || "System"}
                                            <ArrowUpRight className="size-2.5 opacity-50" />
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Modifier Metadata Context Block */}
                            <div className="space-y-1 bg-muted/30 rounded-lg p-2 border border-border/30">
                                <div className="flex items-center gap-1.5 font-medium">
                                    <Calendar className="size-3.5 text-muted-foreground/80" />
                                    <span>Last Activity:</span>
                                    <span className="text-foreground font-normal">{formatDate(customer.updatedAt)}</span>
                                </div>
                                {customer.updatedBy?._id && (
                                    <div className="flex items-center gap-1 pl-5">
                                        <User className="size-3 opacity-60" />
                                        <span>by</span>
                                        <a
                                            href={`/members/${customer.updatedBy._id}`}
                                            className="inline-flex items-center gap-0.5 font-semibold text-foreground hover:text-primary transition-colors hover:underline"
                                        >
                                            {customer.updatedBy.name || "System"}
                                            <ArrowUpRight className="size-2.5 opacity-50" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* CRM Lifecycle Action Button Control Deck */}
                    <div className="flex flex-row flex-wrap sm:flex-nowrap lg:flex-col gap-2 justify-start sm:justify-end lg:justify-start pt-2 lg:pt-0 border-t border-border/40 lg:border-t-0 w-full lg:w-auto">
                        <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/80 shadow-sm flex-1 sm:flex-none lg:w-36 h-9 cursor-pointer"
                            onClick={onCreateDeal}
                        >
                            <Plus className="mr-1.5 size-4" />
                            New Deal
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-muted font-medium flex-1 sm:flex-none lg:w-36 h-9 cursor-pointer"
                            onClick={onEdit}
                        >
                            <Pencil className="mr-1.5 size-4 text-muted-foreground" />
                            Edit Profile
                        </Button>

                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive bg-destructive/20 hover:bg-destructive/40 hover:text-destructive flex-1 sm:flex-none lg:w-36 h-9 cursor-pointer transition-colors"
                            onClick={onDelete}
                        >
                            <Trash2 className="mr-1.5 size-4" />
                            Delete Profile
                        </Button>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
};

export default CustomerDetailsCard;