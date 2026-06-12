import { format } from "date-fns";
import {
    Mail,
    Phone,
    Calendar,
    Pencil,
    Trash2,
    Plus,
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
        <Card>
            <CardContent className="p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    {/* Left */}
                    <div className="space-y-4">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {customer.name}
                            </h1>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Customer Profile
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="size-4 text-muted-foreground" />

                                <span>
                                    {customer.email || "No email"}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="size-4 text-muted-foreground" />

                                <span>
                                    {customer.phone || "No phone"}
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                            <div className="flex items-center gap-2">
                                <Calendar className="size-4" />

                                <span>
                                    Created:{" "}
                                    {formatDate(customer.createdAt)}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Calendar className="size-4" />

                                <span>
                                    Updated:{" "}
                                    {formatDate(customer.updatedAt)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onEdit}
                        >
                            <Pencil className="mr-2 size-4" />
                            Edit
                        </Button>

                        <Button
                            size="sm"
                            onClick={onCreateDeal}
                        >
                            <Plus className="mr-2 size-4" />
                            New Deal
                        </Button>

                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={onDelete}
                        >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default CustomerDetailsCard;