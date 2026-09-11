import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEntityId, formatDate, getStatusBadgeVariant } from "../helpers/member.helper.js";
import { Check, Clock, Loader2 } from "lucide-react";

export const InvitationsView = ({
    invitations = [],
    isOrgLevel = false,
    onAccept,
    isUpdating,
}) => {
    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{isOrgLevel ? "Candidate" : "Organization"}</TableHead>
                        <TableHead>Invited By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Expires</TableHead>
                        {!isOrgLevel && <TableHead className="text-right">Action</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invitations.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={isOrgLevel ? 4 : 5} className="h-32 text-center text-muted-foreground">
                                No invitations available.
                            </TableCell>
                        </TableRow>
                    ) : (
                        invitations.map((inv) => {
                            const invId = getEntityId(inv);
                            const isPending = inv.status === "pending";

                            return (
                                <TableRow key={invId}>
                                    <TableCell>
                                        {isOrgLevel ? (
                                            <span className="font-medium">{inv.email}</span>
                                        ) : (
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground">
                                                    {inv.organization?.name || "Organization"}
                                                </span>
                                                <span className="text-xs text-muted-foreground">{inv.email}</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{inv.inviter || "Admin"}</span>
                                            <span className="text-xs text-muted-foreground">{inv.inviterEmail}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(inv.status)} className="capitalize">
                                            {inv.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        <span className="inline-flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {formatDate(inv.expiresAt)}
                                        </span>
                                    </TableCell>
                                    {!isOrgLevel && (
                                        <TableCell className="text-right">
                                            {isPending ? (
                                                <Button
                                                    size="sm"
                                                    disabled={isUpdating}
                                                    onClick={() => onAccept(invId)}
                                                    className="h-8"
                                                >
                                                    {isUpdating ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                                    ) : (
                                                        <Check className="h-3.5 w-3.5 mr-1" />
                                                    )}
                                                    Accept
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">
                                                    {inv.status === "accepted" ? `Joined ${formatDate(inv.acceptedAt)}` : "Expired"}
                                                </span>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
};